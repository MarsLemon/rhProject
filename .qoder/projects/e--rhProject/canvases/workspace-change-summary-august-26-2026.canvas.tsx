import { Divider, Grid, H1, H2, Stack, Stat, Table, Text } from 'qoder/canvas';

export default function WorkspaceChangeSummary() {
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>e:\rhProject 工作区变更摘要报告</H1>
        <Text tone="secondary">
          统计时间：过去 24 小时（截至 2026-08-26 18:01）| 覆盖子项目数：5
        </Text>
      </Stack>

      <Divider />

      {/* KPI Stats */}
      <Grid columns={5} gap={16}>
        <Stat value="6" label="Git Commits" tone="success" />
        <Stat value="332" label="净增代码行数" tone="success" />
        <Stat value="15" label="影响文件数" tone="neutral" />
        <Stat value="2" label="新增功能" tone="info" />
        <Stat value="3" label="Bug 修复" tone="warning" />
      </Grid>

      {/* Risk Summary */}
      <Divider />
      <H2>🎯 风险等级概览</H2>
      <Grid columns={3} gap={16}>
        <Stat value="2" label="中风险项" tone="warning" />
        <Stat value="2" label="高风险项（待启动）" tone="danger" />
        <Stat value="2" label="低风险项" tone="success" />
      </Grid>

      <Divider />

      {/* Sub-project Summary Table */}
      <H2>📊 子项目变更概览</H2>
      <Table
        headers={['子项目', 'Commits', '未提交改动', '新增文件', '主要类型', '风险等级']}
        rows={[
          ['wk-train-center-service', '3 次', '✅ 无', '❌', '数据质量修复', '🟡 中'],
          ['wk-mhc-ui', '3 次', '✅ 无', '❌', 'UI 交互优化', '🟢 低'],
          ['wk-train-center-ui-v3', '0 次', '❌', '✅ 1 个目录', '迁移任务规划', '🟠 高（待启动）'],
          ['wk-train-center-ui', '0 次', '✅ 无', '❌', '-', '✅ 正常'],
          ['wk-mhc-mobile', '0 次', '✅ 无', '❌', '-', '✅ 正常'],
        ]}
        rowTones={['warning', undefined, undefined, undefined, undefined]}
      />

      {/* Core Changes */}
      <Divider />
      <H2>🔧 核心功能变更详情</H2>
      <Stack gap={16}>
        <Stack gap={8}>
          <H3>wk-train-center-service (后端服务)</H3>
          <Text>
            <strong>Commit #3</strong> f33e8181 - 新增计划用户服务文档 (16:53)<br/>
            • 影响：plan-user-service.md (+288 行) + repowiki metadata 索引<br/>
            • 风险等级：🟢 低风险（纯文档）
          </Text>
          <Text>
            <strong>Commit #2</strong> 807cc3fd - 自动脏数据检测与修复系统增强 (16:30)<br/>
            • 影响：PlanUserServiceImpl.java (+60) + PlanClientServiceImpl.java (+14)<br/>
            • 核心：幽灵用户检测、僵尸状态修正、deadline 污染修复、批量处理 + 事务控制<br/>
            • 代码规模：+157 行 / -45 行 | 风险等级：🟡 中等
          </Text>
          <Text>
            <strong>Commit #1</strong> bb55636c - 学习计划脏数据修复 (15:16)<br/>
            • 影响：PlanClientServiceImpl.java (+329/-84) + PlanClientServiceImplTest.java (+153)<br/>
            • 核心：el_plan_user 状态 SQL 修复、自动补建记录、单元测试验证<br/>
            • 风险等级：🟡 中等（数据库操作，需回归测试）
          </Text>
        </Stack>

        <Stack gap={8}>
          <H3>wk-mhc-ui (MHC 前端门户)</H3>
          <Text>
            <strong>Commit #3</strong> 57142c060a - 修复 Ant Design Select 箭头贴边 (16:53:58)<br/>
            • 影响：service-report-fiva-edit.component.less (+16) + record-sheet-edit.component.less (+16)<br/>
            • 修复：下拉框宽度≥60px、margin-right 调整为 2px、箭头保持 8px 边距<br/>
            • 风险等级：🟢 低风险（纯样式）
          </Text>
          <Text>
            <strong>Commit #2</strong> 11e6f5878a - 表格防抖动优化 (16:05:09)<br/>
            • 影响：HTML/LESS 文件共 6 个 + package.json (+1 行)<br/>
            • 改进：固定表头列宽、响应式 table-layout、国际化"N/A"、新增"sc"本地命令<br/>
            • 代码规模：+77 行 / -50 行 | 风险等级：🟢 低风险
          </Text>
          <Text>
            <strong>Commit #1</strong> b85a9d9b8f - 可编辑选择组件交互重构 (13:24:01)<br/>
            • 影响：editable-select 组件 HTML/TS/Less 共 3 个文件<br/>
            • 改进：hover 替代 click 触发下拉、动态宽度同步、移除冗余代码<br/>
            • 代码规模：+91 行 / -63 行 | 风险等级：🟡 中等（交互逻辑变更）
          </Text>
        </Stack>
      </Stack>

      <Divider />

      {/* Configuration & Dependency Changes */}
      <H2>⚙️ 配置文件与依赖变更</H2>
      <Table
        headers={['检查项', 'wk-train-center-service', 'wk-mhc-ui', '其他子项目']}
        rows={[
          ['package.json / pom.xml', '❌ 无', '✅ +1 行 ("sc"命令)', '❌ 无'],
          ['application.yml / properties', '❌ 无', '❌ 无', '❌ 无'],
          ['.eslintrc / .prettierrc', '❌ 无', '❌ 无', '❌ 无'],
          ['tsconfig / angular.json', '❌ 无', '❌ 无', '❌ 无'],
        ]}
      />

      {/* New Files */}
      <Divider />
      <H2>🆕 新增文件</H2>
      <Table
        headers={['路径', '文件名', '大小/行数', '说明']}
        rows={[
          [
            '.products/projects/wk-train-center-ui-v3/tasks/',
            '2026-08-26-vue3-migration-task-list.md',
            '213 行 (10.8KB)',
            'Vue3 迁移任务清单：277 个 P0 真缺失 + 406 已映射 + 9 移位',
          ],
        ]}
        rowTones={['info']}
      />

      {/* Action Items */}
      <Divider />
      <H2>🎯 优先级行动建议</H2>
      <Table
        headers={['优先级', '任务名称', '负责人', '截止时间']}
        rows={[
          ['🔴 P0', '集成测试：PlanClientServiceImpl 脏数据修复逻辑', '开发团队', '下次发布前'],
          ['🔴 P0', '代码 Review: course/file.vue + exam/review/audit.vue等可疑点', 'Tech Lead', '本周内'],
          ['🟡 P1', '回归测试：延期完成场景 deadline 字段修正准确性', 'QA', '下周前'],
          ['🟡 P1', 'UAT: editable-select hover 交互验收', '产品经理', '下周前'],
          ['🟡 P1', '制定 Vue3 迁移分阶段实施路线图', '架构师', 'TBD'],
          ['🔵 P2', '性能监控：批量查询大规模数据执行时间', '运维', '持续观察'],
          ['🔵 P2', '生产验证：脏数据修复逻辑实际效果', 'DevOps', '部署后'],
        ]}
        rowTones={['danger', 'danger', 'warning', 'warning', 'warning', undefined, undefined]}
      />

      {/* Critical Risks */}
      <Divider />
      <H2>⚠️ 潜在风险项评估</H2>
      <Table
        headers={['风险类别', '级别', '描述', '影响范围', '建议措施']}
        rows={[
          [
            '脏数据修复逻辑',
            '🟡 中',
            'PlanClientServiceImpl 大量新增数据校验和修复代码',
            'el_plan_user, el_plan_node',
            '集成测试 + 预演执行 + 回滚预案',
          ],
          [
            'deadline 字段污染修复',
            '🟡 中',
            '延期完成场景下的字段修正逻辑',
            '已延期计划用户历史数据',
            '验证修正准确性',
          ],
          [
            '下拉框交互重构',
            '🟡 中',
            'hover 替代 click 触发展开逻辑',
            'service-report 模块用户体验',
            '用户验收测试 (UAT)',
          ],
          [
            'Vue3 迁移任务启动',
            '🟠 高',
            '277 个 P0 任务待执行，预计 18 工作日',
            'wk-train-center-ui-v3',
            '制定实施路线图',
          ],
          [
            'Critical 代码可疑点',
            '🟠 高',
            'course/file.vue/audit.vue/form.vue等存在异常 Branch Diff',
            'Vue3 迁移完整性',
            '人工 Review 代码等价性',
          ],
        ]}
        rowTones={[undefined, undefined, undefined, 'warning', 'warning']}
      />

      {/* Final Notes */}
      <Divider />
      <Stack gap={8}>
        <H2>📈 统计数据汇总</H2>
        <Text size="small">
          • 总 Commit 数：<strong>6</strong><br/>
          • 总代码行数变化：<strong>+519 行 / -187 行</strong>(净增+332 行)<br/>
          • 涉及文件数：<strong>15</strong><br/>
          • 新增文档：<strong>2</strong>(计划用户服务文档 + Vue3 任务清单)<br/>
          • 新增功能：<strong>2</strong>(脏数据检测系统 + hover 触发下拉)<br/>
          • Bug 修复：<strong>3</strong>(脏数据修复 + 下拉框样式×2)<br/>
          • UI 优化：<strong>2</strong>(表格防抖 + 组件样式简化)<br/>
          • Breaking Change:<strong>0</strong><br/>
          • 未提交改动:<strong>0</strong><br/>
        </Text>
      </Stack>

      <Text tone="secondary" size="small">
        报告生成时间：2026-08-26 18:01 | 数据来源：git log + git status + file system scan + task list content analysis
      </Text>
    </Stack>
  );
}
