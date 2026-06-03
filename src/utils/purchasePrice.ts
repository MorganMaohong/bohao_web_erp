export interface PurchasePriceRow {
  uid?: string
  name?: string
  supplierUid?: string
  quantity?: number | null
  vatTaxRate?: number | null
  purchasePriceWithTax?: number | null
  purchasePriceWithoutTax?: number | null
}

export function isValidVatTaxRate(value: unknown) {
  if (value === null || value === undefined || value === "") return false
  const rate = Number(value)
  return Number.isFinite(rate) && rate >= 0 && rate <= 100
}

export function isPositivePrice(value: unknown) {
  if (value === null || value === undefined || value === "") return false
  const price = Number(value)
  return Number.isFinite(price) && price > 0
}

export function calcPriceWithoutTax(priceWithTax: unknown, vatTaxRate: unknown) {
  if (!isPositivePrice(priceWithTax) || !isValidVatTaxRate(vatTaxRate)) return null
  const divisor = 1 + Number(vatTaxRate) / 100
  return roundMoney(Number(priceWithTax) / divisor, 4)
}

export function syncPurchasePriceRow<T extends PurchasePriceRow>(row: T) {
  const priceWithoutTax = calcPriceWithoutTax(row.purchasePriceWithTax, row.vatTaxRate)
  row.purchasePriceWithoutTax = priceWithoutTax
  return row
}

export function syncPurchasePriceRows<T extends PurchasePriceRow>(rows: T[] = []) {
  rows.forEach(syncPurchasePriceRow)
  return rows
}

export function calcTaxAmount(priceWithTax: unknown, vatTaxRate: unknown, quantity: unknown = 1) {
  const priceWithoutTax = calcPriceWithoutTax(priceWithTax, vatTaxRate)
  if (priceWithoutTax === null || !isPositiveQuantity(quantity)) return null
  return roundMoney((Number(priceWithTax) - priceWithoutTax) * Number(quantity), 4)
}

export function calcAmountWithTax(priceWithTax: unknown, quantity: unknown) {
  if (!isPositivePrice(priceWithTax) || !isPositiveQuantity(quantity)) return null
  return roundMoney(Number(priceWithTax) * Number(quantity), 4)
}

export function calcAmountWithoutTax(priceWithTax: unknown, vatTaxRate: unknown, quantity: unknown) {
  const priceWithoutTax = calcPriceWithoutTax(priceWithTax, vatTaxRate)
  if (priceWithoutTax === null || !isPositiveQuantity(quantity)) return null
  return roundMoney(priceWithoutTax * Number(quantity), 4)
}

export function validatePurchasePriceRows(rows: PurchasePriceRow[] = [], notify: (message: string) => void) {
  for (const row of rows) {
    const name = row.name || "物料"
    if (!row.uid) {
      notify("存在无效的采购明细")
      return false
    }
    if (!isPositivePrice(row.purchasePriceWithTax)) {
      notify(`【${name}】含税单价必须大于0`)
      return false
    }
    if (!isValidVatTaxRate(row.vatTaxRate)) {
      notify(`【${name}】增值税税率必须在 0 到 100 之间`)
      return false
    }
    syncPurchasePriceRow(row)
    if (!isPositivePrice(row.purchasePriceWithoutTax)) {
      notify(`【${name}】不含税单价计算异常，请检查含税单价和税率`)
      return false
    }
  }
  return true
}

export function formatMoney(value: unknown, precision = 4) {
  if (value === null || value === undefined || value === "") return "-"
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return "-"
  return numberValue.toFixed(precision)
}

function isPositiveQuantity(value: unknown) {
  if (value === null || value === undefined || value === "") return false
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity > 0
}

function roundMoney(value: number, precision: number) {
  const factor = 10 ** precision
  return Math.round((value + Number.EPSILON) * factor) / factor
}
