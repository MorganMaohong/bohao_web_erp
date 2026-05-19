import { BaseEntityLd, OptionVo, PageQuery } from "@/model"

export interface Supplier extends BaseEntityLd {
  code?: string
  name?: string
  taxNo?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNo?: string
  contactName?: string
  contactPhone?: string
  remark?: string
  category?: string
  level?: string
  settlement?: string
  settlementMethod?: string
  address?: string
  area?: string
  creditLimit?: number
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
