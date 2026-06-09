<script lang="ts" setup>
import { ref } from "vue"

const props = withDefaults(
  defineProps<{
    title?: string
    logs?: any[]
    emptyDescription?: string
    showActionTag?: boolean
    tagType?: "warning" | "success" | "info" | "default"
    tagText?: (row: any) => string
    showNodeName?: boolean
    avatarPrefix?: string
    allDotsSuccess?: boolean
  }>(),
  {
    title: "流程日志",
    logs: () => [],
    emptyDescription: "暂无流程日志",
    showActionTag: true,
    tagType: "warning",
    showNodeName: true,
    avatarPrefix: "flow",
    allDotsSuccess: false
  }
)

const logAvatarErrorMap = ref<Record<string, boolean>>({})

function logUserName(row: any) {
  return row?.operatorName || row?.createName || row?.handlerName || row?.assigneeName || "系统"
}

function logAvatarText(row: any) {
  return logUserName(row).trim().slice(-2) || "系统"
}

function logAvatarKey(row: any, index: number) {
  return `${props.avatarPrefix}-${row?.uid || row?.createTime || row?.updateTime || index}`
}

function logAvatarSrc(row: any, index: number) {
  const key = logAvatarKey(row, index)
  if (logAvatarErrorMap.value[key]) return ""
  return row?.headImage || row?.avatar || row?.avatarUrl || row?.operatorHeadImage || row?.handlerHeadImage || ""
}

function logAvatarFallback(row: any, index: number) {
  return !logAvatarSrc(row, index)
}

function onLogAvatarError(row: any, index: number) {
  logAvatarErrorMap.value[logAvatarKey(row, index)] = true
}

function isLatestTimelineItem(index: number) {
  return index === (props.logs?.length || 0) - 1
}

function flowLogDotClass(index: number) {
  if (props.allDotsSuccess) return "log-panel__dot--success"
  return isLatestTimelineItem(index) ? "log-panel__dot--pending" : "log-panel__dot--success"
}

function logActionLabel(action?: string) {
  if (action === "START") return "流程发起"
  if (action === "APPROVE") return "审批通过"
  if (action === "REJECT") return "驳回"
  return action || "处理"
}

function resolveTagText(row: any, index: number) {
  if (props.tagText) return props.tagText(row)
  if (props.showActionTag && isLatestTimelineItem(index)) return logActionLabel(row.action)
  return row.statusName || "处理记录"
}
</script>

<template>
  <div class="log-panel">
    <div class="log-panel__head">
      <div class="log-panel__title">{{ title }}</div>
      <n-tag size="small" :type="tagType" round>{{ logs.length }} 条</n-tag>
    </div>
    <div v-if="logs.length" class="log-panel__timeline">
      <div v-for="(row, index) in logs" :key="row.uid || `${row.createTime}-${index}`" class="log-panel__item">
        <div class="log-panel__rail">
          <span class="log-panel__dot" :class="flowLogDotClass(index)" />
          <span v-if="index < logs.length - 1" class="log-panel__line" />
        </div>
        <div class="log-panel__card">
          <div class="log-panel__card-head">
            <div class="log-panel__user">
              <n-avatar
                round
                :size="34"
                :src="logAvatarSrc(row, index)"
                :class="{ 'log-panel__avatar--fallback': logAvatarFallback(row, index) }"
                @error="onLogAvatarError(row, index)"
              >
                {{ logAvatarText(row) }}
              </n-avatar>
              <div class="log-panel__user-meta">
                <div class="log-panel__name">{{ logUserName(row) }}</div>
                <div class="log-panel__time">{{ row.createTime || "-" }}</div>
              </div>
            </div>
            <n-tag
              v-if="showActionTag ? isLatestTimelineItem(index) : true"
              :type="showActionTag && isLatestTimelineItem(index) ? 'warning' : tagType"
              size="small"
              round
            >
              {{ resolveTagText(row, index) }}
            </n-tag>
          </div>
          <div class="log-panel__body">
            <div v-if="showNodeName && row.nodeName" class="log-panel__node">节点：{{ row.nodeName }}</div>
            <div>{{ row.remark || row.comment || "无备注" }}</div>
          </div>
        </div>
      </div>
    </div>
    <n-empty v-else :description="emptyDescription" />
  </div>
</template>

<style scoped>
.log-panel {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 14px 16px;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.09), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.log-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.log-panel__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.log-panel__timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-panel__item {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 12px;
}

.log-panel__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.log-panel__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.log-panel__dot--pending {
  background: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.16);
}

.log-panel__dot--success {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.16);
}

.log-panel__line {
  width: 2px;
  flex: 1;
  margin-top: 6px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.25), rgba(148, 163, 184, 0.16));
}

.log-panel__card {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 14px;
  background: #fff;
  padding: 10px 12px;
}

.log-panel__card-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.log-panel__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-panel__user-meta {
  min-width: 0;
}

.log-panel__name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.log-panel__time {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.log-panel__body {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
  word-break: break-word;
}

.log-panel__node {
  margin-bottom: 6px;
  color: #475569;
}

.log-panel__avatar--fallback {
  background: #cbd5e1;
  color: #334155;
}
</style>
