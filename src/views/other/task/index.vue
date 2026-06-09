<script lang="ts" setup>
import FormModal from "@/components/FormModal/index.vue"
import TaskBizDetailPanel from "@/views/other/task/components/TaskBizDetailPanel.vue"
import TaskFlowDetailPanel from "@/views/other/task/components/TaskFlowDetailPanel.vue"
import { useBizTaskActions } from "@/views/other/task/composables/useBizTaskActions"
import { buildProductionPlanApprovePayload } from "@/views/other/task/utils/build-production-plan-approve-payload"
import { buildPurchaseApplyApprovePayload } from "@/views/other/task/utils/build-purchase-apply-approve-payload"
import TaskInfoHeader from "@/views/other/task/components/TaskInfoHeader.vue"
import TaskTimelinePanel from "@/views/other/task/components/TaskTimelinePanel.vue"
import { computed, h, onMounted, ref, watch } from "vue"
import { NButton, NTab, NTabs, NTag, useDialog, useMessage } from "naive-ui"
import {
  BizTask,
  BizTaskSubmitForm,
  FlowTaskSubmitForm,
  TaskCenterAction,
  TaskCenterActionField,
  TaskCenterDetail,
  TaskCenterItem
} from "@/model/flow"
import { useAppStore } from "@/store/modules/app"
import { PageVo } from "@/model"
import MCard from "@/components/MCard/index.vue"
import LCard from "@/components/LCard/index.vue"
import { TaskCenterService } from "@/services/TaskCenterService"
import { FlowTaskStatusEnum } from "@/constants/flow"
import { resetRef } from "@/utils"
import { useTaskStore } from "@/store/modules/task"

const appStore = useAppStore()
const taskStore = useTaskStore()
const dialog = useDialog()
const message = useMessage()
const componentSize = computed(() => appStore.componentSize as any)
const currentTab = ref<"pending" | "completed" | "copy" | "history">("pending")
const loading = ref(false)
const showDetail = ref(false)
const taskList = ref<TaskCenterItem[]>([])
const taskData = ref<PageVo<TaskCenterItem, void>>({
  currentPage: 1,
  pageSize: 10,
  count: 0,
  list: [],
  extraData: undefined
})
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})
const detailData = ref<TaskCenterDetail>({})
const bizTaskRow = ref<BizTask>({})
const bizDetailData = ref<TaskCenterDetail>({})
const taskSubmitForm = ref<FlowTaskSubmitForm>({})
const bizTaskSubmitForm = ref<BizTaskSubmitForm>({ formData: {}, imageList: [] })
const showLeaderActionModal = ref(false)
const currentLeaderAction = ref<"transfer" | "dispatch" | "handle" | "">("")
const selectedLeaderTargetUid = ref("")
const flowLogs = ref<any[]>([])
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const currentTaskSource = ref<"flow" | "biz">("flow")

onMounted(() => {
  fetchData()
  getCardProps()
})

function getCardProps() {
  if (TableCardRef.value) {
    TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
  }
}

async function fetchData() {
  loading.value = true
  try {
    let res: PageVo<TaskCenterItem, void>
    switch (currentTab.value) {
      case "pending":
        res = await TaskCenterService.getPendingTasks(pagination.value)
        break
      case "completed":
        res = await TaskCenterService.getCompletedTasks(pagination.value)
        break
      case "copy":
        res = await TaskCenterService.getCopyTasks(pagination.value)
        break
      case "history":
        // For history, we need an instanceUid, but since this is a demo, we'll use an empty string
        // In a real application, you would get the instanceUid from somewhere
        res = {
          currentPage: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          count: 0,
          list: [],
          extraData: undefined
        }
        break
      default:
        res = {
          currentPage: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          count: 0,
          list: [],
          extraData: undefined
        }
    }
    taskData.value = res
    taskList.value = (res.list || []).sort(
      (a, b) => new Date(String(b.createTime || 0)).getTime() - new Date(String(a.createTime || 0)).getTime()
    )
    clampCurrentPage()
    if (currentTab.value === "pending") taskStore.refreshPendingCount()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function clampCurrentPage() {
  const maxPage = Math.max(1, Math.ceil(taskData.value.count / pagination.value.pageSize))
  if (pagination.value.currentPage > maxPage) {
    pagination.value.currentPage = maxPage
  }
}

function pageChange({ currentPage, pageSize }: { currentPage: number; pageSize: number }) {
  pagination.value.currentPage = currentPage
  pagination.value.pageSize = pageSize
  fetchData()
}

function showDetailModal(row: TaskCenterItem) {
  showDetail.value = true
  currentTaskSource.value = row.taskSource || "flow"
  taskSubmitForm.value = resetRef(taskSubmitForm.value)
  taskSubmitForm.value.priceDetailList = []
  bizTaskSubmitForm.value = { taskUid: row.uid, formData: {}, comment: "", imageList: [] }
  showLeaderActionModal.value = false
  currentLeaderAction.value = ""
  selectedLeaderTargetUid.value = ""
  bizTaskRow.value = {}
  flowLogs.value = []
  if (row.taskSource === "biz") {
    bizTaskRow.value = row as BizTask
    TaskCenterService.getDetail("biz", row.uid || "").then((res) => {
      bizDetailData.value = res
      detailData.value = {}
      flowLogs.value = res.historyList || []
      if (res.detailType === "material_request") {
        ;(res.data?.detailList || []).forEach((item: any) => {
          item.issueQuantity = undefined
        })
      }
    })
  } else {
    TaskCenterService.getDetail("flow", row.uid || "", row.flowType || "").then((res) => {
      detailData.value = res
      bizDetailData.value = {}
      taskSubmitForm.value.taskUid = detailData.value.uid
      flowLogs.value = detailData.value.historyList || []
    })
  }
}

function reject() {
  TaskCenterService.submitFlow("reject", {
    ...taskSubmitForm.value,
    flowType: detailData.value.flowType
  }).then(() => {
    showDetail.value = false
    fetchData()
    taskStore.refreshPendingCount()
  })
}

function approve() {
  if (!buildApprovePayload()) {
    return
  }
  TaskCenterService.submitFlow("approve", {
    ...taskSubmitForm.value,
    flowType: detailData.value.flowType
  }).then(() => {
    showDetail.value = false
    fetchData()
    taskStore.refreshPendingCount()
  })
}

const flowActionList = computed<TaskCenterAction[]>(() => detailData.value?.actionList || [])
const bizActionList = computed<TaskCenterAction[]>(() => bizDetailData.value?.actionList || [])
const { hasBizAction, getActionField } = useBizTaskActions(bizActionList)
const materialRequestDetail = computed<any>(() => bizDetailData.value?.data || {})
const isFlowTask = computed(() => currentTaskSource.value === "flow")
const isBizTask = computed(() => currentTaskSource.value === "biz")
const currentLeaderActionOptions = computed<any[]>(() => {
  return getActionField(currentLeaderAction.value, "targetUserUid")?.options || []
})
const currentLeaderActionTitle = computed(() => {
  switch (currentLeaderAction.value) {
    case "transfer":
      return "选择内部转交负责人"
    case "dispatch":
      return "选择派单人员"
    default:
      return "选择处理对象"
  }
})
const currentLeaderActionPlaceholder = computed(() => {
  switch (currentLeaderAction.value) {
    case "transfer":
      return "请选择转交负责人"
    case "dispatch":
      return "请选择派单人员"
    default:
      return "请选择用户"
  }
})
function getFlowAction(action: string) {
  return flowActionList.value.find((item) => item.action === action)
}

function getFlowActionField(action: string, field: string): TaskCenterActionField | undefined {
  return getFlowAction(action)?.fields?.find((item) => item.field === field)
}

function buildApprovePayload() {
  taskSubmitForm.value.priceDetailList = []
  taskSubmitForm.value.formData = undefined

  if (getFlowActionField("approve", "priceDetailList")) {
    const payload = buildPurchaseApplyApprovePayload(detailData.value, (text) => {
      message.error(text)
      return false
    })
    if (payload === false) return false
    taskSubmitForm.value.priceDetailList = payload.priceDetailList
  }

  if (getFlowActionField("approve", "formData")) {
    const payload = buildProductionPlanApprovePayload(detailData.value, (text) => {
      message.error(text)
      return false
    })
    if (payload === false) return false
    taskSubmitForm.value.formData = payload.formData
  }

  return true
}

async function submitBizAction(action: string) {
  bizTaskSubmitForm.value.taskUid = bizTaskRow.value.uid || bizDetailData.value.uid
  bizTaskSubmitForm.value.action = action
  bizTaskSubmitForm.value.formData = {}
  if (action === "transfer" || action === "dispatch") {
    bizTaskSubmitForm.value.targetUserUid = selectedLeaderTargetUid.value
    if (!bizTaskSubmitForm.value.targetUserUid) {
      message.error(action === "transfer" ? "请选择转交负责人" : "请选择派单人员")
      return
    }
  } else {
    bizTaskSubmitForm.value.targetUserUid = ""
  }

  if (action === "issue_partial") {
    const issueDetailList = (materialRequestDetail.value.detailList || [])
      .filter((item: any) => Number(item.issueQuantity || 0) > 0)
      .map((item: any) => ({
        detailUid: item.uid,
        quantity: Number(item.issueQuantity)
      }))
    if (!issueDetailList.length) {
      message.error("请至少填写一条本次出库数量")
      return
    }
    for (const item of materialRequestDetail.value.detailList || []) {
      const current = Number(item.issueQuantity || 0)
      const remain = Number(item.quantity || 0) - Number(item.issuedQuantity || 0)
      if (current < 0) {
        message.error(`【${item.name || "物料"}】本次出库数量不能小于 0`)
        return
      }
      if (current > remain) {
        message.error(`【${item.name || "物料"}】本次出库数量不能超过剩余可出库数量`)
        return
      }
    }
    bizTaskSubmitForm.value.formData = { issueDetailList }
  }

  if (action === "process_log" && !bizTaskSubmitForm.value.remark) {
    message.error("请填写处理记录")
    return
  }

  const submitResult = await TaskCenterService.submitBiz(bizTaskSubmitForm.value)
  if (action === "process_log") {
    bizTaskSubmitForm.value.remark = ""
    bizTaskSubmitForm.value.imageList = []
    bizDetailData.value = await TaskCenterService.getDetail("biz", bizTaskRow.value.uid || "")
    await fetchData()
    await taskStore.refreshPendingCount()
    return
  }
  if (action === "agree" && bizDetailData.value.detailType === "user_password_reset") {
    const result = submitResult as any
    const copyText = result?.temporaryPassword || ""
    dialog.success({
      title: "密码已重置",
      content: () =>
        h("div", { style: "display:flex;flex-direction:column;gap:8px;line-height:1.8;" }, [
          h("div", null, `用户：${result?.name || result?.username || "-"}`),
          h("div", null, `账号：${result?.username || "-"}`),
          h("div", { style: "font-weight:700;color:#d97706;" }, `一次性临时密码：${copyText || "-"}`),
          h(
            "div",
            { style: "color:#64748b;font-size:12px;" },
            "该密码只在当前弹窗展示，请立即复制并通过其他方式通知申请人。"
          )
        ]),
      positiveText: "复制密码",
      negativeText: "关闭",
      async onPositiveClick() {
        if (copyText) {
          await navigator.clipboard.writeText(copyText)
          message.success("已复制临时密码")
        }
        return false
      }
    })
  }
  showLeaderActionModal.value = false
  showDetail.value = false
  await fetchData()
  await taskStore.refreshPendingCount()
}

function openLeaderActionModal(action: "transfer" | "dispatch" | "handle") {
  if (action === "handle") {
    submitBizAction("handle")
    return
  }
  currentLeaderAction.value = action
  selectedLeaderTargetUid.value = ""
  showLeaderActionModal.value = true
}

function confirmLeaderAction() {
  if (!currentLeaderAction.value) return
  submitBizAction(currentLeaderAction.value)
}

function pushBizTaskImage(url: string) {
  bizTaskSubmitForm.value.imageList = bizTaskSubmitForm.value.imageList || []
  bizTaskSubmitForm.value.imageList?.push(url)
}

watch(currentTab, () => {
  pagination.value.currentPage = 1
  fetchData()
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <div class="flex items-center justify-between">
            <n-tabs v-model:value="currentTab" type="line" :size="componentSize">
              <n-tab name="pending">待办事项</n-tab>
              <n-tab name="completed">已完成任务</n-tab>
              <n-tab name="copy">抄送任务</n-tab>
              <n-tab name="history">历史任务</n-tab>
            </n-tabs>
          </div>
        </m-card>
      </template>

      <template #default>
        <m-card ref="TableCardRef" class="w-full h-full flex flex-col" padding="0">
          <vxe-table
            :column-config="{ resizable: true }"
            :data="taskList"
            border
            stripe
            :loading="loading"
            :cell-config="{ height: 45 }"
            :size="componentSize"
            :rowConfig="{ isHover: true }"
            :height="TableCardMaxHeight"
            class="flex-1"
          >
            <vxe-column type="seq" width="70" align="center" title="序号" />
            <vxe-column field="taskName" title="任务名称" align="center" show-overflow="tooltip" />
            <vxe-column field="flowTypeName" title="任务类型" align="center" show-overflow="tooltip">
              <template #default="{ row }">
                {{ row.taskSource === "biz" ? row.taskTypeName || "-" : row.flowTypeName || "-" }}
              </template>
            </vxe-column>
            <vxe-column field="status" title="状态" align="center" show-overflow="tooltip">
              <template #default="{ row }">
                <n-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small">
                  {{ row.statusName }}
                </n-tag>
              </template>
            </vxe-column>
            <vxe-column field="createTime" title="创建时间" align="center" show-overflow="tooltip" />
            <vxe-column title="操作" align="center" fixed="right" width="120">
              <template #default="{ row }">
                <n-button type="primary" text @click="showDetailModal(row)">详情</n-button>
              </template>
            </vxe-column>
          </vxe-table>
        </m-card>
      </template>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end">
          <vxe-pager
            :size="componentSize"
            v-model:currentPage="pagination.currentPage"
            v-model:pageSize="pagination.pageSize"
            :total="taskData.count"
            :layouts="[
              'Home',
              'PrevJump',
              'PrevPage',
              'Number',
              'NextPage',
              'NextJump',
              'End',
              'Sizes',
              'FullJump',
              'Total'
            ]"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>
  </div>
  <FormModal v-model:show="showDetail" title="任务详情" size="xxl">
    <div style="">
      <TaskInfoHeader
        :is-flow-task="isFlowTask"
        :detail-data="detailData"
        :biz-detail-data="bizDetailData"
        :biz-task-row="bizTaskRow"
      />
      <m-card />
      <TaskFlowDetailPanel
        v-if="isFlowTask"
        :flow-type="detailData.flowType"
        :detail="detailData"
        :loading="loading"
      />
      <TaskBizDetailPanel
        v-if="isBizTask"
        :detail-type="bizDetailData.detailType"
        :detail="bizDetailData"
        :loading="loading"
        :biz-task-row="bizTaskRow"
        :submit-form="bizTaskSubmitForm"
        @submit="submitBizAction"
        @leader-action="openLeaderActionModal"
        @upload-image="pushBizTaskImage"
      />
      <m-card />
      <TaskTimelinePanel v-if="isFlowTask" :logs="flowLogs" tag-type="info" />
    </div>

    <template #footer>
      <template v-if="isFlowTask && FlowTaskStatusEnum.PENDING === detailData.status">
        <n-flex justify="end">
          <n-button type="tertiary" @click="reject">驳回</n-button>
          <n-button type="primary" @click="approve">通过</n-button>
        </n-flex>
      </template>
      <template
        v-else-if="
          isBizTask &&
          bizDetailData.detailType !== 'repair_work_order' &&
          (hasBizAction('agree') ||
            hasBizAction('reject') ||
            hasBizAction('issue_partial') ||
            hasBizAction('issue_all') ||
            hasBizAction('unable_issue'))
        "
      >
        <n-flex justify="end">
          <n-input
            v-model:value="bizTaskSubmitForm.comment"
            type="textarea"
            placeholder="请输入处理说明"
            :autosize="{ minRows: 2, maxRows: 4 }"
            class="min-w-[320px]"
          />
          <n-button v-if="hasBizAction('reject')" type="error" @click="submitBizAction('reject')">驳回</n-button>
          <n-button v-if="hasBizAction('approve')" type="primary" @click="submitBizAction('approve')">同意</n-button>
          <n-button v-if="hasBizAction('issue_partial')" type="info" @click="submitBizAction('issue_partial')">
            部分出库
          </n-button>
          <n-button v-if="hasBizAction('issue_all')" type="primary" @click="submitBizAction('issue_all')"
            >全部出库
          </n-button>
          <n-button v-if="hasBizAction('unable_issue')" type="warning" @click="submitBizAction('unable_issue')">
            无法出库
          </n-button>
        </n-flex>
      </template>
    </template>
  </FormModal>
  <FormModal v-model:show="showLeaderActionModal" :title="currentLeaderActionTitle" size="sm" height-mode="auto">
    <n-form>
      <n-form-item label="处理对象">
        <n-select
          v-model:value="selectedLeaderTargetUid"
          :options="currentLeaderActionOptions"
          :placeholder="currentLeaderActionPlaceholder"
          filterable
          clearable
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-button @click="showLeaderActionModal = false">取消</n-button>
      <n-button type="primary" @click="confirmLeaderAction">确定</n-button>
    </template>
  </FormModal>
</template>
