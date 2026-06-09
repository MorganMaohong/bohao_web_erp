<script lang="ts" setup>
import { computed } from "vue"
import { ItemPriceSummaryDto } from "@/model/itemPrice"
import { formatMoney } from "@/utils/purchasePrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"

const { canViewItemPrice } = useItemPricePermission()

const props = defineProps<{
  totalQuantity?: number | string | null
  summary?: ItemPriceSummaryDto | null
  totalAmountWithTax?: number | string | null
  totalAmountWithoutTax?: number | string | null
  totalTaxAmount?: number | string | null
  totalSaleAmountWithTax?: number | string | null
  totalSaleAmountWithoutTax?: number | string | null
  mode?: "descriptions" | "form"
  variant?: "inbound" | "outbound" | "transfer" | "purchase"
  quantityLabel?: string
}>()

const variantPrefix = computed(() => {
  if (props.variant === "outbound") return "出库"
  if (props.variant === "transfer") return "调拨"
  if (props.variant === "purchase") return "采购"
  return "入库"
})

const amountWithTax = computed(() => props.summary?.totalAmountWithTax ?? props.totalAmountWithTax)
const amountWithoutTax = computed(() => props.summary?.totalAmountWithoutTax ?? props.totalAmountWithoutTax)
const taxAmount = computed(() => props.summary?.totalTaxAmount ?? props.totalTaxAmount)
const saleAmountWithTax = computed(() => props.summary?.totalSaleAmountWithTax ?? props.totalSaleAmountWithTax)
const saleAmountWithoutTax = computed(
  () => props.summary?.totalSaleAmountWithoutTax ?? props.totalSaleAmountWithoutTax
)

const resolvedQuantityLabel = computed(
  () => props.quantityLabel ?? `${variantPrefix.value}总数`
)

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-"
  return formatMoney(value)
}

function displayNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return "0"
  return String(value)
}
</script>

<template>
  <n-grid v-if="mode === 'form'" cols="2" x-gap="16" y-gap="0">
    <n-gi>
      <n-form-item :label="resolvedQuantityLabel">
        <n-input disabled placeholder="0" :value="displayNumber(totalQuantity)" />
      </n-form-item>
    </n-gi>
    <template v-if="canViewItemPrice">
      <n-gi>
        <n-form-item label="采购总价(含税)">
          <n-input disabled placeholder="0.00" :value="displayNumber(amountWithTax)" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="采购总价(不含税)">
          <n-input disabled placeholder="0.00" :value="displayNumber(amountWithoutTax)" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="采购总税额">
          <n-input disabled placeholder="0.00" :value="displayNumber(taxAmount)" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="销售总价(含税)">
          <n-input disabled placeholder="0.00" :value="displayNumber(saleAmountWithTax)" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="销售总价(不含税)">
          <n-input disabled placeholder="0.00" :value="displayNumber(saleAmountWithoutTax)" />
        </n-form-item>
      </n-gi>
    </template>
  </n-grid>
  <n-descriptions v-else :column="4" bordered>
    <n-descriptions-item :label="resolvedQuantityLabel">
      {{ totalQuantity ?? "-" }}
    </n-descriptions-item>
    <template v-if="canViewItemPrice">
      <n-descriptions-item :label="`${variantPrefix}总采购价（含税）/元`">
        {{ displayValue(amountWithTax) }}
      </n-descriptions-item>
      <n-descriptions-item :label="`${variantPrefix}总采购价（不含税）/元`">
        {{ displayValue(amountWithoutTax) }}
      </n-descriptions-item>
      <n-descriptions-item :label="`本次${variantPrefix}品总税额/元`">
        {{ displayValue(taxAmount) }}
      </n-descriptions-item>
      <n-descriptions-item :label="`${variantPrefix}总销售价（含税）/元`">
        {{ displayValue(saleAmountWithTax) }}
      </n-descriptions-item>
      <n-descriptions-item :label="`${variantPrefix}总销售价（不含税）/元`">
        {{ displayValue(saleAmountWithoutTax) }}
      </n-descriptions-item>
    </template>
  </n-descriptions>
</template>
