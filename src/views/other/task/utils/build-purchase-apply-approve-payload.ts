import { FlowTaskSubmitForm, TaskCenterDetail } from "@/model/flow"
import {
  getPurchasePriceWithTax,
  getPurchasePriceWithoutTax,
  getVatTaxRate
} from "@/utils/itemPrice"
import { syncPurchasePriceRows, validatePurchasePriceRows } from "@/utils/purchasePrice"

export function buildPurchaseApplyApprovePayload(
  detail: TaskCenterDetail,
  notify: (message: string) => void
): Partial<FlowTaskSubmitForm> | false {
  const rows = detail.data?.detailList || []
  for (const row of rows) {
    row.purchasePriceWithTax = getPurchasePriceWithTax(row)
    row.vatTaxRate = getVatTaxRate(row)
    row.purchasePriceWithoutTax = getPurchasePriceWithoutTax(row)
  }
  syncPurchasePriceRows(rows)
  for (const row of rows) {
    if (!row.supplierUid) {
      notify(`【${row.name || "物料"}】请选择供应商`)
      return false
    }
  }
  const priceDetailList = rows.map((row: Record<string, unknown>) => ({
    uid: row.uid as string,
    name: row.name as string,
    supplierUid: row.supplierUid as string,
    vatTaxRate: getVatTaxRate(row),
    purchasePriceWithTax: getPurchasePriceWithTax(row),
    purchasePriceWithoutTax: getPurchasePriceWithoutTax(row)
  }))
  if (!validatePurchasePriceRows(priceDetailList, notify)) {
    return false
  }
  return { priceDetailList }
}
