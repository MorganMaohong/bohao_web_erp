import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "@/model"

export interface ItemsBase extends BaseEntityLd {
  name?: string
  image?: string
  type?: string
  unit?: string
  itemBizType?: string
  spec?: string
  material?: string
  brand?: string
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
}

export interface ItemsForm extends Items {
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
  supplierOptions?: OptionVo[]
  itemBizTypeOptions?: OptionVo[]
}

export interface ItemsQuery extends PageQuery {
  key?: string
  type?: string
  unit?: string
  warehouseUid?: string
  itemBizType?: string
}

export interface ItemsQueryData {
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
}
