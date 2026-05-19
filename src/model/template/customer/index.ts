import { BaseEntityLd, OptionVo, PageQuery } from "@/model"

export interface Customer extends BaseEntityLd {
  code?: string
  name?: string
  contactName?: string
  contactPhone?: string
  remark?: string
  category?: string
  level?: string
  settlement?: string
  address?: string
  area?: string
  creditLimit?: number
  startTime?: number
  endTime?: number
}

export interface CustomerForm extends Customer {
  categoryOptions?: OptionVo[]
  levelOptions?: OptionVo[]
  settlementOptions?: OptionVo[]
}

export interface CustomerVo extends Customer {
  categoryName?: string
  levelName?: string
  settlementName?: string
  startTimeName?: string
  endTimeName?: string
}

export interface CustomerQuery extends PageQuery {
  name?: string
}
