import type { VxeTablePropTypes } from "vxe-table"

/** ERP 扁平数据转树形表格（uid / parentUid），默认展开所有节点 */
export const ERP_UID_TREE_TABLE_CONFIG: VxeTablePropTypes.TreeConfig = {
  transform: true,
  rowField: "uid",
  parentField: "parentUid",
  expandAll: true
}
