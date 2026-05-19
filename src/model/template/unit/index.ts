import { BaseEntityLd, PageQuery, TreeOptionVo } from "@/model"

export interface Unit extends BaseEntityLd {
  code?: string
  name?: string
  category?: string
  precisionScale?: number
  baseUnitUid?: string
  convertRate?: number
  enabled?: boolean
  parentUid?: string
  sort?: number
  remark?: string
}

export interface UnitVo extends Unit {
  baseUnitName?: string
}

export interface UnitForm extends Unit {
  unitOptions?: TreeOptionVo[]
}

export interface UnitQuery extends PageQuery {
  key?: string
  category?: string
  enabled?: boolean
}
