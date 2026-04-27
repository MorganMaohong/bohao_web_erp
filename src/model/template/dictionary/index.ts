import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "@/model"

export interface Dictionary extends BaseEntityLd {
  type?: string
  name?: string
  remark?: string
  sort?: number
  enabled?: boolean
  parentUid?: string
}

export interface DictionaryForm extends Dictionary {
  treeOptions?: TreeOptionVo[]
  typeOptions?: OptionVo[]
}

export interface DictionaryQuery {
  name?: string
}

export interface DictionaryVo extends Dictionary {
  children?: DictionaryVo[]
  typeName?: string
}
