<script lang="ts" setup>
import { computed } from "vue"
import PurchaseApplyDetailView from "@/views/purchase/components/PurchaseApplyDetailView.vue"
import type { TaskCenterAction, TaskCenterDetail } from "@/model/flow"
import type { PurchaseApplyDetail } from "@/model/purchase"

const props = defineProps<{
  detail: TaskCenterDetail
  loading?: boolean
  actionList?: TaskCenterAction[]
}>()

const applyDetail = computed(() => (props.detail.data || {}) as PurchaseApplyDetail)

const hasPriceApproveField = computed(() =>
  Boolean(
    props.actionList
      ?.find((item) => item.action === "approve")
      ?.fields?.some((field) => field.field === "priceDetailList")
  )
)

const canEditPrice = computed(() => hasPriceApproveField.value && Boolean(applyDetail.value.canEditPrice))

const approveHint = computed(() => props.actionList?.find((item) => item.action === "approve")?.hint || "")
</script>

<template>
  <PurchaseApplyDetailView
    variant="flow"
    :detail="applyDetail"
    :loading="loading"
    :can-edit-price="canEditPrice"
    :approve-hint="hasPriceApproveField ? approveHint : ''"
  />
</template>
