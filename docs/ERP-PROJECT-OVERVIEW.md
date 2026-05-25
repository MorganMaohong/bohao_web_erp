# 博灏智慧 ERP 项目说明

> 供后续对话、开发与排障时快速对齐上下文。  
> 前端仓库：`/Users/maohong/vsworkspace/bohao_web_erp`  
> 后端仓库：`/Users/maohong/IdeaProjects/boot-admin`（默认 API 服务）

---

## 1. 项目定位

公司内部开发的 **ERP 综合平台**，覆盖基础资料、库存、采购、生产等；架构上可扩展为对外交付版本。

技术栈：Vue 3 + TypeScript + Vite + Pinia，UI 以 **Naive UI** 为壳、页面内常用 **Element Plus / VxeTable**；后端 Spring Boot（`boot-admin`）。

---

## 2. 目录与菜单约定

`src/views` 下 **每个一级文件夹 ≈ 一个菜单模块**，其下子文件夹 ≈ 具体页面（通常 `index.vue`）。

路由由后端菜单动态生成：`permissionStore.setRoutes(menuList)` → `import.meta.glob("@/views/**/*.vue")` 匹配组件路径。

| 模块路径 | 说明 | 状态（概览） |
|----------|------|----------------|
| `template/` | 基础资料 | 已用 |
| `inventory/` | 库存（入库/出库/调拨/盘点/流水/领料等） | 已用 |
| `purchase/` | 采购 | 已用 |
| `product/` | 生产管理 | 开发中，**plan 最复杂** |
| `sales/` | 销售 | 订单页存在，业务未完整开发 |
| `other/` | 任务、通知、个人中心等 | 已用 |
| `login/`、`error-page/`、`link/`、`redirect/` | 系统页 | - |

更细的 template 说明见：`src/views/template/README.md`。

---

## 3. 基础资料（`template`）

| 路径 | 功能 |
|------|------|
| `template/customer` | 客户管理，供销售订单使用（销售模块未完备） |
| `template/dictionary` | 字典管理，标准字段自定义 |
| `template/items` | 物料管理：**成品**（`finished_product`）与 **零件**（`component`） |
| `template/unit` | 单位管理、单位换算、价格计算 |
| `template/warehouse` | 仓库管理 |
| `template/supplier` | 供应商管理 |

对应 API 前缀：`/template/*`（如 items、warehouse、customer 等）。

---

## 4. 生产管理（`product`）

### 4.1 模块组成

| 路径 | 业务 | 前端页面 | 后端 API 前缀 |
|------|------|----------|----------------|
| `product/bom` | 成品 BOM（物料清单） | `views/product/bom/index.vue`（约 250 行） | `/production/bom` |
| `product/process-template` | 工序模板 | `views/product/process-template/index.vue`（约 280 行） | `/production/process-template` |
| `product/plan` | 生产计划（审批 + 备料 + 领料 + 工序 + 入库） | `views/product/plan/index.vue`（**约 1524 行，单文件巨石**） | `/production/plan` |

类型定义：`src/model/product/index.ts`  
服务层：`src/services/product/Production*Bom|Plan|ProcessTemplate*Service.ts`  
接口注册：`src/services/api/index.ts` → `productionBomApi` / `productionPlanApi` / `productionProcessTemplateApi`

后端入口：`boot-admin-web/.../controller/production/ProductionPlanController.java`  
核心实现：`boot-admin-service/.../production/impl/ProductionPlanServiceImpl.java`

### 4.2 BOM（`product/bom`）

- 按 **成品** 列表展示，每条可维护其 **零件明细**（用量等）。
- 新建生产计划时，后端会校验所选成品是否已配置 BOM（`ensureBomReady`）。
- 备料阶段也可在计划内再维护/覆盖 BOM 快照（`bomSnapshotJson`）。

### 4.3 工序模板（`product/process-template`）

- 模板含多个 **工序节点**：名称、负责人、预计时长、开始规则、排序等。
- 生产计划中：为某个 **成品** 选择模板 + 数量，生成一条 **工序实例**（`processList`），节点从模板复制。

### 4.4 生产计划（`product/plan`）— 核心流程

#### 双轨状态

1. **审批轨**（Flow 工作流）  
   - 类型：`PRODUCTION_PLAN_FLOW`（`FlowDefinitionTypeOptions.PRODUCTION_PLAN_FLOW`）  
   - 创建计划即 `flowEngineService.startInstance`  
   - `status`：`running` / `completed` / `rejected` / `closed` 等  
   - 审批中若节点配置 `allowEditPlan`，当前审批人可改计划基础信息（`canEditPlan`）

2. **执行轨**（审批通过后 `status === completed` 才进入）  
   阶段字典：`ProductionPlanStageDictionary`（后端）

   | key | 名称 | 完成标志（plan 字段） |
   |-----|------|------------------------|
   | `approve` | 审批 | `status === completed` |
   | `prepare` | 备料 | `materialPrepared` |
   | `issue` | 领料 | `materialIssued` |
   | `process` | 工序 | `processCompleted` |
   | `finish` | 完工 | `finished` |
   | `inbound` | 入库 | `inboundCompleted` |

   当前阶段由后端 `resolveCurrentStage(plan)` 计算，前端用 `currentStage` / `stageList` 展示阶段卡片。

#### 执行阶段操作（API 与 UI 弹窗）

| 阶段 | 主要接口 | 前端弹窗 / 行为 |
|------|----------|-----------------|
| 备料 | `prepare/form`, `prepare/update`, `prepare/confirm` | `showPrepare`：维护 BOM 行，保存 / 确认备料 |
| 领料 | `issue/form`, `issue`, `issue/confirm` | `showIssue`：按 BOM 出库领料，可多次 `issue` 累加，全部领完后 `issueConfirm` |
| 工序 | `process/form`, `process/add|update|delete`, `process/node/complete`, `process/node/rework`, `process/confirm-complete` | `showProcess` 增改工序实例；详情里节点完工 `showCompleteNode`；**确认工序完成** 为计划级 |
| 入库 | `finish/inbound/form`, `finish/inbound` | `showInbound`：成品入指定仓库 |

计划 JSON 字段（实体 `ProductionPlan`）：`productJson`、`bomSnapshotJson`、`processJson`、`issueOrdersJson`、`finishOrdersJson` 等，多为 JSON 序列化存储。

#### 列表/详情上的快捷入口

- `stageActionLabel` + `openCurrentStage`：根据 `currentStage` 打开对应当前阶段弹窗（`prepare` / `issue` / `process` / `inbound`）。
- 关闭：仅 **审批已完成且未全部入库** 可关闭；删除：仅 **已关闭** 可删。

---

## 5. 生产计划页面结构（`plan/index.vue`）

单文件包含：

- **列表**：VxeTable + 搜索 + 分页  
- **弹窗**：`showEdit`（新建/编辑）、`showDetail`（详情+阶段+备料表+工序树）、`showPrepare`、`showIssue`、`showProcess`、`showCompleteNode`、`showInbound`、`showClose`  
- **状态**：大量 `ref` + 内联校验 + `computed`（如 `canConfirmIssue`、`planFormReadonly`）

依赖的基础数据（`loadBaseOptions`）：

- 成品：`ItemsService.select({ itemBizType: "finished_product" })`
- 零件：`itemBizType: "component"`
- 仓库：`WarehouseService.select`

---

## 6. 测试/实现中已暴露的问题（代码阅读结论）

以下为阅读前后端后的 **结构性/一致性问题**，便于后续改 plan 时对齐；具体业务 bug 以你们测试单为准。

### 6.1 单文件过大

`plan/index.vue` 约 **1500+ 行**，7+ 个 Modal、表格、校验、API 全在一处，不利于：

- 阶段权限与按钮显隐维护  
- 联调与单测  
- 多人协作改同一文件

**建议方向**：按阶段拆子组件（PrepareModal / IssueModal / ProcessPanel / InboundModal / PlanDetailDrawer）。

### 6.2 阶段 `finish` 与前端快捷入口不一致

- 后端阶段有 **`finish`（完工）**，且 `resolveCurrentStage` 在 `processCompleted && !finished` 时返回 `finish`。  
- 但 `processConfirmComplete` 会 **同时** 设置 `processCompleted=true` 与 `finished=true`，正常路径下 **`finish` 阶段可能一闪即过或不会出现**。  
- 前端 `stageActionLabel` / `openCurrentStage` **未处理 `finish`**，只有 `prepare | issue | process | inbound`。若后端某刻只置 `processCompleted` 未置 `finished`，列表「进入 xxx」按钮可能 **无文案/无跳转**。

### 6.3 详情里「确认工序完成」按钮位置

详情 `v-for="process in processList"` 内，每条工序行都渲染了 **「确认工序完成」**，但 `confirmProcess` 调用的是 **计划级** `processConfirmComplete(uid)`，会对 **整个计划** 生效，易造成误点或重复按钮。

### 6.4 领料确认条件（`canConfirmIssue`）

```ts
// 仅当所有行 availableQuantity <= 0 时才显示「确认领料」
every((item) => safeNumber(item.availableQuantity) <= 0)
```

与后端 `issueConfirm`（要求每条 BOM `issuedQuantity >= requiredQuantity`）语义需一致；若 `availableQuantity` 计算与「剩余可领」理解不一致，会出现 **按钮长期不出现或过早出现**。

### 6.5 工序数量分配

`openProcess` 用 `remainingQuantityMap` 限制同一成品多工序实例的数量之和，逻辑在前端计算；编辑某条工序时需排除自身，否则 **可生产数量** 可能算错。

### 6.6 备料 BOM 临时 ID

`addPrepareBom` 使用 `uid: tmp_${Date.now()}_...`，若后端按 uid 区分更新，需确认 **临时行** 与持久化行的合并规则。

### 6.7 审批与执行 UI 耦合

详情内审批流预览、执行阶段、工序节点操作同在一大 Modal，信息密度高，测试时容易 **搞混当前该做审批还是做备料/领料**。

---

## 7. 其他业务模块（简表）

| 模块 | 路径示例 | 说明 |
|------|----------|------|
| 库存 | `inventory/inbound`, `outbound`, `transfer`, `check`, `overview`, `flow`, `request` | 与生产领料/入库联动（库存业务类型字典） |
| 采购 | `purchase/apply`, `order`, `inbound`, `return` | 含关联单据 Modal |
| 销售 | `sales/order` | 页面在，功能待完善 |

---

## 8. 常用开发命令

```bash
cd /Users/maohong/vsworkspace/bohao_web_erp
pnpm dev          # 端口 3334
pnpm build:prod   # 产出 bherp/
pnpm exec vue-tsc --noEmit   # 小改动优先类型检查
```

后端改动在 `boot-admin` 对应模块编译验证。

---

## 9. 后续对话推荐写法

改 ERP 前端时建议直接指明：

```text
项目：erp（bohao_web_erp）
页面：src/views/product/plan/index.vue
范围：仅领料弹窗 / 仅详情工序区
行为：……
```

生产计划相关优先读本文件 **第 4、6 节**，再动 `ProductionPlanServiceImpl` 与 `plan/index.vue`。

---

## 10. 关键文件索引

| 用途 | 路径 |
|------|------|
| 生产计划页 | `src/views/product/plan/index.vue` |
| 生产类型 | `src/model/product/index.ts` |
| 生产计划 API | `src/services/product/ProductionPlanService.ts` |
| API 注册 | `src/services/api/index.ts` → `productionPlanApi` |
| 后端 Controller | `boot-admin-web/.../ProductionPlanController.java` |
| 后端 Service | `boot-admin-service/.../ProductionPlanServiceImpl.java` |
| 计划审批编辑策略 | `boot-admin-service/.../ProductionPlanTaskEditServiceImpl.java` |
| 阶段字典 | `boot-admin-public/.../ProductionPlanStageDictionary.java` |
| 项目脚手架说明 | `CLAUDE.md` |

---

*文档版本：基于 2026-05-22 代码库阅读整理；随实现变更请同步更新本节。*
