<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { resetRef } from "@/utils"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { Add } from "@vicons/carbon"
import { CloseFilled } from "@vicons/material"
import FastMultipleUpload from "@/components/FastMultipleUpload/FastMultipleUpload.vue"
import { InventCheckOrderStatusDict } from "@/constants/enum"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { TEMPLATE_MODAL_TABLE_MAX, TEMPLATE_MODAL_TABLE_PICKER_MAX } from "@/constants/template-ui"
import { PageVo } from "@/model"
import { VxePagerEvents } from "vxe-pc-ui"
import { applyWarehouseByUid } from "@/utils/warehouse-select"
import { InventoryOverviewService } from "@/services/inventory/InventoryOverviewService"
import { InventoryQuery, InventoryQueryData, InventoryVo } from "@/model/inventory"
import { InventoryCheckOrderService } from "@/services/inventory/InventoryCheckOrderService"
import {
  InventoryCheckDetail,
  InventoryCheckOrderDetailVo,
  InventoryCheckOrderForm,
  InventoryCheckOrderQuery,
  InventoryCheckOrderQueryData,
  InventoryCheckOrderVo
} from "@/model/inventory/check"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showCancel = ref(false)
const showCompleteConfirm = ref(false)
const showItems = ref(false)
const showPreview = ref(false)
const formData = ref<InventoryCheckOrderForm>({ warehouse: {} })
const itemsQuery = ref<InventoryQuery>({ currentPage: 1, pageSize: 50 })
const itemsData = ref<PageVo<InventoryVo, InventoryQueryData>>({ currentPage: 1, pageSize: 50 })
const VxeTableItemsRef = ref<VxeTableInstance>()
const detailData = ref<InventoryCheckDetail>({ detailList: [], imageList: [] })
const tmpImageList = ref([])
const tmpImageIndex = ref(0)
const formRef = ref<FormInst>()
const loading = ref(false)
const formRule = computed(() => ({
  type: {
    required: true,
    message: "请选择类型",
    trigger: ["input", "blur"]
  },
  warehouseUid: {
    required: true,
    message: "请选择盘点仓库",
    trigger: ["input", "blur"]
  },
  detailList: {
    required: true,
    validator() {
      if (!formData.value.detailList || formData.value.detailList.length <= 0) {
        return new Error("盘点明细不能为空！")
      }

      for (const item of formData.value.detailList) {
        if (item.quantity === undefined || item.quantity === null || Number(item.quantity) < 0) {
          return new Error(`【${item.name}】实盘数量不能小于0！`)
        }
      }

      return true
    },
    trigger: ["input", "blur"]
  }
}))
const query = ref<InventoryCheckOrderQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<InventoryCheckOrderVo, InventoryCheckOrderQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

const warehouseOptions = computed(() => formData.value.warehouseOptions || data.value.extraData?.warehouseOptions || [])

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  InventoryCheckOrderService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function doSearch() {
  query.value.currentPage = 1
  select()
}

const { triggerInputSearch, flushInputSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    query.value = {
      currentPage: 1,
      pageSize: 50,
      key: ""
    }
  })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  InventoryCheckOrderService.form(uid).then((data) => {
    formData.value = data
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    InventoryCheckOrderService.addOrUpdate(formData.value)
      .then(() => {
        showUpdate.value = false
        select()
      })
      .finally(() => {
        isSubmitting.value = false
      })
  })
}

function showCompleteModal() {
  formRef.value?.validate((err) => {
    if (err) return
    showCompleteConfirm.value = true
  })
}

function confirmComplete() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  InventoryCheckOrderService.complete(formData.value)
    .then(() => {
      showCompleteConfirm.value = false
      showUpdate.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function showDeleteModal(uid: string) {
  showDelete.value = true
  formData.value.uid = uid
}

function confirmDelete() {
  isSubmitting.value = true
  InventoryCheckOrderService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
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

function selectItems() {
  loading.value = true
  InventoryOverviewService.select(itemsQuery.value)
    .then((data) => {
      itemsData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

function showItemsModal() {
  if (formData.value.warehouseUid) {
    showItems.value = true
    itemsQuery.value.warehouseUidList = [formData.value.warehouseUid]
    selectItems()
  } else {
    window.$message.error("请选择盘点仓库!")
  }
}

function confirmUpdateItems() {
  const records = VxeTableItemsRef.value?.getCheckboxRecords() || []

  if (!formData.value.detailList) {
    formData.value.detailList = []
  }

  const existUidSet = new Set(formData.value.detailList.map((item) => item.itemUid).filter(Boolean))

  const newDetails: InventoryCheckOrderDetailVo[] = records
    .filter((item) => item.itemUid && !existUidSet.has(item.itemUid))
    .map((item) => ({
      ...item,
      itemUid: item.itemUid,
      uid: undefined,
      quantity: 0
    }))

  if (newDetails.length < records.length) {
    window.$message?.warning("已跳过重复物料")
  }

  formData.value.detailList.push(...newDetails)

  showItems.value = false
}

function confirmDeleteItems(row: InventoryCheckOrderDetailVo, index: number) {
  if (!row.uid) {
    formData.value?.detailList.splice(index, 1)
    return
  }
  InventoryCheckOrderService.deleteDetail(row.uid).then(() => {
    formData.value?.detailList.splice(index, 1)
  })
}

const totalQuantity = computed(() => {
  if (!formData.value.detailList) return 0

  return formData.value.detailList.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0)
  }, 0)
})

const totalAmountWithTax = computed(() => {
  if (!formData.value.detailList) return 0

  return formData.value.detailList.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0
    const price = Number(item.purchasePriceWithTax) || 0
    return sum + quantity * price
  }, 0)
})

const totalAmountWithoutTax = computed(() => {
  if (!formData.value.detailList) return 0

  return formData.value.detailList.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0
    const price = Number(item.purchasePriceWithoutTax) || 0
    return sum + quantity * price
  }, 0)
})

const totalTaxAmount = computed(() => {
  return totalAmountWithTax.value - totalAmountWithoutTax.value
})

function showDetailModal(uid: string) {
  loading.value = true
  showDetail.value = true
  InventoryCheckOrderService.detail(uid)
    .then((data) => {
      detailData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

function showPreviewModal(data, idx: number) {
  tmpImageList.value = data
  tmpImageIndex.value = idx
  showPreview.value = true
}

function showCancelModal(uid: string) {
  showCancel.value = true
  formData.value.uid = uid
}

function confirmCancel() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  InventoryCheckOrderService.cancel(formData.value.uid)
    .then(() => {
      showCancel.value = false
      formData.value.uid = ""
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const profitQuantity = (row) => {
  const stock = row.totalQuantity || 0
  const input = row.quantity || 0
  return Math.max(input - stock, 0)
}

const lossQuantity = (row) => {
  const stock = row.totalQuantity || 0
  const input = row.quantity || 0
  return Math.max(stock - input, 0)
}

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function itemsPageChange(event: VxePagerEvents) {
  itemsQuery.value.currentPage = event.currentPage
  itemsQuery.value.pageSize = event.pageSize
  selectItems()
}

onMounted(() => {
  select()
  getCardProps()
  const $table = VxeTableRef.value
  const $toolbar = VxeToolbarRef.value
  if ($table && $toolbar) {
    $table?.connect?.($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            ref="queryFormRef"
            class="list-search-form"
          >
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="关键字">
                    <n-input
                      class="w-full"
                      clearable
                      v-model:value="query.key"
                      placeholder="编号或备注"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
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
          <ListPageToolbar>
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()"> 新增盘点 </n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1 erp-list-table-wrap">
            <ListPageTable
              :data="data.list"
              :loading="loading"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
              :size="appStore.componentSize"
            >
              <vxe-column field="code" title="编号" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="warehouseName" title="盘点仓库" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column title="状态" show-overflow="tooltip" align="center" width="15%">
                <template #default="{ row }">
                  <vxe-text
                    style="font-weight: bold"
                    status="error"
                    v-if="row.status === InventCheckOrderStatusDict.WAIT_COMPLETE"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                  <vxe-text
                    style="font-weight: bold"
                    status="success"
                    v-else-if="row.status === InventCheckOrderStatusDict.COMPLETE"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                  <vxe-text
                    style="font-weight: bold"
                    status="perfect"
                    v-else-if="row.status === InventCheckOrderStatusDict.CANCEL"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                </template>
              </vxe-column>
              <vxe-column field="startTimeName" title="开始时间" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column field="endTimeName" title="结束时间" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
              <vxe-column
                field="createTime"
                title="创建时间"
                show-overflow="tooltip"
                align="center"
                :visible="false"
                width="30%"
              />
              <vxe-column
                field="updateTime"
                title="更新时间"
                show-overflow="tooltip"
                align="center"
                :visible="false"
                width="30%"
              />
              <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="120">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <template v-if="row.status === InventCheckOrderStatusDict.WAIT_COMPLETE">
                      <n-button type="info" text @click="showUpdateModal(row.uid)">编辑</n-button>
                      <n-button type="error" text @click="showCancelModal(row.uid)">取消</n-button>
                    </template>
                    <template v-else-if="row.status === InventCheckOrderStatusDict.COMPLETE">
                      <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
                    </template>
                    <template v-else-if="row.status === InventCheckOrderStatusDict.CANCEL">
                      <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
                      <!--                      <n-button type="error" text @click="showDeleteModal(row.uid)">删除</n-button>-->
                    </template>
                  </n-flex>
                </template>
              </vxe-column>
            </ListPageTable>
          </m-card>
        </m-card>
      </template>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end">
          <vxe-pager
            :size="appStore.componentSize"
            v-model:currentPage="data.currentPage"
            v-model:pageSize="data.pageSize"
            :total="data.count"
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
  <!-- 弹窗 -->
  <FormModal v-model:show="showUpdate" title="盘点单据信息" size="xl">
    <n-form :model="formData" ref="formRef" :rules="formRule" class="TemplateForm">
      <n-grid cols="2" x-gap="16" y-gap="0">
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">基本信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="编号">
            <n-input disabled placeholder="自动生成编号" v-model:value="formData.code" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="盘点类型" path="type">
            <n-select
              placeholder="请选择类型"
              v-model:value="formData.type"
              :options="formData.typeOptions"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="盘点开始时间" class="w-full" path="startTime">
            <n-date-picker
              type="datetime"
              placeholder="请选择开始时间"
              class="w-full"
              v-model:value="formData.startTime"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="盘点结束时间" class="w-full" path="endTime">
            <n-date-picker
              type="datetime"
              placeholder="请选择结束时间"
              class="w-full"
              v-model:value="formData.endTime"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">盘点仓库</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="盘点仓库" class="w-full" path="warehouseUid">
            <n-select
              filterable
              clearable
              placeholder="请选择盘点仓库"
              class="w-full"
              :options="warehouseOptions"
              v-model:value="formData.warehouseUid"
              @update:value="onWarehouseUidChange"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section TemplateForm-section__head">
            <div class="TemplateForm-section__title">盘点明细</div>
            <n-button type="info" @click="showItemsModal">添加物料</n-button>
          </div>
        </n-gi>
        <n-gi span="2">
          <n-form-item path="detailList" :show-label="false">
            <m-card class="w-full" padding="0">
              <vxe-table
                v-if="formData.detailList && formData.detailList.length > 0"
                class="w-full"
                :data="formData.detailList"
                border
                stripe
                :row-config="{ isHover: true }"
                :max-height="TEMPLATE_MODAL_TABLE_MAX"
              >
                <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="15%" />
                <vxe-column
                  field="supplierName"
                  title="供应商名称"
                  show-overflow="tooltip"
                  align="center"
                  width="15%"
                />
                <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
                <vxe-column field="vatTaxRate" title="增值税率%" show-overflow="tooltip" align="center" width="15%">
                  <template #default="{ row }">
                    <vxe-number-input v-model="row.vatTaxRate" />
                  </template>
                </vxe-column>
                <vxe-column
                  field="purchasePriceWithTax"
                  title="采购单价（含税）/元"
                  show-overflow="tooltip"
                  align="center"
                  width="20%"
                >
                  <template #default="{ row }">
                    <vxe-number-input v-model="row.purchasePriceWithTax" />
                  </template>
                </vxe-column>
                <vxe-column
                  field="purchasePriceWithoutTax"
                  title="采购单价（不含税）/元"
                  show-overflow="tooltip"
                  align="center"
                  width="20%"
                >
                  <template #default="{ row }">
                    <vxe-number-input v-model="row.purchasePriceWithoutTax" />
                  </template>
                </vxe-column>
                <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="15%" />
                <vxe-column title="规格1" show-overflow="tooltip" align="center" width="15%">
                  <template #default="{ row }">{{ getSpec1Name(row) }}</template>
                </vxe-column>
                <vxe-column title="规格2" show-overflow="tooltip" align="center" width="15%">
                  <template #default="{ row }">{{ getSpec2Name(row) }}</template>
                </vxe-column>
                <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
                <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
                <vxe-column
                  field="totalQuantity"
                  fixed="right"
                  title="库存数量"
                  align="center"
                  show-overflow="tooltip"
                  width="15%"
                />
                <!--                    <vxe-column
                      field="availableQuantity"
                      fixed="right"
                      title="可用库存"
                      align="center"
                      show-overflow="tooltip"
                      width="15%"
                    />-->
                <vxe-column fixed="right" title="本次盘点数量" align="center" show-overflow="tooltip" width="15%">
                  <template #default="{ row }">
                    <vxe-number-input v-model="row.quantity" min="0" />
                  </template>
                </vxe-column>
                <vxe-column title="本次盘盈数量" align="center" fixed="right" width="15%">
                  <template #default="{ row }">
                    <vxe-number-input disabled :model-value="profitQuantity(row)" />
                  </template>
                </vxe-column>

                <vxe-column title="本次盘亏数量" align="center" fixed="right" width="15%">
                  <template #default="{ row }">
                    <vxe-number-input disabled :model-value="lossQuantity(row)" />
                  </template>
                </vxe-column>
                <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="60">
                  <template #default="{ row, rowIndex }">
                    <n-flex justify="center">
                      <n-button type="error" text @click="confirmDeleteItems(row, rowIndex)">删除 </n-button>
                    </n-flex>
                  </template>
                </vxe-column>
              </vxe-table>
              <el-empty :image-size="80" class="TemplateForm-empty" description="无数据" v-else />
            </m-card>
          </n-form-item>
        </n-gi>
        <!--          <n-gi>
            <n-form-item label="本单出库总数">
              <n-input disabled placeholder="0" v-model:value="totalQuantity" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本次出库总采购价（含税）/元">
              <n-input disabled placeholder="0.00" v-model:value="totalAmountWithTax" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本次出库总采购价（不含税）/元">
              <n-input disabled placeholder="0.00" v-model:value="totalAmountWithoutTax" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本次出库品总税额/元">
              <n-input disabled placeholder="0.00" v-model:value="totalTaxAmount" />
            </n-form-item>
          </n-gi>-->
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">附件与备注</div>
          </div>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="照片">
            <div class="InventoryForm-images">
              <FastMultipleUpload v-model:data="formData.imageList">
                <n-button type="info" secondary>上传照片</n-button>
              </FastMultipleUpload>
              <n-grid x-gap="12" y-gap="12" cols="8" class="InventoryForm-images__list">
                <n-gi v-for="(url, index) in formData.imageList" :key="index">
                  <div class="InventoryForm-images__item">
                    <div class="InventoryForm-images__remove" @click="formData.imageList.splice(index, 1)">
                      <n-icon size="20">
                        <CloseFilled />
                      </n-icon>
                    </div>
                    <n-image :src="url" class="InventoryForm-images__preview" />
                  </div>
                </n-gi>
              </n-grid>
            </div>
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="备注">
            <n-input v-model:value="formData.remark" placeholder="请输入备注" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button
          class="w-20"
          type="primary"
          @click="showCompleteModal"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          提交
        </n-button>
        <n-button class="w-20" type="default" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">
          保存草稿
        </n-button>
      </n-flex>
    </template>
  </FormModal>
  <FormModal v-model:show="showCompleteConfirm" title="提示信息" size="sm" height-mode="auto" :mask-closable="false">
    <n-text>提交后无法修改！</n-text>
    <template #footer>
      <n-flex justify="end" :size="12">
        <n-button @click="showCompleteConfirm = false">取消</n-button>
        <n-button type="warning" :loading="isSubmitting" :disabled="isSubmitting" @click="confirmComplete">
          确定
        </n-button>
      </n-flex>
    </template>
  </FormModal>
  <FormModal v-model:show="showItems" title="物料信息" size="xl">
    <l-card class="w-full h-full" shadow rounded padding="0">
      <vxe-table
        :data="itemsData.list"
        border
        stripe
        :loading="loading"
        :max-height="TEMPLATE_MODAL_TABLE_PICKER_MAX"
        :row-config="{ isHover: true }"
        :checkbox-config="{ trigger: 'row' }"
        ref="VxeTableItemsRef"
      >
        <vxe-column fixed="left" type="checkbox" width="70" align="center" />
        <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="15%" />
        <vxe-column field="supplierName" title="供应商名称" show-overflow="tooltip" align="center" width="15%" />
        <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
        <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="15%" />
        <vxe-column field="vatTaxRate" title="增值税率%" show-overflow="tooltip" align="center" width="15%" />
        <vxe-column
          field="purchasePriceWithTax"
          title="采购单价（含税）/元"
          show-overflow="tooltip"
          align="center"
          width="15%"
        />
        <vxe-column
          field="purchasePriceWithoutTax"
          title="采购单价（不含税）/元"
          show-overflow="tooltip"
          align="center"
          width="20%"
        />
        <vxe-column title="规格1" show-overflow="tooltip" align="center" width="15%">
          <template #default="{ row }">{{ getSpec1Name(row) }}</template>
        </vxe-column>
        <vxe-column title="规格2" show-overflow="tooltip" align="center" width="15%">
          <template #default="{ row }">{{ getSpec2Name(row) }}</template>
        </vxe-column>
        <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
        <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
        <vxe-column
          field="totalQuantity"
          fixed="right"
          title="库存数量"
          align="center"
          show-overflow="tooltip"
          width="15%"
        />
        <vxe-column
          field="availableQuantity"
          fixed="right"
          title="可用库存"
          align="center"
          show-overflow="tooltip"
          width="15%"
        />
      </vxe-table>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end">
          <vxe-pager
            v-model:currentPage="itemsData.currentPage"
            v-model:pageSize="itemsData.pageSize"
            :total="itemsData.count"
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
            @page-change="itemsPageChange"
          />
        </m-card>
      </template>
    </l-card>
    <template #footer>
      <n-flex justify="end">
        <n-button type="primary" @click="confirmUpdateItems">确定</n-button>
      </n-flex>
    </template>
  </FormModal>
  <n-modal
    :mask-closable="false"
    v-model:show="showDelete"
    preset="dialog"
    type="error"
    title="提示信息"
    content="确定删除吗?"
    positive-text="确定"
    @positive-click="confirmDelete"
  />
  <FormModal v-model:show="showDetail" title="盘点详情" size="xl">
    <n-space vertical :size="12">
      <n-descriptions bordered :column="4" title="单据信息">
        <n-descriptions-item label="编号">{{ detailData.code }}</n-descriptions-item>
        <n-descriptions-item label="盘点类型">{{ detailData.typeName }}</n-descriptions-item>
        <n-descriptions-item label="开始时间">{{ detailData.startTimeName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="结束时间">{{ detailData.endTimeName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="盘点仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ detailData.statusName }}</n-descriptions-item>
        <n-descriptions-item label="备注" :span="2">{{ detailData.remark }}</n-descriptions-item>
        <n-descriptions-item label="照片" :span="4">
          <n-grid x-gap="12" y-gap="12" cols="8">
            <n-gi v-for="(url, index) in detailData.imageList">
              <m-card border class="relative group w-full aspect-[1/1] overflow-hidden">
                <div class="w-full h-full flex items-center justify-center p-2 bg-white">
                  <el-image
                    :src="url"
                    fit="cover"
                    style="width: 100%; height: 100%"
                    class="cursor-pointer"
                    @click="showPreviewModal(detailData.imageList, index)"
                  />
                </div>
              </m-card>
            </n-gi>
          </n-grid>
        </n-descriptions-item>
      </n-descriptions>
      <div>
        <n-descriptions :column="4" title="盘点明细" />
        <m-card ref="TableCardRef" padding="0" v-if="detailData">
          <vxe-table
            :loading="loading"
            class="w-full"
            :data="detailData.detailList"
            border
            stripe
            :row-config="{ isHover: true }"
            :max-height="TEMPLATE_MODAL_TABLE_MAX"
          >
            <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="20%" />
            <vxe-column field="supplierName" title="供应商名称" show-overflow="tooltip" align="center" width="20%" />
            <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
            <vxe-column field="vatTaxRate" title="增值税率%" show-overflow="tooltip" align="center" width="10%" />
            <vxe-column
              field="purchasePriceWithTax"
              title="采购单价（含税）"
              show-overflow="tooltip"
              align="center"
              width="15%"
            />
            <vxe-column
              field="purchasePriceWithoutTax"
              title="采购单价（不含税）"
              show-overflow="tooltip"
              align="center"
              width="15%"
            />
            <vxe-column field="totalQuantity" title="账面库存" show-overflow="tooltip" align="center" width="10%" />
            <vxe-column
              fixed="right"
              field="quantity"
              title="实盘数量"
              align="center"
              show-overflow="tooltip"
              width="10%"
            />
            <vxe-column field="profitQuantity" title="盘盈数量" align="center" show-overflow="tooltip" width="10%" />
            <vxe-column field="lossQuantity" title="盘亏数量" align="center" show-overflow="tooltip" width="10%" />
            <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="15%" />
            <vxe-column title="规格1" show-overflow="tooltip" align="center" width="15%">
              <template #default="{ row }">{{ getSpec1Name(row) }}</template>
            </vxe-column>
            <vxe-column title="规格2" show-overflow="tooltip" align="center" width="15%">
              <template #default="{ row }">{{ getSpec2Name(row) }}</template>
            </vxe-column>
            <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
            <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
          </vxe-table>
        </m-card>
      </div>
      <n-descriptions :column="4" bordered>
        <n-descriptions-item label="实盘总数">
          {{ detailData.totalQuantity }}
        </n-descriptions-item>
        <n-descriptions-item label="盘盈总数">
          {{ detailData.totalProfitQuantity }}
        </n-descriptions-item>
        <n-descriptions-item label="盘亏总数">
          {{ detailData.totalLossQuantity }}
        </n-descriptions-item>
      </n-descriptions>
    </n-space>
  </FormModal>
  <n-modal
    :mask-closable="false"
    v-model:show="showCancel"
    preset="dialog"
    type="error"
    title="提示信息"
    content="确定取消该盘点单吗?"
    positive-text="确定"
    @positive-click="confirmCancel"
  />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
