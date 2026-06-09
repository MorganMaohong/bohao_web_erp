<script lang="ts" setup>
import MCard from "@/components/MCard/index.vue"

defineProps<{
  order?: Record<string, any>
  sourceUserName?: string
  showHandlerLogs?: boolean
  /** 仅展示处理日志表格 */
  handlerLogsOnly?: boolean
}>()
</script>

<template>
  <n-space vertical :size="12">
    <template v-if="!handlerLogsOnly">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">工单基础信息</div>
      </div>
      <n-descriptions bordered :column="2" label-placement="left">
      <n-descriptions-item label="工单名称">{{ order?.name || order?.title || "-" }}</n-descriptions-item>
      <n-descriptions-item label="项目">{{ order?.projectName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="工单状态">{{ order?.statusName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="创建人">{{ order?.createName || sourceUserName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="当前负责人">{{ order?.leaderName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="当前处理人">{{ order?.handlerName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="工单编号">{{ order?.code || "-" }}</n-descriptions-item>
      <n-descriptions-item label="创建时间">{{ order?.createTime || "-" }}</n-descriptions-item>
      <n-descriptions-item label="描述" :span="2">{{ order?.remark || order?.description || "-" }}</n-descriptions-item>
      </n-descriptions>
    </template>
    <div v-if="showHandlerLogs || handlerLogsOnly">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">处理日志</div>
      </div>
      <m-card padding="0">
        <vxe-table
          class="w-full"
          :data="order?.handlerLogList || []"
          border
          stripe
          :row-config="{ isHover: true }"
          max-height="300"
        >
          <vxe-column field="createTime" title="操作时间" show-overflow="tooltip" align="center" width="20%" />
          <vxe-column field="createName" title="处理人" show-overflow="tooltip" align="center" width="15%" />
          <vxe-column field="statusName" title="状态" show-overflow="tooltip" align="center" width="15%" />
          <vxe-column field="remark" title="处理说明" show-overflow="tooltip" align="center" width="35%" />
        </vxe-table>
      </m-card>
    </div>
  </n-space>
</template>
