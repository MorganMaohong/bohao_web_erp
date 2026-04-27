import { BaseEntityLd, OptionVo, TreeOptionVo } from "src/model"

export interface Menu extends BaseEntityLd {
  /** 标题名称 */
  title: string

  name: string

  redirect: string

  /** 图标 */
  icon: string
  selectedIcon: string
  version: string

  /** 菜单类型 */
  type: string

  /** 排序 */
  sort: number

  /** 链接路径 */
  link: string

  /** 菜单路径 */
  path: string

  /** 组件路径 */
  component: string

  /** 上级菜单 */
  parentUid: string

  /** 是否隐藏 */
  visible: boolean

  /** 菜单类型时，是否为多级菜单 */
  multiLevel: boolean

  /** 菜单为外链 */
  linkType: boolean
}

export interface MenuDataVo {
  list: MenuTreeVo[]
}

export interface MenuTreeVo extends Menu {
  children: MenuTreeVo[]
}

export interface MenuQuery {}

export interface MenuForm extends Menu {
  versionOptions: OptionVo[]
  typeOptions: OptionVo[]
  menuTreeOptions: TreeOptionVo[]
}

export interface MenuQueryForm {
  uid: string
  version: string
}

export interface MenuSortForm {
  newRowUid: string
  oldRowUid: string
}
