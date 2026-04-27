/**
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
