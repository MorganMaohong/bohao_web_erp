<script lang="ts" setup>
import MCard from "@/components/MCard/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import { MaterialRequestDetail } from "@/model/inventory/request"
import { MaterialRequestOrderStatusDict } from "@/constants/enum"
import { TEMPLATE_MODAL_TABLE_MAX } from "@/constants/template-ui"

withDefaults(
  defineProps<{
    detail?: MaterialRequestDetail
    loading?: boolean
    tableMaxHeight?: number | string
    showDetailTable?: boolean
  }>(),
  {
    detail: () => ({ detailList: [] }),
    loading: false,
    tableMaxHeight: TEMPLATE_MODAL_TABLE_MAX,
    showDetailTable: true
  }
)

function statusTagType(status?: string) {
  if (status === MaterialRequestOrderStatusDict.REJECTED) return "error"
  if (status === MaterialRequestOrderStatusDict.WAIT_ISSUE) return "warning"
  if (status === MaterialRequestOrderStatusDict.PART_ISSUED) return "info"
  if (status === MaterialRequestOrderStatusDict.ALL_ISSUED) return "success"
  return "default"
}
</script>

<template>
  <n-space vertical :size="12">
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">基本信息</div>
    </div>
    <n-descriptions bordered :column="2" label-placement="left">
      <n-descriptions-item label="申请单号">{{ detail.code || "-" }}</n-descriptions-item>
      <n-descriptions-item label="领料仓库">{{ detail.warehouseName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="用途类型">{{ detail.usageTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="业务对象类型">{{ detail.bizTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="业务对象">{{ detail.bizName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="申请时间">{{ detail.applyTimeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="期望时间">{{ detail.expectTimeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="流程状态">
        <n-tag v-if="detail.statusName" size="small" :type="statusTagType(detail.status)" :bordered="false">
          {{ detail.statusName }}
        </n-tag>
        <span v-else>-</span>
      </n-descriptions-item>
      <n-descriptions-item label="当前节点">{{ detail.currentNodeName || "-" }}</n-descriptions-item>
      <n-descriptions-item v-if="detail.totalQuantity != null" label="总数量">{{ detail.totalQuantity }}</n-descriptions-item>
      <n-descriptions-item label="备注" :span="2">{{ detail.remark || "-" }}</n-descriptions-item>
    </n-descriptions>
    <div v-if="showDetailTable">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">领料明细</div>
      </div>
      <m-card padding="0">
        <ItemDetailTable
          :data="detail.detailList"
          preset="inventory_request_view"
          :loading="loading"
          :max-height="tableMaxHeight"
        />
      </m-card>
    </div>
  </n-space>
</template>
