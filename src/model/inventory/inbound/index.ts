import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { ItemPriceSummaryDto } from "@/model/itemPrice"
import { Warehouse } from "@/model/stock"
import { ItemsBase } from "@/model/template/items"

export interface InventoryInOrder extends BaseEntityLd {
  code?: string
  type?: string
  otherType?: string
  time?: number | string
  warehouseUid?: string
  projectUid?: string
  projectName?: string
  customerName?: string
  sourcePartyName?: string
  handlerName?: string
  approvalRemark?: string
  inspectionRemark?: string
  purchaseOrderUid?: string
  images?: string
  remark?: string
  status?: string
}

export interface InventoryInOrderForm extends InventoryInOrder {
  typeOptions?: OptionVo[]
  projectOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  warehouse?: Warehouse
  imageList?: string[]
  detailList?: InventoryInOrderDetailVo[]
}

export interface InventoryInOrderDetail extends ItemsBase {
  code?: string
  itemUid?: string
  quantity?: number
  returnedQuantity?: number
  purchaseOrderDetailUid?: string
  remark?: string
  batchNo?: string
}

export interface InventoryInOrderDetailVo extends InventoryInOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
  totalQuantity?: number
  availableQuantity?: number
}

export interface InventoryInOrderVo extends InventoryInOrder {
  typeName?: string
  warehouseName?: string
  statusName?: string
  timeName?: string
  purchaseOrderCode?: string
}

export interface InventoryInOrderQuery extends PageQuery {
  type?: string
  key?: string
  warehouseUid?: string
  status?: string
  excludeTypeList?: string[]
}

export interface InventoryInOrderQueryData {
  typeOptions?: OptionVo[]
  statusOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
}

export interface InventoryInboundDetail extends InventoryInOrder {
  imageList?: string[]
  warehouseName?: string
  timeName?: string
  typeName?: string
  statusName?: string
  detailList?: InventoryInOrderDetailVo[]
  priceSummary?: ItemPriceSummaryDto | null
  totalAmountWithTax?: number
  totalPurchasePriceWithTax?: number
  totalTaxAmount?: number
  totalQuantity?: number
  purchaseOrderCode?: string
}
