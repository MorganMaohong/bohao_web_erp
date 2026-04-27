import { TreeOptionVo, OptionVo, PageQuery, BaseEntityLd } from "src/model"
import { Menu } from "@/model/menu"

export interface User extends BaseEntityLd {
  /** 用户名（长度 5~25） */
  username: string

  /** 邮箱 */
  email?: string

  /** 手机号 */
  phone?: string

  /** 密码 */
  password?: string

  /** 姓名 */
  name: string

  /** 头像 */
  headImage?: string

  /** 性别（字典值） */
  sex?: string

  /** 是否启用 */
  enabled: boolean

  /** 密码错误次数 */
  errorCount: number

  /** 部门Uid */
  departmentUid: string

  /** 职位Uid */
  postUid: string

  /** 微信用户绑定的用户id */
  wxuid?: string

  /** 公众号用户的uid */
  wpuid?: string

  /** 是否为超级管理员 */
  superAdmin: boolean
  jobName?: string
}

export interface UserVo extends User {
  deptLabel?: string
  enabledLabel?: string
  postLabel?: string
  sexLabel?: string
}

/**
 * UserQuery，用户查询
 */
export interface UserQuery extends PageQuery {
  /**
   * 结束时间 时间戳
   */
  createEndTime?: number
  /**
   * 开始时间 时间戳
   */
  createStartTime?: number

  /**
   * 部门uid
   */
  // departmentUid?: string
  departmentUidList?: string[]
  /**
   * 启用状态
   */
  enabled?: { [key: string]: any }
  /**
   * 姓名
   */
  name?: string

  /**
   * 职位
   */
  // postUid?: string
  postUidList?: string[]
  /**
   * role
   */
  roleUid?: string
  sex?: string
  /**
   * 用户名
   */
  username?: string
}

/**
 * UserInfoVo，用户信息
 */
export interface UserInfoVo extends User {
  deptLabel?: string
  enabledLabel?: string
  postLabel?: string
  sexLabel?: string
  menuList: Menu[]
  roleList?: string[]
  permissionList?: string[]
}

export interface UserProfileForm {
  headImage?: string
  name?: string
  sex?: string
  phone?: string
}

export interface UserPasswordChangeForm {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export interface UserPasswordResetApplyForm {
  reason?: string
}

export interface UserPasswordIssueVo {
  userUid?: string
  username?: string
  name?: string
  temporaryPassword?: string
  scene?: string
}

/**
 * UserForm，用户表单
 */
export interface UserForm extends User {
  deptOptions?: TreeOptionVo[]
  postOptions?: TreeOptionVo[]
  /**
   * 职位下拉数据
   */
  postOptionsDeptMap?: { [key: string]: Post[] }
  sexOptions?: OptionVo[]
}

export interface UserPermForm extends User {
  roleOptions?: OptionVo[]
  roleUidList?: string[]
  permissionUidList?: string[]
  permissionOptions?: string[]
  projectUidList?: string[]
  projectOptions?: OptionVo[]
  gatewayUidList?: string[]
  gatewayOptions?: OptionVo[]
}

/**
 * 职位下拉数据
 *
 * Post，职位下拉数据
 */
export interface Post {
  createColumn?: string
  /**
   * 部门uid
   */
  departmentUid?: string
  /**
   * Id
   */
  id?: number
  /**
   * 名称
   */
  name?: string
  /**
   * 父uid
   */
  parentUid?: string
  /**
   * 排序
   */
  sort?: number
  /**
   * 唯一uid 操作更新等操作需要
   */
  uid?: string
  updateColumn?: string

  [property: string]: any
}

/**
 * UserQueryData，用户查询扩展数据
 */
export interface UserQueryData {
  deptOptions?: TreeOptionVo[]
  postOptions?: OptionVo[]
  roleOptions?: OptionVo[]
  sexOptions?: OptionVo[]

  [property: string]: any
}
