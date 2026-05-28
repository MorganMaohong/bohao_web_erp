import { BaseEntityLd, OptionVo, TreeOptionVo } from "@/model"

export type ItemDictNodeKind = "CATEGORY" | "SPEC" | "BRAND"

export interface ItemDict extends BaseEntityLd {
  nodeKind?: ItemDictNodeKind
  code?: string
  name?: string
  remark?: string
  sort?: number
  enabled?: boolean
  parentUid?: string
}

export interface ItemDictForm extends ItemDict {
  treeOptions?: TreeOptionVo[]
  nodeKindOptions?: OptionVo[]
}

export interface ItemDictQuery {
  name?: string
}

export interface ItemDictVo extends ItemDict {
  nodeKindName?: string
  categoryPathName?: string
  specSummary?: string
  brandSummary?: string
  leafCategory?: boolean
  /** 列表展示用虚拟分组（规格/品牌） */
  virtualNode?: boolean
}

export interface ItemDictPickerVo {
  specOptions?: OptionVo[]
  brandOptions?: OptionVo[]
}

export interface ItemCodeBuildForm {
  categoryUid?: string
  specUids?: string[]
  brandUid?: string
}
