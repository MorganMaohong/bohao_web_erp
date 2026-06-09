<script lang="ts" setup>
import { computed } from "vue"
import MCard from "@/components/MCard/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import ItemPriceSummary from "@/components/ItemPrice/ItemPriceSummary.vue"
import { useItemPricePermission } from "@/composables/useItemPricePermission"
import { PurchaseOrderDetail } from "@/model/purchase"
import { PurchaseOrderStatusDict } from "@/constants/enum"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX, TEMPLATE_MODAL_TABLE_RECORD_MAX } from "@/constants/template-ui"

const props = withDefaults(
  defineProps<{
    detail?: PurchaseOrderDetail
    loading?: boolean
    linkable?: boolean
    tableMaxHeight?: number | string
    inboundTableMaxHeight?: number | string
  }>(),
  {
    detail: () => ({ detailList: [], inboundOrderList: [] }),
    loading: false,
    linkable: true,
    tableMaxHeight: TEMPLATE_MODAL_TABLE_DETAIL_MAX,
    inboundTableMaxHeight: TEMPLATE_MODAL_TABLE_RECORD_MAX
  }
)

const emit = defineEmits<{
  openApply: [uid?: string, code?: string]
  openOrder: [uid?: string, code?: string]
  openInbound: [uid?: string, code?: string]
}>()

const { canViewItemPrice } = useItemPricePermission()

const detailTotalQuantity = computed(() =>
  (props.detail.detailList || []).reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
)

const detailPriceSummary = computed(() => ({
  totalAmountWithTax: props.detail.totalAmount,
  totalAmountWithoutTax: props.detail.totalAmountWithoutTax,
  totalTaxAmount: (Number(props.detail.totalAmount) || 0) - (Number(props.detail.totalAmountWithoutTax) || 0)
}))

function statusTagType(status?: string) {
  if (status === PurchaseOrderStatusDict.REJECT) return "error"
  if (status === PurchaseOrderStatusDict.WAIT_CONFIRM || status === PurchaseOrderStatusDict.WAIT_APPROVE) return "warning"
  if (status === PurchaseOrderStatusDict.APPROVED || status === PurchaseOrderStatusDict.ALL_IN) return "success"
  if (status === PurchaseOrderStatusDict.PART_IN || status === PurchaseOrderStatusDict.PART_RETURN) return "info"
  return "default"
}
</script>

<template>
  <n-space vertical :size="12">
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">订单信息</div>
    </div>
    <n-descriptions bordered :column="2" label-placement="left">
      <n-descriptions-item label="订单编号">{{ detail.code || "-" }}</n-descriptions-item>
      <n-descriptions-item label="订单类型">{{ detail.orderTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="预计到货">{{ detail.expectTimeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="状态">
        <n-tag v-if="detail.statusName" size="small" :type="statusTagType(detail.status)" :bordered="false">
          {{ detail.statusName }}
        </n-tag>
        <span v-else>-</span>
      </n-descriptions-item>
      <n-descriptions-item label="供应商">{{ detail.supplierName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="申请单号">
        <n-button
          v-if="linkable && detail.applyOrderCode"
          text
          type="info"
          @click="emit('openApply', detail.applyOrderUid, detail.applyOrderCode)"
        >
          {{ detail.applyOrderCode }}
        </n-button>
        <span v-else>{{ detail.applyOrderCode || "-" }}</span>
      </n-descriptions-item>
      <n-descriptions-item label="来源订单">
        <n-button
          v-if="linkable && detail.sourceOrderCode"
          text
          type="info"
          @click="emit('openOrder', detail.sourceOrderUid, detail.sourceOrderCode)"
        >
          {{ detail.sourceOrderCode }}
        </n-button>
        <span v-else>{{ detail.sourceOrderCode || "-" }}</span>
      </n-descriptions-item>
      <n-descriptions-item label="申请状态">{{ detail.applyOrderStatusName || "-" }}</n-descriptions-item>
    </n-descriptions>
    <div>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">订单明细</div>
      </div>
      <m-card padding="0">
        <ItemDetailTable
          :data="detail.detailList"
          preset="purchase_order_view"
          :loading="loading"
          :max-height="tableMaxHeight"
        />
      </m-card>
    </div>
    <template v-if="canViewItemPrice">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">汇总信息</div>
      </div>
      <ItemPriceSummary
        mode="descriptions"
        variant="purchase"
        quantity-label="到货总数"
        :total-quantity="detailTotalQuantity"
        :summary="detailPriceSummary"
      />
    </template>
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">其他</div>
    </div>
    <n-descriptions bordered :column="1" label-placement="left">
      <n-descriptions-item label="备注">{{ detail.remark || "-" }}</n-descriptions-item>
    </n-descriptions>
    <template v-if="detail.inboundOrderList?.length">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">相关采购入库</div>
      </div>
      <m-card padding="0">
        <vxe-table
          border
          stripe
          show-overflow
          align="center"
          :data="detail.inboundOrderList || []"
          :max-height="inboundTableMaxHeight"
        >
          <vxe-column field="code" title="入库单号" min-width="170">
            <template #default="{ row }">
              <n-button
                v-if="linkable"
                text
                type="info"
                @click="emit('openInbound', row.uid, row.code)"
              >
                {{ row.code || "-" }}
              </n-button>
              <span v-else>{{ row.code || "-" }}</span>
            </template>
          </vxe-column>
          <vxe-column field="warehouseName" title="仓库" min-width="120" />
          <vxe-column field="timeName" title="入库时间" min-width="160" />
          <vxe-column field="totalQuantity" title="入库总数" min-width="110" />
          <vxe-column field="statusName" title="状态" min-width="100" />
        </vxe-table>
      </m-card>
    </template>
  </n-space>
</template>
