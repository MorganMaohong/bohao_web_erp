<script lang="ts" setup>
import { computed } from "vue"
import FastUpload from "@/components/FastUpload/FastUpload.vue"
import RepairWorkOrderDetailView from "@/views/other/task/components/RepairWorkOrderDetailView.vue"
import { useBizTaskActions } from "@/views/other/task/composables/useBizTaskActions"
import type { BizTask, BizTaskSubmitForm, TaskCenterDetail } from "@/model/flow"

const props = defineProps<{
  detail: TaskCenterDetail
  bizTaskRow: BizTask
  submitForm: BizTaskSubmitForm
}>()

const emit = defineEmits<{
  submit: [action: string]
  leaderAction: [action: "transfer" | "dispatch" | "handle"]
  uploadImage: [url: string]
}>()

const { hasBizAction, getActionField, getBizActionHint } = useBizTaskActions(() => props.detail.actionList)

const repairOrder = computed(() => props.detail.data || {})
const hint = computed(() => props.detail.hint || "")
</script>

<template>
  <n-alert v-if="hint" type="info" :show-icon="false" class="mb-3">
    {{ hint }}
  </n-alert>
  <RepairWorkOrderDetailView :order="repairOrder" :source-user-name="bizTaskRow.sourceUserName" />
  <div
    v-if="hasBizAction('transfer') || hasBizAction('dispatch') || hasBizAction('handle')"
    class="space-y-3"
  >
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">负责人操作</div>
    </div>
    <n-grid :cols="3" x-gap="16" y-gap="16">
      <n-gi v-if="hasBizAction('transfer')">
        <n-card size="small" embedded class="repair-action-card repair-action-card--transfer">
          <div class="repair-action-card__header">
            <span class="repair-action-card__badge">转交</span>
            <div class="repair-action-card__title-group">
              <div class="repair-action-card__title">内部转交</div>
              <div class="repair-action-card__subtitle">切换当前负责人</div>
            </div>
          </div>
          <div class="repair-action-card__desc">
            只允许转交给拥有当前项目权限的负责人，转交成功后会替换当前负责人。
          </div>
          <n-button type="warning" secondary strong block @click="emit('leaderAction', 'transfer')">
            选择负责人
          </n-button>
        </n-card>
      </n-gi>
      <n-gi v-if="hasBizAction('dispatch')">
        <n-card size="small" embedded class="repair-action-card repair-action-card--dispatch">
          <div class="repair-action-card__header">
            <span class="repair-action-card__badge">派单</span>
            <div class="repair-action-card__title-group">
              <div class="repair-action-card__title">派单处理</div>
              <div class="repair-action-card__subtitle">指定执行人处理</div>
            </div>
          </div>
          <div class="repair-action-card__desc">派单是指定执行人接单处理，负责人仍保留整体责任和跟进。</div>
          <n-button type="info" secondary strong block @click="emit('leaderAction', 'dispatch')">选择执行人</n-button>
        </n-card>
      </n-gi>
      <n-gi v-if="hasBizAction('handle')">
        <n-card size="small" embedded class="repair-action-card repair-action-card--handle">
          <div class="repair-action-card__header">
            <span class="repair-action-card__badge">处理</span>
            <div class="repair-action-card__title-group">
              <div class="repair-action-card__title">自行处理</div>
              <div class="repair-action-card__subtitle">负责人直接处理</div>
            </div>
          </div>
          <div class="repair-action-card__desc">当前负责人直接进入处理环节，记录处理日志后再提交审核。</div>
          <n-button type="primary" strong block @click="emit('leaderAction', 'handle')">开始处理</n-button>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
  <div
    v-if="
      hasBizAction('agree') ||
      hasBizAction('reject') ||
      hasBizAction('complete_confirm') ||
      hasBizAction('complete_reject')
    "
    class="space-y-3"
  >
    <n-form-item label="处理意见">
      <n-input v-model:value="submitForm.comment" type="textarea" />
    </n-form-item>
    <n-flex>
      <n-button v-if="hasBizAction('agree')" type="primary" @click="emit('submit', 'agree')">同意</n-button>
      <n-button v-if="hasBizAction('reject')" type="error" @click="emit('submit', 'reject')">驳回</n-button>
      <n-button v-if="hasBizAction('complete_confirm')" type="primary" @click="emit('submit', 'complete_confirm')">
        确认完成
      </n-button>
      <n-button v-if="hasBizAction('complete_reject')" type="error" @click="emit('submit', 'complete_reject')">
        退回处理
      </n-button>
    </n-flex>
  </div>
  <div v-if="hasBizAction('process_log') || hasBizAction('submit_review')" class="space-y-3">
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">处理任务</div>
    </div>
    <n-alert type="info" :show-icon="false">
      当前已记录处理次数：{{ detail.meta?.handlerLogCount || 0 }}，至少 1 次处理记录后才可以提交审核。
    </n-alert>
    <n-form-item :label="getActionField('process_log', 'remark')?.label || '处理记录'">
      <n-input
        v-model:value="submitForm.remark"
        type="textarea"
        :placeholder="getActionField('process_log', 'remark')?.placeholder || '请输入本次处理内容'"
      />
    </n-form-item>
    <div class="flex gap-2 flex-wrap">
      <n-image
        v-for="(item, index) in submitForm.imageList || []"
        :key="index"
        :src="item"
        class="w-20 h-20"
      />
      <FastUpload @before-upload="(url: string) => emit('uploadImage', url)">
        <n-button tertiary>上传处理图片</n-button>
      </FastUpload>
    </div>
    <n-alert v-if="getBizActionHint('submit_review')" type="warning" :show-icon="false">
      {{ getBizActionHint("submit_review") }}
    </n-alert>
    <n-flex>
      <n-button v-if="hasBizAction('process_log')" type="primary" @click="emit('submit', 'process_log')">
        记录处理
      </n-button>
      <n-button v-if="hasBizAction('submit_review')" type="warning" @click="emit('submit', 'submit_review')">
        提交审核
      </n-button>
    </n-flex>
  </div>
  <RepairWorkOrderDetailView :order="repairOrder" handler-logs-only show-handler-logs />
</template>

<style scoped>
.repair-action-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.repair-action-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.repair-action-card__badge {
  min-width: 48px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.repair-action-card__title-group {
  min-width: 0;
}

.repair-action-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.repair-action-card__subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.repair-action-card__desc {
  min-height: 44px;
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
}

.repair-action-card--transfer .repair-action-card__badge {
  background: #fff4e5;
  color: #b45309;
}

.repair-action-card--dispatch .repair-action-card__badge {
  background: #e6f4ff;
  color: #1d4ed8;
}

.repair-action-card--handle .repair-action-card__badge {
  background: #e8fff3;
  color: #047857;
}
</style>
