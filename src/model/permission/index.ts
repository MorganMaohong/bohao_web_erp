import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "src/model"
import { Role } from "@/model/role"

export interface Permission extends BaseEntityLd {
  /** 权限名称 */
  name: string

  /** 排序 */
  sort: number

  /** 权限编码 */
  code: string

  /** 权限描述 */
  description?: string

  /** 权限类型：菜单权限、API权限、场站权限、工程权限等 */
  permissionType: string
  groupUid: string
}

export interface PermissionVo extends Permission {}

export interface PermissionForm extends Permission {
  /** 权限类型数据 */
  permTypeOptions: OptionVo[]

  /** Api 树形数据 */
  apiTreeOptions: TreeOptionVo[]
  apiOptions: OptionVo[]

  /** 菜单树形数据 */
  menuTreeOptions: TreeOptionVo[]
  menuOptions: OptionVo[]

  /** 项目数据 */
  projectOptions: OptionVo[]

  /** 场站树形数据 */
  stationOptions: TreeOptionVo[]

  /** 网关树形数据 */
  gatewayOptions: OptionVo[]

  /** 选中的权限资源 Uid */
  selectUidList: string[]
}

export interface PermissionQuery extends PageQuery {
  name?: string
  createStartTime?: number
  createEndTime?: number
  groupUid?: string
  permissionType?: string
  permissionTypeList?: string[]
}

export interface PermissionQueryData {
  groupOptions: TreeOptionVo[]
}

export interface PermissionGroup extends BaseEntityLd {
  name?: string
  def?: boolean
  parentUid?: string
}

export interface PermissionGroupForm extends PermissionGroup {
  groupOptions: TreeOptionVo[]
}
