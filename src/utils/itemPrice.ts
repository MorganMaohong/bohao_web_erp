import { ItemPriceCarrier, ItemPriceDto, ItemPriceSummaryDto } from "@/model/itemPrice"
import {
  calcAmountWithTax,
  calcAmountWithoutTax,
  calcPriceWithoutTax,
  calcTaxAmount,
  formatMoney,
  resolveDisplayPriceWithoutTax,
  resolveDisplayUnitTaxAmount,
  syncItemPriceFields,
  validateItemPriceFields
} from "@/utils/purchasePrice"

export function createEmptyItemPrice(): ItemPriceDto {
  return {}
}

export function ensureItemPrice<T extends ItemPriceCarrier>(row: T): ItemPriceDto {
  if (!row.price) {
    row.price = createEmptyItemPrice()
  }
  return row.price
}

export function cloneItemPrice(price?: ItemPriceDto | null): ItemPriceDto | undefined {
  if (!price) return undefined
  return { ...price }
}

type FlatItemPriceFields = {
  purchasePriceWithTax?: number | null
  purchasePriceWithoutTax?: number | null
  vatTaxRate?: number | null
  taxAmount?: number | null
  salePriceWithTax?: number | null
  salePriceWithoutTax?: number | null
}

export function getVatTaxRate(row?: (ItemPriceCarrier & FlatItemPriceFields) | null) {
  return row?.price?.vatTaxRate ?? row?.vatTaxRate
}

export function getPurchasePriceWithTax(row?: (ItemPriceCarrier & FlatItemPriceFields) | null) {
  return row?.price?.purchasePriceWithTax ?? row?.purchasePriceWithTax
}

export function getPurchasePriceWithoutTax(row?: (ItemPriceCarrier & FlatItemPriceFields) | null) {
  return row?.price?.purchasePriceWithoutTax ?? row?.purchasePriceWithoutTax
}

export function getTaxAmount(row?: (ItemPriceCarrier & FlatItemPriceFields) | null) {
  return row?.price?.taxAmount ?? row?.taxAmount
}

export function getSalePriceWithTax(row?: (ItemPriceCarrier & FlatItemPriceFields) | null) {
  return row?.price?.salePriceWithTax ?? row?.salePriceWithTax
}

export function getSalePriceWithoutTax(row?: (ItemPriceCarrier & FlatItemPriceFields) | null) {
  return row?.price?.salePriceWithoutTax ?? row?.salePriceWithoutTax
}

export function syncNestedItemPrice<T extends ItemPriceCarrier>(row: T) {
  return syncItemPriceFields(ensureItemPrice(row))
}

export function validateNestedItemPrice<T extends ItemPriceCarrier>(
  row: T,
  notify: (message: string) => void,
  itemName = row.name || "物料"
) {
  return validateItemPriceFields(ensureItemPrice(row), notify, itemName)
}

export function displayPurchasePriceWithoutTax(row: ItemPriceCarrier) {
  const price = row.price
  return formatMoney(
    resolveDisplayPriceWithoutTax(price?.purchasePriceWithTax, price?.vatTaxRate, price?.purchasePriceWithoutTax)
  )
}

export function displayPurchaseTaxAmount(row: ItemPriceCarrier) {
  const price = row.price
  return formatMoney(resolveDisplayUnitTaxAmount(price?.purchasePriceWithTax, price?.vatTaxRate, price?.taxAmount))
}

export function displaySalePriceWithoutTax(row: ItemPriceCarrier) {
  const price = row.price
  return formatMoney(
    resolveDisplayPriceWithoutTax(price?.salePriceWithTax, price?.vatTaxRate, price?.salePriceWithoutTax)
  )
}

export function calcDetailAmountWithTax(row: ItemPriceCarrier & { quantity?: number | null }) {
  return calcAmountWithTax(getPurchasePriceWithTax(row), row.quantity)
}

export function calcDetailAmountWithoutTax(row: ItemPriceCarrier & { quantity?: number | null }) {
  return calcAmountWithoutTax(getPurchasePriceWithTax(row), getVatTaxRate(row), row.quantity)
}

export function calcDetailTaxAmount(row: ItemPriceCarrier & { quantity?: number | null }) {
  return calcTaxAmount(getPurchasePriceWithTax(row), getVatTaxRate(row), row.quantity)
}

export function calcDetailUnitPriceWithoutTax(row: ItemPriceCarrier) {
  const price = row.price
  return (
    price?.purchasePriceWithoutTax ??
    calcPriceWithoutTax(price?.purchasePriceWithTax, price?.vatTaxRate)
  )
}

export function sumDetailListAmounts<T extends ItemPriceCarrier & { quantity?: number | null }>(rows: T[] = []) {
  return rows.reduce(
    (acc, row) => {
      const quantity = Number(row.quantity) || 0
      const priceWithTax = Number(getPurchasePriceWithTax(row)) || 0
      const priceWithoutTax = Number(calcDetailUnitPriceWithoutTax(row)) || 0
      acc.withTax += quantity * priceWithTax
      acc.withoutTax += quantity * priceWithoutTax
      return acc
    },
    { withTax: 0, withoutTax: 0 }
  )
}

function calcDetailSaleUnitPriceWithoutTax(row: ItemPriceCarrier) {
  const price = row.price
  return (
    price?.salePriceWithoutTax ??
    calcPriceWithoutTax(price?.salePriceWithTax, price?.vatTaxRate)
  )
}

export function sumDetailListSaleAmounts<T extends ItemPriceCarrier & { quantity?: number | null }>(rows: T[] = []) {
  return rows.reduce(
    (acc, row) => {
      const quantity = Number(row.quantity) || 0
      const priceWithTax = Number(getSalePriceWithTax(row)) || 0
      const priceWithoutTax = Number(calcDetailSaleUnitPriceWithoutTax(row)) || 0
      acc.withTax += quantity * priceWithTax
      acc.withoutTax += quantity * priceWithoutTax
      return acc
    },
    { withTax: 0, withoutTax: 0 }
  )
}

export function buildPriceSummaryFromTotals(
  purchase: { withTax: number; withoutTax: number },
  sale?: { withTax: number; withoutTax: number }
): ItemPriceSummaryDto {
  return {
    totalAmountWithTax: purchase.withTax,
    totalAmountWithoutTax: purchase.withoutTax,
    totalTaxAmount: purchase.withTax - purchase.withoutTax,
    totalSaleAmountWithTax: sale?.withTax,
    totalSaleAmountWithoutTax: sale?.withoutTax
  }
}
