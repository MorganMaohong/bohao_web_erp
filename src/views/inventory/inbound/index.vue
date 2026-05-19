<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { resetRef } from "@/utils"
import { VxeTableInstance } from "vxe-table"
import { Add, Reset, Search } from "@vicons/carbon"
import { CloseFilled } from "@vicons/material"
import FastMultipleUpload from "@/components/FastMultipleUpload/FastMultipleUpload.vue"
import { InventoryInOrderService } from "@/services/inventory/InventoryInOrderService"
import {
  InventoryInboundDetail,
  InventoryInOrderDetailVo,
  InventoryInOrderForm,
  InventoryInOrderQuery,
  InventoryInOrderQueryData,
  InventoryInOrderVo
} from "@/model/inventory/inbound"
import { InventInOrderStatusDict, InventInOrderTypeDict, InventOutOrderStatusDict } from "@/constants/enum"
import { WarehouseService } from "@/services/template/WarehouseService"
import { WarehouseQuery, WarehouseVo } from "@/model/stock"
import { PageVo } from "@/model"
import { VxePagerEvents, VxeTableEvents } from "vxe-pc-ui"
import { ItemsQuery, ItemsVo } from "@/model/template/items"
import { ItemsService } from "@/services/template/ItemsService"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showCancel = ref(false)
const showWarehouse = ref(false)
const showItems = ref(false)
const showPreview = ref(false)
const formData = ref<InventoryInOrderForm>({ warehouse: {} })
const warehouseQuery = ref<WarehouseQuery>({ currentPage: 1, pageSize: 50 })
const warehouseData = ref<PageVo<WarehouseVo, void>>({})
const itemsQuery = ref<ItemsQuery>({ currentPage: 1, pageSize: 50 })
const itemsData = ref<PageVo<ItemsVo, void>>({})
const VxeTableItemsRef = ref<VxeTableInstance>()
const detailData = ref<InventoryInboundDetail>({ detailList: [], imageList: [] })
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
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  },
  time: {
    required: true,
    message: "请输入时间",
    type: "number",
    trigger: ["input", "blur"]
  },
  otherType: {
    required: true,
    message: "请输入其他类型名称",
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
        return new Error("入库明细不能为空！")
      }

      for (const item of formData.value.detailList) {
        if (!item.quantity || item.quantity <= 0) {
          return new Error(`【${item.name}】入库数量必须大于0！`)
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

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  InventoryInOrderService.select(query.value)
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
  InventoryInOrderService.form(uid).then((data) => {
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
    InventoryInOrderService.addOrUpdate(formData.value)
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
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    InventoryInOrderService.complete(formData.value)
      .then(() => {
        showUpdate.value = false
        select()
      })
      .finally(() => {
        isSubmitting.value = false
      })
  })
}

function confirmTransferComplete() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  InventoryInOrderService.complete(detailData.value)
    .then(() => {
      showDetail.value = false
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
  InventoryInOrderService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function selectWarehouse() {
  loading.value = true
  WarehouseService.select(warehouseQuery.value)
    .then((data) => {
      warehouseData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

function showWarehouseModal() {
  showWarehouse.value = true
  selectWarehouse()
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

function warehousePageChange(event: VxePagerEvents) {
  warehouseQuery.value.currentPage = event.currentPage
  warehouseQuery.value.pageSize = event.pageSize
  selectItems()
}

const warehouseCellClickEvent: VxeTableEvents.CellClick<WarehouseVo> = ({ row, column }) => {
  formData.value.warehouse = row
  formData.value.warehouseUid = row.uid
  showWarehouse.value = false
}

function selectItems() {
  loading.value = true
  itemsQuery.value.warehouseUid = formData.value.warehouseUid
  ItemsService.select(itemsQuery.value)
    .then((data) => {
      itemsData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

function showItemsModal() {
  if (!formData.value.warehouseUid) {
    window.$message.error("请选择仓库")
    return
  }
  showItems.value = true
  selectItems()
}

function confirmUpdateItems() {
  const records = VxeTableItemsRef.value?.getCheckboxRecords() || []

  if (!formData.value.detailList) {
    formData.value.detailList = []
  }

  const newDetails = records.map((item) => ({
    ...item,
    itemUid: item.uid,
    uid: undefined,
    quantity: 1
  }))

  formData.value.detailList.push(...newDetails)

  showItems.value = false
}

function confirmDeleteItems(row: InventoryInOrderDetailVo, index: number) {
  if (row.uid && row.orderUid) {
    InventoryInOrderService.deleteDetail(row.uid)
  }
  formData.value?.detailList.splice(index, 1)
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
  InventoryInOrderService.detail(uid)
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
  InventoryInOrderService.cancel(formData.value.uid).then(() => {
    showCancel.value = false
    formData.value.uid = ""
    select()
  })
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
          <n-form label-placement="left" :size="appStore.componentSize" ref="queryFormRef" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.name" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button @click="search" type="info" icon-placement="left" secondary strong>
                      <template #icon>
                        <n-icon>
                          <Search />
                        </n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset" type="tertiary" icon-placement="left" secondary strong>
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
          </n-form>
        </m-card>
      </template>
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <m-card padding="0" class="px-2 pt-2 flex items-center justify-between">
            <n-button type="primary" :size="appStore.componentSize" @click="showUpdateModal()">
              <n-icon size="18">
                <Add />
              </n-icon>
              添加
            </n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
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
              <vxe-column field="warehouseName" title="仓库名称" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="projectName" title="项目" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="customerName" title="客户/来货方" show-overflow="tooltip" align="center" width="16%" />
              <vxe-column field="handlerName" title="经手人" show-overflow="tooltip" align="center" width="12%" />
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column title="状态" show-overflow="tooltip" align="center" width="15%">
                <template #default="{ row }">
                  <vxe-text
                    style="font-weight: bold"
                    status="error"
                    v-if="row.status === InventInOrderStatusDict.WAIT_COMPLETE"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                  <vxe-text
                    style="font-weight: bold"
                    status="success"
                    v-else-if="row.status === InventInOrderStatusDict.COMPLETE"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                  <vxe-text
                    style="font-weight: bold"
                    status="perfect"
                    v-else-if="row.status === InventInOrderStatusDict.CANCEL"
                  >
                    {{ row.statusName }}
                  </vxe-text>
                </template>
              </vxe-column>
              <vxe-column field="timeName" title="入库时间" show-overflow="tooltip" align="center" width="20%" />
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
                    <!--                    <template
                      v-if="
                        row.status === InventInOrderStatusDict.WAIT_COMPLETE &&
                        row.type === InventInOrderTypeDict.TRANSFER
                      "
                    >
                      <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
                    </template>-->
                    <template v-if="row.status === InventInOrderStatusDict.WAIT_COMPLETE">
                      <n-button type="info" text @click="showUpdateModal(row.uid)" :size="appStore.componentSize">
                        编辑
                      </n-button>
                      <n-button type="error" text @click="showCancelModal(row.uid)" :size="appStore.componentSize">
                        取消
                      </n-button>
                    </template>
                    <template v-else-if="row.status === InventInOrderStatusDict.COMPLETE">
                      <n-button type="info" text @click="showDetailModal(row.uid)" :size="appStore.componentSize">
                        详情
                      </n-button>
                    </template>
                    <template v-else-if="row.status === InventInOrderStatusDict.CANCEL">
                      <n-button type="info" text @click="showDetailModal(row.uid)" :size="appStore.componentSize">
                        详情
                      </n-button>
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
  <n-modal v-model:show="showUpdate" preset="card" class="w-[1000px] z-0" content-style="padding: 0" title="其他入库单">
    <n-scrollbar style="max-height: 600px; padding: 0 24px 24px 20px" trigger="none">
      <n-form :model="formData" ref="formRef" :rules="formRule">
        <div class="flex items-center mb-4">
          <div class="w-1 h-4 bg-blue-500 mr-2 rounded" />
          <div class="text-base font-semibold text-gray-700">入库单信息</div>
        </div>
        <n-grid cols="3" x-gap="24">
          <n-gi>
            <n-form-item label="编号">
              <n-input disabled placeholder="自动生成编号" v-model:value="formData.code" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="入库类型" path="type">
              <n-select
                placeholder="请选择类型"
                v-model:value="formData.type"
                :options="formData.typeOptions"
                clearable
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="入库时间" class="w-full" path="time">
              <n-date-picker
                type="datetime"
                placeholder="请选择时间"
                class="w-full"
                v-model:value="formData.time"
                clearable
              />
            </n-form-item>
          </n-gi>
          <template v-if="formData.type === InventInOrderTypeDict.OTHER">
            <n-gi />
            <n-gi>
              <n-form-item label="其他名称" path="otherType">
                <n-input v-model:value="formData.otherType" placeholder="请输入其他类型" />
              </n-form-item>
            </n-gi>
            <n-gi />
          </template>
          <n-gi>
            <n-form-item label="入库仓库" class="w-full" path="warehouseUid">
              <n-input
                class="w-full"
                @click="showWarehouseModal"
                v-if="formData?.warehouse.uid"
                :value="`【仓库】-${formData?.warehouse.code}-${formData?.warehouse.name}`"
                clearable
                @clear.stop="
                  () => {
                    formData.warehouse = resetRef(formData.warehouse)
                  }
                "
              />
              <n-button class="w-full" @click="showWarehouseModal" v-else>关联数据</n-button>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="仓库编码" class="w-full">
              <n-input class="w-full" disabled placeholder="暂无内容" v-model:value="formData.warehouse.code" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="仓库名称" class="w-full">
              <n-input class="w-full" disabled placeholder="暂无内容" v-model:value="formData.warehouse.name" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="关联项目" class="w-full">
              <n-select
                filterable
                clearable
                placeholder="请选择项目"
                :options="formData.projectOptions"
                v-model:value="formData.projectUid"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="客户/来货方">
              <n-input v-model:value="formData.customerName" placeholder="如退货客户或赠品供应商" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="经手人">
              <n-input v-model:value="formData.handlerName" placeholder="请输入经手人" />
            </n-form-item>
          </n-gi>
          <n-gi span="3">
            <n-form-item label="业务说明">
              <n-input
                v-model:value="formData.sourcePartyName"
                placeholder="说明退货、换货、借货、赠品等来源和场景"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="3">
            <n-form-item label="审批说明">
              <n-input
                v-model:value="formData.approvalRemark"
                type="textarea"
                placeholder="特殊入库、换货、借货等审批情况说明"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="3">
            <n-form-item label="照片">
              <div class="flex flex-col">
                <FastMultipleUpload class="mb-1" v-model:data="formData.imageList">
                  <n-button type="info" secondary :size="appStore.componentSize">上传照片</n-button>
                </FastMultipleUpload>
                <n-grid x-gap="12" y-gap="12" cols="8" class="p-1">
                  <n-gi v-for="(url, index) in formData.imageList" :key="index">
                    <m-card border class="relative group w-full aspect-[1/1] overflow-hidden">
                      <!-- 删除按钮 -->
                      <div
                        class="absolute right-1 top-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        @click="
                          () => {
                            formData.imageList.splice(index, 1)
                          }
                        "
                      >
                        <n-icon size="24" class="text-red-500 font-bold">
                          <CloseFilled />
                        </n-icon>
                      </div>

                      <!-- 图片容器 -->
                      <div class="w-full h-full flex items-center justify-center p-2 bg-white">
                        <n-image :src="url" class="max-w-full max-h-full object-contain" />
                      </div>
                    </m-card>
                  </n-gi>
                </n-grid>
              </div>
            </n-form-item>
          </n-gi>
          <n-gi span="3">
            <n-form-item label="验收说明">
              <n-input
                type="textarea"
                v-model:value="formData.inspectionRemark"
                placeholder="可记录退换货验收、品质核验结果，辅助防止次品调换"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="3">
            <n-form-item label="备注">
              <n-input placeholder="" v-model:value="formData.remark" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <div class="flex items-center mb-4">
          <div class="w-1 h-4 bg-blue-500 mr-2 rounded" />
          <div class="text-base font-semibold text-gray-700">入库物料信息</div>
        </div>
        <n-grid cols="3" x-gap="24">
          <n-gi span="3">
            <n-form-item label="入库明细" path="detailList" required>
              <m-card class="w-full h-full flex flex-col" padding="0">
                <m-card padding="0" style="position: absolute; right: 0; top: -30px">
                  <n-button :size="appStore.componentSize" type="info" @click="showItemsModal" class="w-20">
                    添加物料
                  </n-button>
                </m-card>
                <m-card ref="TableCardRef" class="flex-1" padding="0">
                  <vxe-table
                    v-if="formData.detailList && formData.detailList.length > 0"
                    class="w-full"
                    :data="formData.detailList"
                    border
                    stripe
                    :row-config="{ isHover: true }"
                    max-height="400"
                  >
                    <vxe-column title="批次号" show-overflow="tooltip" align="center" width="20%">
                      <template #default="{ row }">
                        <vxe-input placeholder="自动生成批次号" disabled v-model="row.batchNo" />
                      </template>
                    </vxe-column>
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
                      width="15%"
                    >
                      <template #default="{ row }">
                        <vxe-number-input v-model="row.purchasePriceWithTax" />
                      </template>
                    </vxe-column>
                    <vxe-column
                      field="purchasePriceWithoutTax"
                      title="采购单价（不含税）"
                      show-overflow="tooltip"
                      align="center"
                      width="15%"
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
                    <vxe-column
                      field="availableQuantity"
                      fixed="right"
                      title="可用库存"
                      align="center"
                      show-overflow="tooltip"
                      width="15%"
                    />
                    <vxe-column fixed="right" title="入库数量" align="center" show-overflow="tooltip" width="15%">
                      <template #default="{ row }">
                        <vxe-number-input v-model="row.quantity" min="1" />
                      </template>
                    </vxe-column>
                    <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="60">
                      <template #default="{ row, rowIndex }">
                        <n-flex justify="center">
                          <n-button
                            type="error"
                            text
                            @click="confirmDeleteItems(row, rowIndex)"
                            :size="appStore.componentSize"
                            >删除
                          </n-button>
                        </n-flex>
                      </template>
                    </vxe-column>
                  </vxe-table>
                  <el-empty :image-size="80" style="height: 140px" description="无数据" v-else />
                </m-card>
              </m-card>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本单入库总数">
              <n-input disabled placeholder="0" v-model:value="totalQuantity" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本次入库总采购价（含税）/元">
              <n-input disabled placeholder="0.00" v-model:value="totalAmountWithTax" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本次入库总采购价（不含税）/元">
              <n-input disabled placeholder="0.00" v-model:value="totalAmountWithoutTax" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="本次入库品总税额/元">
              <n-input disabled placeholder="0.00" v-model:value="totalTaxAmount" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <n-divider dashed />
    <template #footer>
      <n-flex justify="end">
        <n-button
          class="w-20"
          type="primary"
          @click="confirmComplete"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          :size="appStore.componentSize"
        >
          提交
        </n-button>
        <n-button
          class="w-20"
          type="default"
          @click="confirmUpdate"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          :size="appStore.componentSize"
        >
          保存草稿
        </n-button>
      </n-flex>
    </template>
  </n-modal>
  <n-modal v-model:show="showWarehouse" preset="card" class="w-[1000px]" title="仓库信息">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <vxe-table
        :data="warehouseData.list"
        :loading="loading"
        @cell-click="warehouseCellClickEvent"
        border
        stripe
        :row-config="{ isHover: true }"
      >
        <vxe-column width="30" align="center">
          <template #default="{ row }">
            <vxe-radio />
          </template>
        </vxe-column>
        <vxe-column field="code" title="编号" show-overflow="tooltip" align="center" width="20%" />
        <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="30%" />
        <vxe-column field="address" title="地址" show-overflow="tooltip" align="center" width="45%" />
      </vxe-table>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end">
          <vxe-pager
            :size="appStore.componentSize"
            v-model:currentPage="warehouseData.currentPage"
            v-model:pageSize="warehouseData.pageSize"
            :total="warehouseData.count"
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
            @page-change="warehousePageChange"
          />
        </m-card>
      </template>
    </l-card>
  </n-modal>
  <n-modal v-model:show="showItems" preset="card" class="w-[1000px] h-[600px]" title="物料信息">
    <l-card class="w-full h-full" shadow rounded padding="0">
      <vxe-table
        :data="itemsData.list"
        border
        stripe
        :loading="loading"
        max-height="600"
        :row-config="{ isHover: true }"
        :checkbox-config="{ trigger: 'row' }"
        ref="VxeTableItemsRef"
      >
        <vxe-column type="checkbox" width="30" align="center" />
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
          width="15%"
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
        <n-button size="small" type="primary" @click="confirmUpdateItems"> 确定</n-button>
      </n-flex>
    </template>
  </n-modal>
  <n-modal
    :mask-closable="false"
    v-model:show="showDelete"
    preset="dialog"
    type="error"
    title="提示信息"
    content="确定删除吗?"
    positive-text="确定"
    @positive-click="confirmDelete"
    :size="appStore.componentSize"
  />
  <n-modal v-model:show="showDetail" preset="card" class="w-[1000px]" content-style="padding: 0" title="入库信息">
    <n-scrollbar style="max-height: 800px; padding: 0 24px 24px 20px" trigger="none">
      <n-space vertical :size="12">
        <n-descriptions bordered :column="4" title="单据信息">
          <n-descriptions-item label="编号">{{ detailData.code }}</n-descriptions-item>
          <n-descriptions-item label="入库类型">{{ detailData.typeName }}</n-descriptions-item>
          <n-descriptions-item label="入库时间">{{ detailData.timeName }}</n-descriptions-item>
          <n-descriptions-item label="仓库名称">{{ detailData.warehouseName }}</n-descriptions-item>
          <n-descriptions-item label="关联项目">{{ detailData.projectName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="客户/来货方">{{ detailData.customerName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="经手人">{{ detailData.handlerName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ detailData.statusName }}</n-descriptions-item>
          <n-descriptions-item label="业务说明" :span="4">{{ detailData.sourcePartyName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="审批说明" :span="4">{{ detailData.approvalRemark || "-" }}</n-descriptions-item>
          <n-descriptions-item label="验收说明" :span="4">{{ detailData.inspectionRemark || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="4">{{ detailData.remark }}</n-descriptions-item>
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
          <n-descriptions :column="4" title="入库明细单" />
          <m-card ref="TableCardRef" padding="0">
            <vxe-table
              :loading="loading"
              class="w-full"
              :data="detailData.detailList"
              border
              stripe
              :row-config="{ isHover: true }"
              max-height="400"
            >
              <vxe-column field="batchNo" title="批次号" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column field="supplierName" title="供应商名称" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="vatTaxRate" title="增值税率%" show-overflow="tooltip" align="center" width="10%" />
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
                width="15%"
              />
              <vxe-column
                fixed="right"
                field="quantity"
                title="入库数量"
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
          <n-descriptions-item label="入库总数">
            {{ detailData.totalQuantity }}
          </n-descriptions-item>
          <n-descriptions-item label="入库总采购价（含税）/元">
            {{ detailData.totalPurchasePriceWithTax }}
          </n-descriptions-item>
          <n-descriptions-item label="入库总采购价（不含税）/元">
            {{ detailData.totalAmountWithTax }}
          </n-descriptions-item>
          <n-descriptions-item label="本次入库品总税额/元">
            {{ detailData.totalQuantity }}
          </n-descriptions-item>
        </n-descriptions>
      </n-space>
    </n-scrollbar>
    <template
      #footer
      v-if="
        detailData.type === InventInOrderTypeDict.TRANSFER &&
        detailData.status === InventOutOrderStatusDict.WAIT_COMPLETE
      "
    >
      <n-flex justify="end">
        <n-button size="small" type="primary" @click="confirmTransferComplete">确定</n-button>
      </n-flex>
    </template>
  </n-modal>
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
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
