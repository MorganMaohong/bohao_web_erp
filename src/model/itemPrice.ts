/** 物料价格嵌套 DTO，与后端 ItemPriceDto 对齐 */
export interface ItemPriceDto {
  vatTaxRate?: number | null
  purchasePriceWithTax?: number | null
  purchasePriceWithoutTax?: number | null
  taxAmount?: number | null
  salePriceWithTax?: number | null
  salePriceWithoutTax?: number | null
}

/** 入库等场景的金额汇总，与后端 ItemPriceSummaryDto 对齐 */
export interface ItemPriceSummaryDto {
  totalAmountWithTax?: number | null
  totalAmountWithoutTax?: number | null
  totalTaxAmount?: number | null
  totalSaleAmountWithTax?: number | null
  totalSaleAmountWithoutTax?: number | null
}

export interface ItemPriceCarrier {
  price?: ItemPriceDto | null
  name?: string
}
