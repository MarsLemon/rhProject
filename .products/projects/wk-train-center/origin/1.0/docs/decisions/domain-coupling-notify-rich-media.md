---
name: domain-coupling-notify-rich-media
description: 站内信前端复用钉钉富媒体字段（运行时联查模板，不入 el_msg）
metadata:
  node_type: memory
  type: project
  originSessionId: 307b3a61-8c3e-4694-845a-ac9c3e032445
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\domain-coupling-notify-rich-media.md
---

# 站内信前端复用钉钉富媒体字段

## 现状

- `el_msg` 表只有 `link_type` / `link_id` 两个抽象字段（从未被业务填充）
- 钉钉工作通知走独立事件链路，富媒体能力由 `DingWorkNoticeEvent` 自带 `image_url` / `button_name` / `jump_url`
- 2026-06-17 v2 PC 端对齐：前端弹窗用 `MsgDTO.imageUrl / buttonName / jumpUrl` 渲染，**后端运行时按 `msg.tmplId` 联查 `el_msg_tmpl` 填进响应，不入 el_msg 表**

## enrich 逻辑（MsgServiceImpl）

- `enrichWithTemplate(MsgDTO)` — 单条消息，按 `dto.tmplId` 查模板填入 3 字段
- `enrichWithTemplates(List<MsgDTO>)` — 批量，按 `tmplId` 分组 IN 查一次模板（避免 N+1）
- 调用点：
  - `detailForRead(msgId, userId)` — 详情接口
  - `userPaging(reqDTO)` — 学员端分页
  - `paging(reqDTO)` — 管理端分页（`MsgRespDTO extends MsgDTO`，强转后 enrich）
- jumpUrl 解析：`resolveTmplJumpUrl(tmpl.getJumpUrl(), params)` 内部走 `MsgUtils.parseMsg` 替换 `${key}` 命名占位符
- props 批量查询：`msgPropService.list(new QueryWrapper<MsgProp>().lambda().in(MsgProp::getMsgId, msgIds))` 然后按 `msgId` 分组成 `LinkedHashMap<key, value>`

## 占位符取舍

**两套占位符并存，分别走不同解析路径**（2026-06-17 修复后两套都被覆盖）：

| 占位符 | 用途 | 解析器 | 数据源 |
|---|---|---|---|
| `${key}` | 站内信 jumpUrl 模板 + 消息内容 `template` 字段 | `MsgUtils.parseMsg` | `params` (LinkedHashMap) → 已存 `el_msg_prop` |
| `{?}` | 钉钉工作通知 jumpUrl + 部分站内信 jumpUrl 模板 | `resolveJumpUrl` 私有方法 | `MsgSendDTO.tmplSpliceInfos` (List<String>) → **2026-06-17 补存到 `el_msg_prop`**（约定 `__splice_<index>`） |

**站内信前端**：`enrichWithTemplate` / `enrichWithTemplates` 在联查模板时，**额外按 `msgId` 查 `el_msg_prop` 还原 `params` + `spliceInfos`**，**两轮替换**：
1. `MsgUtils.parseMsg(tmpl.getJumpUrl(), params)` 替换 `${key}` 命名占位符
2. `resolveJumpUrl(after, spliceInfos)` 替换 `{?}` 位置占位符

**`MsgPropService` 新增方法**（2026-06-17）：
- `saveSpliceInfos(msgId, spliceInfos)` — 按 `__splice_<index>` 命名 key 存到 `el_msg_prop`
- `findSpliceInfos(msgId)` — 按 index 数值排序还原成 `List<String>`（避免字典序 10<2 问题）
- `SPLICE_PREFIX = "__splice_"` 常量

**`MsgServiceImpl.sendNotify` 改动**：`prepareIm` 返回 msgId 后，调 `msgPropService.saveSpliceInfos(msgId, reqDTO.getTmplSpliceInfos())` 补存位置参数。testNotify / imNotify 链路不传 spliceInfos，无需改。

**前端兜底**：检测 `jumpUrl` 仍含 `${xxx}` 或 `{?}` 时按钮置灰 + tooltip "该消息的跳转链接含未解析的占位符"。正常情况下两轮替换完，按钮可点。

## 前端字段约定

- `detail.imageUrl` → 弹窗顶部 16:9 预览图
- `detail.buttonName || '查看详情'` → 弹窗 footer 按钮文案
- `detail.jumpUrl` → 弹窗 footer 跳转目标
- 列表项 `row.jumpUrl` 非空且不含 `{?}` → 显示「可跳转」小角标（朱砂红 + 朱砂红边）

## 关键文件

- 后端响应 DTO：[MsgDTO.java:69-78](wk-train-center-service/yf-modules/yf-module-notify/src/main/java/com/yf/notify/modules/notify/dto/MsgDTO.java#L69-L78) — 保留 3 字段（运行时填，**不入 SQL**）
- 模板源：[MsgTmpl.java:40-53](wk-train-center-service/yf-modules/yf-module-notify/src/main/java/com/yf/notify/modules/notify/entity/MsgTmpl.java#L40-L53)
- enrich 实现：[MsgServiceImpl.java:60-130](wk-train-center-service/yf-modules/yf-module-notify/src/main/java/com/yf/notify/modules/notify/service/impl/MsgServiceImpl.java#L60-L130)
- 前端弹窗：
  - 学员端 [im.vue](wk-train-center-ui/src/views/web/ucenter/im.vue)
  - 管理端 [im.vue](wk-train-center-ui/src/views/admin/notify/im.vue)
- Wiki：[消息管理.md](wk-train-center-service/.qoder/repowiki/zh/content/业务功能/消息通知/消息管理.md) — "站内信富媒体字段（运行时联查模板，不入 el_msg）"小节

## 改动禁区

- **不要回 `MsgDTO` 的 3 字段** — 前端契约
- **不要在 Mapper SQL / result map 里加 3 字段** — 这是联查语义，不是落库语义
- **不要回 `assembleDingWorkNoticeEvent` 改用 `tmpl.setJumpUrl`** — 修过的 bug（污染入参）
- **不要把 `enrichWithTemplate` 内联到 service 各处** — 集中抽方法

## 联动

- 业务触发走 `MsgService.sendNotify` → 钉钉走 `assembleDingWorkNoticeEvent`（发富媒体 type=2 事件）→ `DingWorkNoticeEventListener` → `sendMarkdownWorkNoticeLikeOA(5 字段)`
- 站内信前端弹窗走 `SysUserMsgController.detail` → `MsgServiceImpl.detailForRead` → enrich 模板 → 响应给前端
- AI 答疑模块**不联动**（通知节点枚举不涉及富媒体字段）
- v3 迁移**不联动**（`ucenter/` 空壳未迁移）

## 历史回填

- 0 改动、0 回填（数据库表结构未动）