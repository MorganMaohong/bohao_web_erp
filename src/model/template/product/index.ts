import { BaseEntityLd, PageQuery, TreeOptionVo } from "@/model"

export interface Product extends BaseEntityLd {
  name?: string
  image?: string
  type?: string
  unit?: string
  spec?: string
  remark?: string
}

export interface ProductVo extends Product {
  typeName?: string
  unitName?: string
}

export interface ProductForm extends Product {
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
}

export interface ProductQuery extends PageQuery {
  key?: string
  type?: string
  unit?: string
}

export interface ProductQueryData {
  typeOptions?: TreeOptionVo[]
  unitOptions?: TreeOptionVo[]
}
