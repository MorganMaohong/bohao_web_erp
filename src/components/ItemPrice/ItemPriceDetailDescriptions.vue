<script lang="ts" setup>
import { ItemPriceCarrier } from "@/model/itemPrice"
import { displayPurchasePriceWithoutTax, getPurchasePriceWithTax, getVatTaxRate } from "@/utils/itemPrice"
import { formatMoney } from "@/utils/purchasePrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"

defineProps<{
  data?: ItemPriceCarrier | null
}>()

const { canViewItemPrice } = useItemPricePermission()
</script>

<template>
  <n-descriptions-item v-show="canViewItemPrice" label="增值税率">
    {{ getVatTaxRate(data) != null ? `${getVatTaxRate(data)}%` : "-" }}
  </n-descriptions-item>
  <n-descriptions-item v-show="canViewItemPrice" label="采购单价(含税)">
    {{ formatMoney(getPurchasePriceWithTax(data)) }}
  </n-descriptions-item>
  <n-descriptions-item v-show="canViewItemPrice" label="采购单价(不含税)">
    {{ displayPurchasePriceWithoutTax(data ?? {}) }}
  </n-descriptions-item>
</template>
