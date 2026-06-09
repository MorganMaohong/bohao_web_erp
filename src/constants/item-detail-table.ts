/** 库存等业务单据中的物料明细表格场景 */
export type ItemDetailTablePreset =
  | "inventory_inbound_edit"
  | "inventory_inbound_view"
  | "inventory_outbound_edit"
  | "inventory_outbound_view"
  | "inventory_transfer_edit"
  | "inventory_transfer_view"
  | "inventory_check_edit"
  | "inventory_check_view"
  | "inventory_request_edit"
  | "inventory_request_view"
  | "inventory_request_issue"
  | "purchase_apply_edit"
  | "purchase_apply_view"
  | "purchase_apply_approve"
  | "purchase_order_view"

export interface ItemDetailTableQuantityColumn {
  label: string
  editable: boolean
  min?: number
  fixed?: "left" | "right"
  /** 可编辑时数量上限取自行字段，如 availableQuantity */
  maxField?: string
}

export interface ItemDetailTablePresetConfig {
  mode: "edit" | "view"
  showBatchNo?: boolean
  batchNoEditable?: boolean
  showImage?: boolean
  showCode?: boolean
  showSupplier?: boolean
  /** 编辑态：预期供应商下拉 */
  supplierEditable?: boolean
  /** 是否展示库存总量列，默认 true */
  showTotalStock?: boolean
  /** 只读价格列范围：purchase 仅采购价 */
  priceScope?: "full" | "purchase"
  /** 详情：按行数量展示税额与小计 */
  showLineAmount?: boolean
  /** 编辑态备注是否可输入，默认 true */
  remarkEditable?: boolean
  showItemBizType?: boolean
  showBrand?: boolean
  showStock?: boolean
  /** 展示账面库存时列标题，默认「库存数量」 */
  stockQuantityLabel?: string
  /** 是否展示可用库存列，默认 true */
  showAvailableStock?: boolean
  /** 盘点：展示盘盈/盘亏列 */
  showCheckDiff?: boolean
  /** 领料详情：展示已出库数量 */
  showIssuedQuantity?: boolean
  /** 领料出库：展示剩余可出库 */
  showRemainQuantity?: boolean
  /** 领料出库：展示本次出库（可编辑） */
  showIssueQuantity?: boolean
  /** 备注列放在数量列之后，默认 false */
  remarkAfterQuantity?: boolean
  /** 采购订单详情：展示申请数量 */
  showApplyQuantity?: boolean
  /** 采购订单详情：展示已入库/已退货/可入库/可退货数量 */
  showInboundQuantity?: boolean
  showReturnQuantity?: boolean
  showAvailableInboundQuantity?: boolean
  showAvailableReturnQuantity?: boolean
  /** readonly：与物料列表一致的 6 列价格；edit：可编辑采购价；none：不展示价格 */
  priceMode: "none" | "readonly" | "edit"
  quantity?: ItemDetailTableQuantityColumn
  showDelete?: boolean
  showRemark?: boolean
}

export const ITEM_DETAIL_TABLE_PRESETS: Record<ItemDetailTablePreset, ItemDetailTablePresetConfig> = {
  inventory_inbound_edit: {
    mode: "edit",
    showBatchNo: true,
    batchNoEditable: false,
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    priceMode: "edit",
    quantity: { label: "入库数量", editable: true, min: 1, fixed: "right" },
    showDelete: true,
    showRemark: true
  },
  inventory_inbound_view: {
    mode: "view",
    showBatchNo: true,
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    priceMode: "readonly",
    quantity: { label: "入库数量", editable: false, fixed: "right" },
    showRemark: true
  },
  inventory_outbound_edit: {
    mode: "edit",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    priceMode: "edit",
    quantity: { label: "出库数量", editable: true, min: 1, fixed: "right" },
    showDelete: true,
    showRemark: true
  },
  inventory_outbound_view: {
    mode: "view",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    priceMode: "readonly",
    quantity: { label: "出库数量", editable: false, fixed: "right" },
    showRemark: true
  },
  inventory_transfer_edit: {
    mode: "edit",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    priceMode: "none",
    quantity: { label: "调拨数量", editable: true, min: 1, fixed: "right" },
    showDelete: true,
    showRemark: true
  },
  inventory_transfer_view: {
    mode: "view",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    priceMode: "readonly",
    quantity: { label: "调拨数量", editable: false, fixed: "right" },
    showRemark: true
  },
  inventory_check_edit: {
    mode: "edit",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    showAvailableStock: false,
    showCheckDiff: true,
    priceMode: "none",
    quantity: { label: "本次盘点数量", editable: true, min: 0, fixed: "right" },
    showDelete: true,
    showRemark: true
  },
  inventory_check_view: {
    mode: "view",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    stockQuantityLabel: "账面库存",
    showAvailableStock: false,
    showCheckDiff: true,
    priceMode: "readonly",
    quantity: { label: "实盘数量", editable: false, fixed: "right" },
    showRemark: true
  },
  inventory_request_edit: {
    mode: "edit",
    showImage: true,
    showCode: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    priceMode: "none",
    quantity: {
      label: "申请数量",
      editable: true,
      min: 1,
      fixed: "right",
      maxField: "availableQuantity"
    },
    showDelete: true,
    showRemark: true
  },
  inventory_request_view: {
    mode: "view",
    showImage: true,
    showCode: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    showIssuedQuantity: true,
    priceMode: "none",
    quantity: { label: "申请数量", editable: false, fixed: "right" },
    showRemark: true,
    remarkAfterQuantity: true
  },
  inventory_request_issue: {
    mode: "edit",
    showImage: true,
    showCode: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    showIssuedQuantity: true,
    showRemainQuantity: true,
    showIssueQuantity: true,
    priceMode: "none",
    quantity: { label: "申请数量", editable: false, fixed: "right" },
    showRemark: true,
    remarkAfterQuantity: true,
    remarkEditable: false
  },
  purchase_apply_edit: {
    mode: "edit",
    showImage: true,
    showCode: true,
    showItemBizType: true,
    showBrand: true,
    supplierEditable: true,
    showStock: true,
    showTotalStock: false,
    showAvailableStock: true,
    priceMode: "none",
    quantity: { label: "采购数量", editable: true, min: 1, fixed: "right" },
    showDelete: true,
    showRemark: true,
    remarkEditable: false
  },
  purchase_apply_view: {
    mode: "view",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    showStock: true,
    showTotalStock: false,
    showAvailableStock: true,
    priceMode: "readonly",
    priceScope: "purchase",
    showLineAmount: true,
    quantity: { label: "采购数量", editable: false },
    showRemark: true
  },
  purchase_apply_approve: {
    mode: "edit",
    showImage: true,
    showCode: true,
    supplierEditable: true,
    showItemBizType: true,
    showBrand: true,
    showStock: false,
    priceMode: "edit",
    priceScope: "purchase",
    showLineAmount: true,
    quantity: { label: "申请数量", editable: false },
    showRemark: true,
    remarkEditable: false
  },
  purchase_order_view: {
    mode: "view",
    showImage: true,
    showCode: true,
    showSupplier: true,
    showItemBizType: true,
    showBrand: true,
    showStock: false,
    showApplyQuantity: true,
    showInboundQuantity: true,
    showReturnQuantity: true,
    showAvailableInboundQuantity: true,
    showAvailableReturnQuantity: true,
    priceMode: "readonly",
    priceScope: "purchase",
    showLineAmount: true,
    quantity: { label: "到货数量", editable: false },
    showRemark: true
  }
}

export function getItemDetailTablePreset(preset: ItemDetailTablePreset) {
  return ITEM_DETAIL_TABLE_PRESETS[preset]
}
