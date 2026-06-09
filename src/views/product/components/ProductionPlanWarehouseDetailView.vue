<script lang="ts" setup>
import MCard from "@/components/MCard/index.vue"
import { ProductionPlanDetail } from "@/model/product"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { formatDateTime } from "@/utils"

withDefaults(
  defineProps<{
    plan?: ProductionPlanDetail
    loading?: boolean
    tableMaxHeight?: number | string
  }>(),
  {
    plan: () => ({}),
    loading: false,
    tableMaxHeight: 420
  }
)
</script>

<template>
  <n-space vertical :size="12">
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">生产计划</div>
    </div>
    <n-descriptions bordered :column="2" label-placement="left">
      <n-descriptions-item label="计划名称">{{ plan.name || "-" }}</n-descriptions-item>
      <n-descriptions-item label="入库状态">{{ plan.inboundStatusName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="申请入库时间">
        {{ plan.inboundApplyTime ? formatDateTime(plan.inboundApplyTime) : "-" }}
      </n-descriptions-item>
      <n-descriptions-item label="备注" :span="2">{{ plan.inboundApplyRemark || "-" }}</n-descriptions-item>
    </n-descriptions>
    <div>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">入库申请明细</div>
      </div>
      <m-card padding="0">
        <vxe-table
          :loading="loading"
          class="w-full"
          :data="plan.inboundApplyDetailList || []"
          border
          stripe
          :row-config="{ isHover: true }"
          :max-height="tableMaxHeight"
        >
          <vxe-column field="productName" title="成品" align="center" min-width="180" />
          <vxe-column title="规格1" align="center" min-width="140">
            <template #default="{ row }">{{ getSpec1Name(row) }}</template>
          </vxe-column>
          <vxe-column title="规格2" align="center" min-width="140">
            <template #default="{ row }">{{ getSpec2Name(row) }}</template>
          </vxe-column>
          <vxe-column field="warehouseName" title="入库仓库" align="center" min-width="160" />
          <vxe-column field="quantity" title="本次入库数量" align="center" width="140" />
          <vxe-column field="remark" title="备注" align="center" min-width="180" />
        </vxe-table>
      </m-card>
    </div>
  </n-space>
</template>
