import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "@/model"
import { ItemPriceDto } from "@/model/itemPrice"

export interface Inventory extends BaseEntityLd {
  itemUid?: string
  warehouseUid?: string
  quantity?: number
  lockedQuantity?: number
}

export interface InventoryVo extends Inventory {
  code?: string
  name?: string
  type?: string
  typeName?: string
  unit?: string
  unitName?: string
  itemBizType?: string
  itemBizTypeName?: string
  image?: string
  spec?: string
  spec1Name?: string
  spec2Name?: string
  material?: string
  remark?: string
  brand?: string
  brandUid?: string
  warehouseUid?: string
  warehouseName?: string
  supplierUid?: string
  supplierName?: string
  price?: ItemPriceDto | null
  totalQuantity?: number
  availableQuantity?: number
}

export interface InventoryOverviewDetail extends InventoryVo {
  recentFlowList?: InventoryFlowVo[]
}

export interface InventoryQuery extends PageQuery {
  key?: string
  code?: string
  itemBizType?: string
  availableOnly?: boolean
  /** 末级品类 uid */
  type?: string
  spec1Uid?: string
  spec2Uid?: string
  brandUid?: string
  warehouseUidList?: string[]
  supplierUidList?: string[]
  types?: string[]
  units?: string[]
}

export interface InventoryQueryData {
  typeOptions?: TreeOptionVo[]
  specOptions?: OptionVo[]
  spec1Options?: OptionVo[]
  spec2Options?: OptionVo[]
  brandOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  supplierOptions?: OptionVo[]
  unitOptions?: TreeOptionVo[]
  summary?: InventoryOverviewSummary
}

export interface InventoryOverviewSummary {
  itemCount?: number
  totalQuantity?: number
  availableQuantity?: number
  lockedQuantity?: number
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
  code?: string
  name?: string
  type?: string
  typeName?: string
  unit?: string
  unitName?: string
  image?: string
  spec?: string
  spec1Name?: string
  spec2Name?: string
  material?: string
  brand?: string
  itemBizType?: string
  itemBizTypeName?: string
  remark?: string
  warehouseName?: string
  supplierUid?: string
  supplierName?: string
  businessTypeName?: string
  createTimeName?: string
  updateTimeName?: string
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
  itemUid?: string
  type?: string
  spec1Uid?: string
  spec2Uid?: string
  brandUid?: string
  businessType?: string
  warehouseUidList?: string[]
  supplierUidList?: string[]
  types?: string[]
  units?: string[]
}

export interface InventoryFlowQueryData {
  typeOptions?: TreeOptionVo[]
  specOptions?: OptionVo[]
  spec1Options?: OptionVo[]
  spec2Options?: OptionVo[]
  brandOptions?: OptionVo[]
  businessTypeOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  supplierOptions?: OptionVo[]
  unitOptions?: TreeOptionVo[]
}
