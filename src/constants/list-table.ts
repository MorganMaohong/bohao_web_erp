import type { VxeTablePropTypes } from "vxe-table"

/** ERP 扁平数据转树形表格（uid / parentUid），默认展开所有节点 */
export const ERP_UID_TREE_TABLE_CONFIG: VxeTablePropTypes.TreeConfig = {
  transform: true,
  rowField: "uid",
  parentField: "parentUid",
  expandAll: true
}

/** 列表页横向滚动：列较多时启用 */
export const ERP_LIST_TABLE_SCROLL_X: VxeTablePropTypes.ScrollX = {
  enabled: true,
  gt: 0
}

/** 固定高度表格纵向虚拟滚动（pageSize 50 时仅渲染可视区行） */
export const ERP_LIST_TABLE_SCROLL_Y: VxeTablePropTypes.ScrollY = {
  enabled: true,
  gt: 0,
  mode: "wheel"
}
