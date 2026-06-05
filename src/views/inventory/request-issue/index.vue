<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { NButton, useMessage } from "naive-ui"
import { PageVo } from "@/model"
import LCard from "@/components/LCard/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { VxePagerEvents } from "vxe-pc-ui"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import {
  MaterialRequestDetail,
  MaterialRequestIssueForm,
  MaterialRequestOrderQuery,
  MaterialRequestOrderQueryData,
  MaterialRequestOrderVo
} from "@/model/inventory/request"
import { MaterialRequestOrderService } from "@/services/inventory/MaterialRequestOrderService"
import { MaterialRequestOrderStatusDict } from "@/constants/enum"
import { TEMPLATE_MODAL_TABLE_DETAIL_MAX } from "@/constants/template-ui"

const appStore = useAppStore()
const message = useMessage()
const showIssueAllConfirm = ref(false)
const pendingIssueAllUid = ref("")
const componentSize = computed(() => appStore.componentSize as any)

const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const loading = ref(false)
const submitting = ref(false)
const showIssue = ref(false)
const showDetail = ref(false)
const issueMode = ref<"partial" | "all" | "unable">("partial")

const query = ref<MaterialRequestOrderQuery>({ currentPage: 1, pageSize: 20, key: "" })
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

function doSearch() {
  query.value.currentPage = 1
  select()
}

const { triggerInputSearch, flushInputSearch, triggerSelectSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    query.value = {
      currentPage: 1,
      pageSize: 20,
      key: "",
      warehouseUid: undefined,
      usageType: undefined,
      bizType: undefined
    }
  })
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
      message.success("全部出库成功")
    } else if (issueMode.value === "unable") {
      await MaterialRequestOrderService.unableIssue(issueForm.value)
      message.success("已关闭领料申请")
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
      message.success("部分出库成功")
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
  pendingIssueAllUid.value = uid
  showIssueAllConfirm.value = true
}

async function confirmIssueAllSubmit() {
  if (!pendingIssueAllUid.value || submitting.value) return
  submitting.value = true
  try {
    await MaterialRequestOrderService.issueAll({ uid: pendingIssueAllUid.value })
    message.success("全部出库成功")
    showIssueAllConfirm.value = false
    pendingIssueAllUid.value = ""
    await select()
  } finally {
    submitting.value = false
  }
}

function statusTagType(status?: string) {
  if (status === MaterialRequestOrderStatusDict.PART_ISSUED) return "warning"
  if (status === MaterialRequestOrderStatusDict.WAIT_ISSUE) return "info"
  return "default"
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
  <div class="LayoutContainer inventory-request-issue">
    <l-card class="w-full inventory-request-issue__shell" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            class="inventory-request-issue__search list-search-form"
          >
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="关键字">
                    <n-input
                      class="w-full"
                      v-model:value="query.key"
                      placeholder="申请单号 / 备注 / 关联对象"
                      clearable
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="领料仓库">
                    <n-select
                      class="w-full"
                      v-model:value="query.warehouseUid"
                      :options="data.extraData?.warehouseOptions || []"
                      placeholder="请选择仓库"
                      filterable
                      clearable
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="用途类型">
                    <n-select
                      class="w-full"
                      v-model:value="query.usageType"
                      :options="data.extraData?.usageTypeOptions || []"
                      placeholder="请选择用途"
                      clearable
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
              </n-grid>
              <ListSearchActions @reset="reset" />
            </div>
          </SearchQueryForm>
        </m-card>
      </template>
      <template #default>
        <div class="inventory-request-issue__page">
          <div class="inventory-request-issue__table-head">
            <div class="inventory-request-issue__table-title">
              <span>待出库列表</span>
            </div>
          </div>

          <div class="inventory-request-issue__table-zone erp-list-table-wrap">
            <m-card ref="TableCardRef" class="w-full" padding="0">
              <ListPageTable
                :data="data.list || []"
                :loading="loading"
                :cell-height="48"
                :size="componentSize"
                :height="TableCardMaxHeight"
              >
                <vxe-column type="seq" width="70" align="center" title="序号" />
                <vxe-column field="code" title="申请单号" align="center" min-width="160" />
                <vxe-column field="warehouseName" title="领料仓库" align="center" min-width="140" />
                <vxe-column field="usageTypeName" title="用途类型" align="center" min-width="140" />
                <vxe-column field="bizTypeName" title="业务类型" align="center" min-width="130" />
                <vxe-column field="bizName" title="关联对象" align="center" min-width="180" show-overflow="tooltip" />
                <vxe-column field="totalQuantity" title="申请总量" align="center" width="110" />
                <vxe-column field="statusName" title="状态" align="center" width="120">
                  <template #default="{ row }">
                    <n-tag size="small" :type="statusTagType(row.status)" :bordered="false">
                      {{ row.statusName || "-" }}
                    </n-tag>
                  </template>
                </vxe-column>
                <vxe-column field="expectTimeName" title="期望时间" align="center" min-width="160" />
                <vxe-column title="操作" align="center" fixed="right" width="260">
                  <template #default="{ row }">
                    <n-space justify="center">
                      <n-button type="primary" text @click="showIssueModal(row.uid, 'partial')">部分出库</n-button>
                      <n-button type="success" text @click="confirmIssueAll(row.uid)">全部出库</n-button>
                      <n-button type="warning" text @click="confirmUnable(row.uid)">无法出库</n-button>
                      <n-button text @click="showDetailModal(row.uid)">详情</n-button>
                    </n-space>
                  </template>
                </vxe-column>
              </ListPageTable>
            </m-card>
          </div>
        </div>
      </template>
      <template #footer>
        <m-card class="w-full flex items-center justify-end inventory-request-issue__pager" padding="8">
          <vxe-pager
            :size="componentSize"
            v-model:currentPage="data.currentPage"
            v-model:pageSize="data.pageSize"
            :total="data.count || 0"
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
    <vxe-table
      :data="detailData.detailList || []"
      border
      stripe
      :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
      :row-config="{ isHover: true }"
    >
      <vxe-column field="name" title="物料名称" align="center" min-width="180" />
      <vxe-column title="规格1" align="center" min-width="130">
        <template #default="{ row }">{{ getSpec1Name(row) }}</template>
      </vxe-column>
      <vxe-column title="规格2" align="center" min-width="130">
        <template #default="{ row }">{{ getSpec2Name(row) }}</template>
      </vxe-column>
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
          <vxe-number-input v-if="issueMode === 'all'" v-model="row.issueQuantity" disabled :show-button="false" />
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
      <div class="TemplateForm-section__title">{{ issueMode === "unable" ? "无法出库说明" : "出库说明" }}</div>
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
    <div class="TemplateForm-section">
      <div class="TemplateForm-section__title">出库明细</div>
    </div>
    <vxe-table
      :data="detailData.detailList || []"
      border
      stripe
      :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
      :row-config="{ isHover: true }"
    >
      <vxe-column field="name" title="物料名称" align="center" min-width="180" />
      <vxe-column title="规格1" align="center" min-width="130">
        <template #default="{ row }">{{ getSpec1Name(row) }}</template>
      </vxe-column>
      <vxe-column title="规格2" align="center" min-width="130">
        <template #default="{ row }">{{ getSpec2Name(row) }}</template>
      </vxe-column>
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

  <FormModal
    v-model:show="showIssueAllConfirm"
    title="确认全部出库"
    size="sm"
    height-mode="auto"
    :mask-closable="false"
  >
    <n-text>将按剩余未出库数量一次性生成正式出库单并扣减库存，库存不足会被后端拦截。</n-text>
    <template #footer>
      <n-flex justify="end" :size="12">
        <n-button @click="showIssueAllConfirm = false">取消</n-button>
        <n-button type="warning" :loading="submitting" :disabled="submitting" @click="confirmIssueAllSubmit">
          确认出库
        </n-button>
      </n-flex>
    </template>
  </FormModal>
</template>

<style scoped lang="scss">
.inventory-request-issue {
  &__shell {
    background: linear-gradient(180deg, var(--n-color-modal) 0%, var(--n-body-color) 120px);
  }

  &__page {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__search-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 0;
  }

  &__table-zone {
    border-radius: 10px;
    border: 1px solid var(--n-border-color);
    background: var(--n-color-modal);
    overflow: hidden;
  }

  &__table-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  &__pager {
    padding: 0 12px 8px;
  }
}
</style>
