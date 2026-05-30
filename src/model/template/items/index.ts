import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "@/model"

export interface ItemsBase extends BaseEntityLd {
  code?: string
  name?: string
  image?: string
  /** 末级品类 uid */
  type?: string
  unit?: string
  itemBizType?: string
  spec?: string
  specUids?: string
  material?: string
  brand?: string
  brandUid?: string
  supplierUid?: string
  remark?: string
  vatTaxRate?: number
  taxAmount?: number
  purchasePriceWithTax?: number
  purchasePriceWithoutTax?: number
  salePriceWithTax?: number
  salePriceWithoutTax?: number
}

export interface Items extends ItemsBase {}

export interface ItemsVo extends Items {
  typeName?: string
  unitName?: string
  supplierName?: string
  itemBizTypeName?: string
  totalQuantity?: number
  availableQuantity?: number
}

export interface ItemsForm extends Items {
  specUidList?: string[]
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
  supplierOptions?: OptionVo[]
  itemBizTypeOptions?: OptionVo[]
  specOptions?: OptionVo[]
  brandOptions?: OptionVo[]
}

export interface ItemsQuery extends PageQuery {
  key?: string
  type?: string
  unit?: string
  warehouseUid?: string
  itemBizType?: string
  specUid?: string
  brandUid?: string
}

export interface ItemsQueryData {
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
  specOptions?: OptionVo[]
  brandOptions?: OptionVo[]
}
