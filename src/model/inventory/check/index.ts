import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { Warehouse } from "@/model/stock"
import { InventoryOutOrderDetailVo } from "@/model/inventory/outbound"

export interface InventoryCheckOrder extends BaseEntityLd {
  code?: string
  type?: string
  startTime?: string
  endTime?: string
  warehouseUid?: string
  images?: string
  remark?: string
  status?: string
}

export interface InventoryCheckDetail extends InventoryCheckOrder {
  detailList?: InventoryCheckOrderDetailVo[]
  imageList?: string[]
  warehouseName?: string
  typeName?: string
  statusName?: string
  startTimeName?: string
  endTimeName?: string
  totalQuantity?: number
  totalProfitQuantity?: number
  totalLossQuantity?: number
}

export interface InventoryCheckOrderForm extends InventoryCheckOrder {
  typeOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  detailList?: InventoryCheckOrderDetailVo[]
  imageList?: string[]
  warehouse?: Warehouse
}

export interface InventoryCheckOrderVo extends InventoryCheckOrder {
  startTimeName?: string
  endTimeName?: string
  warehouseName?: string
  typeName?: string
  statusName?: string
}

export interface InventoryCheckOrderQuery extends PageQuery {
  key?: string
}

export interface InventoryCheckOrderQueryData {
  warehouseOptions?: OptionVo[]
}

export interface InventoryCheckOrderDetail extends BaseEntityLd {
  code?: string
  itemUid?: string
  quantity?: number
  profitQuantity?: number
  lossQuantity?: number
  orderUid?: string
}

export interface InventoryCheckOrderDetailVo extends InventoryCheckOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
  totalQuantity?: number
  availableQuantity?: number
}
