import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { FlowDefinitionSchemaVo } from "@/model/flow/schema"
import { ItemsBase } from "@/model/template/items"

export interface PurchaseApplyOrder extends BaseEntityLd {
  code?: string
  address?: string
  applyTime?: number
  expectTime?: number
  sourceType?: string
  warehouseUid?: string
  remark?: string
  flowInstanceUid?: string
  status?: string
  currentNodeUid?: string
}

export interface PurchaseApplyOrderForm extends PurchaseApplyOrder {
  sourceTypeOptions?: OptionVo[]
  detailList?: PurchaseApplyOrderDetailVo[]
  warehouseOptions?: OptionVo[]
  supplierOptions?: OptionVo[]
}

export interface PurchaseApplyOrderVo extends PurchaseApplyOrder {
  statusName?: string
  currentNodeName?: string
  sourceTypeName?: string
  expectTimeName?: string
  applyTimeName?: string
}

export interface PurchaseApplyDetail extends PurchaseApplyOrder {
  statusName?: string
  currentNodeName?: string
  sourceTypeName?: string
  expectTimeName?: string
  applyTimeName?: string
  allowEditPrice?: boolean
  canEditPrice?: boolean
  canCreatePurchaseOrder?: boolean
  purchaseOrderCount?: number
  flowSchema?: FlowDefinitionSchemaVo
  detailList?: PurchaseApplyOrderDetailVo[]
  supplierOptions?: OptionVo[]
}

export interface PurchaseApplyOrderQuery extends PageQuery {
  name?: string
}

export interface PurchaseApplyOrderQueryData {}

export interface PurchaseApplyOrderDetail extends ItemsBase {
  code?: string
  itemUid?: string
  quantity?: number
  orderUid?: string
}

export interface PurchaseApplyOrderDetailVo extends PurchaseApplyOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
  totalQuantity?: number
  availableQuantity?: number
}

export interface PurchaseOrder extends BaseEntityLd {
  code?: string
  supplierUid?: string
  orderType?: string
  status?: string
  totalAmount?: number
  totalAmountWithoutTax?: number
  applyOrderUid?: string
  sourceOrderUid?: string
  remark?: string
  expectTime?: number
  flowInstanceUid?: string
  currentNodeUid?: string
}

export interface PurchaseOrderVo extends PurchaseOrder {
  supplierName?: string
  orderTypeName?: string
  statusName?: string
  expectTimeName?: string
  applyOrderCode?: string
  sourceOrderCode?: string
}

export interface PurchaseOrderDetailVo extends PurchaseApplyOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
  applyQuantity?: number
  totalAmount?: number
  totalAmountWithoutTax?: number
  inboundQuantity?: number
  returnQuantity?: number
  availableInboundQuantity?: number
  availableReturnQuantity?: number
  priceCompareReason?: string
}

export interface PurchaseOrderForm extends PurchaseOrder {
  supplierName?: string
  orderTypeName?: string
  statusName?: string
  expectTimeName?: string
  applyOrderCode?: string
  sourceOrderCode?: string
  detailList?: PurchaseOrderDetailVo[]
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  supplierName?: string
  orderTypeName?: string
  statusName?: string
  expectTimeName?: string
  applyOrderCode?: string
  sourceOrderCode?: string
  applyOrderStatus?: string
  applyOrderStatusName?: string
  applyRemark?: string
  totalInboundQuantity?: number
  totalReturnQuantity?: number
  availableInboundQuantity?: number
  availableReturnQuantity?: number
  canInbound?: boolean
  canReturn?: boolean
  flowSchema?: FlowDefinitionSchemaVo
  inboundOrderList?: PurchaseOrderInboundVo[]
  detailList?: PurchaseOrderDetailVo[]
}

export interface PurchaseOrderInboundDetailVo extends PurchaseApplyOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
  returnedQuantity?: number
  availableQuantity?: number
}

export interface PurchaseOrderInboundVo extends BaseEntityLd {
  code?: string
  type?: string
  otherType?: string
  time?: number
  timeName?: string
  warehouseUid?: string
  warehouseName?: string
  remark?: string
  status?: string
  statusName?: string
  purchaseOrderUid?: string
  totalQuantity?: number
  detailList?: PurchaseOrderInboundDetailVo[]
}

export interface PurchaseOrderQuery extends PageQuery {
  key?: string
  status?: string
  orderType?: string
  scene?: string
}

export interface PurchaseOrderQueryData {
  statusOptions?: OptionVo[]
  supplierOptions?: OptionVo[]
  orderTypeOptions?: OptionVo[]
}

export interface PurchasePriceCompareItem {
  orderDetailUid?: string
  itemUid?: string
  itemName?: string
  supplierUid?: string
  quantity?: number
  vatTaxRate?: number
  purchasePriceWithTax?: number
}

export interface PurchasePriceCompareQuery {
  orderUid?: string
  detailList?: PurchasePriceCompareItem[]
}

export interface PurchasePriceCompareVo {
  orderDetailUid?: string
  itemUid?: string
  itemName?: string
  supplierUid?: string
  supplierName?: string
  currentPurchasePriceWithTax?: number
  currentPurchasePriceWithoutTax?: number
  currentVatTaxRate?: number
  historyCount?: number
  sameSupplierHistoryCount?: number
  lastSameSupplierPriceWithTax?: number
  lastSameSupplierPriceWithoutTax?: number
  lastSameSupplierVatTaxRate?: number
  lastSameSupplierOrderUid?: string
  lastSameSupplierOrderCode?: string
  lastSameSupplierTimeName?: string
  avgSameSupplierPriceWithTax?: number
  avgSameSupplierPriceWithoutTax?: number
  minHistoryPriceWithTax?: number
  minHistoryPriceWithoutTax?: number
  avgHistoryPriceWithTax?: number
  avgHistoryPriceWithoutTax?: number
  maxHistoryPriceWithTax?: number
  maxHistoryPriceWithoutTax?: number
  minHistorySupplierUid?: string
  minHistorySupplierName?: string
  minHistoryOrderUid?: string
  minHistoryOrderCode?: string
  currentVsAvgRate?: number
  currentVsMinRate?: number
  currentVsAvgWithoutTaxRate?: number
  currentVsMinWithoutTaxRate?: number
  priceReasonRequired?: boolean
  priceReasonTip?: string
  compareBaseName?: string
  warningLevel?: "default" | "normal" | "warning" | "danger" | "success"
  warningText?: string
}

export interface PurchasePriceHistoryQuery {
  orderUid?: string
  itemUid?: string
  supplierUid?: string
  currentPage?: number
  pageSize?: number
}

export interface PurchasePriceHistoryRecordVo {
  orderUid?: string
  orderCode?: string
  orderStatus?: string
  orderStatusName?: string
  orderTimeName?: string
  itemUid?: string
  itemName?: string
  supplierUid?: string
  supplierName?: string
  quantity?: number
  vatTaxRate?: number
  purchasePriceWithTax?: number
  purchasePriceWithoutTax?: number
  totalAmountWithTax?: number
  totalAmountWithoutTax?: number
}

export interface PurchasePriceHistoryResultVo {
  itemUid?: string
  itemName?: string
  supplierUid?: string
  supplierOptions?: OptionVo[]
  list?: PurchasePriceHistoryRecordVo[]
  count?: number
}
