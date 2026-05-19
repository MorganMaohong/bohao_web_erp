import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { InventoryOutOrderVo } from "@/model/inventory/outbound"
import { ItemsBase } from "@/model/template/items"

export interface SalesOrder extends BaseEntityLd {
  code?: string
  customerUid?: string
  orderType?: string
  status?: string
  saleTime?: number
  expectTime?: number
  totalAmount?: number
  totalAmountWithoutTax?: number
  sourceOrderUid?: string
  remark?: string
  flowInstanceUid?: string
  currentNodeUid?: string
}

export interface SalesOrderDetailVo extends ItemsBase {
  code?: string
  itemUid?: string
  quantity?: number
  outboundQuantity?: number
  returnQuantity?: number
  salePriceWithTax?: number
  salePriceWithoutTax?: number
  orderUid?: string
  typeName?: string
  unitName?: string
  totalAmount?: number
  totalAmountWithoutTax?: number
  availableOutboundQuantity?: number
}

export interface SalesOrderForm extends SalesOrder {
  customerName?: string
  orderTypeName?: string
  statusName?: string
  saleTimeName?: string
  expectTimeName?: string
  detailList?: SalesOrderDetailVo[]
  customerOptions?: OptionVo[]
  orderTypeOptions?: OptionVo[]
  statusOptions?: OptionVo[]
}

export interface SalesOrderVo extends SalesOrder {
  customerName?: string
  orderTypeName?: string
  statusName?: string
  saleTimeName?: string
  expectTimeName?: string
  totalQuantity?: number
  outboundQuantity?: number
}

export interface SalesOrderDetail extends SalesOrderVo {
  availableOutboundQuantity?: number
  canOutbound?: boolean
  detailList?: SalesOrderDetailVo[]
  outboundOrderList?: InventoryOutOrderVo[]
}

export interface SalesOrderQuery extends PageQuery {
  key?: string
  customerUid?: string
  status?: string
  orderType?: string
  scene?: string
}

export interface SalesOrderQueryData {
  statusOptions?: OptionVo[]
  customerOptions?: OptionVo[]
  orderTypeOptions?: OptionVo[]
}
