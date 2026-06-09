/** 明细行可能嵌套 item，统一铺平并补齐物料编码等展示字段 */
export function normalizeItemDetailRow(row: Record<string, unknown>): Record<string, unknown> {
  if (!row || typeof row !== "object") return row
  const nested = (row.item || row.itemInfo || {}) as Record<string, unknown>
  return {
    ...nested,
    ...row,
    code: row.code ?? nested.code ?? row.itemCode,
    name: row.name ?? nested.name,
    image: row.image ?? nested.image,
    typeName: row.typeName ?? nested.typeName,
    itemBizType: row.itemBizType ?? nested.itemBizType,
    itemBizTypeName: row.itemBizTypeName ?? nested.itemBizTypeName,
    unitName: row.unitName ?? nested.unitName,
    brand: row.brand ?? nested.brand,
    material: row.material ?? nested.material,
    spec1Name: row.spec1Name ?? nested.spec1Name,
    spec2Name: row.spec2Name ?? nested.spec2Name,
    spec1Uid: row.spec1Uid ?? nested.spec1Uid,
    spec2Uid: row.spec2Uid ?? nested.spec2Uid,
    spec: row.spec ?? nested.spec
  }
}

export function normalizeItemDetailList(list?: Record<string, unknown>[]) {
  return (list || []).map((row) => normalizeItemDetailRow(row))
}
