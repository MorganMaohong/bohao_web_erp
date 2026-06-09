<script lang="ts" setup>
import type { TaskCenterDetail } from "@/model/flow"
import { computed } from "vue"

const props = defineProps<{
  detail: TaskCenterDetail
}>()

const hint = computed(() => props.detail.hint || "")
const data = computed(() => props.detail.data || {})
</script>

<template>
  <n-alert v-if="hint" type="info" :show-icon="false" class="mb-3">
    {{ hint }}
  </n-alert>
  <div class="TemplateForm-section">
    <div class="TemplateForm-section__title">密码重置申请</div>
  </div>
  <n-descriptions bordered :column="2" label-placement="left">
    <n-descriptions-item label="申请用户">{{ data.applicant?.name || "-" }}</n-descriptions-item>
    <n-descriptions-item label="登录账号">{{ data.applicant?.username || "-" }}</n-descriptions-item>
    <n-descriptions-item label="手机号">{{ data.applicant?.phone || "-" }}</n-descriptions-item>
    <n-descriptions-item label="申请时间">{{ data.applyTime || "-" }}</n-descriptions-item>
    <n-descriptions-item label="处理结果">{{ data.resultName || detail.statusName || "-" }}</n-descriptions-item>
    <n-descriptions-item label="处理时间">{{ data.completeTime || "-" }}</n-descriptions-item>
    <n-descriptions-item label="处理说明" :span="2">{{ data.comment || "-" }}</n-descriptions-item>
    <n-descriptions-item label="申请原因" :span="2">{{ data.reason || "-" }}</n-descriptions-item>
  </n-descriptions>
</template>
