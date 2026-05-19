<script lang="ts" setup>
import { ref, watch } from "vue"
import { InventoryInboundDetail } from "@/model/inventory/inbound"
import { InventoryInOrderService } from "@/services/inventory/InventoryInOrderService"
import { InventInOrderTypeDict } from "@/constants/enum"

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
  <n-modal
    :show="show"
    preset="card"
    class="w-[1400px] h-screen overflow-auto flex flex-col"
    title="采购入库详情"
    @update:show="updateShow"
  >
    <n-spin :show="loading">
      <div class="purchase-related-body">
        <n-card title="入库详情" :bordered="false" class="detail-card">
          <n-descriptions bordered :column="3">
            <n-descriptions-item label="入库单号">{{ detailData.code || "-" }}</n-descriptions-item>
            <n-descriptions-item label="采购订单">{{ detailData.purchaseOrderCode || "-" }}</n-descriptions-item>
            <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="入库时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="备注">{{ detailData.remark || "-" }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="入库明细" :bordered="false" class="detail-card">
          <vxe-table border stripe show-overflow align="center" :data="detailData.detailList || []">
            <vxe-column field="name" title="物料名称" min-width="160" />
            <vxe-column field="spec" title="规格型号" min-width="150" />
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="quantity" title="入库数量" min-width="110" />
            <vxe-column field="returnedQuantity" title="已退货数量" min-width="110" />
          </vxe-table>
        </n-card>
      </div>
    </n-spin>
  </n-modal>
</template>

<style lang="scss" scoped>
.purchase-related-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  border-radius: 18px;
}
</style>
