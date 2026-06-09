<script lang="ts" setup>
import { watch } from "vue"
import { ItemPriceDto } from "@/model/itemPrice"
import { syncNestedItemPrice } from "@/utils/itemPrice"

const price = defineModel<ItemPriceDto | null>("price", { default: () => ({}) })

defineProps<{
  disabled?: boolean
}>()

watch(
  () => [price.value?.purchasePriceWithTax, price.value?.salePriceWithTax, price.value?.vatTaxRate],
  () => {
    if (!price.value) {
      price.value = {}
    }
    syncNestedItemPrice({ price: price.value })
  }
)
</script>

<template>
  <div class="ItemPriceForm-section">
    <div class="ItemPriceForm-section__title">价格信息</div>
    <n-grid cols="2" x-gap="16" y-gap="0">
      <n-gi>
        <n-form-item label="增值税率(%)">
          <n-input-number
            v-model:value="price!.vatTaxRate"
            placeholder="如 13"
            :show-button="false"
            :min="0"
            :max="100"
            :precision="2"
            :disabled="disabled"
            class="w-full"
          />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="采购单价(含税)">
          <n-input-number
            v-model:value="price!.purchasePriceWithTax"
            placeholder="请输入含税单价"
            :show-button="false"
            :min="0"
            :precision="4"
            :disabled="disabled"
            class="w-full"
          />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="采购单价(不含税)">
          <n-input-number
            v-model:value="price!.purchasePriceWithoutTax"
            placeholder="自动计算"
            :show-button="false"
            :min="0"
            :precision="4"
            disabled
            class="w-full"
          />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="采购税额">
          <n-input-number
            v-model:value="price!.taxAmount"
            placeholder="自动计算"
            :show-button="false"
            :min="0"
            :precision="4"
            disabled
            class="w-full"
          />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="销售单价(含税)">
          <n-input-number
            v-model:value="price!.salePriceWithTax"
            placeholder="请输入含税单价"
            :show-button="false"
            :min="0"
            :precision="4"
            :disabled="disabled"
            class="w-full"
          />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="销售单价(不含税)">
          <n-input-number
            v-model:value="price!.salePriceWithoutTax"
            placeholder="自动计算"
            :show-button="false"
            :min="0"
            :precision="4"
            disabled
            class="w-full"
          />
        </n-form-item>
      </n-gi>
    </n-grid>
  </div>
</template>

<style lang="scss" scoped>
.ItemPriceForm-section {
  margin-top: 4px;
}

.ItemPriceForm-section__title {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--n-text-color-1);
  padding-bottom: 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--n-divider-color);
}
</style>
