import { BaseEntity, BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "src/model"

export interface Role extends BaseEntityLd {
  name?: string
  code?: string
  description?: string
  groupUid?: string
  type?: string
}

export interface RoleVo extends Role {}

export interface RoleForm extends Role {
  permUidList?: string[]
  permOptions?: OptionVo[]
  typeOptions?: OptionVo[]
  groupOptions?: OptionVo[]
}

export interface RoleQuery extends PageQuery {
  name?: string
  createStartTime?: number
  createEndTime?: number
  groupUid?: string
}

export interface RoleGroup extends BaseEntityLd {
  name?: string
  def?: boolean
  parentUid?: string
}

export interface RoleGroupForm extends RoleGroup {
  groupOptions: TreeOptionVo[]
}

export interface RoleQueryData {
  groupOptions: TreeOptionVo[]
}
