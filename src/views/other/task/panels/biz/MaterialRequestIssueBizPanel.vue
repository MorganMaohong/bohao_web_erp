<script lang="ts" setup>
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import MaterialRequestDetailView from "@/views/inventory/components/MaterialRequestDetailView.vue"
import { useBizTaskActions } from "@/views/other/task/composables/useBizTaskActions"
import type { ItemDetailTablePreset } from "@/constants/item-detail-table"
import type { MaterialRequestDetail } from "@/model/inventory/request"
import type { TaskCenterDetail } from "@/model/flow"
import { computed } from "vue"

const props = defineProps<{
  detail: TaskCenterDetail
  loading?: boolean
}>()

const { hasBizAction, getBizActionHint } = useBizTaskActions(() => props.detail.actionList)

const requestDetail = computed(() => (props.detail.data || {}) as MaterialRequestDetail)
const hint = computed(() => props.detail.hint || "")
const detailPreset = computed<ItemDetailTablePreset>(() =>
  hasBizAction("issue_partial") ? "inventory_request_issue" : "inventory_request_view"
)
</script>

<template>
  <n-alert v-if="hint" type="info" :show-icon="false" class="mb-3">
    {{ hint }}
  </n-alert>
  <MaterialRequestDetailView :detail="requestDetail" :loading="loading" :show-detail-table="false" />
  <div>
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">领料明细</div>
    </div>
    <ItemDetailTable
      :data="requestDetail.detailList"
      :preset="detailPreset"
      :loading="loading"
      :max-height="420"
    />
  </div>
  <n-tag v-if="getBizActionHint('issue_partial')" type="info" size="small">
    {{ getBizActionHint("issue_partial") }}
  </n-tag>
</template>
