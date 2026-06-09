/** 物料选择弹窗业务场景 */
export type ItemPickerScenario =
  /** 其他入库：需先选入库仓库，查该仓库下物料，展示库存参考，允许同物料多批次重复添加 */
  | "inbound_other"
  /** 出库：需选仓库，仅展示库存/可用库存大于 0 的物料 */
  | "outbound"
  /** 调拨：需选出库仓库，仅展示可用库存大于 0 的物料 */
  | "transfer"
  /** 盘点：需选盘点仓库 */
  | "check"
  /** 领料：需选领料仓库，仅展示可用库存大于 0 的物料 */
  | "request"
  /** 销售选料：查全部物料，不展示库存 */
  | "sales"
  /** 采购申请：查全部物料，不展示库存 */
  | "purchase_apply"

export type ItemPickerDataSource = "items" | "inventory"

export interface ItemPickerScenarioConfig {
  /** 数据来源：物料主数据 或 库存概览 */
  dataSource: ItemPickerDataSource
  /** 打开弹窗前是否必须先选择仓库 */
  requireWarehouse: boolean
  /** 表格是否展示库存数量、可用库存列 */
  showStock: boolean
  /** 确认选择时是否允许同一物料重复添加（批次场景） */
  allowDuplicate: boolean
  /** 是否仅返回库存数量或可用库存大于 0 的记录 */
  filterAvailableOnly: boolean
  /** 未选仓库时的提示文案 */
  warehouseRequiredMessage: string
}

export const ITEM_PICKER_SCENARIO_CONFIG: Record<ItemPickerScenario, ItemPickerScenarioConfig> = {
  inbound_other: {
    dataSource: "items",
    requireWarehouse: true,
    showStock: true,
    allowDuplicate: true,
    filterAvailableOnly: false,
    warehouseRequiredMessage: "请先选择入库仓库"
  },
  outbound: {
    dataSource: "inventory",
    requireWarehouse: true,
    showStock: true,
    allowDuplicate: false,
    filterAvailableOnly: true,
    warehouseRequiredMessage: "请先选择出库仓库"
  },
  transfer: {
    dataSource: "inventory",
    requireWarehouse: true,
    showStock: true,
    allowDuplicate: false,
    filterAvailableOnly: true,
    warehouseRequiredMessage: "请先选择出库仓库"
  },
  check: {
    dataSource: "inventory",
    requireWarehouse: true,
    showStock: true,
    allowDuplicate: false,
    filterAvailableOnly: false,
    warehouseRequiredMessage: "请先选择盘点仓库"
  },
  request: {
    dataSource: "inventory",
    requireWarehouse: true,
    showStock: true,
    allowDuplicate: false,
    filterAvailableOnly: true,
    warehouseRequiredMessage: "请先选择领料仓库"
  },
  sales: {
    dataSource: "items",
    requireWarehouse: false,
    showStock: false,
    allowDuplicate: false,
    filterAvailableOnly: false,
    warehouseRequiredMessage: ""
  },
  purchase_apply: {
    dataSource: "items",
    requireWarehouse: false,
    showStock: false,
    allowDuplicate: false,
    filterAvailableOnly: false,
    warehouseRequiredMessage: ""
  }
}

export function getItemPickerScenarioConfig(scenario: ItemPickerScenario): ItemPickerScenarioConfig {
  return ITEM_PICKER_SCENARIO_CONFIG[scenario]
}
