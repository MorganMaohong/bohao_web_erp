import { BaseEntityLd, TreeOptionVo } from "src/model"

export interface PostTreeQuery {
  deptUidList: string[]
}

export interface PostDataVo {
  deptTree: TreeOptionVo[]
  list: PostVo[]
}

/**
 * PostVo，职位View
 */
export interface PostVo {
  children?: PostVo[]
  createColumn?: string
  /**
   * 部门uid
   */
  departmentUid?: string
  /**
   * 部门名称
   */
  deptName?: string
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

export interface Post extends BaseEntityLd {
  name?: string
  departmentUid?: string
  parentUid?: string
  sort?: number
}

/**
 * PostForm，职位表单
 */
export interface PostForm extends Post {
  deptOptions?: TreeOptionVo[]
  postOptions?: TreeOptionVo[]
}
