<script lang="ts" setup>
import { ref, watch } from "vue"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { PurchaseApplyDetail } from "@/model/purchase"
import { PurchaseApplyOrderService } from "@/services/purchase/PurchaseApplyOrderService"

const props = defineProps<{
  show: boolean
  uid?: string
  code?: string
}>()

const emit = defineEmits<{
  "update:show": [value: boolean]
}>()

const loading = ref(false)
const detailData = ref<PurchaseApplyDetail>({ detailList: [] })

function updateShow(value: boolean) {
  emit("update:show", value)
}

function loadDetail() {
  if (!props.show) return
  if (props.uid) {
    loading.value = true
    PurchaseApplyOrderService.detail(props.uid)
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
  PurchaseApplyOrderService.select({ currentPage: 1, pageSize: 10, name: props.code })
    .then((res) => {
      const matched = (res.list || []).find((item) => item.code === props.code) || res.list?.[0]
      if (matched?.uid) {
        return PurchaseApplyOrderService.detail(matched.uid)
      }
      window.$message?.warning("未找到对应采购申请")
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
    title="采购申请详情"
    @update:show="updateShow"
  >
    <n-spin :show="loading">
      <div class="flex flex-1 min-h-0">
        <div class="basis-2/3 flex flex-col gap-2 overflow-auto pr-2">
          <n-card title="申请信息" :bordered="false" class="detail-card">
            <n-descriptions :column="2" label-placement="left" bordered>
              <n-descriptions-item label="申请单号">{{ detailData.code || "-" }}</n-descriptions-item>
              <n-descriptions-item label="流程状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
              <n-descriptions-item label="申请日期">{{ detailData.applyTimeName || "-" }}</n-descriptions-item>
              <n-descriptions-item label="到货日期">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
              <n-descriptions-item label="需求来源">{{ detailData.sourceTypeName || "-" }}</n-descriptions-item>
              <n-descriptions-item label="当前节点">{{ detailData.currentNodeName || "-" }}</n-descriptions-item>
              <n-descriptions-item label="到货地址" :span="2">{{ detailData.address || "-" }}</n-descriptions-item>
              <n-descriptions-item label="备注" :span="2">{{ detailData.remark || "-" }}</n-descriptions-item>
            </n-descriptions>
          </n-card>

          <n-card title="采购物料信息" :bordered="false" class="detail-card">
            <vxe-table :data="detailData.detailList || []" border stripe show-overflow align="center">
              <vxe-column field="name" title="名称" min-width="140" />
              <vxe-column field="supplierName" title="供应商" min-width="140" />
              <vxe-column field="spec" title="规格" min-width="140" />
              <vxe-column field="material" title="材质" min-width="120" />
              <vxe-column field="unitName" title="单位" min-width="90" />
              <vxe-column field="quantity" title="采购数量" min-width="100" />
              <vxe-column field="remark" title="备注" min-width="180" />
            </vxe-table>
          </n-card>
        </div>

        <div class="basis-1/3 overflow-auto">
          <FlowSchemaPreview title="流程进度" :schema-data="detailData.flowSchema" />
        </div>
      </div>
    </n-spin>
  </n-modal>
</template>

<style lang="scss" scoped>
.detail-card {
  border-radius: 18px;
}
</style>
