import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { ItemsBase } from "@/model/template/items"
import { Warehouse } from "@/model/stock"
import { InventoryCheckOrderDetailVo } from "@/model/inventory/check"

export interface InventoryTransferOrder extends BaseEntityLd {
  type?: string
  applyTime?: number
  expectTime?: number
  outWarehouseUid?: string
  inWarehouseUid?: string
  projectUid?: string
  projectName?: string
  receiveUserName?: string
  receiveTime?: number | string
  receiveTimeName?: string
  receiveRemark?: string
  images?: string
  remark?: string
  outOrderUid?: string
  inOrderUid?: string
  status?: string
}

export interface InventoryTransferOrderForm extends InventoryTransferOrder {
  imageList?: string[]
  typeOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  detailList?: InventoryTransferOrderDetailVo[]
  inWarehouse?: Warehouse
  outWarehouse?: Warehouse
  projectOptions?: OptionVo[]
}

export interface InventoryTransferDetail extends InventoryTransferOrder {
  detailList?: InventoryTransferOrderDetailVo[]
  imageList?: string[]
  totalQuantity?: number
  totalPurchasePriceWithTax?: number
  totalAmountWithTax?: number
  totalAmountWithoutTax?: number
  totalTaxAmount?: number
}

export interface InventoryTransferOrderVo extends InventoryTransferOrder {
  typeName?: string
  inWarehouseName?: string
  outWarehouseName?: string
  applyTimeName?: string
  expectTimeName?: string
  statusName?: string
}

export interface InventoryTransferOrderQuery extends PageQuery {
  key?: string
  status?: string
  inWarehouseUid?: string
  outWarehouseUid?: string
  typeList?: string[]
}

export interface InventoryTransferOrderQueryData {
  warehouseOptions?: OptionVo[]
}

export interface InventoryTransferOrderDetail extends ItemsBase {
  code?: string
  itemUid?: string
  quantity?: number
  remark?: string
  batchNo?: string
  orderUid?: string
  transferOrderUid?: string
}

export interface InventoryTransferOrderDetailVo extends InventoryTransferOrderDetail {
  typeName?: string
  unitName?: string
  supplierName?: string
}
