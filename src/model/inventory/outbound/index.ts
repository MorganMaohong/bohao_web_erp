import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { Warehouse } from "@/model/stock"
import { ItemsBase } from "@/model/template/items"

export interface InventoryOutOrder extends BaseEntityLd {
  code?: string
  type?: string
  otherType?: string
  time?: number | string
  warehouseUid?: string
  purchaseOrderUid?: string
  purchaseOrderCode?: string
  inOrderUid?: string
  purchaseReturnType?: string
  resendOrderUid?: string
  resendOrderUids?: string
  bizType?: string
  bizUid?: string
  bizName?: string
  images?: string
  remark?: string
  status?: string
}

export interface InventoryOutOrderForm extends InventoryOutOrder {
  typeOptions?: OptionVo[]
  projectOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  warehouse?: Warehouse
  imageList?: string[]
  detailList?: InventoryOutOrderDetailVo[]
  resendOrderCodeList?: string[]
  recordList?: PurchaseReturnRecordVo[]
}

export interface InventoryOutOrderDetail extends ItemsBase {
  code?: string
  itemUid?: string
  quantity?: number
  remark?: string
  batchNo?: string
  orderUid?: string
  purchaseOrderDetailUid?: string
  bizDetailUid?: string
  sourceInDetailUid?: string
}

export interface InventoryOutOrderDetailVo extends InventoryOutOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
  totalQuantity?: number
  availableQuantity?: number
}

export interface InventoryOutOrderVo extends InventoryOutOrder {
  typeName?: string
  warehouseName?: string
  statusName?: string
  timeName?: string
  purchaseReturnTypeName?: string
  totalQuantity?: number
  resendOrderCodeList?: string[]
}

export interface InventoryOutOrderQuery extends PageQuery {
  type?: string
  key?: string
  warehouseUid?: string
  status?: string
  purchaseReturnType?: string
}

export interface InventoryOutOrderQueryData {
  typeOptions?: OptionVo[]
  statusOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  purchaseReturnTypeOptions?: OptionVo[]
}

export interface InventoryOutboundDetail extends InventoryOutOrder {
  imageList?: string[]
  warehouseName?: string
  timeName?: string
  typeName?: string
  statusName?: string
  purchaseReturnTypeName?: string
  resendOrderCodeList?: string[]
  detailList?: InventoryOutOrderDetailVo[]
  recordList?: PurchaseReturnRecordVo[]
  totalAmountWithTax?: number
  totalPurchasePriceWithTax?: number
  totalTaxAmount?: number
  totalQuantity?: number
}

export interface PurchaseReturnRecordVo {
  uid?: string
  code?: string
  purchaseReturnType?: string
  purchaseReturnTypeName?: string
  status?: string
  statusName?: string
  time?: number | string
  timeName?: string
  purchaseOrderCode?: string
  totalQuantity?: number
  remark?: string
  resendOrderCodeList?: string[]
}
