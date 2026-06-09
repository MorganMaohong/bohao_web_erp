<script lang="ts" setup>
import { formatMoney } from "@/utils/purchasePrice"
import { getPurchasePriceWithTax, getVatTaxRate } from "@/utils/itemPrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"

const { canViewItemPrice } = useItemPricePermission()

withDefaults(
  defineProps<{
    /** 采购含税列标题 */
    purchaseTitle?: string
    /** 税率列标题 */
    rateTitle?: string
    /** 是否展示采购不含税列 */
    showWithoutTax?: boolean
    withoutTaxTitle?: string
    purchaseMinWidth?: string | number
    rateMinWidth?: string | number
    withoutTaxMinWidth?: string | number
  }>(),
  {
    purchaseTitle: "采购含税",
    rateTitle: "税率%",
    showWithoutTax: false,
    withoutTaxTitle: "采购不含税",
    purchaseMinWidth: 110,
    rateMinWidth: 88,
    withoutTaxMinWidth: 110
  }
)
</script>

<template>
  <template v-if="canViewItemPrice">
  <vxe-column :title="purchaseTitle" align="center" :min-width="purchaseMinWidth">
    <template #default="{ row }">
      <span>{{ formatMoney(getPurchasePriceWithTax(row)) }}</span>
    </template>
  </vxe-column>
  <vxe-column :title="rateTitle" show-overflow="tooltip" align="center" :min-width="rateMinWidth">
    <template #default="{ row }">
      <span>{{ getVatTaxRate(row) != null ? `${getVatTaxRate(row)}%` : "—" }}</span>
    </template>
  </vxe-column>
  <vxe-column
    v-if="showWithoutTax"
    :title="withoutTaxTitle"
    show-overflow="tooltip"
    align="center"
    :min-width="withoutTaxMinWidth"
  >
    <template #default="{ row }">
      <span>{{ formatMoney(row.price?.purchasePriceWithoutTax) }}</span>
    </template>
  </vxe-column>
  </template>
</template>
