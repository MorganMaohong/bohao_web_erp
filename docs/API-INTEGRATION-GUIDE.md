# API 对接指南（给小程序 / 第三方前端）

ERP Web 是本项目的 **参考实现**，但对接规范以 **后端文档** 为准。

## 主文档（必读）

👉 **[boot-admin/docs/API-FRONTEND-DELIVERY-GUIDE.md](../../../IdeaProjects/boot-admin/docs/API-FRONTEND-DELIVERY-GUIDE.md)**

内容包括：

- 统一响应 `{ code, msg, data }`
- 为什么几乎全是 `POST`
- `select` / `form` / `detail` / `add` / `update` / `delete` 标准命名
- 分页 `PageVo`、主键 `uid`、时间戳、明细 `detailList`
- 登录（Web / 小程序）、请求头、任务中心审批
- 销售订单完整示例 + 小程序 `wx.request` 模板
- 常见错误排查

## 在本仓库快速定位

| 用途 | 路径 |
|------|------|
| 所有 API 路径 | `src/services/api/index.ts` |
| 请求封装（Header/错误码） | `src/utils/request.ts` |
| 某模块怎么调 | `src/services/{模块}/*Service.ts` |
| 字段 TypeScript 类型 | `src/model/**` |
| 业务说明 | `docs/ERP-PROJECT-OVERVIEW.md` |

## 多系统 Token

见 `boot-admin/docs/multi-system-token-refactor-handoff.md`  
小程序请使用 `x-client-system: miniapp`，token 独立存储，勿与 Web 共用 key。
