<!--
  vxe-table 要求 vxe-column 必须是表格的直接子节点，不能通过子组件包裹。
  物料列表等页面请在 vxe-table 内联下列列定义，并配合 :visible="canViewItemPrice" 隐藏列。
-->
<script lang="ts" setup>
import { formatMoney } from "@/utils/purchasePrice"
import {
  displayPurchasePriceWithoutTax,
  displayPurchaseTaxAmount,
  displaySalePriceWithoutTax,
  getPurchasePriceWithTax,
  getSalePriceWithTax,
  getVatTaxRate
} from "@/utils/itemPrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"

const { canViewItemPrice } = useItemPricePermission()
</script>

<template>
  <vxe-column
    title="税率%"
    align="center"
    min-width="88"
    class-name="erp-list-table__col-secondary"
    :visible="canViewItemPrice"
  >
      <template #default="{ row }">
        <span>{{ getVatTaxRate(row) != null ? `${getVatTaxRate(row)}%` : "—" }}</span>
      </template>
  </vxe-column>
  <vxe-column title="采购含税" align="center" min-width="116" :visible="canViewItemPrice">
      <template #default="{ row }">
        <span class="erp-list-table__money">{{ formatMoney(getPurchasePriceWithTax(row)) }}</span>
      </template>
    </vxe-column>
  <vxe-column
    title="采购不含税"
    align="center"
    min-width="116"
    class-name="erp-list-table__col-secondary"
    :visible="canViewItemPrice"
  >
      <template #default="{ row }">
        <span class="erp-list-table__money">{{ displayPurchasePriceWithoutTax(row) }}</span>
      </template>
    </vxe-column>
  <vxe-column
    title="采购税额"
    align="center"
    min-width="100"
    class-name="erp-list-table__col-secondary"
    :visible="canViewItemPrice"
  >
      <template #default="{ row }">
        <span class="erp-list-table__money">{{ displayPurchaseTaxAmount(row) }}</span>
      </template>
    </vxe-column>
  <vxe-column title="销售含税" align="center" min-width="116" :visible="canViewItemPrice">
      <template #default="{ row }">
        <span class="erp-list-table__money">{{ formatMoney(getSalePriceWithTax(row)) }}</span>
      </template>
    </vxe-column>
  <vxe-column
    title="销售不含税"
    align="center"
    min-width="116"
    class-name="erp-list-table__col-secondary"
    :visible="canViewItemPrice"
  >
      <template #default="{ row }">
        <span class="erp-list-table__money">{{ displaySalePriceWithoutTax(row) }}</span>
      </template>
  </vxe-column>
</template>
