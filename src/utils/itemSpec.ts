export interface ItemSpecRow {
  spec?: string
  spec1Name?: string
  spec2Name?: string
}

export function splitItemSpec(spec?: string) {
  const parts = (spec || "")
    .split("、")
    .map((item) => item.trim())
    .filter(Boolean)
  return {
    spec1Name: parts[0] || "",
    spec2Name: parts[1] || ""
  }
}

export function getSpec1Name(row?: ItemSpecRow | null) {
  if (!row) return "-"
  if (row.spec1Name) return row.spec1Name
  return splitItemSpec(row.spec).spec1Name || "-"
}

export function getSpec2Name(row?: ItemSpecRow | null) {
  if (!row) return "-"
  if (row.spec2Name) return row.spec2Name
  return splitItemSpec(row.spec).spec2Name || "-"
}

export function formatItemSpecLabel(row?: ItemSpecRow | null) {
  const spec1 = getSpec1Name(row)
  const spec2 = getSpec2Name(row)
  const parts = [spec1, spec2].filter((item) => item && item !== "-")
  return parts.join(" / ") || "-"
}
