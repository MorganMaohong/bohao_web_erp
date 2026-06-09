<script lang="ts" setup>
import { computed } from "vue"
import RepairWorkOrderDetailView from "@/views/other/task/components/RepairWorkOrderDetailView.vue"
import TaskTimelinePanel from "@/views/other/task/components/TaskTimelinePanel.vue"
import type { TaskCenterDetail } from "@/model/flow"

const props = defineProps<{
  detail: TaskCenterDetail
}>()

const repairOrder = computed(() => props.detail.data || {})
const handlerLogs = computed(() => repairOrder.value.handlerLogList || [])
</script>

<template>
  <RepairWorkOrderDetailView :order="repairOrder" :source-user-name="detail.sourceUserName" />
  <TaskTimelinePanel
    v-if="handlerLogs.length"
    title="处理日志"
    :logs="handlerLogs"
    tag-type="success"
    :show-action-tag="false"
    :tag-text="(row) => row.statusName || '处理记录'"
    :show-node-name="false"
    avatar-prefix="handler"
    all-dots-success
    empty-description="暂无处理日志"
  />
</template>
