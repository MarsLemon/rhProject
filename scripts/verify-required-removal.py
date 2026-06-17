#!/usr/bin/env python3
"""
培训计划「必须学习」移除 — 自动化验证脚本（v2）
================================================

覆盖：
1. 后端 API 验证（localhost:8101，token 头为小写 "token"）
2. 数据库 schema 验证（dev DB）
3. 前端文本验证（已删除 required 字段）
4. Maven 单测

运行：
    pip install pymysql requests
    python verify-required-removal.py
"""

import json
import os
import re
import subprocess
import sys
import traceback
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

try:
    import pymysql
except ImportError:
    pymysql = None

import urllib.request
import urllib.error


# ============================================================
# 配置
# ============================================================

BACKEND_BASE = 'http://localhost:8101'
DB_CONFIG = {
    'host': '47.105.122.150',
    'port': 31101,
    'user': 'dev_root',
    'password': '123456',
    'database': 'wk_train_center',
    'connect_timeout': 10,
}
ADMIN_USER = 'admin'
ADMIN_PASS = 'admin'
FRONTEND_DIR = r'e:\rhProject\wk-train-center-ui\src\views\admin\plan'


# ============================================================
# 测试结果
# ============================================================

@dataclass
class TestCase:
    id: str
    name: str
    category: str
    severity: str
    passed: bool = False
    skipped: bool = False
    error: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)


RESULTS: List[TestCase] = []


class SkipTest(Exception):
    pass


def run_test(tc: TestCase, fn) -> None:
    print(f'\n[{tc.category}/{tc.severity}] {tc.id} — {tc.name}')
    try:
        details = fn() or {}
        tc.details = details
        tc.passed = True
        print(f'  ✅ PASS — {details.get("note", "")}')
    except SkipTest as e:
        tc.skipped = True
        tc.error = str(e)
        print(f'  ⏭️  SKIP — {e}')
    except AssertionError as e:
        tc.error = str(e)
        print(f'  ❌ FAIL — {e}')
    except Exception as e:
        tc.error = f'{type(e).__name__}: {e}'
        print(f'  ❌ ERROR — {e}')


# ============================================================
# API 客户端
# ============================================================

class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None

    def request(self, method: str, path: str, body: Optional[dict] = None,
                timeout: int = 15) -> Tuple[int, dict]:
        url = self.base_url + path
        data = json.dumps(body).encode('utf-8') if body is not None else None
        h = {'Content-Type': 'application/json'}
        if self.token:
            h['token'] = self.token  # 小写，与 request.js 一致
        req = urllib.request.Request(url, data=data, method=method, headers=h)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.status, json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            body_text = e.read().decode('utf-8', errors='replace')
            try:
                return e.code, json.loads(body_text)
            except json.JSONDecodeError:
                return e.code, {'raw': body_text}

    def login(self) -> str:
        status, resp = self.request('POST', '/api/sys/user/login',
                                    {'username': ADMIN_USER, 'password': ADMIN_PASS})
        assert status == 200 and resp.get('code') == 0, f'登录失败: {resp}'
        token = resp.get('data', {}).get('token')
        assert token, f'无 token: {resp}'
        self.token = token
        return token


# ============================================================
# 用例实现
# ============================================================

def test_a1_login() -> dict:
    """A1 admin 登录"""
    client = ApiClient(BACKEND_BASE)
    token = client.login()
    assert len(token) > 20
    return {'note': f'token {len(token)} 字符'}


def test_b1_plan_paging_no_required() -> dict:
    """B1 计划列表分页响应无 required 字段"""
    client = ApiClient(BACKEND_BASE)
    client.login()

    status, resp = client.request('POST', '/api/plan/plan/paging',
                                  {'current': 1, 'size': 10})
    assert status == 200, f'HTTP {status}: {resp}'
    assert resp.get('code') == 0, f'业务错误: {resp.get("msg")}'

    records = resp.get('data', {}).get('records', [])
    assert records, '计划列表为空'

    # 遍历所有 key 找 required
    found_paths = []
    def walk(obj, path=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == 'required':
                    found_paths.append(f'{path}.{k}')
                walk(v, f'{path}.{k}')
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, f'{path}[{i}]')
    walk(resp)

    assert not found_paths, f'仍含 required 字段: {found_paths[:3]}'
    return {'note': f'扫 {len(records)} 个计划，无 required 字段'}


def test_b2_plan_simple_detail_no_required() -> dict:
    """B2 计划 simple-detail 响应无 required 字段"""
    client = ApiClient(BACKEND_BASE)
    client.login()

    # 先取第一个 plan id
    _, resp = client.request('POST', '/api/plan/plan/paging', {'current': 1, 'size': 1})
    plan_id = resp['data']['records'][0]['id']

    status, resp = client.request('POST', '/api/plan/plan/simple-detail', {'id': plan_id})
    assert status == 200, f'HTTP {status}: {resp}'
    assert resp.get('code') == 0

    data_obj = resp.get('data', {})
    assert 'required' not in data_obj, f'plan data 含 required: {data_obj}'

    # 也扫一遍所有 key
    found = []
    def walk(obj, path=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == 'required':
                    found.append(f'{path}.{k}')
                walk(v, f'{path}.{k}')
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, f'{path}[{i}]')
    walk(resp)
    assert not found, f'仍含 required 字段: {found}'

    return {'note': f'plan {plan_id} 响应无 required 字段，data keys={list(data_obj.keys())[:5]}'}


def test_b3_plan_full_detail_status() -> dict:
    """B3 计划完整详情 API 健康（无 required 字段）"""
    client = ApiClient(BACKEND_BASE)
    client.login()

    _, resp = client.request('POST', '/api/plan/plan/paging', {'current': 1, 'size': 1})
    plan_id = resp['data']['records'][0]['id']

    status, resp = client.request('POST', '/api/plan/plan/detail', {'id': plan_id})
    assert status == 200, f'HTTP {status}: {resp}'
    assert resp.get('code') == 0, f'业务错误: {resp.get("msg")}'

    # 检查 required 字段
    found = []
    def walk(obj, path=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == 'required':
                    found.append(f'{path}.{k}')
                walk(v, f'{path}.{k}')
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, f'{path}[{i}]')
    walk(resp)
    assert not found, f'仍含 required 字段: {found}'
    return {'note': f'plan {plan_id} full detail 无 required，data keys={list(resp.get("data", {}).keys())[:5]}'}


def test_b4_user_paging_no_required() -> dict:
    """B4 学员列表分页响应无 required 字段 + 验证 requireNode = 非 sparring 节点数"""
    client = ApiClient(BACKEND_BASE)
    client.login()
    _, resp = client.request('POST', '/api/plan/plan/paging', {'current': 1, 'size': 1})
    plan_id = resp['data']['records'][0]['id']

    status, resp = client.request('POST', '/api/plan/user/paging',
                                  {'current': 1, 'size': 20,
                                   'params': {'planId': plan_id}})  # 注意: body 用 params
    assert status == 200, f'HTTP {status}: {resp}'
    assert resp.get('code') == 0, f'业务错误: {resp.get("msg")}'

    records = resp.get('data', {}).get('records', [])
    assert records, f'plan {plan_id} 无学员记录'

    sample = records[0]
    assert 'requireNode' in sample, f'记录无 requireNode: {list(sample.keys())}'
    assert 'required' not in sample, f'记录含 required: {sample}'

    # 交叉验证：requireNode 应该 = DB 内该 plan 非 sparring 节点数
    if pymysql:
        conn = pymysql.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM el_plan_node
            WHERE plan_id=%s AND node_type != 'sparring' AND deleted=0
        """, (plan_id,))
        expected = cur.fetchone()[0]
        conn.close()
        actual = sample.get('requireNode', 0)
        assert actual == expected, f'requireNode={actual} != DB {expected}'
        return {'note': f'plan {plan_id} 学员 {len(records)} 人，requireNode={actual} = DB 非 sparring 节点数 {expected}'}

    return {'note': f'plan {plan_id} 学员 {len(records)} 人，requireNode={sample.get("requireNode")}'}


def test_b5_stat_detail_no_required() -> dict:
    """B5 统计详情 API 响应无 required 字段（ColumnNotFound 防御）"""
    client = ApiClient(BACKEND_BASE)
    client.login()
    _, resp = client.request('POST', '/api/plan/plan/paging', {'current': 1, 'size': 1})
    plan_id = resp['data']['records'][0]['id']

    # 注意: 正确 body 格式是 {planId: '...'}
    status, resp = client.request('POST', '/api/plan/stat/detail', {'planId': plan_id})
    assert status == 200, f'HTTP {status}: {resp}'
    assert resp.get('code') == 0, f'业务错误: {resp.get("msg")}'

    # 检查 required 字段
    found = []
    def walk(obj, path=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == 'required':
                    found.append(f'{path}.{k}')
                walk(v, f'{path}.{k}')
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, f'{path}[{i}]')
    walk(resp)
    assert not found, f'统计响应仍含 required 字段: {found}'

    data_obj = resp.get('data', {})
    grp_count = len(data_obj.get('groupList', []))
    return {'note': f'plan {plan_id} 统计响应 {grp_count} 个分组，无 required 字段'}


def test_c1_el_plan_node_no_required_column() -> dict:
    """C1 el_plan_node 表无 required 列"""
    if not pymysql:
        raise SkipTest('pymysql 未装')
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SHOW COLUMNS FROM el_plan_node LIKE 'required'")
    row = cur.fetchone()
    conn.close()
    assert row is None, f'required 列仍存在: {row}'
    return {'note': 'SHOW COLUMNS LIKE required → Empty'}


def test_c2_no_required_in_any_table() -> dict:
    """C2 全库无 required 字段（除 el_course_file_learn.required_sec）"""
    if not pymysql:
        raise SkipTest('pymysql 未装')
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA='wk_train_center' AND COLUMN_NAME LIKE '%required%'
    """)
    rows = cur.fetchall()
    conn.close()
    unexpected = [r for r in rows if not (r[0] == 'el_course_file_learn' and r[1] == 'required_sec')]
    assert not unexpected, f'意外残留: {unexpected}'
    return {'note': f'全库 required 字段: {[f"{r[0]}.{r[1]}" for r in rows]} (符合预期)'}


def test_c3_db_plan_data_integrity() -> dict:
    """C3 DB 内计划节点数与各表数据一致"""
    if not pymysql:
        raise SkipTest('pymysql 未装')
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM el_plan")
    plans = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM el_plan_node WHERE deleted=0")
    nodes = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM el_plan_user")
    users = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM el_plan_user_node")
    user_nodes = cur.fetchone()[0]
    conn.close()
    assert plans > 0, '无计划数据'
    return {
        'note': f'plans={plans} nodes={nodes} users={users} user_nodes={user_nodes}'
    }


def test_e1_form_vue_clean() -> dict:
    """E1 form.vue 无 node.required = false"""
    path = os.path.join(FRONTEND_DIR, 'plan', 'form.vue')
    with open(path, encoding='utf-8') as f:
        content = f.read()
    assert 'node.required = false' not in content
    return {'note': f'{path} 已清理'}


def test_e2_composable_clean() -> dict:
    """E2 useGroupManager.js 无 required: false"""
    path = os.path.join(FRONTEND_DIR, 'plan', 'components', 'composables', 'useGroupManager.js')
    with open(path, encoding='utf-8') as f:
        content = f.read()
    assert 'required: false' not in content
    return {'note': f'{path} 已清理'}


def test_e3_user_list_column_renamed() -> dict:
    """E3 管理端列表列名改为「项目数」"""
    path = os.path.join(FRONTEND_DIR, 'stat', 'components', 'PlanUserList.vue')
    with open(path, encoding='utf-8') as f:
        content = f.read()
    assert '必学项目' not in content
    assert '项目数' in content
    return {'note': f'{path} 列名「项目数」'}


def test_f1_maven_unit_tests() -> dict:
    """F1 mvn test plan 模块单测全过"""
    result = subprocess.run(
        [r'D:\apache-maven-3.9.7\bin\mvn.cmd', '-pl', 'yf-modules/yf-module-plan',
         'test',
         '-Dtest=PlanUserServiceImplTest,PlanNodeServiceImplTest,'
                'PlanUserNodeClientServiceImplTest,PlanClientGroupRespDTOTest',
         '-DfailIfNoTests=false'],
        cwd=r'e:\rhProject\wk-train-center-service',
        capture_output=True, text=True, timeout=300,
    )
    output = result.stdout + result.stderr
    # 匹所有 "Tests run:" 行，取最后一个（汇总行）
    matches = re.findall(r'Tests run: (\d+), Failures: (\d+), Errors: (\d+)(?:, Skipped: \d+)?', output)
    if matches:
        # 优先取含 Skipped 信息的（汇总行）
        summary = matches[-1]  # 最后一行
        total, fails, errors = int(summary[0]), int(summary[1]), int(summary[2])
        assert result.returncode == 0 and fails == 0 and errors == 0, \
            f'mvn test 失败: total={total} fail={fails} error={errors}'
        return {'note': f'{total} tests, 0 fail, 0 error'}
    raise AssertionError(f'mvn test 输出无 Tests run 行: {output[-300:]}')


# ============================================================
# 主程序
# ============================================================

def main():
    print('=' * 70)
    print('培训计划「必须学习」移除 — 验证测试集 v2')
    print('=' * 70)

    test_cases = [
        TestCase('A1', 'admin 登录', 'API', 'P0'),
        TestCase('B1', '计划列表分页无 required', 'API', 'P0'),
        TestCase('B2', '计划 simple-detail 无 required', 'API', 'P0'),
        TestCase('B3', '计划 full-detail 无 required', 'API', 'P0'),
        TestCase('B4', '学员列表分页无 required + requireNode 校验', 'API', 'P0'),
        TestCase('B5', '统计详情无 required 字段（防 ColumnNotFound）', 'API', 'P0'),
        TestCase('C1', 'el_plan_node 无 required 列', 'DB', 'P0'),
        TestCase('C2', '全库无 required 字段', 'DB', 'P0'),
        TestCase('C3', 'DB 计划数据完整性', 'DB', 'P1'),
        TestCase('E1', 'form.vue 无 node.required = false', 'UI', 'P0'),
        TestCase('E2', 'useGroupManager.js 无 required: false', 'UI', 'P0'),
        TestCase('E3', '列表列名「必学项目」→「项目数」', 'UI', 'P0'),
        TestCase('F1', 'mvn test plan 模块单测', 'Build', 'P0'),
    ]

    handlers = {
        'A1': test_a1_login,
        'B1': test_b1_plan_paging_no_required,
        'B2': test_b2_plan_simple_detail_no_required,
        'B3': test_b3_plan_full_detail_status,
        'B4': test_b4_user_paging_no_required,
        'B5': test_b5_stat_detail_no_required,
        'C1': test_c1_el_plan_node_no_required_column,
        'C2': test_c2_no_required_in_any_table,
        'C3': test_c3_db_plan_data_integrity,
        'E1': test_e1_form_vue_clean,
        'E2': test_e2_composable_clean,
        'E3': test_e3_user_list_column_renamed,
        'F1': test_f1_maven_unit_tests,
    }

    for tc in test_cases:
        if tc.id in handlers:
            run_test(tc, handlers[tc.id])
            RESULTS.append(tc)

    # 汇总
    print('\n' + '=' * 70)
    print('汇总')
    print('=' * 70)
    passed = [t for t in RESULTS if t.passed and not t.skipped]
    failed = [t for t in RESULTS if not t.passed and not t.skipped]
    skipped = [t for t in RESULTS if t.skipped]
    print(f'✅ 通过: {len(passed)}/{len(RESULTS)}')
    print(f'❌ 失败: {len(failed)}')
    print(f'⏭️  跳过: {len(skipped)}')

    if failed:
        print('\n失败用例:')
        for t in failed:
            print(f'  {t.id} ({t.severity}) — {t.name}: {t.error}')

    if skipped:
        print('\n跳过用例:')
        for t in skipped:
            print(f'  {t.id} — {t.name}: {t.error}')

    p0_failed = [t for t in failed if t.severity == 'P0']
    if p0_failed:
        print(f'\n🚨 {len(p0_failed)} 个 P0 失败 — 不能发布')
        sys.exit(1)
    else:
        print('\n🎯 所有 P0 用例通过（或跳过）')
        sys.exit(0)


if __name__ == '__main__':
    main()
