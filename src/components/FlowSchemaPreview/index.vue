<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { FlowDefinitionService } from "@/services/FlowDefinitionService"
import type {
  FlowDefinitionSchemaNodeVo,
  FlowDefinitionSchemaVo,
  FlowDefinitionSchemaUserVo
} from "@/model/flow/schema"

const props = withDefaults(
  defineProps<{
    flowType?: string
    schemaData?: FlowDefinitionSchemaVo
    title?: string
  }>(),
  {
    title: "流程预览"
  }
)

const loading = ref(false)
const schema = ref<FlowDefinitionSchemaVo>()
const avatarErrorMap = ref<Record<string, boolean>>({})

const activeSchema = computed(() => props.schemaData || schema.value)
const nodes = computed(() => activeSchema.value?.nodes || [])

function avatarFallback(user: FlowDefinitionSchemaUserVo) {
  return user.name?.trim()?.slice(-2) || "审批"
}

function getUserAvatarKey(node: FlowDefinitionSchemaNodeVo, user: FlowDefinitionSchemaUserVo, index: number) {
  return `${node.nodeUid || node.nodeName || "node"}-${user.uid || user.name || index}-${user.headImage?.trim() || ""}`
}

function resolveUserAvatarSrc(node: FlowDefinitionSchemaNodeVo, user: FlowDefinitionSchemaUserVo, index: number) {
  const key = getUserAvatarKey(node, user, index)
  if (avatarErrorMap.value[key]) return ""
  return user.headImage?.trim() || ""
}

function isUserAvatarFallback(node: FlowDefinitionSchemaNodeVo, user: FlowDefinitionSchemaUserVo, index: number) {
  return !resolveUserAvatarSrc(node, user, index)
}

function onUserAvatarError(node: FlowDefinitionSchemaNodeVo, user: FlowDefinitionSchemaUserVo, index: number) {
  const key = getUserAvatarKey(node, user, index)
  avatarErrorMap.value[key] = true
}

function resolveNodeTagType(node: FlowDefinitionSchemaNodeVo) {
  if (node.current || node.status === "pending") return "warning"
  if (node.status === "completed") return "success"
  if (node.status === "rejected" || node.status === "withdrawn") return "error"
  return "info"
}

function resolveUserTagType(user: FlowDefinitionSchemaUserVo) {
  if (user.highlight || user.status === "pending") return "warning"
  if (user.status === "completed") return "success"
  if (user.status === "rejected" || user.status === "withdrawn") return "error"
  return "default"
}

async function loadSchema() {
  if (props.schemaData) {
    avatarErrorMap.value = {}
    schema.value = undefined
    return
  }

  if (!props.flowType) {
    avatarErrorMap.value = {}
    schema.value = undefined
    return
  }

  loading.value = true
  try {
    avatarErrorMap.value = {}
    schema.value = await FlowDefinitionService.schema(props.flowType)
  } catch (error) {
    avatarErrorMap.value = {}
    schema.value = undefined
    console.error("加载流程预览失败:", error)
  } finally {
    loading.value = false
  }
}

onMounted(loadSchema)

watch(
  () => [props.flowType, props.schemaData],
  () => {
    loadSchema()
  }
)
</script>

<template>
  <div class="flow-schema-preview">
    <div class="flow-schema-preview__head">
      <div>
        <div class="flow-schema-preview__title">{{ title }}</div>
        <div class="flow-schema-preview__desc">
          {{ activeSchema?.flowName || "当前业务流程" }}
          <span v-if="activeSchema?.flowTypeLabel">· {{ activeSchema.flowTypeLabel }}</span>
          <span v-if="activeSchema?.statusName">· {{ activeSchema.statusName }}</span>
          <span v-if="activeSchema?.currentNodeName">· 当前节点：{{ activeSchema.currentNodeName }}</span>
        </div>
      </div>
    </div>

    <n-spin :show="loading">
      <n-empty
        v-if="!loading && !nodes.length"
        description="未配置流程模板或暂无可展示节点"
        class="flow-schema-preview__empty"
      />

      <div v-else class="flow-schema-preview__timeline">
        <div
          v-for="(node, index) in nodes"
          :key="node.nodeUid || `${node.nodeType}-${index}`"
          class="flow-schema-preview__item"
        >
          <div class="flow-schema-preview__rail">
            <div
              class="flow-schema-preview__dot"
              :class="{
                'flow-schema-preview__dot--start': node.nodeType === 'start',
                'flow-schema-preview__dot--approve': node.nodeType === 'approve',
                'flow-schema-preview__dot--end': node.nodeType === 'end'
              }"
            />
            <div v-if="index < nodes.length - 1" class="flow-schema-preview__line" />
          </div>

          <div class="flow-schema-preview__card">
            <div class="flow-schema-preview__card-head">
              <div>
                <div class="flow-schema-preview__node-title">
                  {{ node.nodeName || node.nodeTypeLabel || "流程节点" }}
                </div>
                <div class="flow-schema-preview__node-summary">{{ node.summary }}</div>
              </div>
              <div class="flow-schema-preview__tag-group">
                <n-tag v-if="node.statusName" size="small" round :bordered="false" :type="resolveNodeTagType(node)">
                  {{ node.statusName }}
                </n-tag>
                <n-tag size="small" round :bordered="false" type="info">
                  {{ node.nodeTypeLabel || node.nodeType }}
                </n-tag>
              </div>
            </div>

            <div v-if="node.comment" class="flow-schema-preview__comment">
              {{ node.comment }}
            </div>

            <div v-if="node.sourceLabels?.length" class="flow-schema-preview__labels">
              <n-tag v-for="label in node.sourceLabels" :key="label" size="small" type="warning" round>
                {{ label }}
              </n-tag>
            </div>

            <div v-if="node.users?.length" class="flow-schema-preview__users">
              <div class="flow-schema-preview__users-title">审批人</div>
              <div class="flow-schema-preview__user-list">
                <div
                  v-for="(user, userIndex) in node.users"
                  :key="user.uid || userIndex"
                  class="flow-schema-preview__user"
                >
                  <div
                    class="flow-schema-preview__user-avatar"
                    :class="{
                      'flow-schema-preview__user-avatar--active': user.highlight,
                      'flow-schema-preview__user-avatar--fallback': isUserAvatarFallback(node, user, userIndex)
                    }"
                  >
                    <img
                      v-if="resolveUserAvatarSrc(node, user, userIndex)"
                      :src="resolveUserAvatarSrc(node, user, userIndex)"
                      :alt="user.name || user.uid || '审批人'"
                      class="flow-schema-preview__user-avatar-image"
                      @error="onUserAvatarError(node, user, userIndex)"
                    />
                    <span v-else>{{ avatarFallback(user) }}</span>
                  </div>
                  <div class="flow-schema-preview__user-name">{{ user.name || user.uid }}</div>
                  <n-tag v-if="user.statusName" size="small" round :type="resolveUserTagType(user)">
                    {{ user.statusName }}
                  </n-tag>
                  <div v-if="user.comment" class="flow-schema-preview__user-comment">{{ user.comment }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped lang="scss">
.flow-schema-preview {
  overflow: auto;
  border-radius: 18px;
  padding: 16px 18px;
  //background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 30%),
  //  linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.flow-schema-preview__head {
  margin-bottom: 14px;
}

.flow-schema-preview__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.flow-schema-preview__desc {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.flow-schema-preview__empty {
  padding: 12px 0;
}

.flow-schema-preview__timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.flow-schema-preview__item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
}

.flow-schema-preview__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-schema-preview__dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #94a3b8;
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.18);
}

.flow-schema-preview__dot--start {
  background: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.16);
}

.flow-schema-preview__dot--approve {
  background: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.16);
}

.flow-schema-preview__dot--end {
  background: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.14);
}

.flow-schema-preview__line {
  width: 2px;
  flex: 1;
  margin-top: 8px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.35), rgba(148, 163, 184, 0.2));
}

.flow-schema-preview__card {
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.flow-schema-preview__card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.flow-schema-preview__node-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.flow-schema-preview__tag-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.flow-schema-preview__node-summary {
  margin-top: 4px;
  color: #334155;
  line-height: 1.5;
}

.flow-schema-preview__comment {
  margin-top: 10px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.flow-schema-preview__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.flow-schema-preview__users {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(148, 163, 184, 0.35);
}

.flow-schema-preview__users-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}

.flow-schema-preview__user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.flow-schema-preview__user {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.flow-schema-preview__user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.flow-schema-preview__user-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.flow-schema-preview__user-name {
  font-size: 12px;
  line-height: 1.4;
  color: #334155;
  word-break: break-all;
}

.flow-schema-preview__user-avatar--active {
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
}

.flow-schema-preview__user-avatar--fallback {
  background: #cbd5e1;
  color: #334155;
}

.flow-schema-preview__user-comment {
  font-size: 11px;
  line-height: 1.4;
  color: #64748b;
  word-break: break-all;
}
</style>
