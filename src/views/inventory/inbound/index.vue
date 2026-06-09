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
import { InventInOrderStatusDict, InventInOrderTypeDict } from "@/constants/enum"
import { TEMPLATE_MODAL_TABLE_MAX } from "@/constants/template-ui"
import { PageVo } from "@/model"
import { VxePagerEvents } from "vxe-pc-ui"
import { applyWarehouseByUid } from "@/utils/warehouse-select"
import ItemPickerModal from "@/components/ItemPickerModal/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import ItemPriceSummary from "@/components/ItemPrice/ItemPriceSummary.vue"
import { ItemPickerVo } from "@/services/ItemPickerService"
import { cloneItemPrice, sumDetailListAmounts, sumDetailListSaleAmounts } from "@/utils/itemPrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"

const appStore = useAppStore()
const { canViewItemPrice } = useItemPricePermission()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showCancel = ref(false)
const showItems = ref(false)
const showPreview = ref(false)
const formData = ref<InventoryInOrderForm>({ warehouse: {} })
const detailData = ref<InventoryInboundDetail>({ detailList: [], imageList: [] })
const tmpImageList = ref([])
const tmpImageIndex = ref(0)
const formRef = ref<FormInst>()
const loading = ref(false)
const OTHER_INBOUND_EXCLUDE_TYPES = [
  InventInOrderTypeDict.PURCHASE_INBOUND,
  InventInOrderTypeDict.TRANSFER,
  InventInOrderTypeDict.PRODUCTION_INBOUND
]

const formRule = computed(() => ({
  type: {
    required: true,
    message: "请选择类型",
    trigger: ["input", "blur"]
  },
  time: {
    required: true,
    message: "请输入时间",
    type: "number",
    trigger: ["input", "blur"]
  },
  otherType: {
    required: formData.value.type === InventInOrderTypeDict.OTHER,
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
}))
const query = ref<InventoryInOrderQuery>({
  currentPage: 1,
  pageSize: 50,
  key: "",
  excludeTypeList: [...OTHER_INBOUND_EXCLUDE_TYPES]
})
const data = ref<PageVo<InventoryInOrderVo, InventoryInOrderQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

const warehouseOptions = computed(() => formData.value.warehouseOptions || data.value.extraData?.warehouseOptions || [])

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
      key: "",
      excludeTypeList: [...OTHER_INBOUND_EXCLUDE_TYPES]
    }
  })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  InventoryInOrderService.form(uid).then((res) => {
    formData.value = res
    if (!uid && !formData.value.type) {
      formData.value.type = InventInOrderTypeDict.OTHER
    }
  })
}

function confirmUpdate() {
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

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function showItemsModal() {
  if (!formData.value.warehouseUid) {
    window.$message.error("请先选择入库仓库")
    return
  }
  showItems.value = true
}

function confirmUpdateItems(records: ItemPickerVo[]) {
  if (!formData.value.detailList) {
    formData.value.detailList = []
  }

  const newDetails = records.map((item) => {
    const itemUid = "uid" in item ? item.uid : (item as { itemUid?: string }).itemUid
    return {
      ...item,
      itemUid,
      uid: undefined,
      quantity: 1,
      price: cloneItemPrice(item.price) ?? {}
    }
  })

  formData.value.detailList.push(...newDetails)
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
  return sumDetailListAmounts(formData.value.detailList).withTax
})

const totalAmountWithoutTax = computed(() => {
  if (!formData.value.detailList) return 0
  return sumDetailListAmounts(formData.value.detailList).withoutTax
})

const totalTaxAmount = computed(() => {
  return totalAmountWithTax.value - totalAmountWithoutTax.value
})

const totalSaleAmountWithTax = computed(() => {
  if (!formData.value.detailList) return 0
  return sumDetailListSaleAmounts(formData.value.detailList).withTax
})

const totalSaleAmountWithoutTax = computed(() => {
  if (!formData.value.detailList) return 0
  return sumDetailListSaleAmounts(formData.value.detailList).withoutTax
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
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()"> 新增入库 </n-button>
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
                      <n-button type="info" text @click="showUpdateModal(row.uid)"> 编辑</n-button>
                      <n-button type="error" text @click="showCancelModal(row.uid)"> 取消</n-button>
                    </template>
                    <template v-else-if="row.status === InventInOrderStatusDict.COMPLETE">
                      <n-button type="info" text @click="showDetailModal(row.uid)"> 详情</n-button>
                    </template>
                    <template v-else-if="row.status === InventInOrderStatusDict.CANCEL">
                      <n-button type="info" text @click="showDetailModal(row.uid)"> 详情</n-button>
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
  <FormModal v-model:show="showUpdate" title="其他入库单" size="xxxl">
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
          <n-form-item label="入库时间" path="time">
            <n-date-picker
              type="datetime"
              placeholder="请选择时间"
              class="w-full"
              v-model:value="formData.time"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi v-if="formData.type === InventInOrderTypeDict.OTHER">
          <n-form-item label="其他名称" path="otherType">
            <n-input v-model:value="formData.otherType" placeholder="请输入其他类型" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="入库仓库" path="warehouseUid">
            <n-select
              filterable
              clearable
              placeholder="请选择入库仓库"
              class="w-full"
              :options="warehouseOptions"
              v-model:value="formData.warehouseUid"
              @update:value="onWarehouseUidChange"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="关联项目">
            <n-select
              filterable
              clearable
              placeholder="请选择项目"
              class="w-full"
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
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">业务说明</div>
          </div>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="业务说明">
            <n-input v-model:value="formData.sourcePartyName" placeholder="说明退货、换货、借货、赠品等来源和场景" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="审批说明">
            <n-input
              v-model:value="formData.approvalRemark"
              type="textarea"
              placeholder="特殊入库、换货、借货等审批情况说明"
            />
          </n-form-item>
        </n-gi>
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
          <n-form-item label="验收说明">
            <n-input
              type="textarea"
              v-model:value="formData.inspectionRemark"
              placeholder="可记录退换货验收、品质核验结果"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="备注">
            <n-input v-model:value="formData.remark" placeholder="请输入备注" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section TemplateForm-section__head">
            <div class="TemplateForm-section__title">入库明细</div>
            <n-button type="info" @click="showItemsModal">添加物料</n-button>
          </div>
        </n-gi>
        <n-gi span="2">
          <n-form-item path="detailList" :show-label="false">
            <ItemDetailTable
              :data="formData.detailList"
              preset="inventory_inbound_edit"
              :max-height="TEMPLATE_MODAL_TABLE_MAX"
              @delete="confirmDeleteItems"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">汇总信息</div>
          </div>
        </n-gi>
        <n-gi span="2">
          <ItemPriceSummary
            mode="form"
            :total-quantity="totalQuantity"
            :total-amount-with-tax="totalAmountWithTax"
            :total-amount-without-tax="totalAmountWithoutTax"
            :total-tax-amount="totalTaxAmount"
            :total-sale-amount-with-tax="totalSaleAmountWithTax"
            :total-sale-amount-without-tax="totalSaleAmountWithoutTax"
          />
        </n-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button class="w-20" type="primary" @click="confirmComplete" :loading="isSubmitting" :disabled="isSubmitting">
          提交
        </n-button>
        <n-button class="w-20" type="default" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">
          保存草稿
        </n-button>
      </n-flex>
    </template>
  </FormModal>
  <ItemPickerModal
    v-model:show="showItems"
    scenario="inbound_other"
    :warehouse-uid="formData.warehouseUid"
    @confirm="confirmUpdateItems"
  />
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
  <FormModal v-model:show="showDetail" title="其他入库单" size="xxl">
    <n-space vertical :size="12">
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">基本信息</div>
      </div>
      <n-descriptions bordered :column="2" label-placement="left">
        <n-descriptions-item label="编号">{{ detailData.code || "-" }}</n-descriptions-item>
        <n-descriptions-item label="入库类型">{{ detailData.typeName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="入库时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
        <n-descriptions-item v-if="detailData.type === InventInOrderTypeDict.OTHER" label="其他名称">
          {{ detailData.otherType || "-" }}
        </n-descriptions-item>
        <n-descriptions-item label="入库仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="关联项目">{{ detailData.projectName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="客户/来货方">{{ detailData.customerName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="经手人">{{ detailData.handlerName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
      </n-descriptions>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">业务说明</div>
      </div>
      <n-descriptions bordered :column="1" label-placement="left">
        <n-descriptions-item label="业务说明">{{ detailData.sourcePartyName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="审批说明">{{ detailData.approvalRemark || "-" }}</n-descriptions-item>
      </n-descriptions>
      <div class="TemplateForm-section">
        <div class="TemplateForm-section__title">附件与备注</div>
      </div>
      <n-descriptions bordered :column="1" label-placement="left">
        <n-descriptions-item label="照片">
          <n-grid v-if="detailData.imageList?.length" x-gap="12" y-gap="12" cols="8">
            <n-gi v-for="(url, index) in detailData.imageList" :key="index">
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
          <span v-else>-</span>
        </n-descriptions-item>
        <n-descriptions-item label="验收说明">{{ detailData.inspectionRemark || "-" }}</n-descriptions-item>
        <n-descriptions-item label="备注">{{ detailData.remark || "-" }}</n-descriptions-item>
      </n-descriptions>
      <div>
        <div class="TemplateForm-section">
          <div class="TemplateForm-section__title">入库明细</div>
        </div>
        <m-card ref="TableCardRef" padding="0">
          <ItemDetailTable
            :data="detailData.detailList"
            preset="inventory_inbound_view"
            :loading="loading"
            :max-height="TEMPLATE_MODAL_TABLE_MAX"
          />
        </m-card>
      </div>
      <template v-if="canViewItemPrice">
        <div class="TemplateForm-section">
          <div class="TemplateForm-section__title">汇总信息</div>
        </div>
        <ItemPriceSummary
          mode="descriptions"
          :total-quantity="detailData.totalQuantity"
          :summary="detailData.priceSummary"
        />
      </template>
      <div
        v-if="
          detailData.type === InventInOrderTypeDict.TRANSFER &&
          detailData.status === InventInOrderStatusDict.WAIT_COMPLETE
        "
        class="TemplateForm-actions"
      >
        <n-flex justify="end">
          <n-button type="primary" @click="confirmTransferComplete">确定</n-button>
        </n-flex>
      </div>
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
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
