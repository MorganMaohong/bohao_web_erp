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
import ItemPickerModal from "@/components/ItemPickerModal/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import MaterialRequestDetailView from "@/views/inventory/components/MaterialRequestDetailView.vue"
import { ItemPickerVo } from "@/services/ItemPickerService"
import { cloneItemPrice } from "@/utils/itemPrice"
import {
  MaterialRequestDetail,
  MaterialRequestOrderDetailVo,
  MaterialRequestOrderForm,
  MaterialRequestOrderQuery,
  MaterialRequestOrderQueryData,
  MaterialRequestOrderVo
} from "@/model/inventory/request"
import { MaterialRequestOrderService } from "@/services/inventory/MaterialRequestOrderService"
import { MaterialRequestOrderStatusDict } from "@/constants/enum"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import { TEMPLATE_MODAL_TABLE_MAX } from "@/constants/template-ui"

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

const query = ref<MaterialRequestOrderQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<MaterialRequestOrderVo, MaterialRequestOrderQueryData>>({})
const formData = ref<MaterialRequestOrderForm>({ warehouse: {}, detailList: [] })
const detailData = ref<MaterialRequestDetail>({ detailList: [] })
const VxeTableRef = ref<VxeTableInstance>()
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
      pageSize: 50,
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

function showItemsModal() {
  if (!formData.value.warehouseUid) {
    message.error("请先选择领料仓库")
    return
  }
  showItems.value = true
}

function statusTagType(status?: string) {
  if (status === MaterialRequestOrderStatusDict.REJECTED) return "error"
  if (status === MaterialRequestOrderStatusDict.WAIT_ISSUE) return "warning"
  if (status === MaterialRequestOrderStatusDict.PART_ISSUED) return "info"
  if (status === MaterialRequestOrderStatusDict.ALL_ISSUED) return "success"
  return "default"
}

function confirmSelectItems(records: ItemPickerVo[]) {
  if (!formData.value.detailList) {
    formData.value.detailList = []
  }

  const existUidSet = new Set(formData.value.detailList.map((item) => item.itemUid).filter(Boolean))

  const newDetails: MaterialRequestOrderDetailVo[] = records
    .filter((item) => {
      const itemUid = "itemUid" in item && item.itemUid ? item.itemUid : "uid" in item ? item.uid : undefined
      return itemUid && !existUidSet.has(itemUid)
    })
    .map((item) => {
      const itemUid = "itemUid" in item && item.itemUid ? item.itemUid : "uid" in item ? item.uid : undefined
      return {
        ...item,
        itemUid,
        uid: undefined,
        quantity: 1,
        remark: "",
        price: cloneItemPrice(item.price) ?? {}
      }
    })

  if (newDetails.length < records.length) {
    message.warning("已跳过重复物料")
  }

  formData.value.detailList.push(...newDetails)
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

function removeDetail(_row: MaterialRequestOrderDetailVo, index: number) {
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
    <l-card class="w-full h-full inventory-request__shell" border shadow rounded padding="0">
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
        <m-card class="w-full h-full flex flex-col" padding="0">
          <div class="inventory-request__page">
            <ListPageToolbar>
              <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()"> 新增领料</n-button>
            </ListPageToolbar>

            <m-card ref="TableCardRef" class="flex-1 erp-list-table-wrap" padding="0">
              <ListPageTable
                ref="VxeTableRef"
                :data="data.list || []"
                :loading="loading"
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
                <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="220">
                  <template #default="{ row }">
                    <n-flex justify="center">
                      <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
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
                    </n-flex>
                  </template>
                </vxe-column>
              </ListPageTable>
            </m-card>
          </div>
        </m-card>
      </template>

      <template #footer>
        <m-card class="w-full flex items-center justify-end" padding="8">
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

  <FormModal v-model:show="showUpdate" :title="isResubmit ? '重新提交领料申请' : '领料申请'" size="full">
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
              <ItemDetailTable
                :data="formData.detailList"
                preset="inventory_request_edit"
                :max-height="TEMPLATE_MODAL_TABLE_MAX"
                @delete="removeDetail"
              />
            </n-gi>
          </n-grid>
        </n-form>
      </div>
      <div class="TemplateModal__split-side">
        <FlowSchemaPreview :flow-type="FlowDefinitionTypeOptions.INVENTORY_REQUEST_FLOW" title="流程进度" />
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

  <FormModal v-model:show="showDetail" title="领料申请" size="full">
    <div class="TemplateModal__split">
      <div class="TemplateModal__split-main">
        <MaterialRequestDetailView :detail="detailData" />
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

  <ItemPickerModal
    v-model:show="showItems"
    scenario="request"
    :warehouse-uid="formData.warehouseUid"
    @confirm="confirmSelectItems"
  />
</template>

<style lang="scss" scoped>
.inventory-request {
  &__shell {
    background: linear-gradient(180deg, var(--n-color-modal) 0%, var(--n-body-color) 120px);
  }

  &__page {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
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
    padding: 4px 8px 0;
  }

  &__table-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
