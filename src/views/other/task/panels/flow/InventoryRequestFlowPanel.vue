<script lang="ts" setup>
import { computed } from "vue"
import MaterialRequestDetailView from "@/views/inventory/components/MaterialRequestDetailView.vue"
import type { TaskCenterDetail } from "@/model/flow"
import type { MaterialRequestDetail } from "@/model/inventory/request"

const props = defineProps<{
  detail: TaskCenterDetail
  loading?: boolean
}>()

const requestDetail = computed(() => (props.detail.data || {}) as MaterialRequestDetail)
</script>

<template>
  <MaterialRequestDetailView :detail="requestDetail" :loading="loading" />
</template>
