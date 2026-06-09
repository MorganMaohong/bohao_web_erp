<script lang="ts" setup>
import { computed } from "vue"
import { BizTask, TaskCenterDetail } from "@/model/flow"

const props = defineProps<{
  isFlowTask: boolean
  detailData: TaskCenterDetail
  bizDetailData: TaskCenterDetail
  bizTaskRow: BizTask
}>()

/** 流程 4 项两行、业务 6 项两行 */
const descriptionColumn = computed(() => (props.isFlowTask ? 2 : 3))
</script>

<template>
  <n-descriptions bordered title="任务信息" :column="descriptionColumn" label-placement="left">
    <template v-if="isFlowTask">
      <n-descriptions-item label="任务名称">{{ detailData.taskName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="流程类型">{{ detailData.flowTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="创建时间">{{ detailData.createTime || "-" }}</n-descriptions-item>
    </template>
    <template v-else>
      <n-descriptions-item label="任务名称">{{ bizDetailData.taskName || bizTaskRow.taskName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="任务类型">{{ bizDetailData.taskTypeName || bizTaskRow.taskTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="状态">{{ bizDetailData.statusName || bizTaskRow.statusName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="创建时间">{{ bizDetailData.createTime || bizTaskRow.createTime || "-" }}</n-descriptions-item>
      <n-descriptions-item label="任务接收人">{{ bizDetailData.assigneeName || bizTaskRow.assigneeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="任务发起人">{{ bizDetailData.sourceUserName || bizTaskRow.sourceUserName || "-" }}</n-descriptions-item>
    </template>
  </n-descriptions>
</template>
