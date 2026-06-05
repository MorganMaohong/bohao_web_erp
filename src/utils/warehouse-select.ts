import type { OptionVo } from "@/model"
import type { Warehouse } from "@/model/stock"

/** 解析后端仓库选项 label：编号-仓库名称 */
export function parseWarehouseOptionLabel(label?: string): { code: string; name: string } {
  if (!label) {
    return { code: "", name: "" }
  }
  const idx = label.indexOf("-")
  if (idx < 0) {
    return { code: "", name: label }
  }
  return {
    code: label.slice(0, idx),
    name: label.slice(idx + 1)
  }
}

export function applyWarehouseByUid(warehouse: Warehouse, uid: string | null | undefined, options: OptionVo[]): void {
  if (!uid) {
    Object.assign(warehouse, {})
    return
  }
  const opt = options.find((item) => item.value === uid)
  const { code, name } = parseWarehouseOptionLabel(opt?.label)
  Object.assign(warehouse, { uid, code, name })
}
