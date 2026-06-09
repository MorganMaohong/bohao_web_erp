<script lang="ts" setup>
import { computed } from "vue"
import ProductionPlanApproveDetailView from "@/views/product/components/ProductionPlanApproveDetailView.vue"
import type { TaskCenterAction, TaskCenterDetail } from "@/model/flow"
import type { ProductionPlanDetail } from "@/model/product"

const props = defineProps<{
  detail: TaskCenterDetail
  loading?: boolean
  actionList?: TaskCenterAction[]
}>()

const planDetail = computed(() => (props.detail.data || {}) as ProductionPlanDetail)

const hasFormApproveField = computed(() =>
  Boolean(
    props.actionList?.find((item) => item.action === "approve")?.fields?.some((field) => field.field === "formData")
  )
)

const canEditPlan = computed(() => hasFormApproveField.value && Boolean(planDetail.value.canEditPlan ?? true))

const approveHint = computed(() => props.actionList?.find((item) => item.action === "approve")?.hint || "")
</script>

<template>
  <ProductionPlanApproveDetailView
    :plan="planDetail"
    :loading="loading"
    :can-edit-plan="canEditPlan"
    :approve-hint="hasFormApproveField ? approveHint : ''"
  />
</template>
