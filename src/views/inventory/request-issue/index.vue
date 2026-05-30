<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { NButton, useDialog, useMessage } from "naive-ui"
import { PageVo } from "@/model"
import LCard from "@/components/LCard/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { VxePagerEvents } from "vxe-pc-ui"
import {
  MaterialRequestDetail,
  MaterialRequestIssueForm,
  MaterialRequestOrderQuery,
  MaterialRequestOrderQueryData,
  MaterialRequestOrderVo
} from "@/model/inventory/request"
import { MaterialRequestOrderService } from "@/services/inventory/MaterialRequestOrderService"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX } from "@/constants/template-ui"

const appStore = useAppStore()
const message = useMessage()
const dialog = useDialog()
const componentSize = computed(() => appStore.componentSize as any)

const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const loading = ref(false)
const submitting = ref(false)
const showIssue = ref(false)
const showDetail = ref(false)
const issueMode = ref<"partial" | "all" | "unable">("partial")

const query = ref<MaterialRequestOrderQuery>({ currentPage: 1, pageSize: 20 })
const data = ref<PageVo<MaterialRequestOrderVo, MaterialRequestOrderQueryData>>({})
const detailData = ref<MaterialRequestDetail>({ detailList: [] })
const issueForm = ref<MaterialRequestIssueForm>({ detailList: [] })

function getCardProps() {
  if (TableCardRef.value) {
    TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
  }
}

async function select() {
  loading.value = true
  try {
    data.value = await MaterialRequestOrderService.issueSelect(query.value)
  } finally {
    loading.value = false
  }
}

function search() {
  query.value.currentPage = 1
  select()
}

function reset() {
  query.value = { currentPage: 1, pageSize: 20 }
  select()
}

async function showDetailModal(uid?: string) {
  if (!uid) return
  showDetail.value = true
  detailData.value = await MaterialRequestOrderService.issueDetail(uid)
}

async function showIssueModal(uid: string, mode: "partial" | "all" | "unable") {
  issueMode.value = mode
  detailData.value = await MaterialRequestOrderService.issueDetail(uid)
  issueForm.value = {
    uid,
    comment: "",
    detailList: []
  }
  ;(detailData.value.detailList || []).forEach((item) => {
    item.issueQuantity = mode === "all" ? String(remainQuantity(item)) : undefined
  })
  showIssue.value = true
}

function remainQuantity(row: any) {
  return Math.max(Number(row.quantity || 0) - Number(row.issuedQuantity || 0), 0)
}

function issueTitle() {
  if (issueMode.value === "all") return "全部出库"
  if (issueMode.value === "unable") return "无法出库"
  return "部分出库"
}

function parseIssueQuantity(row: any) {
  if (row.issueQuantity === undefined || row.issueQuantity === null || row.issueQuantity === "") {
    return 0
  }
  return Number(row.issueQuantity)
}

function validateIssueQuantity(row: any, showTip = true) {
  const current = parseIssueQuantity(row)
  const remain = remainQuantity(row)
  if (!Number.isFinite(current)) {
    if (showTip) message.error(`【${row.name || "物料"}】本次出库数量格式不正确`)
    return false
  }
  if (current < 0) {
    if (showTip) message.error(`【${row.name || "物料"}】本次出库数量不能小于 0`)
    return false
  }
  if (current > remain) {
    if (showTip) message.error(`【${row.name || "物料"}】本次出库数量不能超过剩余可出库数量 ${remain}`)
    return false
  }
  return true
}

async function confirmIssue() {
  if (!issueForm.value.uid) return
  if (issueMode.value === "unable" && !issueForm.value.comment) {
    message.error("请填写无法出库原因")
    return
  }
  submitting.value = true
  try {
    if (issueMode.value === "all") {
      await MaterialRequestOrderService.issueAll(issueForm.value)
    } else if (issueMode.value === "unable") {
      await MaterialRequestOrderService.unableIssue(issueForm.value)
    } else {
      const detailList = (detailData.value.detailList || [])
        .filter((item) => parseIssueQuantity(item) > 0)
        .map((item) => ({
          detailUid: item.uid,
          quantity: parseIssueQuantity(item)
        }))
      if (!detailList.length) {
        message.error("请至少填写一条本次出库数量")
        return
      }
      for (const item of detailData.value.detailList || []) {
        if (!validateIssueQuantity(item)) {
          return
        }
      }
      await MaterialRequestOrderService.issuePartial({
        ...issueForm.value,
        detailList
      })
    }
    showIssue.value = false
    await select()
  } finally {
    submitting.value = false
  }
}

function confirmUnable(uid?: string) {
  if (!uid) return
  showIssueModal(uid, "unable")
}

function confirmIssueAll(uid?: string) {
  if (!uid) return
  dialog.warning({
    title: "确认全部出库",
    content: "将按剩余未出库数量一次性生成正式出库单并扣减库存，库存不足会被后端拦截。",
    positiveText: "确认",
    negativeText: "取消",
    onPositiveClick: () => showIssueModal(uid, "all")
  })
}

const pageChange = (event: VxePagerEvents) => {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

onMounted(() => {
  select()
  getCardProps()
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm inline label-placement="left" :show-feedback="false" class="request-issue-search">
            <n-form-item label="关键词">
              <n-input v-model:value="query.key" placeholder="申请单号 / 用途 / 备注" clearable />
            </n-form-item>
            <n-form-item label="领料仓库">
              <n-select
                v-model:value="query.warehouseUid"
                :options="data.extraData?.warehouseOptions || []"
                placeholder="请选择仓库"
                filterable
                clearable
                class="w-[180px]"
              />
            </n-form-item>
            <n-form-item label="用途类型">
              <n-select
                v-model:value="query.usageType"
                :options="data.extraData?.usageTypeOptions || []"
                placeholder="请选择用途"
                clearable
                class="w-[180px]"
              />
            </n-form-item>
            <n-form-item>
              <n-space>
                <n-button type="primary" @click="search">
                  <template #icon><n-icon :component="Search" /></template>
                  查询
                </n-button>
                <n-button @click="reset">
                  <template #icon><n-icon :component="Reset" /></template>
                  重置
                </n-button>
              </n-space>
            </n-form-item>
          </SearchQueryForm>
        </m-card>
      </template>
      <template #default>
        <m-card ref="TableCardRef" class="w-full h-full flex flex-col" padding="0">
          <vxe-table
            :column-config="{ resizable: true }"
            :data="data.list || []"
            border
            stripe
            :loading="loading"
            :cell-config="{ height: 48 }"
            :size="componentSize"
            :row-config="{ isHover: true }"
            :height="TableCardMaxHeight"
            class="flex-1"
          >
            <vxe-column type="seq" width="70" align="center" title="序号" />
            <vxe-column field="code" title="申请单号" align="center" min-width="160" />
            <vxe-column field="warehouseName" title="领料仓库" align="center" min-width="140" />
            <vxe-column field="usageTypeName" title="用途类型" align="center" min-width="140" />
            <vxe-column field="bizTypeName" title="业务类型" align="center" min-width="130" />
            <vxe-column field="bizName" title="关联对象" align="center" min-width="180" />
            <vxe-column field="totalQuantity" title="申请总量" align="center" width="110" />
            <vxe-column field="statusName" title="状态" align="center" width="120">
              <template #default="{ row }">
                <n-tag :type="row.status === 'part_issued' ? 'warning' : 'info'" size="small">
                  {{ row.statusName || "-" }}
                </n-tag>
              </template>
            </vxe-column>
            <vxe-column field="expectTimeName" title="期望时间" align="center" min-width="160" />
            <vxe-column title="操作" align="center" fixed="right" width="260">
              <template #default="{ row }">
                <n-space justify="center">
                  <n-button type="primary" text @click="showIssueModal(row.uid, 'partial')">
                    部分出库
                  </n-button>
                  <n-button type="success" text @click="confirmIssueAll(row.uid)">
                    全部出库
                  </n-button>
                  <n-button type="warning" text @click="confirmUnable(row.uid)">
                    无法出库
                  </n-button>
                  <n-button text @click="showDetailModal(row.uid)">详情</n-button>
                </n-space>
              </template>
            </vxe-column>
          </vxe-table>
          <vxe-pager
            v-model:current-page="query.currentPage"
            v-model:page-size="query.pageSize"
            :total="data.count || 0"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>
  </div>

  <FormModal v-model:show="showIssue" :title="issueTitle()" size="xl">

    <n-alert v-if="issueMode === 'all'" type="success" :show-icon="false" class="mb-3">
      全部出库会按剩余未出库数量扣减库存，若库存不足会直接提示。
    </n-alert>
    <n-alert v-else-if="issueMode === 'unable'" type="warning" :show-icon="false" class="mb-3">
      无法出库会关闭当前领料申请，请填写原因，方便后续追踪。
    </n-alert>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">申请信息</div>
      </div>
      <n-descriptions bordered column="4">
      <n-descriptions-item label="申请单号">{{ detailData.code || "-" }}</n-descriptions-item>
      <n-descriptions-item label="领料仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="用途类型">{{ detailData.usageTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="关联对象">{{ detailData.bizName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="备注" :span="4">{{ detailData.remark || "-" }}</n-descriptions-item>
    </n-descriptions>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">出库明细</div>
      </div>
      <vxe-table :data="detailData.detailList || []" border stripe :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX" :row-config="{ isHover: true }">
      <vxe-column field="name" title="物料名称" align="center" min-width="180" />
      <vxe-column field="spec" title="规格" align="center" min-width="130" />
      <vxe-column field="material" title="材质" align="center" min-width="120" />
      <vxe-column field="unitName" title="单位" align="center" width="90" />
      <vxe-column field="quantity" title="申请数量" align="center" width="110" />
      <vxe-column field="issuedQuantity" title="已出库" align="center" width="110" />
      <vxe-column field="availableQuantity" title="可用库存" align="center" width="110" />
      <vxe-column field="remainQuantity" title="剩余可出库" align="center" width="120">
        <template #default="{ row }">{{ remainQuantity(row) }}</template>
      </vxe-column>
      <vxe-column v-if="issueMode !== 'unable'" field="issueQuantity" title="本次出库" align="center" width="150">
        <template #default="{ row }">
          <vxe-number-input
            v-if="issueMode === 'all'"
            v-model="row.issueQuantity"
            disabled
            :show-button="false"
          />
          <n-input
            v-else
            v-model:value="row.issueQuantity"
            placeholder="请输入数量"
            @blur="validateIssueQuantity(row)"
          />
        </template>
      </vxe-column>
      <vxe-column field="remark" title="备注" align="center" min-width="180" />
    </vxe-table>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">{{ issueMode === 'unable' ? '无法出库说明' : '出库说明' }}</div>
      </div>
      <n-form-item :show-label="false">
        <n-input
          v-model:value="issueForm.comment"
          type="textarea"
          :placeholder="issueMode === 'unable' ? '请填写无法出库原因' : '请输入本次出库说明'"
        />
      </n-form-item>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showIssue = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="confirmIssue">确定</n-button>
      </n-flex>
    </template>
  </FormModal>

  <FormModal v-model:show="showDetail" title="领料申请详情" size="xl">
    <n-descriptions bordered title="基础信息" column="4">
      <n-descriptions-item label="申请单号">{{ detailData.code || "-" }}</n-descriptions-item>
      <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="领料仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="申请总量">{{ detailData.totalQuantity || 0 }}</n-descriptions-item>
      <n-descriptions-item label="用途类型">{{ detailData.usageTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="业务类型">{{ detailData.bizTypeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="关联对象">{{ detailData.bizName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="期望时间">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
      <n-descriptions-item label="备注" :span="4">{{ detailData.remark || "-" }}</n-descriptions-item>
    </n-descriptions>
    <m-card />
    <vxe-table :data="detailData.detailList || []" border stripe :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX" :row-config="{ isHover: true }">
      <vxe-column field="name" title="物料名称" align="center" min-width="180" />
      <vxe-column field="spec" title="规格" align="center" min-width="130" />
      <vxe-column field="material" title="材质" align="center" min-width="120" />
      <vxe-column field="unitName" title="单位" align="center" width="90" />
      <vxe-column field="quantity" title="申请数量" align="center" width="110" />
      <vxe-column field="issuedQuantity" title="已出库" align="center" width="110" />
      <vxe-column field="availableQuantity" title="可用库存" align="center" width="110" />
      <vxe-column field="remainQuantity" title="剩余可出库" align="center" width="120">
        <template #default="{ row }">{{ remainQuantity(row) }}</template>
      </vxe-column>
      <vxe-column field="remark" title="备注" align="center" min-width="180" />
    </vxe-table>
  </FormModal>
</template>

<style scoped>
.request-issue-search {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}
</style>
