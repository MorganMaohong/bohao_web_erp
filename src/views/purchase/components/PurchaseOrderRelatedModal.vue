<script lang="ts" setup>
import FormModal from "@/components/FormModal/index.vue"
import { ref, watch } from "vue"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX, TEMPLATE_MODAL_TABLE_RECORD_MAX } from "@/constants/template-ui"
import { PurchaseOrderDetail } from "@/model/purchase"
import { PurchaseOrderService } from "@/services/purchase/PurchaseOrderService"
import PurchaseApplyRelatedModal from "./PurchaseApplyRelatedModal.vue"
import PurchaseInboundRelatedModal from "./PurchaseInboundRelatedModal.vue"
import PurchaseModalDetailShell from "./PurchaseModalDetailShell.vue"

const props = defineProps<{
  show: boolean
  uid?: string
  code?: string
}>()

const emit = defineEmits<{
  "update:show": [value: boolean]
}>()

const loading = ref(false)
const detailData = ref<PurchaseOrderDetail>({ detailList: [], inboundOrderList: [] })
const showApplyDetail = ref(false)
const showSourceOrderDetail = ref(false)
const showInboundDetail = ref(false)
const relatedApply = ref<{ uid?: string; code?: string }>({})
const relatedSourceOrder = ref<{ uid?: string; code?: string }>({})
const relatedInbound = ref<{ uid?: string; code?: string }>({})

function updateShow(value: boolean) {
  emit("update:show", value)
}

function loadDetail() {
  if (!props.show) return
  if (props.uid) {
    loading.value = true
    PurchaseOrderService.detail(props.uid)
      .then((res) => {
        detailData.value = res
      })
      .finally(() => {
        loading.value = false
      })
    return
  }

  if (!props.code) return
  loading.value = true
  PurchaseOrderService.select({ currentPage: 1, pageSize: 10, key: props.code })
    .then((res) => {
      const matched = (res.list || []).find((item) => item.code === props.code) || res.list?.[0]
      if (matched?.uid) {
        return PurchaseOrderService.detail(matched.uid)
      }
      window.$message?.warning("未找到对应采购订单")
      return undefined
    })
    .then((res) => {
      if (res) detailData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function openApply(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedApply.value = { uid, code }
  showApplyDetail.value = true
}

function openSourceOrder(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedSourceOrder.value = { uid, code }
  showSourceOrderDetail.value = true
}

function openInbound(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedInbound.value = { uid, code }
  showInboundDetail.value = true
}

watch(() => [props.show, props.uid, props.code], loadDetail, { immediate: true })
</script>

<template>
  <FormModal :show="show" title="采购订单详情" size="xxl" @update:show="updateShow">
    <PurchaseModalDetailShell :loading="loading">
      <n-card title="订单详情" :bordered="false" class="detail-card">
        <n-descriptions bordered :column="2" label-placement="left">
          <n-descriptions-item label="订单编号">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="订单类型">{{ detailData.orderTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="供应商">{{ detailData.supplierName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请单号">
            <n-button
              v-if="detailData.applyOrderCode"
              text
              type="info"
              @click="openApply(detailData.applyOrderUid, detailData.applyOrderCode)"
            >
              {{ detailData.applyOrderCode }}
            </n-button>
            <span v-else>-</span>
          </n-descriptions-item>
          <n-descriptions-item label="来源订单">
            <n-button
              v-if="detailData.sourceOrderCode"
              text
              type="info"
              @click="openSourceOrder(detailData.sourceOrderUid, detailData.sourceOrderCode)"
            >
              {{ detailData.sourceOrderCode }}
            </n-button>
            <span v-else>-</span>
          </n-descriptions-item>
          <n-descriptions-item label="预计到货">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="含税总额">{{ detailData.totalAmount ?? "-" }}</n-descriptions-item>
          <n-descriptions-item label="不含税总额">{{ detailData.totalAmountWithoutTax ?? "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请状态">{{ detailData.applyOrderStatusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="2">{{ detailData.remark || "-" }}</n-descriptions-item>
        </n-descriptions>
      </n-card>

      <n-card title="订单明细" :bordered="false" class="detail-card">
        <vxe-table
          border
          stripe
          show-overflow
          align="center"
          :data="detailData.detailList || []"
          :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
        >
          <vxe-column field="name" title="物料名称" min-width="160" />
          <vxe-column title="规格1" min-width="150">
            <template #default="{ row }">{{ getSpec1Name(row) }}</template>
          </vxe-column>
          <vxe-column title="规格2" min-width="150">
            <template #default="{ row }">{{ getSpec2Name(row) }}</template>
          </vxe-column>
          <vxe-column field="unitName" title="单位" min-width="90" />
          <vxe-column field="applyQuantity" title="申请数量" min-width="100" />
          <vxe-column field="quantity" title="到货数量" min-width="100" />
          <vxe-column field="inboundQuantity" title="已入库" min-width="100" />
          <vxe-column field="returnQuantity" title="已退货" min-width="100" />
          <vxe-column field="purchasePriceWithTax" title="含税单价" min-width="110" />
          <vxe-column field="vatTaxRate" title="税率(%)" min-width="90" />
        </vxe-table>
      </n-card>

      <n-card v-if="detailData.inboundOrderList?.length" title="相关采购入库" :bordered="false" class="detail-card">
        <vxe-table
          border
          stripe
          show-overflow
          align="center"
          :data="detailData.inboundOrderList || []"
          :max-height="TEMPLATE_MODAL_TABLE_RECORD_MAX"
        >
          <vxe-column field="code" title="入库单号" min-width="170">
            <template #default="{ row }">
              <n-button text type="info" @click="openInbound(row.uid, row.code)">{{ row.code || "-" }}</n-button>
            </template>
          </vxe-column>
          <vxe-column field="warehouseName" title="仓库" min-width="120" />
          <vxe-column field="timeName" title="入库时间" min-width="160" />
          <vxe-column field="totalQuantity" title="入库总数" min-width="110" />
          <vxe-column field="statusName" title="状态" min-width="100" />
        </vxe-table>
      </n-card>
      <template #side>
        <FlowSchemaPreview v-if="detailData.flowSchema" title="审批流程" :schema-data="detailData.flowSchema" />
        <n-card v-else title="审批流程" :bordered="false" class="detail-card">
          <n-empty description="暂无流程数据" />
        </n-card>
      </template>
    </PurchaseModalDetailShell>

    <PurchaseApplyRelatedModal v-model:show="showApplyDetail" :uid="relatedApply.uid" :code="relatedApply.code" />
    <PurchaseOrderRelatedModal
      v-model:show="showSourceOrderDetail"
      :uid="relatedSourceOrder.uid"
      :code="relatedSourceOrder.code"
    />
    <PurchaseInboundRelatedModal
      v-model:show="showInboundDetail"
      :uid="relatedInbound.uid"
      :code="relatedInbound.code"
    />
  </FormModal>
</template>
