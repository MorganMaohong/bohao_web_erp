export interface BaseEntity {
  id?: number
  createTime?: string
  updateTime?: string
  uid?: string
}

export interface BaseEntityLd {
  id?: number
  createTime?: string
  updateTime?: string
  uid?: string
  delete?: boolean
}

export interface BaseLink {
  id: number
}

export interface PageQuery {
  currentPage: number
  pageSize: number
}

export interface PageVo<T, E> {
  currentPage: number
  pageSize: number
  count: number
  list: T[]
  extraData: E
}

export interface TreeOptionVo {
  /**
   * 子集
   */
  children?: TreeOptionVo[]
  /**
   * 标题
   */
  label?: string
  /**
   * 内容
   */
  value?: string

  [property: string]: any
}

export interface OptionVo {
  /**
   * 标题
   */
  label?: string
  /**
   * 内容
   */
  value?: string

  [property: string]: any
}

export interface TempOptionVo {
  label?: string
  /*e*
   * 内容
   */
  value?: string
  parentUid?: string
  group: boolean
  children?: TempOptionVo[]
}

export interface UpdateDragSortForm {
  newUid?: string
  newSort?: number
  oldUid?: string
  oldSort?: number
}
