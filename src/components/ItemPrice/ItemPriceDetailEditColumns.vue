<script lang="ts" setup>
import { ItemPriceCarrier } from "@/model/itemPrice"
import { ensureItemPrice, syncNestedItemPrice } from "@/utils/itemPrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"

const { canViewItemPrice } = useItemPricePermission()

function syncDetailPrice(row: ItemPriceCarrier) {
  syncNestedItemPrice(row)
}
</script>

<template>
  <template v-if="canViewItemPrice">
    <vxe-column title="税率%" show-overflow="tooltip" align="center" width="12%">
      <template #default="{ row }">
        <vxe-number-input v-model="ensureItemPrice(row).vatTaxRate" @change="syncDetailPrice(row)" />
      </template>
    </vxe-column>
    <vxe-column title="采购含税" show-overflow="tooltip" align="center" width="12%">
      <template #default="{ row }">
        <vxe-number-input v-model="ensureItemPrice(row).purchasePriceWithTax" @change="syncDetailPrice(row)" />
      </template>
    </vxe-column>
    <vxe-column title="采购不含税" show-overflow="tooltip" align="center" width="12%">
      <template #default="{ row }">
        <vxe-number-input v-model="ensureItemPrice(row).purchasePriceWithoutTax" disabled />
      </template>
    </vxe-column>
  </template>
</template>
