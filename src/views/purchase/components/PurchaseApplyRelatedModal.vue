<script lang="ts" setup>
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { ref, watch } from "vue"
import { PurchaseApplyDetail } from "@/model/purchase"
import { PurchaseApplyOrderService } from "@/services/purchase/PurchaseApplyOrderService"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX } from "@/constants/template-ui"
import { FlowInstanceStatusDict } from "@/constants/enum"
import PurchaseModalDetailShell from "@/views/purchase/components/PurchaseModalDetailShell.vue"

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

function statusTagType(status?: string) {
  if (status === FlowInstanceStatusDict.REJECTED) return "error"
  if (status === FlowInstanceStatusDict.WITHDRAWN) return "warning"
  if (status === FlowInstanceStatusDict.COMPLETED) return "success"
  if (status === FlowInstanceStatusDict.RUNNING) return "info"
  return "default"
}

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
  <FormModal :show="show" title="采购申请详情" size="full" @update:show="updateShow">
    <PurchaseModalDetailShell :loading="loading">
      <n-space vertical :size="12">
        <div class="TemplateForm-section">
          <div class="TemplateForm-section__title">基本信息</div>
        </div>
        <n-descriptions bordered :column="2" label-placement="left">
          <n-descriptions-item label="申请单号">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请日期">{{ detailData.applyTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="到货需求日期">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="需求来源">{{ detailData.sourceTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="用途类型">{{ detailData.usageTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="业务对象类型">{{ detailData.bizTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="业务对象">{{ detailData.bizName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="到货地址" :span="2">{{ detailData.address || "-" }}</n-descriptions-item>
          <n-descriptions-item label="流程状态">
            <n-tag
              v-if="detailData.statusName"
              size="small"
              :type="statusTagType(detailData.status)"
              :bordered="false"
            >
              {{ detailData.statusName }}
            </n-tag>
            <span v-else>-</span>
          </n-descriptions-item>
          <n-descriptions-item label="当前节点">{{ detailData.currentNodeName || "-" }}</n-descriptions-item>
        </n-descriptions>
        <div>
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">采购物料明细</div>
          </div>
          <m-card padding="0">
            <ItemDetailTable
              :data="detailData.detailList"
              preset="purchase_apply_view"
              :loading="loading"
              :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
            />
          </m-card>
        </div>
        <div class="TemplateForm-section">
          <div class="TemplateForm-section__title">其他</div>
        </div>
        <n-descriptions bordered :column="1" label-placement="left">
          <n-descriptions-item label="备注">{{ detailData.remark || "-" }}</n-descriptions-item>
        </n-descriptions>
      </n-space>
      <template #side>
        <FlowSchemaPreview title="流程进度" :schema-data="detailData.flowSchema" />
      </template>
    </PurchaseModalDetailShell>
  </FormModal>
</template>
