<script lang="ts" setup>
import { computed, watch } from "vue"
import MCard from "@/components/MCard/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import { OptionVo } from "@/model"
import { PurchaseApplyDetail } from "@/model/purchase"
import { FlowInstanceStatusDict } from "@/constants/enum"
import { ItemDetailTablePreset } from "@/constants/item-detail-table"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX } from "@/constants/template-ui"
import { ensureItemPrice, syncNestedItemPrice } from "@/utils/itemPrice"

const props = withDefaults(
  defineProps<{
    detail?: PurchaseApplyDetail & { createName?: string }
    loading?: boolean
    variant?: "page" | "flow"
    canEditPrice?: boolean
    supplierOptions?: OptionVo[]
    approveHint?: string
    tableMaxHeight?: number | string
    showOrderSection?: boolean
  }>(),
  {
    detail: () => ({ detailList: [] }),
    loading: false,
    variant: "page",
    canEditPrice: false,
    supplierOptions: () => [],
    tableMaxHeight: TEMPLATE_MODAL_TABLE_DETAIL_MAX,
    showOrderSection: true
  }
)

const tablePreset = computed<ItemDetailTablePreset>(() =>
  props.canEditPrice ? "purchase_apply_approve" : "purchase_apply_view"
)

const resolvedSupplierOptions = computed(
  () => props.supplierOptions?.length ? props.supplierOptions : props.detail.supplierOptions || []
)

function statusTagType(status?: string) {
  if (status === FlowInstanceStatusDict.REJECTED) return "error"
  if (status === FlowInstanceStatusDict.WITHDRAWN) return "warning"
  if (status === FlowInstanceStatusDict.COMPLETED) return "success"
  if (status === FlowInstanceStatusDict.RUNNING) return "info"
  return "default"
}

function normalizeDetailPrices() {
  for (const row of props.detail.detailList || []) {
    const price = ensureItemPrice(row)
    const flat = row as {
      purchasePriceWithTax?: number
      purchasePriceWithoutTax?: number
      vatTaxRate?: number
    }
    if (flat.purchasePriceWithTax != null) price.purchasePriceWithTax = flat.purchasePriceWithTax
    if (flat.purchasePriceWithoutTax != null) price.purchasePriceWithoutTax = flat.purchasePriceWithoutTax
    if (flat.vatTaxRate != null) price.vatTaxRate = flat.vatTaxRate
    syncNestedItemPrice(row)
  }
}

watch(
  () => [props.canEditPrice, props.detail.detailList] as const,
  () => {
    if (props.canEditPrice) normalizeDetailPrices()
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <n-space vertical :size="12">
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">基本信息</div>
    </div>
    <n-descriptions bordered :column="2" label-placement="left">
      <n-descriptions-item :label="variant === 'flow' ? '编码' : '申请单号'">
        {{ detail.code || "-" }}
      </n-descriptions-item>
      <n-descriptions-item v-if="variant === 'flow'" label="申请人">
        {{ detail.createName || "-" }}
      </n-descriptions-item>
      <n-descriptions-item :label="variant === 'flow' ? '申请时间' : '申请日期'">
        {{ detail.applyTimeName || "-" }}
      </n-descriptions-item>
      <n-descriptions-item :label="variant === 'flow' ? '需求到货时间' : '到货需求日期'">
        {{ detail.expectTimeName || "-" }}
      </n-descriptions-item>
      <n-descriptions-item label="需求来源">{{ detail.sourceTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="用途类型">{{ detail.usageTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item :label="variant === 'flow' ? '业务类型' : '业务对象类型'">
        {{ detail.bizTypeName || "-" }}
      </n-descriptions-item>
      <n-descriptions-item :label="variant === 'flow' ? '业务对象' : '业务对象'">
        {{ detail.bizName || "-" }}
      </n-descriptions-item>
      <n-descriptions-item v-if="variant === 'page'" label="到货地址" :span="2">
        {{ detail.address || "-" }}
      </n-descriptions-item>
      <n-descriptions-item v-if="variant === 'page'" label="流程状态">
        <n-tag v-if="detail.statusName" size="small" :type="statusTagType(detail.status)" :bordered="false">
          {{ detail.statusName }}
        </n-tag>
        <span v-else>-</span>
      </n-descriptions-item>
      <n-descriptions-item v-if="variant === 'page'" label="当前节点">{{ detail.currentNodeName || "-" }}</n-descriptions-item>
    </n-descriptions>

    <template v-if="variant === 'page' && showOrderSection">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">采购订单</div>
      </div>
      <n-descriptions bordered :column="1" label-placement="left">
        <n-descriptions-item label="已生成订单">
          <slot name="order-section" />
        </n-descriptions-item>
      </n-descriptions>
    </template>

    <div>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">采购物料明细</div>
      </div>
      <m-card padding="0">
        <ItemDetailTable
          :data="detail.detailList"
          :preset="tablePreset"
          :loading="loading"
          :max-height="tableMaxHeight"
          :supplier-options="resolvedSupplierOptions"
        />
      </m-card>
    </div>

    <n-tag v-if="approveHint" :type="canEditPrice ? 'warning' : 'default'" size="small">
      {{ approveHint }}
    </n-tag>

    <template v-if="variant === 'page'">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">其他</div>
      </div>
      <n-descriptions bordered :column="1" label-placement="left">
        <n-descriptions-item label="备注">{{ detail.remark || "-" }}</n-descriptions-item>
      </n-descriptions>
    </template>
  </n-space>
</template>
