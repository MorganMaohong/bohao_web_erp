<script lang="ts" setup>
import FormModal from "@/components/FormModal/index.vue"
import { ref, watch } from "vue"
import { InventoryInboundDetail } from "@/model/inventory/inbound"
import { InventoryInOrderService } from "@/services/inventory/InventoryInOrderService"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX } from "@/constants/template-ui"
import { InventInOrderTypeDict } from "@/constants/enum"
import PurchaseModalDetailShell from "@/views/purchase/components/PurchaseModalDetailShell.vue"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"

const props = defineProps<{
  show: boolean
  uid?: string
  code?: string
}>()

const emit = defineEmits<{
  "update:show": [value: boolean]
}>()

const loading = ref(false)
const detailData = ref<InventoryInboundDetail>({ detailList: [], imageList: [] })

function updateShow(value: boolean) {
  emit("update:show", value)
}

function loadDetail() {
  if (!props.show) return
  if (props.uid) {
    loading.value = true
    InventoryInOrderService.detail(props.uid)
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
  InventoryInOrderService.select({
    currentPage: 1,
    pageSize: 10,
    key: props.code,
    type: InventInOrderTypeDict.PURCHASE_INBOUND
  })
    .then((res) => {
      const matched = (res.list || []).find((item) => item.code === props.code) || res.list?.[0]
      if (matched?.uid) {
        return InventoryInOrderService.detail(matched.uid)
      }
      window.$message?.warning("未找到对应采购入库单")
      return undefined
    })
    .then((res) => {
      if (res) detailData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

watch(() => [props.show, props.uid, props.code], loadDetail, { immediate: true })
</script>

<template>
  <FormModal :show="show" title="采购入库详情" size="xxl" @update:show="updateShow">
    <PurchaseModalDetailShell :loading="loading">
      <n-card title="入库详情" :bordered="false" class="detail-card">
        <n-descriptions bordered :column="2" label-placement="left">
          <n-descriptions-item label="入库单号">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="采购订单">{{ detailData.purchaseOrderCode || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="入库时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="2">{{ detailData.remark || "-" }}</n-descriptions-item>
        </n-descriptions>
      </n-card>

      <n-card title="入库明细" :bordered="false" class="detail-card">
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
          <vxe-column field="quantity" title="入库数量" min-width="110" />
          <vxe-column field="returnedQuantity" title="已退货数量" min-width="110" />
        </vxe-table>
      </n-card>
    </PurchaseModalDetailShell>
  </FormModal>
</template>
