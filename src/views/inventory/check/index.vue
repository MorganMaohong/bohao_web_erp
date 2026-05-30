<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { resetRef } from "@/utils"
import { VxeTableInstance } from "vxe-table"
import { Add, Reset, Search } from "@vicons/carbon"
import { CloseFilled } from "@vicons/material"
import FastMultipleUpload from "@/components/FastMultipleUpload/FastMultipleUpload.vue"
import { InventOutOrderStatusDict } from "@/constants/enum"
import {
  TEMPLATE_MODAL_TABLE_MAX,
  TEMPLATE_MODAL_TABLE_PICKER_MAX
} from "@/constants/template-ui"
import { PageVo } from "@/model"
import { VxePagerEvents } from "vxe-pc-ui"
import { applyWarehouseByUid } from "@/utils/warehouse-select"
import { InventoryOverviewService } from "@/services/inventory/InventoryOverviewService"
import { InventoryQuery, InventoryQueryData, InventoryVo } from "@/model/inventory"
import { InventoryOutOrderDetailVo } from "@/model/inventory/outbound"
import { InventoryTransferOrderDetailVo } from "@/model/inventory/transfer"
import { InventoryCheckOrderService } from "@/services/inventory/InventoryCheckOrderService"
import { InventoryCheckDetail, InventoryCheckOrderForm } from "@/model/inventory/check"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showCancel = ref(false)
const showComplete = ref(false)
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
const formRule = {
  type: {
    required: true,
    message: "请选择类型",
    trigger: ["input", "blur"]
  },
  warehouseUid: {
    required: true,
    message: "请选择入库仓库",
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
}
const query = ref<InventoryInOrderQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<InventoryInOrderVo, InventoryInOrderQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

const warehouseOptions = computed(
  () => formData.value.warehouseOptions || data.value.extraData?.warehouseOptions || []
)

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
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function search() {
  select()
}

function reset() {
  query.value = resetRef(query.value)
  select()
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  InventoryCheckOrderService.form(uid).then((data) => {
    formData.value = data
  })
}

function confirmUpdate() {
  console.log(formData.value)
  // return
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

function confirmComplete() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  showComplete.value = false
  InventoryCheckOrderService.complete(formData.value)
    .then(() => {
      showUpdate.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function showCompleteModal() {
  formRef.value?.validate((err) => {
    if (err) return
    showComplete.value = true
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

  const existUidSet = new Set(formData.value.detailList.map((item) => item.itemUid))

  const newDetails: InventoryOutOrderDetailVo[] = records
    .filter((item) => !existUidSet.has(item.itemUid))
    .map((item) => ({
      // 主数据关联
      ...item,
      itemUid: item.itemUid,
      uid: "",
      quantity: 0
    }))

  formData.value.detailList.push(...newDetails)

  showItems.value = false
}

function confirmDeleteItems(row: InventoryTransferOrderDetailVo, index: number) {
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
  InventoryCheckOrderService.cancel(formData.value.uid).then(() => {
    showCancel.value = false
    formData.value.uid = ""
    select()
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
  selectWarehouse()
}

onMounted(() => {
  select()
  getCardProps()
  const $table = VxeTableRef.value
  const $toolbar = VxeToolbarRef.value
  if ($table && $toolbar) {
    $table.connect($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm label-placement="left" ref="queryFormRef" >
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.name" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="primary" @click="search">
                      <template #icon>
                        <n-icon>
                          <Search />
                        </n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset">
                      <template #icon>
                        <n-icon>
                          <Reset />
                        </n-icon>
                      </template>
                      重置
                    </n-button>
                  </div>
                </n-form-item>
              </n-gi>
            </n-grid>
          </SearchQueryForm>
        </m-card>
      </template>
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <ListPageToolbar>
            <n-button type="primary" @click="showUpdateModal()">
              <n-icon size="18">
                <Add />
              </n-icon>
              添加
            </n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
              :size="appStore.componentSize"
              :cell-config="{ height: 40 }"
            >
              <vxe-column field="code" title="编号" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="warehouseName" title="盘点仓库" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column title="状态" show-overflow="tooltip" align="center" width="15%">
                <template #default="{ row }">
                  <vxe-text
                    style="font-weight: bold"
                    status="error"
                    v-if="row.status === InventOutOrderStatusDict.WAIT_COMPLETE"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                  <vxe-text
                    style="font-weight: bold"
                    status="success"
                    v-else-if="row.status === InventOutOrderStatusDict.COMPLETE"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                  <vxe-text
                    style="font-weight: bold"
                    status="perfect"
                    v-else-if="row.status === InventOutOrderStatusDict.CANCEL"
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
                    <template v-if="row.status === InventOutOrderStatusDict.WAIT_COMPLETE">
                      <n-button type="info" text @click="showUpdateModal(row.uid)">编辑</n-button>
                      <n-button type="error" text @click="showCancelModal(row.uid)">取消</n-button>
                    </template>
                    <template v-else-if="row.status === InventOutOrderStatusDict.COMPLETE">
                      <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
                    </template>
                    <template v-else-if="row.status === InventOutOrderStatusDict.CANCEL">
                      <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
                      <!--                      <n-button type="error" text @click="showDeleteModal(row.uid)">删除</n-button>-->
                    </template>
                  </n-flex>
                </template>
              </vxe-column>
            </vxe-table>
          </m-card>
        </m-card>
      </template>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end">
          <vxe-pager
            v-model:currentPage="query.currentPage"
            v-model:pageSize="query.pageSize"
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
  <FormModal v-model:show="showUpdate" title="盘点单据信息" size="lg">

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
                    <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
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
                          <n-button
                            type="error"
                            text
                            @click="confirmDeleteItems(row, rowIndex)"
                            >删除
                          </n-button>
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
                <n-button
                  class="w-20"
                  type="default"
                  @click="confirmUpdate"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                >
                  保存草稿
                </n-button>
      </n-flex>
    </template>
  </FormModal>
  <FormModal v-model:show="showItems" title="物料信息" size="lg">

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
        <vxe-column fixed="left" type="checkbox" width="30" align="center" />
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
        <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
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
  <FormModal v-model:show="showDetail" title="出库信息" size="lg">
    <n-space vertical :size="12">
        <n-descriptions bordered :column="4" title="单据信息">
          <n-descriptions-item label="编号">{{ detailData.code }}</n-descriptions-item>
          <n-descriptions-item label="出库类型">{{ detailData.typeName }}</n-descriptions-item>
          <n-descriptions-item label="出库时间">{{ detailData.timeName }}</n-descriptions-item>
          <n-descriptions-item label="仓库名称">{{ detailData.warehouseName }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ detailData.statusName }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="3">{{ detailData.remark }}</n-descriptions-item>
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
          <n-descriptions :column="4" title="出库明细单" />
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
              <vxe-column
                fixed="right"
                field="quantity"
                title="出库数量"
                align="center"
                show-overflow="tooltip"
                width="10%"
              />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
            </vxe-table>
          </m-card>
        </div>
        <n-descriptions :column="4" bordered>
          <n-descriptions-item label="出库总数">
            {{ detailData.totalQuantity }}
          </n-descriptions-item>
          <n-descriptions-item label="出库总采购价（含税）/元">
            {{ detailData.totalPurchasePriceWithTax }}
          </n-descriptions-item>
          <n-descriptions-item label="出库总采购价（不含税）/元">
            {{ detailData.totalAmountWithTax }}
          </n-descriptions-item>
          <n-descriptions-item label="本次出库品总税额/元">
            {{ detailData.totalQuantity }}
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
    content="确定取消该入库单吗?"
    positive-text="确定"
    @positive-click="confirmCancel"
  />
  <n-modal
    :mask-closable="false"
    v-model:show="showComplete"
    preset="dialog"
    type="warning"
    title="提示信息"
    content="提交后无法修改！"
    positive-text="确定"
    @positive-click="confirmComplete"
  />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
