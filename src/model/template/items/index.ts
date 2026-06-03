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
  spec1Name?: string
  spec2Name?: string
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
  spec1Uid?: string
  spec2Uid?: string
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
  supplierOptions?: OptionVo[]
  itemBizTypeOptions?: OptionVo[]
  specOptions?: OptionVo[]
  spec1Options?: OptionVo[]
  spec2Options?: OptionVo[]
  brandOptions?: OptionVo[]
}

export interface ItemsQuery extends PageQuery {
  key?: string
  type?: string
  unit?: string
  warehouseUid?: string
  itemBizType?: string
  specUid?: string
  spec1Uid?: string
  spec2Uid?: string
  brandUid?: string
}

export interface ItemsQueryData {
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
  specOptions?: OptionVo[]
  spec1Options?: OptionVo[]
  spec2Options?: OptionVo[]
  brandOptions?: OptionVo[]
}
