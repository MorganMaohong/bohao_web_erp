import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "@/model"

export interface Inventory extends BaseEntityLd {
  itemUid?: string
  warehouseUid?: string
  quantity?: number
}

export interface InventoryVo extends Inventory {
  name?: string
  type?: string
  typeName?: string
  unit?: string
  unitName?: string
  image?: string
  spec?: string
  material?: string
  warehouseUid?: string
  warehouseName?: string
  supplierUid?: string
  supplierName?: string
  vatTaxRate?: number
  purchasePriceWithTax?: number
  purchasePriceWithoutTax?: number
  totalQuantity?: number
  availableQuantity?: number
}

export interface InventoryQuery extends PageQuery {
  key?: string
  warehouseUidList?: string[]
  supplierUidList?: string[]
  types?: string[]
  units?: string[]
}

export interface InventoryQueryData {
  typeOptions?: TreeOptionVo[]
  warehouseOptions?: OptionVo[]
  supplierOptions?: OptionVo[]
  unitOptions?: TreeOptionVo[]
}

export interface InventoryFlow extends BaseEntityLd {
  itemUid?: string
  warehouseUid?: string
  changeQuantity?: number
  beforeQuantity?: number
  afterQuantity?: number
  businessType?: string
  businessUid?: string
  businessDetailUid?: string
}

export interface InventoryFlowVo extends InventoryFlow {
  itemsName?: string
  itemsType?: string
  itemsTypeName?: string
  itemsUnit?: string
  itemsUnitName?: string
  itemsImage?: string
  itemsSpec?: string
  itemsMaterial?: string
  warehouseUid?: string
  warehouseName?: string
  itemsSupplierUid?: string
  itemsSupplierName?: string
}

export interface InventoryFlowQuery extends PageQuery {
  key?: string
  warehouseUidList?: string[]
  supplierUidList?: string[]
  types?: string[]
  units?: string[]
}

export interface InventoryFlowQueryData {
  typeOptions?: TreeOptionVo[]
  warehouseOptions?: OptionVo[]
  supplierOptions?: OptionVo[]
  unitOptions?: TreeOptionVo[]
}
