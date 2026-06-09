<script lang="ts" setup>
import { computed } from "vue"
import type { BizTask, BizTaskSubmitForm, TaskCenterDetail } from "@/model/flow"
import { isBizPanelRegistered, resolveBizPanel } from "@/views/other/task/registry/biz-panel-registry"

const props = defineProps<{
  detailType?: string
  detail: TaskCenterDetail
  loading?: boolean
  bizTaskRow?: BizTask
  submitForm?: BizTaskSubmitForm
}>()

defineEmits<{
  submit: [action: string]
  leaderAction: [action: "transfer" | "dispatch" | "handle"]
  uploadImage: [url: string]
}>()

const adapter = computed(() => resolveBizPanel(props.detailType))
const registered = computed(() => isBizPanelRegistered(props.detailType))
</script>

<template>
  <component
    v-if="registered && adapter"
    :is="adapter.component"
    :detail="detail"
    :loading="loading"
    :biz-task-row="bizTaskRow"
    :submit-form="submitForm"
    @submit="$emit('submit', $event)"
    @leader-action="$emit('leaderAction', $event)"
    @upload-image="$emit('uploadImage', $event)"
  />
  <slot v-else />
</template>
