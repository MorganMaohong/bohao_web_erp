<script lang="ts" setup>
import { computed } from "vue"
import ProductionPlanWarehouseDetailView from "@/views/product/components/ProductionPlanWarehouseDetailView.vue"
import type { TaskCenterDetail } from "@/model/flow"
import type { ProductionPlanDetail } from "@/model/product"

const props = defineProps<{
  detail: TaskCenterDetail
  loading?: boolean
}>()

const planDetail = computed(() => (props.detail.data || {}) as ProductionPlanDetail)
</script>

<template>
  <ProductionPlanWarehouseDetailView :plan="planDetail" :loading="loading" />
</template>
