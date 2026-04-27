<script lang="ts" setup>
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
import { FlowDefinitionTypeOptions, FlowTaskStatusEnum } from "@/constants/flow"
import { resetRef } from "@/utils"
import { useTaskStore } from "@/store/modules/task"
import FastUpload from "@/components/FastUpload/FastUpload.vue"
import { calcPriceWithoutTax, formatMoney, syncPurchasePriceRows, validatePurchasePriceRows } from "@/utils/purchasePrice"

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

const purchaseDetailList = computed(() => detailData.value.data?.detailList || [])
const flowActionList = computed<TaskCenterAction[]>(() => detailData.value?.actionList || [])
const canEditPrice = computed(() => Boolean(getFlowActionField("approve", "priceDetailList")))
const productionPlanData = computed<any>(() => detailData.value.data || {})
const canEditPlan = computed(() => Boolean(getFlowActionField("approve", "formData")))
const repairHandlerLogList = computed(() => detailData.value.data?.handlerLogList || [])
const bizActionList = computed<TaskCenterAction[]>(() => bizDetailData.value?.actionList || [])
const repairDetail = computed<any>(() => bizDetailData.value?.data || {})
const materialRequestDetail = computed<any>(() => bizDetailData.value?.data || {})
const isFlowTask = computed(() => currentTaskSource.value === "flow")
const isBizTask = computed(() => currentTaskSource.value === "biz")
const bizTaskHint = computed(() => bizDetailData.value?.hint || "")
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
const logAvatarErrorMap = ref<Record<string, boolean>>({})

function getFlowAction(action: string) {
  return flowActionList.value.find((item) => item.action === action)
}

function getFlowActionField(action: string, field: string): TaskCenterActionField | undefined {
  return getFlowAction(action)?.fields?.find((item) => item.field === field)
}

function getFlowActionHint(action: string) {
  return getFlowAction(action)?.hint || ""
}

function getBizAction(action: string) {
  return bizActionList.value.find((item) => item.action === action)
}

function getActionField(action: string, field: string): TaskCenterActionField | undefined {
  return getBizAction(action)?.fields?.find((item) => item.field === field)
}

function hasBizAction(action: string) {
  return Boolean(getBizAction(action))
}

function getBizActionHint(action: string) {
  return getBizAction(action)?.hint || ""
}

function logUserName(row: any) {
  return row?.operatorName || row?.createName || row?.handlerName || row?.assigneeName || "系统"
}

function logAvatarText(row: any) {
  return logUserName(row).trim().slice(-2) || "系统"
}

function logAvatarKey(prefix: string, row: any, index: number) {
  return `${prefix}-${row?.uid || row?.createTime || row?.updateTime || index}`
}

function logAvatarSrc(prefix: string, row: any, index: number) {
  const key = logAvatarKey(prefix, row, index)
  if (logAvatarErrorMap.value[key]) return ""
  return row?.headImage || row?.avatar || row?.avatarUrl || row?.operatorHeadImage || row?.handlerHeadImage || ""
}

function logAvatarFallback(prefix: string, row: any, index: number) {
  return !logAvatarSrc(prefix, row, index)
}

function onLogAvatarError(prefix: string, row: any, index: number) {
  const key = logAvatarKey(prefix, row, index)
  logAvatarErrorMap.value[key] = true
}

function logActionLabel(action?: string) {
  if (action === "START") return "流程发起"
  if (action === "APPROVE") return "审批通过"
  if (action === "REJECT") return "驳回"
  return action || "处理"
}

function isLatestTimelineItem(index: number, list: any[]) {
  return index === (list?.length || 0) - 1
}

function flowLogDotClass(index: number, list: any[]) {
  return isLatestTimelineItem(index, list) ? "log-panel__dot--pending" : "log-panel__dot--success"
}

function shouldShowFlowLogTag(index: number, list: any[]) {
  return isLatestTimelineItem(index, list)
}

function buildApprovePayload() {
  taskSubmitForm.value.priceDetailList = []
  taskSubmitForm.value.formData = undefined

  if (getFlowActionField("approve", "priceDetailList")) {
    syncPurchasePriceRows(purchaseDetailList.value)
    const priceDetailList = purchaseDetailList.value.map((row: any) => ({
      uid: row.uid,
      vatTaxRate: row.vatTaxRate,
      purchasePriceWithTax: row.purchasePriceWithTax,
      purchasePriceWithoutTax: row.purchasePriceWithoutTax
    }))

    if (!validatePurchasePriceRows(priceDetailList, (text) => message.error(text))) {
      return false
    }
    taskSubmitForm.value.priceDetailList = priceDetailList
  }

  if (getFlowActionField("approve", "formData")) {
    const plan = productionPlanData.value
    if (!plan?.uid) {
      message.error("生产计划数据异常")
      return false
    }
    if (!plan.name || !plan.startTime || !plan.planCompleteTime) {
      message.error("请完整填写生产计划基础信息")
      return false
    }
    if (!plan.productList?.length) {
      message.error("请至少保留一个成品")
      return false
    }
    for (const item of plan.productList) {
      if (!item.itemUid || !item.warehouseUid || !item.quantity || Number(item.quantity) <= 0) {
        message.error("请完整填写生产计划成品信息")
        return false
      }
    }
    taskSubmitForm.value.formData = {
      uid: plan.uid,
      name: plan.name,
      startTime: plan.startTime,
      planCompleteTime: plan.planCompleteTime,
      remark: plan.remark,
      imageList: plan.imageList || [],
      docList: plan.docList || [],
      productList: plan.productList || []
    }
  }

  return true
}

function removePlanProduct(index: number) {
  productionPlanData.value.productList?.splice(index, 1)
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
                <n-button type="primary" text :size="componentSize" @click="showDetailModal(row)">详情</n-button>
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
  <n-modal v-model:show="showDetail" preset="card" class="w-[1200px] h-screen overflow-auto" title="任务详情">
    <div style="">
      <n-descriptions bordered title="任务信息" column="4">
        <template v-if="isFlowTask">
          <n-descriptions-item label="任务名称">
            {{ detailData.taskName }}
          </n-descriptions-item>
          <n-descriptions-item label="流程类型">
            {{ detailData.flowTypeName }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ detailData.statusName }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ detailData.createTime }}
          </n-descriptions-item>
        </template>
        <template v-else>
          <n-descriptions-item label="任务名称">
            {{ bizDetailData.taskName || bizTaskRow.taskName }}
          </n-descriptions-item>
          <n-descriptions-item label="任务类型">
            {{ bizDetailData.taskTypeName || bizTaskRow.taskTypeName }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ bizDetailData.statusName || bizTaskRow.statusName }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ bizDetailData.createTime || bizTaskRow.createTime }}
          </n-descriptions-item>
          <n-descriptions-item label="任务接收人">
            {{ bizDetailData.assigneeName || bizTaskRow.assigneeName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="任务发起人">
            {{ bizDetailData.sourceUserName || bizTaskRow.sourceUserName || "-" }}
          </n-descriptions-item>
        </template>
      </n-descriptions>
      <m-card />
      <template v-if="isFlowTask && FlowDefinitionTypeOptions.REPAIR_FLOW === detailData.flowType">
        <n-descriptions bordered title="工单基础信息" column="4">
          <n-descriptions-item label="工单名称">
            {{ detailData.data?.name || detailData.data?.title || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="项目">
            {{ detailData.data?.projectName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ detailData.data?.statusName || detailData.statusName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="创建人">
            {{ detailData.data?.createName || detailData.sourceUserName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="当前负责人">
            {{ detailData.data?.leaderName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="当前处理人">
            {{ detailData.data?.handlerName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="工单编号">
            {{ detailData.data?.code || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ detailData.data?.createTime || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="描述" :span="4">
            {{ detailData.data?.remark || detailData.data?.description || "-" }}
          </n-descriptions-item>
        </n-descriptions>
      </template>
      <template v-else-if="isFlowTask && FlowDefinitionTypeOptions.PURCHASE_APPLY_FLOW === detailData.flowType">
        <n-descriptions bordered title="采购申请单">
          <n-descriptions-item label="编码">
            {{ detailData.data.code }}
          </n-descriptions-item>
          <n-descriptions-item label="申请人">
            {{ detailData.data.createName }}
          </n-descriptions-item>
          <n-descriptions-item label="需求来源">
            {{ detailData.data.sourceTypeName }}
          </n-descriptions-item>
          <n-descriptions-item label="申请时间">
            {{ detailData.data.applyTimeName }}
          </n-descriptions-item>
          <n-descriptions-item label="需求到货时间">
            {{ detailData.data.expectTimeName }}
          </n-descriptions-item>
        </n-descriptions>
        <m-card />
        <div>
          <n-descriptions :column="4" title="采购申请明细单" />
          <m-card padding="0">
            <vxe-table
              :loading="loading"
              class="w-full"
              :data="detailData.data.detailList"
              border
              stripe
              :row-config="{ isHover: true }"
              max-height="400"
            >
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column field="supplierName" title="供应商名称" show-overflow="tooltip" align="center" width="15%">
                <template #default="{ row }">
                  <vxe-select :options="detailData.data.supplierOptions" v-model="row.supplierUid" />
                </template>
              </vxe-column>
              <vxe-column
                field="purchasePriceWithTax"
                title="采购单价（含税）/元"
                align="center"
                show-overflow="tooltip"
                width="10%"
              >
                <template #default="{ row }">
                  <vxe-number-input
                    v-model="row.purchasePriceWithTax"
                    :show-button="false"
                    :min="0"
                    :precision="4"
                    :disabled="!canEditPrice"
                    :controls="false"
                  />
                </template>
              </vxe-column>
              <vxe-column field="vatTaxRate" title="增值税税率%" align="center" show-overflow="tooltip" width="10%">
                <template #default="{ row }">
                  <vxe-number-input
                    v-model="row.vatTaxRate"
                    :show-button="false"
                    :min="0"
                    :max="100"
                    :precision="2"
                    :disabled="!canEditPrice"
                    :controls="false"
                  />
                </template>
              </vxe-column>
              <vxe-column
                field="purchasePriceWithoutTax"
                title="不含税单价（自动）/元"
                align="center"
                show-overflow="tooltip"
                width="10%"
              >
                <template #default="{ row }">
                  {{ formatMoney(calcPriceWithoutTax(row.purchasePriceWithTax, row.vatTaxRate)) }}
                </template>
              </vxe-column>
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
              <vxe-column
                field="quantity"
                title="申请数量"
                align="center"
                fixed="right"
                show-overflow="tooltip"
                width="10%"
              />
            </vxe-table>
          </m-card>
        </div>
        <n-tag v-if="getFlowActionHint('approve')" :type="canEditPrice ? 'warning' : 'default'" size="small">
          {{ getFlowActionHint("approve") }}
        </n-tag>
      </template>
      <template v-else-if="isFlowTask && FlowDefinitionTypeOptions.INVENTORY_REQUEST_FLOW === detailData.flowType">
        <n-descriptions bordered title="领料申请信息" column="4">
          <n-descriptions-item label="申请单号">{{ detailData.data?.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态"
            >{{ detailData.data?.statusName || detailData.statusName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="领料仓库">{{ detailData.data?.warehouseName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="总数量">{{ detailData.data?.totalQuantity || 0 }}</n-descriptions-item>
          <n-descriptions-item label="用途类型">{{ detailData.data?.usageTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="业务类型">{{ detailData.data?.bizTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="关联对象">{{ detailData.data?.bizName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ detailData.data?.applyTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="期望时间">{{ detailData.data?.expectTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="3">{{ detailData.data?.remark || "-" }}</n-descriptions-item>
        </n-descriptions>
        <m-card />
        <div>
          <n-descriptions :column="4" title="领料明细" />
          <m-card padding="0">
            <vxe-table
              :loading="loading"
              class="w-full"
              :data="detailData.data?.detailList || []"
              border
              stripe
              :row-config="{ isHover: true }"
              max-height="420"
            >
              <vxe-column field="name" title="名称" align="center" min-width="180" />
              <vxe-column field="spec" title="规格" align="center" min-width="140" />
              <vxe-column field="material" title="材质" align="center" min-width="120" />
              <vxe-column field="typeName" title="类型" align="center" min-width="120" />
              <vxe-column field="unitName" title="单位" align="center" width="90" />
              <vxe-column field="quantity" title="申请数量" align="center" width="110" />
              <vxe-column field="issuedQuantity" title="已出库" align="center" width="110" />
              <vxe-column field="availableQuantity" title="可用库存" align="center" width="110" />
              <vxe-column field="remark" title="备注" align="center" min-width="180" />
            </vxe-table>
          </m-card>
        </div>
      </template>
      <template v-else-if="isFlowTask && FlowDefinitionTypeOptions.PRODUCTION_PLAN_FLOW === detailData.flowType">
        <n-descriptions bordered title="生产计划" column="4">
          <n-descriptions-item label="计划名称">
            <n-input v-model:value="productionPlanData.name" :disabled="!canEditPlan" />
          </n-descriptions-item>
          <n-descriptions-item label="当前节点">
            {{ productionPlanData.currentNodeName || "-" }}
          </n-descriptions-item>
          <n-descriptions-item label="开工时间">
            <n-date-picker
              v-model:value="productionPlanData.startTime"
              type="datetime"
              class="w-full"
              :disabled="!canEditPlan"
            />
          </n-descriptions-item>
          <n-descriptions-item label="计划完成">
            <n-date-picker
              v-model:value="productionPlanData.planCompleteTime"
              type="datetime"
              class="w-full"
              :disabled="!canEditPlan"
            />
          </n-descriptions-item>
          <n-descriptions-item label="备注" :span="4">
            <n-input v-model:value="productionPlanData.remark" type="textarea" :disabled="!canEditPlan" />
          </n-descriptions-item>
        </n-descriptions>
        <m-card />
        <div>
          <n-descriptions :column="4" title="生产成品明细" />
          <m-card padding="0">
            <vxe-table
              :loading="loading"
              class="w-full"
              :data="productionPlanData.productList || []"
              border
              stripe
              :row-config="{ isHover: true }"
              max-height="420"
            >
              <vxe-column field="name" title="成品" align="center" min-width="180" />
              <vxe-column field="warehouseName" title="仓库" align="center" min-width="160" />
              <vxe-column field="typeName" title="类型" align="center" min-width="120" />
              <vxe-column field="spec" title="规格" align="center" min-width="140" />
              <vxe-column field="material" title="材质" align="center" min-width="120" />
              <vxe-column field="quantity" title="生产数量" align="center" width="140">
                <template #default="{ row }">
                  <vxe-number-input
                    v-model="row.quantity"
                    :show-button="false"
                    :min="1"
                    :disabled="!canEditPlan"
                    :controls="false"
                  />
                </template>
              </vxe-column>
              <vxe-column v-if="canEditPlan" title="操作" align="center" width="100">
                <template #default="{ rowIndex }">
                  <n-button type="error" text @click="removePlanProduct(rowIndex)">删除</n-button>
                </template>
              </vxe-column>
            </vxe-table>
          </m-card>
        </div>
        <n-tag v-if="getFlowActionHint('approve')" :type="canEditPlan ? 'warning' : 'default'" size="small">
          {{ getFlowActionHint("approve") }}
        </n-tag>
      </template>
      <template v-else-if="isBizTask && bizDetailData.detailType === 'repair_work_order'">
        <n-alert v-if="bizTaskHint" type="info" :show-icon="false" class="mb-3">
          {{ bizTaskHint }}
        </n-alert>
        <n-descriptions bordered title="工单基础信息" column="4">
          <n-descriptions-item label="工单名称">{{
            repairDetail.name || repairDetail.title || "-"
          }}</n-descriptions-item>
          <n-descriptions-item label="项目">{{ repairDetail.projectName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="工单状态">{{ repairDetail.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="创建人">{{
            repairDetail.createName || bizTaskRow.sourceUserName || "-"
          }}</n-descriptions-item>
          <n-descriptions-item label="当前负责人">{{ repairDetail.leaderName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="当前处理人">{{ repairDetail.handlerName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="工单编号">{{ repairDetail.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ repairDetail.createTime || "-" }}</n-descriptions-item>
          <n-descriptions-item label="描述" :span="4">
            {{ repairDetail.remark || repairDetail.description || "-" }}
          </n-descriptions-item>
        </n-descriptions>
        <m-card />
        <div v-if="hasBizAction('transfer') || hasBizAction('dispatch') || hasBizAction('handle')" class="space-y-3">
          <n-descriptions title="负责人操作" />
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
                <n-button type="warning" secondary strong block @click="openLeaderActionModal('transfer')"
                  >选择负责人</n-button
                >
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
                <n-button type="info" secondary strong block @click="openLeaderActionModal('dispatch')"
                  >选择执行人</n-button
                >
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
                <n-button type="primary" strong block @click="openLeaderActionModal('handle')">开始处理</n-button>
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
            <n-input v-model:value="bizTaskSubmitForm.comment" type="textarea" />
          </n-form-item>
          <n-flex>
            <n-button v-if="hasBizAction('agree')" type="primary" @click="submitBizAction('agree')">同意</n-button>
            <n-button v-if="hasBizAction('reject')" type="error" @click="submitBizAction('reject')">驳回</n-button>
            <n-button
              v-if="hasBizAction('complete_confirm')"
              type="primary"
              @click="submitBizAction('complete_confirm')"
              >确认完成</n-button
            >
            <n-button v-if="hasBizAction('complete_reject')" type="error" @click="submitBizAction('complete_reject')"
              >退回处理</n-button
            >
          </n-flex>
        </div>
        <div v-if="hasBizAction('process_log') || hasBizAction('submit_review')" class="space-y-3">
          <n-descriptions title="处理任务" />
          <n-alert type="info" :show-icon="false">
            当前已记录处理次数：{{ bizDetailData.meta?.handlerLogCount || 0 }}，至少 1 次处理记录后才可以提交审核。
          </n-alert>
          <n-form-item :label="getActionField('process_log', 'remark')?.label || '处理记录'">
            <n-input
              v-model:value="bizTaskSubmitForm.remark"
              type="textarea"
              :placeholder="getActionField('process_log', 'remark')?.placeholder || '请输入本次处理内容'"
            />
          </n-form-item>
          <div class="flex gap-2 flex-wrap">
            <n-image
              v-for="(item, index) in bizTaskSubmitForm.imageList || []"
              :key="index"
              :src="item"
              class="w-20 h-20"
            />
            <FastUpload @before-upload="pushBizTaskImage">
              <n-button tertiary>上传处理图片</n-button>
            </FastUpload>
          </div>
          <n-alert v-if="getBizActionHint('submit_review')" type="warning" :show-icon="false">
            {{ getBizActionHint("submit_review") }}
          </n-alert>
          <n-flex>
            <n-button v-if="hasBizAction('process_log')" type="primary" @click="submitBizAction('process_log')"
              >记录处理</n-button
            >
            <n-button v-if="hasBizAction('submit_review')" type="warning" @click="submitBizAction('submit_review')"
              >提交审核</n-button
            >
          </n-flex>
        </div>
        <m-card />
        <div>
          <n-descriptions :column="4" title="处理日志" />
          <m-card padding="0">
            <vxe-table
              class="w-full"
              :data="repairDetail.handlerLogList || []"
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
      </template>
      <template v-else-if="isBizTask && bizDetailData.detailType === 'material_request'">
        <n-alert v-if="bizTaskHint" type="info" :show-icon="false" class="mb-3">
          {{ bizTaskHint }}
        </n-alert>
        <n-descriptions bordered title="领料申请信息" column="4">
          <n-descriptions-item label="申请单号">{{ materialRequestDetail.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ materialRequestDetail.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="领料仓库">{{ materialRequestDetail.warehouseName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="总数量">{{ materialRequestDetail.totalQuantity || 0 }}</n-descriptions-item>
          <n-descriptions-item label="用途类型">{{ materialRequestDetail.usageTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="业务类型">{{ materialRequestDetail.bizTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="关联对象">{{ materialRequestDetail.bizName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ materialRequestDetail.applyTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="期望时间">{{ materialRequestDetail.expectTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="3">{{ materialRequestDetail.remark || "-" }}</n-descriptions-item>
        </n-descriptions>
        <m-card />
        <div>
          <n-descriptions :column="4" title="领料明细" />
          <m-card padding="0">
            <vxe-table
              :loading="loading"
              class="w-full"
              :data="materialRequestDetail.detailList || []"
              border
              stripe
              :row-config="{ isHover: true }"
              max-height="420"
            >
              <vxe-column field="name" title="名称" align="center" min-width="180" />
              <vxe-column field="spec" title="规格" align="center" min-width="140" />
              <vxe-column field="material" title="材质" align="center" min-width="120" />
              <vxe-column field="typeName" title="类型" align="center" min-width="120" />
              <vxe-column field="unitName" title="单位" align="center" width="90" />
              <vxe-column field="quantity" title="申请数量" align="center" width="110" />
              <vxe-column field="issuedQuantity" title="已出库" align="center" width="110" />
              <vxe-column field="availableQuantity" title="可用库存" align="center" width="110" />
              <vxe-column field="remainQuantity" title="剩余可出库" align="center" width="120">
                <template #default="{ row }">
                  {{ Number(row.quantity || 0) - Number(row.issuedQuantity || 0) }}
                </template>
              </vxe-column>
              <vxe-column
                v-if="hasBizAction('issue_partial')"
                field="issueQuantity"
                title="本次出库"
                align="center"
                width="140"
              >
                <template #default="{ row }">
                  <vxe-number-input
                    v-model="row.issueQuantity"
                    :show-button="false"
                    :min="0"
                    :max="Math.max(Number(row.quantity || 0) - Number(row.issuedQuantity || 0), 0)"
                    :controls="false"
                  />
                </template>
              </vxe-column>
              <vxe-column field="remark" title="备注" align="center" min-width="180" />
            </vxe-table>
          </m-card>
        </div>
        <n-tag v-if="getBizActionHint('issue_partial')" type="info" size="small">
          {{ getBizActionHint("issue_partial") }}
        </n-tag>
      </template>
      <template v-else-if="isBizTask && bizDetailData.detailType === 'user_password_reset'">
        <n-alert v-if="bizTaskHint" type="info" :show-icon="false" class="mb-3">
          {{ bizTaskHint }}
        </n-alert>
        <n-descriptions bordered title="密码重置申请" column="4">
          <n-descriptions-item label="申请用户">{{ bizDetailData.data?.applicant?.name || "-" }}</n-descriptions-item>
          <n-descriptions-item label="登录账号">{{
            bizDetailData.data?.applicant?.username || "-"
          }}</n-descriptions-item>
          <n-descriptions-item label="手机号">{{ bizDetailData.data?.applicant?.phone || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ bizDetailData.data?.applyTime || "-" }}</n-descriptions-item>
          <n-descriptions-item label="处理结果">{{
            bizDetailData.data?.resultName || bizDetailData.statusName || "-"
          }}</n-descriptions-item>
          <n-descriptions-item label="处理时间">{{ bizDetailData.data?.completeTime || "-" }}</n-descriptions-item>
          <n-descriptions-item label="处理说明" :span="2">{{ bizDetailData.data?.comment || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请原因" :span="4">{{ bizDetailData.data?.reason || "-" }}</n-descriptions-item>
        </n-descriptions>
      </template>
      <m-card />
      <div v-if="isFlowTask" class="log-panel">
        <div class="log-panel__head">
          <div class="log-panel__title">流程日志</div>
          <n-tag size="small" type="info" round>{{ flowLogs.length }} 条</n-tag>
        </div>
        <div v-if="flowLogs.length" class="log-panel__timeline">
          <div v-for="(row, index) in flowLogs" :key="row.uid || `${row.createTime}-${index}`" class="log-panel__item">
            <div class="log-panel__rail">
              <span class="log-panel__dot" :class="flowLogDotClass(index, flowLogs)" />
              <span v-if="index < flowLogs.length - 1" class="log-panel__line" />
            </div>
            <div class="log-panel__card">
              <div class="log-panel__card-head">
                <div class="log-panel__user">
                  <n-avatar
                    round
                    :size="34"
                    :src="logAvatarSrc('flow', row, index)"
                    :class="{ 'log-panel__avatar--fallback': logAvatarFallback('flow', row, index) }"
                    @error="onLogAvatarError('flow', row, index)"
                  >
                    {{ logAvatarText(row) }}
                  </n-avatar>
                  <div class="log-panel__user-meta">
                    <div class="log-panel__name">{{ logUserName(row) }}</div>
                    <div class="log-panel__time">{{ row.createTime || "-" }}</div>
                  </div>
                </div>
                <n-tag v-if="shouldShowFlowLogTag(index, flowLogs)" type="warning" size="small" round>
                  {{ logActionLabel(row.action) }}
                </n-tag>
              </div>
              <div class="log-panel__body">
                <div v-if="row.nodeName" class="log-panel__node">节点：{{ row.nodeName }}</div>
                <div>{{ row.comment || row.remark || "无备注" }}</div>
              </div>
            </div>
          </div>
        </div>
        <n-empty v-else description="暂无流程日志" />
      </div>

      <div v-if="isFlowTask && FlowDefinitionTypeOptions.REPAIR_FLOW === detailData.flowType" class="log-panel">
        <div class="log-panel__head">
          <div class="log-panel__title">处理日志</div>
          <n-tag size="small" type="success" round>{{ repairHandlerLogList.length }} 条</n-tag>
        </div>
        <div v-if="repairHandlerLogList.length" class="log-panel__timeline">
          <div
            v-for="(row, index) in repairHandlerLogList"
            :key="row.uid || `${row.createTime}-${index}`"
            class="log-panel__item"
          >
            <div class="log-panel__rail">
              <span class="log-panel__dot log-panel__dot--success" />
              <span v-if="index < repairHandlerLogList.length - 1" class="log-panel__line" />
            </div>
            <div class="log-panel__card">
              <div class="log-panel__card-head">
                <div class="log-panel__user">
                  <n-avatar
                    round
                    :size="34"
                    :src="logAvatarSrc('handler', row, index)"
                    :class="{ 'log-panel__avatar--fallback': logAvatarFallback('handler', row, index) }"
                    @error="onLogAvatarError('handler', row, index)"
                  >
                    {{ logAvatarText(row) }}
                  </n-avatar>
                  <div class="log-panel__user-meta">
                    <div class="log-panel__name">{{ logUserName(row) }}</div>
                    <div class="log-panel__time">{{ row.createTime || "-" }}</div>
                  </div>
                </div>
                <n-tag size="small" type="success" round>{{ row.statusName || "处理记录" }}</n-tag>
              </div>
              <div class="log-panel__body">
                <div>{{ row.remark || row.comment || "无处理说明" }}</div>
              </div>
            </div>
          </div>
        </div>
        <n-empty v-else description="暂无处理日志" />
      </div>
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
  </n-modal>
  <n-modal v-model:show="showLeaderActionModal" preset="card" class="w-[520px]" :title="currentLeaderActionTitle">
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
      <n-flex justify="end">
        <n-button @click="showLeaderActionModal = false">取消</n-button>
        <n-button type="primary" @click="confirmLeaderAction">确定</n-button>
      </n-flex>
    </template>
  </n-modal>
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
