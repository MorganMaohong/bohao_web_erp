<script lang="ts" setup>
import { computed } from "vue"
import PurchaseOrderDetailView from "@/views/purchase/components/PurchaseOrderDetailView.vue"
import type { TaskCenterDetail } from "@/model/flow"
import type { PurchaseOrderDetail } from "@/model/purchase"

const props = defineProps<{
  detail: TaskCenterDetail
  loading?: boolean
}>()

const orderDetail = computed(() => (props.detail.data || {}) as PurchaseOrderDetail)
</script>

<template>
  <PurchaseOrderDetailView :detail="orderDetail" :loading="loading" :linkable="false" />
</template>
