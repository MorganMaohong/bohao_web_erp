<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { applyWarehouseByUid } from "@/utils/warehouse-select"
import { NButton, useMessage } from "naive-ui"
import { PageVo } from "@/model"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { VxePagerEvents, VxeTableInstance } from "vxe-pc-ui"
import { InventoryOverviewService } from "@/services/inventory/InventoryOverviewService"
import { InventoryQuery, InventoryQueryData, InventoryVo } from "@/model/inventory"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import {
  MaterialRequestDetail,
  MaterialRequestOrderForm,
  MaterialRequestOrderQuery,
  MaterialRequestOrderQueryData,
  MaterialRequestOrderVo
} from "@/model/inventory/request"
import { MaterialRequestOrderService } from "@/services/inventory/MaterialRequestOrderService"
import { MaterialRequestOrderStatusDict } from "@/constants/enum"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import {
  TEMPLATE_MODAL_TABLE_DETAIL_MAX,
  TEMPLATE_MODAL_TABLE_MAX,
  TEMPLATE_MODAL_TABLE_PICKER_MAX
} from "@/constants/template-ui"

const appStore = useAppStore()
const message = useMessage()
const componentSize = computed(() => appStore.componentSize as any)

const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const loading = ref(false)
const submitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showItems = ref(false)

const query = ref<MaterialRequestOrderQuery>({ currentPage: 1, pageSize: 20, key: "" })
const data = ref<PageVo<MaterialRequestOrderVo, MaterialRequestOrderQueryData>>({})
const formData = ref<MaterialRequestOrderForm>({ warehouse: {}, detailList: [] })
const detailData = ref<MaterialRequestDetail>({ detailList: [] })
const itemsQuery = ref<InventoryQuery>({ currentPage: 1, pageSize: 50 })
const itemsData = ref<PageVo<InventoryVo, InventoryQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeTableItemsRef = ref<VxeTableInstance>()
const isResubmit = computed(() => !!formData.value.uid && formData.value.status === "rejected")
const warehouseOptions = computed(() => formData.value.warehouseOptions || data.value.extraData?.warehouseOptions || [])

function getCardProps() {
  if (TableCardRef.value) {
    TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
  }
}

async function select() {
  loading.value = true
  try {
    data.value = await MaterialRequestOrderService.select(query.value)
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
      status: undefined,
      warehouseUid: undefined,
      usageType: undefined,
      bizType: undefined
    }
  })
}

async function showUpdateModal(uid?: string) {
  showUpdate.value = true
  formData.value = await MaterialRequestOrderService.form(uid)
  formData.value.warehouse = formData.value.warehouse || {}
  formData.value.detailList = formData.value.detailList || []
}

async function confirmUpdate() {
  if (!formData.value.warehouseUid) {
    message.error("请选择领料仓库")
    return
  }
  if (!formData.value.usageType) {
    message.error("请选择用途类型")
    return
  }
  if (!formData.value.bizType) {
    message.error("请选择业务对象类型")
    return
  }
  if (formData.value.bizType !== "none" && !formData.value.bizUid) {
    message.error("请选择业务对象")
    return
  }
  if (!formData.value.detailList?.length) {
    message.error("请至少添加一条领料明细")
    return
  }
  for (const row of formData.value.detailList) {
    if (!row.itemUid || !row.quantity || Number(row.quantity) <= 0) {
      message.error("请完整填写领料明细数量")
      return
    }
    const available = Number(row.availableQuantity) || 0
    if (Number(row.quantity) > available) {
      message.error(`【${row.name}】申请数量不能超过可用库存 ${available}`)
      return
    }
  }
  submitting.value = true
  try {
    await MaterialRequestOrderService.addOrUpdate(formData.value)
    message.success(isResubmit.value ? "重新提交成功，已再次发起审批流程" : "提交成功")
    showUpdate.value = false
    await select()
  } finally {
    submitting.value = false
  }
}

function showDeleteModal(uid?: string) {
  formData.value.uid = uid
  showDelete.value = true
}

async function confirmDelete() {
  if (!formData.value.uid) return
  submitting.value = true
  try {
    await MaterialRequestOrderService.delete(formData.value.uid)
    showDelete.value = false
    await select()
  } finally {
    submitting.value = false
  }
}

async function showDetailModal(uid?: string) {
  if (!uid) return
  showDetail.value = true
  detailData.value = await MaterialRequestOrderService.detail(uid)
}

function onWarehouseUidChange(uid: string | null) {
  const prevUid = formData.value.warehouseUid
  if (!uid) {
    formData.value.warehouseUid = undefined
    formData.value.warehouse = {}
    return
  }
  if (prevUid && prevUid !== uid) {
    formData.value.detailList = []
  }
  formData.value.warehouseUid = uid
  if (!formData.value.warehouse) {
    formData.value.warehouse = {}
  }
  applyWarehouseByUid(formData.value.warehouse, uid, warehouseOptions.value)
}

async function selectItems() {
  loading.value = true
  try {
    itemsData.value = await InventoryOverviewService.select(itemsQuery.value)
  } finally {
    loading.value = false
  }
}

function resetItemsQuery() {
  itemsQuery.value.key = ""
  itemsQuery.value.currentPage = 1
  selectItems()
}

function showItemsModal() {
  if (!formData.value.warehouseUid) {
    message.error("请先选择领料仓库")
    return
  }
  showItems.value = true
  itemsQuery.value = { currentPage: 1, pageSize: 50, key: "", warehouseUidList: [formData.value.warehouseUid] }
  selectItems()
}

function statusTagType(status?: string) {
  if (status === MaterialRequestOrderStatusDict.REJECTED) return "error"
  if (status === MaterialRequestOrderStatusDict.WAIT_ISSUE) return "warning"
  if (status === MaterialRequestOrderStatusDict.PART_ISSUED) return "info"
  if (status === MaterialRequestOrderStatusDict.ALL_ISSUED) return "success"
  return "default"
}

function confirmSelectItems() {
  const records = VxeTableItemsRef.value?.getCheckboxRecords() || []
  const currentMap = new Map((formData.value.detailList || []).map((item) => [item.itemUid, item]))
  let skipped = 0
  records.forEach((row) => {
    if (!row.itemUid) return
    const existing = currentMap.get(row.itemUid)
    if (existing) {
      existing.totalQuantity = row.totalQuantity
      existing.availableQuantity = row.availableQuantity
      skipped++
      return
    }
    currentMap.set(row.itemUid, {
      itemUid: row.itemUid,
      name: row.name,
      image: row.image,
      type: row.type,
      typeName: row.typeName,
      unit: row.unit,
      unitName: row.unitName,
      spec: row.spec,
      material: row.material,
      supplierUid: row.supplierUid,
      supplierName: row.supplierName,
      quantity: 1,
      totalQuantity: row.totalQuantity,
      availableQuantity: row.availableQuantity,
      remark: ""
    })
  })
  if (skipped > 0) {
    message.warning("已跳过重复物料")
  }
  formData.value.detailList = Array.from(currentMap.values())
  showItems.value = false
}

async function onBizTypeChange(value: string) {
  formData.value.bizUid = ""
  formData.value.bizName = ""
  formData.value.bizObjectOptions = await MaterialRequestOrderService.bizObjectOptions(value)
}

const pageChange = (event: VxePagerEvents) => {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

const itemsPageChange = (event: VxePagerEvents) => {
  itemsQuery.value.currentPage = event.currentPage
  itemsQuery.value.pageSize = event.pageSize
  selectItems()
}

function removeDetail(index: number) {
  formData.value.detailList?.splice(index, 1)
}

watch(
  () => formData.value.bizUid,
  (value) => {
    const match = formData.value.bizObjectOptions?.find((item) => item.value === value)
    formData.value.bizName = match?.label || ""
  }
)

onMounted(() => {
  select()
  getCardProps()
})
</script>

<template>
  <div class="LayoutContainer inventory-request">
    <l-card class="w-full inventory-request__shell" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            class="inventory-request__search list-search-form"
          >
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="关键字">
                    <n-input
                      class="w-full"
                      v-model:value="query.key"
                      clearable
                      placeholder="单号 / 备注 / 关联对象"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="状态">
                    <n-select
                      class="w-full"
                      v-model:value="query.status"
                      :options="data.extraData?.statusOptions || []"
                      clearable
                      filterable
                      placeholder="状态"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="领料仓库">
                    <n-select
                      class="w-full"
                      v-model:value="query.warehouseUid"
                      :options="data.extraData?.warehouseOptions || []"
                      filterable
                      clearable
                      placeholder="领料仓库"
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
                      clearable
                      placeholder="用途类型"
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
        <div class="inventory-request__page">
          <ListPageToolbar>
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()"> 新增领料</n-button>
          </ListPageToolbar>

          <div class="inventory-request__table-head">
            <div class="inventory-request__table-title">
              <span>申请列表</span>
            </div>
          </div>

          <div class="inventory-request__table-zone erp-list-table-wrap">
            <m-card ref="TableCardRef" class="w-full" padding="0">
              <ListPageTable
                ref="VxeTableRef"
                :data="data.list || []"
                :loading="loading"
                :cell-height="45"
                :size="componentSize"
                :height="TableCardMaxHeight"
              >
                <vxe-column type="seq" width="70" align="center" title="序号" />
                <vxe-column field="code" title="申请单号" min-width="180" align="center" />
                <vxe-column field="warehouseName" title="领料仓库" min-width="140" align="center" />
                <vxe-column field="usageTypeName" title="用途类型" min-width="140" align="center" />
                <vxe-column field="bizName" title="关联对象" min-width="160" align="center" show-overflow="tooltip" />
                <vxe-column field="statusName" title="状态" width="120" align="center">
                  <template #default="{ row }">
                    <n-tag size="small" :type="statusTagType(row.status)" :bordered="false">
                      {{ row.statusName || "-" }}
                    </n-tag>
                  </template>
                </vxe-column>
                <vxe-column
                  field="currentNodeName"
                  title="当前节点"
                  min-width="150"
                  align="center"
                  show-overflow="tooltip"
                />
                <vxe-column field="totalQuantity" title="总数量" width="100" align="center" />
                <vxe-column field="applyTimeName" title="申请时间" min-width="170" align="center" />
                <vxe-column title="操作" fixed="right" width="220" align="center">
                  <template #default="{ row }">
                    <n-space justify="center" size="small">
                      <n-button type="primary" text @click="showDetailModal(row.uid)">详情</n-button>
                      <n-button
                        v-if="row.status === MaterialRequestOrderStatusDict.REJECTED"
                        type="info"
                        text
                        @click="showUpdateModal(row.uid)"
                      >
                        重新提交
                      </n-button>
                      <n-button
                        v-if="row.status === MaterialRequestOrderStatusDict.REJECTED"
                        type="error"
                        text
                        @click="showDeleteModal(row.uid)"
                      >
                        删除
                      </n-button>
                    </n-space>
                  </template>
                </vxe-column>
              </ListPageTable>
            </m-card>
          </div>
        </div>
      </template>

      <template #footer>
        <m-card class="w-full flex items-center justify-end inventory-request__pager" padding="8">
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

  <FormModal v-model:show="showUpdate" :title="isResubmit ? '重新提交领料申请' : '领料申请'" size="xxl">
    <div class="TemplateModal__split">
      <div class="TemplateModal__split-main">
        <n-form :model="formData" class="TemplateForm">
          <n-grid cols="2" x-gap="16" y-gap="0">
            <n-gi span="2">
              <div class="TemplateForm-section">
                <div class="TemplateForm-section__title">基本信息</div>
              </div>
            </n-gi>
            <n-gi>
              <n-form-item label="申请单号">
                <n-input :value="formData.code" disabled placeholder="自动生成申请单号" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="领料仓库">
                <n-select
                  filterable
                  clearable
                  placeholder="请选择领料仓库"
                  class="w-full"
                  :options="warehouseOptions"
                  v-model:value="formData.warehouseUid"
                  @update:value="onWarehouseUidChange"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="用途类型">
                <n-select
                  v-model:value="formData.usageType"
                  :options="formData.usageTypeOptions || []"
                  placeholder="请选择用途类型"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="业务对象类型">
                <n-select
                  v-model:value="formData.bizType"
                  :options="formData.bizTypeOptions || []"
                  placeholder="请选择业务对象类型"
                  @update:value="onBizTypeChange"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="业务对象">
                <n-select
                  v-model:value="formData.bizUid"
                  :options="formData.bizObjectOptions || []"
                  placeholder="请选择业务对象"
                  :disabled="!formData.bizType || formData.bizType === 'none'"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="申请时间">
                <n-date-picker v-model:value="formData.applyTime" type="datetime" class="w-full" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="期望时间">
                <n-date-picker v-model:value="formData.expectTime" type="datetime" class="w-full" />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <n-form-item label="备注">
                <n-input v-model:value="formData.remark" type="textarea" placeholder="请输入备注" />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <div class="TemplateForm-section TemplateForm-section__head">
                <div class="TemplateForm-section__title">领料明细</div>
                <n-button type="info" secondary @click="showItemsModal">添加物料</n-button>
              </div>
            </n-gi>
            <n-gi span="2">
              <m-card class="w-full" padding="0">
                <vxe-table :data="formData.detailList || []" border stripe :max-height="TEMPLATE_MODAL_TABLE_MAX">
                  <vxe-column field="name" title="名称" min-width="180" align="center" />
                  <vxe-column title="规格1" min-width="120" align="center">
                    <template #default="{ row }">{{ getSpec1Name(row) }}</template>
                  </vxe-column>
                  <vxe-column title="规格2" min-width="120" align="center">
                    <template #default="{ row }">{{ getSpec2Name(row) }}</template>
                  </vxe-column>
                  <vxe-column field="material" title="材质" min-width="120" align="center" />
                  <vxe-column field="typeName" title="类型" min-width="120" align="center" />
                  <vxe-column field="unitName" title="单位" width="90" align="center" />
                  <vxe-column field="availableQuantity" title="可用库存" width="110" align="center" />
                  <vxe-column field="quantity" title="申请数量" width="120" align="center">
                    <template #default="{ row }">
                      <vxe-number-input
                        v-model="row.quantity"
                        :show-button="false"
                        :min="1"
                        :max="Number(row.availableQuantity || 0)"
                        :controls="false"
                      />
                    </template>
                  </vxe-column>
                  <vxe-column field="remark" title="备注" min-width="180" align="center">
                    <template #default="{ row }">
                      <n-input v-model:value="row.remark" placeholder="备注" />
                    </template>
                  </vxe-column>
                  <vxe-column title="操作" width="100" align="center">
                    <template #default="{ rowIndex }">
                      <n-button type="error" text @click="removeDetail(rowIndex)">删除</n-button>
                    </template>
                  </vxe-column>
                </vxe-table>
              </m-card>
            </n-gi>
          </n-grid>
        </n-form>
      </div>
      <div class="TemplateModal__split-side">
        <FlowSchemaPreview
          class="h-full"
          :flow-type="FlowDefinitionTypeOptions.INVENTORY_REQUEST_FLOW"
          title="领料申请流程"
        />
      </div>
    </div>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showUpdate = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="confirmUpdate">
          {{ isResubmit ? "重新提交审批" : "提交申请" }}
        </n-button>
      </n-flex>
    </template>
  </FormModal>

  <FormModal v-model:show="showDetail" title="领料申请详情" size="xxl">
    <div class="TemplateModal__split">
      <div class="TemplateModal__split-main TemplateModal__sections">
        <n-card title="领料申请信息" :bordered="false" class="detail-card">
          <n-descriptions :column="2" label-placement="left" bordered>
            <n-descriptions-item label="申请单号">{{ detailData.code || "-" }}</n-descriptions-item>
            <n-descriptions-item label="流程状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="申请时间">{{ detailData.applyTimeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="期望时间">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="领料仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="当前节点">{{ detailData.currentNodeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="用途类型">{{ detailData.usageTypeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="业务类型">{{ detailData.bizTypeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="关联对象" :span="2">{{ detailData.bizName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="备注" :span="2">{{ detailData.remark || "-" }}</n-descriptions-item>
          </n-descriptions>
        </n-card>
        <n-card title="领料明细" :bordered="false" class="detail-card">
          <vxe-table :data="detailData.detailList || []" border stripe :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX">
            <vxe-column field="name" title="名称" min-width="180" align="center" />
            <vxe-column title="规格1" min-width="120" align="center">
              <template #default="{ row }">{{ getSpec1Name(row) }}</template>
            </vxe-column>
            <vxe-column title="规格2" min-width="120" align="center">
              <template #default="{ row }">{{ getSpec2Name(row) }}</template>
            </vxe-column>
            <vxe-column field="material" title="材质" min-width="120" align="center" />
            <vxe-column field="typeName" title="类型" min-width="120" align="center" />
            <vxe-column field="unitName" title="单位" width="90" align="center" />
            <vxe-column field="quantity" title="申请数量" width="100" align="center" />
            <vxe-column field="issuedQuantity" title="已出库" width="100" align="center" />
            <vxe-column field="availableQuantity" title="可用库存" width="110" align="center" />
            <vxe-column field="remark" title="备注" min-width="160" align="center" />
          </vxe-table>
        </n-card>
      </div>
      <div class="TemplateModal__split-side">
        <FlowSchemaPreview title="流程进度" :schema-data="detailData.flowSchema" />
      </div>
    </div>
  </FormModal>

  <n-modal
    v-model:show="showDelete"
    preset="dialog"
    title="删除领料申请"
    content="确定删除当前领料申请吗？"
    positive-text="确定"
    negative-text="取消"
    @positive-click="confirmDelete"
  />

  <FormModal v-model:show="showItems" title="选择物料" size="lg">
    <div class="space-y-3">
      <div class="flex items-center gap-3 flex-wrap">
        <n-input
          v-model:value="itemsQuery.key"
          clearable
          placeholder="名称 / 材质"
          class="w-[280px]"
          @keyup.enter="selectItems"
        />
        <n-button type="info" secondary strong @click="selectItems">
          <template #icon>
            <n-icon :component="Search" />
          </template>
          查询
        </n-button>
        <n-button type="tertiary" secondary strong @click="resetItemsQuery">
          <template #icon>
            <n-icon :component="Reset" />
          </template>
          重置
        </n-button>
      </div>
      <vxe-table
        ref="VxeTableItemsRef"
        :data="itemsData.list || []"
        border
        stripe
        :max-height="TEMPLATE_MODAL_TABLE_PICKER_MAX"
        :checkbox-config="{ reserve: true }"
      >
        <vxe-column type="checkbox" width="60" align="center" />
        <vxe-column field="name" title="名称" min-width="180" align="center" />
        <vxe-column title="规格1" min-width="140" align="center">
          <template #default="{ row }">{{ getSpec1Name(row) }}</template>
        </vxe-column>
        <vxe-column title="规格2" min-width="140" align="center">
          <template #default="{ row }">{{ getSpec2Name(row) }}</template>
        </vxe-column>
        <vxe-column field="material" title="材质" min-width="120" align="center" />
        <vxe-column field="typeName" title="类型" min-width="120" align="center" />
        <vxe-column field="unitName" title="单位" width="90" align="center" />
        <vxe-column field="availableQuantity" title="可用库存" width="110" align="center" />
        <vxe-column field="supplierName" title="供应商" min-width="160" align="center" />
      </vxe-table>
      <vxe-pager
        v-model:currentPage="itemsData.currentPage"
        v-model:pageSize="itemsData.pageSize"
        :total="itemsData.count || 0"
        @page-change="itemsPageChange"
      />
    </div>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showItems = false">取消</n-button>
        <n-button type="primary" @click="confirmSelectItems">确定添加</n-button>
      </n-flex>
    </template>
  </FormModal>
</template>

<style lang="scss" scoped>
.inventory-request {
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
