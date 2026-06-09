<script lang="ts" setup>
import { computed } from "vue"
import type { TaskCenterDetail } from "@/model/flow"
import { isFlowPanelRegistered, resolveFlowPanel } from "@/views/other/task/registry/task-panel-registry"

const props = defineProps<{
  flowType?: string
  detail: TaskCenterDetail
  loading?: boolean
}>()

const adapter = computed(() => resolveFlowPanel(props.flowType))
const registered = computed(() => isFlowPanelRegistered(props.flowType))
</script>

<template>
  <component
    v-if="registered && adapter"
    :is="adapter.component"
    :detail="detail"
    :loading="loading"
    :action-list="detail.actionList"
  />
</template>
