import { BaseEntityLd, OptionVo, TreeOptionVo } from "@/model"

export type ItemDictNodeKind = "CATEGORY" | "SPEC" | "SPEC1" | "SPEC2" | "BRAND"

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
  spec1Name?: string
  spec2Name?: string
}

export interface ItemDictVo extends ItemDict {
  nodeKindName?: string
  categoryPathName?: string
  spec1Tags?: OptionVo[]
  spec2Tags?: OptionVo[]
  brandTags?: OptionVo[]
  leafCategory?: boolean
  /** 列表展示用虚拟分组（规格/品牌） */
  virtualNode?: boolean
  /** 规格1/规格2/品牌 标签展示行 */
  tagRowKind?: "spec1" | "spec2" | "brand"
  displayTags?: OptionVo[]
}

export interface ItemDictPickerVo {
  specOptions?: OptionVo[]
  spec1Options?: OptionVo[]
  spec2Options?: OptionVo[]
  brandOptions?: OptionVo[]
}

export interface ItemCodeBuildForm {
  categoryUid?: string
  spec1Uid?: string
  spec2Uid?: string
  brandUid?: string
}
