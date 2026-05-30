<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { applyWarehouseByUid } from "@/utils/warehouse-select"
import { Add, Reset, Search } from "@vicons/carbon"
import { NButton, useMessage } from "naive-ui"
import { PageVo } from "@/model"
import LCard from "@/components/LCard/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { VxePagerEvents, VxeTableEvents, VxeTableInstance } from "vxe-pc-ui"
import { InventoryOverviewService } from "@/services/inventory/InventoryOverviewService"
import { InventoryQuery, InventoryQueryData, InventoryVo } from "@/model/inventory"
import {
  MaterialRequestDetail,
  MaterialRequestOrderDetailVo,
  MaterialRequestOrderForm,
  MaterialRequestOrderQuery,
  MaterialRequestOrderQueryData,
  MaterialRequestOrderVo
} from "@/model/inventory/request"
import { MaterialRequestOrderService } from "@/services/inventory/MaterialRequestOrderService"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import {
  TEMPLATE_MODAL_TABLE_MAX,
  TEMPLATE_MODAL_TABLE_PICKER_MAX,
  TEMPLATE_MODAL_TABLE_DETAIL_MAX
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

const query = ref<MaterialRequestOrderQuery>({ currentPage: 1, pageSize: 20 })
const data = ref<PageVo<MaterialRequestOrderVo, MaterialRequestOrderQueryData>>({})
const formData = ref<MaterialRequestOrderForm>({ warehouse: {}, detailList: [] })
const detailData = ref<MaterialRequestDetail>({ detailList: [] })
const itemsQuery = ref<InventoryQuery>({ currentPage: 1, pageSize: 50 })
const itemsData = ref<PageVo<InventoryVo, InventoryQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeTableItemsRef = ref<VxeTableInstance>()
const isResubmit = computed(() => !!formData.value.uid && formData.value.status === "rejected")
const warehouseOptions = computed(
  () => formData.value.warehouseOptions || data.value.extraData?.warehouseOptions || []
)

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

function search() {
  query.value.currentPage = 1
  select()
}

function reset() {
  query.value = { currentPage: 1, pageSize: 20 }
  select()
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
  itemsQuery.key = ''
  itemsQuery.currentPage = 1
  loading.value = true
  try {
    itemsData.value = await InventoryOverviewService.select(itemsQuery.value)
  } finally {
    loading.value = false
  }
}

function showItemsModal() {
  if (!formData.value.warehouseUid) {
    message.error("请先选择领料仓库")
    return
  }
  showItems.value = true
  itemsQuery.value.warehouseUidList = [formData.value.warehouseUid]
  selectItems()
}

function confirmSelectItems() {
  const records = VxeTableItemsRef.value?.getCheckboxRecords() || []
  const currentMap = new Map((formData.value.detailList || []).map((item) => [item.itemUid, item]))
  records.forEach((row) => {
    const existing = currentMap.get(row.itemUid)
    if (existing) {
      existing.totalQuantity = row.totalQuantity
      existing.availableQuantity = row.availableQuantity
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
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm label-placement="left" >
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="搜索:">
                  <n-input v-model:value="query.key" clearable placeholder="单号/备注/关联对象" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="状态:">
                  <n-select v-model:value="query.status" :options="data.extraData?.statusOptions || []" clearable placeholder="状态" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="领料仓库:">
                  <n-select
                    v-model:value="query.warehouseUid"
                    :options="data.extraData?.warehouseOptions || []"
                    filterable
                    clearable
                    placeholder="领料仓库"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="用途类型:">
                  <n-select
                    v-model:value="query.usageType"
                    :options="data.extraData?.usageTypeOptions || []"
                    clearable
                    placeholder="用途类型"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="4">
                <n-form-item>
                  <div class="flex items-center justify-between gap-3 flex-wrap w-full">
                    <div class="flex gap-2">
                      <n-button type="primary" @click="search">
                        <template #icon><Search /></template>
                        查询
                      </n-button>
                      <n-button @click="reset">
                        <template #icon><Reset /></template>
                        重置
                      </n-button>
                    </div>
                    <n-button type="primary" @click="showUpdateModal()">
                      <template #icon><Add /></template>
                      我要领料
                    </n-button>
                  </div>
                </n-form-item>
              </n-gi>
            </n-grid>
          </SearchQueryForm>
        </m-card>
      </template>

      <template #default>
        <m-card ref="TableCardRef" class="w-full h-full flex flex-col" padding="0">
          <vxe-table
            ref="VxeTableRef"
            :data="data.list || []"
            border
            stripe
            :loading="loading"
            :cell-config="{ height: 45 }"
            :size="componentSize"
            :row-config="{ isHover: true }"
            :height="TableCardMaxHeight"
          >
            <vxe-column type="seq" width="70" align="center" title="序号" />
            <vxe-column field="code" title="申请单号" min-width="180" align="center" />
            <vxe-column field="warehouseName" title="领料仓库" min-width="140" align="center" />
            <vxe-column field="usageTypeName" title="用途类型" min-width="140" align="center" />
            <vxe-column field="bizName" title="关联对象" min-width="160" align="center" />
            <vxe-column field="statusName" title="状态" width="120" align="center" />
            <vxe-column field="currentNodeName" title="当前节点" min-width="150" align="center" />
            <vxe-column field="totalQuantity" title="总数量" width="100" align="center" />
            <vxe-column field="applyTimeName" title="申请时间" min-width="170" align="center" />
            <vxe-column title="操作" fixed="right" width="220" align="center">
              <template #default="{ row }">
                <n-space justify="center" size="small">
                  <n-button type="primary" text @click="showDetailModal(row.uid)">详情</n-button>
                  <n-button
                    v-if="['rejected'].includes(row.status)"
                    type="info"
                    text
                    @click="showUpdateModal(row.uid)"
                  >
                    重新提交
                  </n-button>
                  <n-button
                    v-if="['rejected'].includes(row.status)"
                    type="error"
                    text
                    @click="showDeleteModal(row.uid)"
                  >
                    删除
                  </n-button>
                </n-space>
              </template>
            </vxe-column>
          </vxe-table>
          <vxe-pager
            :current-page="query.currentPage"
            :page-size="query.pageSize"
            :total="data.count || 0"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>
  </div>

  <FormModal
    v-model:show="showUpdate"
    :title="isResubmit ? '重新提交领料申请' : '领料申请'"
    size="xxl"
  >

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
              <n-select v-model:value="formData.usageType" :options="formData.usageTypeOptions || []" placeholder="请选择用途类型" />
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
              <n-date-picker v-model:value="formData.applyTime" type="datetime" value-format="timestamp" class="w-full" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="期望时间">
              <n-date-picker v-model:value="formData.expectTime" type="datetime" value-format="timestamp" class="w-full" />
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
            <vxe-column field="spec" title="规格" min-width="120" align="center" />
            <vxe-column field="material" title="材质" min-width="120" align="center" />
            <vxe-column field="typeName" title="类型" min-width="120" align="center" />
            <vxe-column field="unitName" title="单位" width="90" align="center" />
            <vxe-column field="availableQuantity" title="可用库存" width="110" align="center" />
            <vxe-column field="quantity" title="申请数量" width="120" align="center">
              <template #default="{ row }">
                <vxe-number-input v-model="row.quantity" :show-button="false" :min="1" :controls="false" />
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
        <FlowSchemaPreview class="h-full" :flow-type="FlowDefinitionTypeOptions.INVENTORY_REQUEST_FLOW" title="领料申请流程" />
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
            <vxe-column field="spec" title="规格" min-width="120" align="center" />
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

  <n-modal v-model:show="showDelete" preset="dialog" title="删除领料申请" content="确定删除当前领料申请吗？" positive-text="确定" negative-text="取消" @positive-click="confirmDelete" />

  <FormModal v-model:show="showItems" title="选择物料" size="lg">

    <div class="space-y-3">
      <div class="flex items-center gap-3 flex-wrap">
        <n-input v-model:value="itemsQuery.key" clearable placeholder="名称/规格/材质" class="w-[280px]" />
        <n-button type="info" secondary strong @click="selectItems">
          <template #icon><Search /></template>
          查询
        </n-button>
        <n-button
          type="tertiary"
          secondary
          strong
          @click="

            selectItems()
          "
        >
          <template #icon><Reset /></template>
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
      <vxe-column field="spec" title="规格" min-width="140" align="center" />
      <vxe-column field="material" title="材质" min-width="120" align="center" />
      <vxe-column field="typeName" title="类型" min-width="120" align="center" />
      <vxe-column field="unitName" title="单位" width="90" align="center" />
      <vxe-column field="availableQuantity" title="可用库存" width="110" align="center" />
      <vxe-column field="supplierName" title="供应商" min-width="160" align="center" />
      </vxe-table>
      <vxe-pager
        :current-page="itemsQuery.currentPage"
        :page-size="itemsQuery.pageSize"
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
