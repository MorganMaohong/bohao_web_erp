<script lang="ts" setup>
import MCard from "@/components/MCard/index.vue"
import { ProductionPlanDetail } from "@/model/product"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { formatDateTime } from "@/utils"
const props = withDefaults(
  defineProps<{
    plan?: ProductionPlanDetail
    loading?: boolean
    canEditPlan?: boolean
    approveHint?: string
    tableMaxHeight?: number | string
  }>(),
  {
    plan: () => ({}),
    loading: false,
    canEditPlan: false,
    tableMaxHeight: 420
  }
)

function removeProduct(index: number) {
  props.plan.productList?.splice(index, 1)
}
</script>

<template>
  <n-space vertical :size="12">
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">生产计划</div>
    </div>
    <n-descriptions bordered :column="2" label-placement="left">
      <n-descriptions-item label="计划名称">
        <n-input v-if="canEditPlan" v-model:value="plan.name" />
        <span v-else>{{ plan.name || "-" }}</span>
      </n-descriptions-item>
      <n-descriptions-item label="当前节点">{{ plan.currentNodeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="开工时间">
        <n-date-picker
          v-if="canEditPlan"
          v-model:value="plan.startTime"
          type="datetime"
          class="w-full"
        />
        <span v-else>{{ plan.startTime ? formatDateTime(plan.startTime) : "-" }}</span>
      </n-descriptions-item>
      <n-descriptions-item label="计划完成">
        <n-date-picker
          v-if="canEditPlan"
          v-model:value="plan.planCompleteTime"
          type="datetime"
          class="w-full"
        />
        <span v-else>{{ plan.planCompleteTime ? formatDateTime(plan.planCompleteTime) : "-" }}</span>
      </n-descriptions-item>
      <n-descriptions-item label="备注" :span="2">
        <n-input v-if="canEditPlan" v-model:value="plan.remark" type="textarea" />
        <span v-else>{{ plan.remark || "-" }}</span>
      </n-descriptions-item>
    </n-descriptions>
    <div>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">生产成品明细</div>
      </div>
      <m-card padding="0">
        <vxe-table
          :loading="loading"
          class="w-full"
          :data="plan.productList || []"
          border
          stripe
          :row-config="{ isHover: true }"
          :max-height="tableMaxHeight"
        >
          <vxe-column field="name" title="成品" align="center" min-width="180" />
          <vxe-column field="warehouseName" title="仓库" align="center" min-width="160" />
          <vxe-column field="typeName" title="类型" align="center" min-width="120" />
          <vxe-column title="规格1" align="center" min-width="140">
            <template #default="{ row }">{{ getSpec1Name(row) }}</template>
          </vxe-column>
          <vxe-column title="规格2" align="center" min-width="140">
            <template #default="{ row }">{{ getSpec2Name(row) }}</template>
          </vxe-column>
          <vxe-column field="material" title="材质" align="center" min-width="120" />
          <vxe-column field="quantity" title="生产数量" align="center" width="140">
            <template #default="{ row }">
              <vxe-number-input
                v-if="canEditPlan"
                v-model="row.quantity"
                :show-button="false"
                :min="1"
                :controls="false"
              />
              <span v-else>{{ row.quantity ?? "-" }}</span>
            </template>
          </vxe-column>
          <vxe-column v-if="canEditPlan" title="操作" align="center" width="100">
            <template #default="{ rowIndex }">
              <n-button type="error" text @click="removeProduct(rowIndex)">删除</n-button>
            </template>
          </vxe-column>
        </vxe-table>
      </m-card>
    </div>
    <n-tag v-if="approveHint" :type="canEditPlan ? 'warning' : 'default'" size="small">
      {{ approveHint }}
    </n-tag>
  </n-space>
</template>
