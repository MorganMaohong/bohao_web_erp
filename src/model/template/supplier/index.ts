import { BaseEntityLd, OptionVo, PageQuery } from "@/model"

export interface Supplier extends BaseEntityLd {
  code?: string
  name?: string
  remark?: string
  category?: string
  level?: string
  settlement?: string
  address?: string
  area?: string
  creditLimit?: string
  startTime?: number
  endTime?: number
}

export interface SupplierForm extends Supplier {
  categoryOptions?: OptionVo[]
  levelOptions?: OptionVo[]
  settlementOptions?: OptionVo[]
}

export interface SupplierQuery extends PageQuery {
  name?: string
}
