import { BaseEntityLd, TreeOptionVo } from "src/model"

export interface Department extends BaseEntityLd {
  name?: string
  parentUid?: string
  sort?: number
}

/**
 * DeptVo，部门对象
 */
export interface DeptVo {
  children?: DeptVo[]
  createColumn?: string
  /**
   * Id
   */
  id?: number
  name?: string
  parentUid?: string
  sort?: number
  state?: boolean
  /**
   * 唯一uid 操作更新等操作需要
   */
  uid?: string
  updateColumn?: string

  [property: string]: any
}

/**
 * DeptForm，部门表单
 */
export interface DeptForm {
  createColumn?: string
  /**
   * Id
   */
  id?: number
  name?: string
  parentUid?: string
  sort?: number
  state?: boolean
  /**
   * 唯一uid 操作更新等操作需要
   */
  uid?: string
  updateColumn?: string
  deptTree?: TreeOptionVo[]

  [property: string]: any
}

export interface DeptPostUserVo {
  children?: DeptPostUserVo[]
  group?: boolean
  name?: string
  parentUid?: string
  postName?: string
  uid?: string

  [property: string]: any
}

export interface DeptTreePostUserVo {
  children?: DeptTreePostUserVo[]
  group?: boolean
  deptName?: string
  userName?: string
  parentUid?: string
  postName?: string
  uid?: string
}

export interface DeptPostUserVoTest {
  children?: DeptPostUserVo[]
  name?: string
  parentUid?: string
  uid?: string
}
