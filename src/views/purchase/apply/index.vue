<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst } from "naive-ui"
import { resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"
import { PurchaseApplyOrderService } from "@/services/purchase/PurchaseApplyOrderService"
import {
  PurchaseApplyDetail,
  PurchaseApplyOrderDetailVo,
  PurchaseApplyOrderForm,
  PurchaseApplyOrderQuery,
  PurchaseApplyOrderQueryData,
  PurchaseApplyOrderVo,
  PurchaseOrderQueryData,
  PurchaseOrderVo
} from "@/model/purchase"
import { InventoryQueryData, InventoryVo } from "@/model/inventory"
import { ItemsService } from "@/services/template/ItemsService"
import { ItemsQuery } from "@/model/template/items"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import {
  TEMPLATE_MODAL_TABLE_MAX,
  TEMPLATE_MODAL_TABLE_PICKER_MAX,
  TEMPLATE_MODAL_TABLE_DETAIL_MAX
} from "@/constants/template-ui"
import { VxePagerEvents } from "vxe-pc-ui"
import { PurchaseOrderService } from "@/services/purchase/PurchaseOrderService"
import PurchaseOrderRelatedModal from "@/views/purchase/components/PurchaseOrderRelatedModal.vue"
import PurchaseModalDetailShell from "@/views/purchase/components/PurchaseModalDetailShell.vue"
import {
  calcAmountWithTax,
  calcAmountWithoutTax,
  calcPriceWithoutTax,
  calcTaxAmount,
  formatMoney
} from "@/utils/purchasePrice"

const appStore = useAppStore()
const route = useRoute()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDetail = ref(false)
const showDelete = ref(false)
const showItems = ref(false)
const showRelatedOrderList = ref(false)
const showRelatedOrder = ref(false)
const formData = ref<PurchaseApplyOrderForm>({
  address: "",
  applyTime: 0,
  code: "",
  expectTime: 0,
  remark: "",
  sourceType: "",
  warehouseUid: ""
})
const formRef = ref<FormInst>()
const loading = ref(false)
const detailLoading = ref(false)
const creatingOrder = ref(false)
const itemsQuery = ref<ItemsQuery>({ currentPage: 1, pageSize: 50 })
const itemsData = ref<PageVo<InventoryVo, InventoryQueryData>>({})
const formRule = {
  sourceType: {
    required: true,
    message: "请选择需求类型",
    trigger: ["input", "blur"]
  },
  detailList: {
    required: true,
    validator() {
      if (!formData.value.detailList || formData.value.detailList.length <= 0) {
        return new Error("采购明细不能为空！")
      }

      for (const item of formData.value.detailList) {
        if (!item.quantity || item.quantity <= 0) {
          return new Error(`【${item.name}】采购数量必须大于0！`)
        }
      }

      return true
    },
    trigger: ["input", "blur"]
  }
}
const query = ref<PurchaseApplyOrderQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<PurchaseApplyOrderVo, PurchaseApplyOrderQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeTableItemsRef = ref<VxeTableInstance>()
const detailData = ref<PurchaseApplyDetail>({ detailList: [] })
const relatedOrderList = ref<PageVo<PurchaseOrderVo, PurchaseOrderQueryData>>({
  currentPage: 1,
  pageSize: 20,
  count: 0,
  list: [],
  extraData: {} as PurchaseOrderQueryData
})
const relatedOrder = ref<{ uid?: string; code?: string }>({})

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function getQueryString(value: unknown) {
  return Array.isArray(value) ? value[0] : (value as string | undefined)
}

function select() {
  loading.value = true
  return PurchaseApplyOrderService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function openMatchedDetailByCode(code?: string) {
  if (!code) return
  const matched = (data.value.list || []).find((item) => item.code === code)
  if (matched?.uid) {
    showDetailModal(matched.uid)
  }
}

function applyRouteOpen() {
  const openUid = getQueryString(route.query.openUid)
  const openCode = getQueryString(route.query.openCode)
  if (!openUid && !openCode) {
    return select()
  }

  if (openCode) {
    query.value.name = openCode
    query.value.currentPage = 1
  }

  const request = select()
  if (openUid) {
    showDetailModal(openUid)
  } else {
    request.then(() => openMatchedDetailByCode(openCode))
  }
  return request
}

function openRelatedPurchaseOrder(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedOrder.value = { uid, code }
  showRelatedOrder.value = true
}

function openRelatedPurchaseOrderList(code?: string) {
  if (!code) return
  showRelatedOrderList.value = true
  loading.value = true
  PurchaseOrderService.select({ currentPage: 1, pageSize: 50, key: code })
    .then((res) => {
      relatedOrderList.value = {
        ...res,
        list: (res.list || []).filter((item) => !item.applyOrderCode || item.applyOrderCode === code)
      }
    })
    .finally(() => {
      loading.value = false
    })
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

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  PurchaseApplyOrderService.form(uid).then((data) => {
    formData.value = data
  })
}

function showItemsModal() {
  showItems.value = true
  itemsQuery.value.currentPage = 1
  selectItems()
}

function selectItems() {
  itemsQuery.value.key = ""
  itemsQuery.value.currentPage = 1
  loading.value = true
  ItemsService.select(itemsQuery.value)
    .then((data) => {
      itemsData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

function confirmUpdateItems() {
  const records = VxeTableItemsRef.value?.getCheckboxRecords() || []

  if (!formData.value.detailList) {
    formData.value.detailList = []
  }

  const existUidSet = new Set(formData.value.detailList.map((item) => item.itemUid))

  const newDetails: PurchaseApplyOrderDetailVo[] = records
    .filter((item) => !existUidSet.has(item.itemUid))
    .map((item) => ({
      // 主数据关联
      ...item,
      itemUid: item.uid,
      uid: "",
      quantity: 1
    }))

  formData.value.detailList.push(...newDetails)

  showItems.value = false
}

function confirmDeleteItems(_row: PurchaseApplyOrderDetailVo, index: number) {
  formData.value?.detailList.splice(index, 1)
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    PurchaseApplyOrderService.addOrUpdate(formData.value)
      .then(() => {
        showUpdate.value = false
        select()
      })
      .finally(() => {
        isSubmitting.value = false
      })
  })
}

function showDeleteModal(uid: string) {
  showDelete.value = true
  formData.value.uid = uid
}

function showDetailModal(uid: string) {
  showDetail.value = true
  detailLoading.value = true
  PurchaseApplyOrderService.detail(uid)
    .then((res) => {
      detailData.value = res
    })
    .finally(() => {
      detailLoading.value = false
    })
}

function createPurchaseOrder() {
  if (!detailData.value.uid || creatingOrder.value) {
    return
  }
  creatingOrder.value = true
  PurchaseApplyOrderService.createPurchaseOrder(detailData.value.uid)
    .then((res) => {
      const createdCount = res?.createdCount || 0
      const skippedCount = res?.skippedCount || 0
      window.$message?.success(`采购订单处理完成，新增 ${createdCount} 张，跳过 ${skippedCount} 张`)
      return PurchaseApplyOrderService.detail(detailData.value.uid!)
    })
    .then((res) => {
      detailData.value = res
      select()
    })
    .finally(() => {
      creatingOrder.value = false
    })
}

function confirmDelete() {
  isSubmitting.value = true
  PurchaseApplyOrderService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function search() {
  select()
}

function reset() {
  query.value = resetRef(query.value)
  select()
}

watch(
  () => [route.query.openUid, route.query.openCode],
  () => {
    applyRouteOpen()
  }
)

onMounted(() => {
  applyRouteOpen()
  getCardProps()
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
            <n-button type="primary" :size="appStore.componentSize" @click="showUpdateModal()">新增申请</n-button>
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :size="appStore.componentSize"
              :row-config="{ isHover: true }"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
            >
              <vxe-column field="code" title="申请编号" show-overflow="tooltip" align="center">
                <template #default="{ row }">
                  <n-button text type="info" @click="showDetailModal(row.uid)">{{ row.code || "-" }}</n-button>
                </template>
              </vxe-column>
              <vxe-column field="sourceTypeName" title="类型" show-overflow="tooltip" align="center" />
              <vxe-column field="applyTimeName" title="申请时间" show-overflow="tooltip" align="center" />
              <vxe-column field="expectTimeName" title="到货时间" show-overflow="tooltip" align="center" />
              <vxe-column field="statusName" title="流程状态" show-overflow="tooltip" align="center" />
              <vxe-column field="currentNodeName" title="当前节点" show-overflow="tooltip" align="center" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" />
              <vxe-column field="createTime" title="创建时间" show-overflow="tooltip" align="center" :visible="false" />
              <vxe-column field="updateTime" title="更新时间" show-overflow="tooltip" align="center" :visible="false" />
              <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="180">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <n-button type="info" text @click="showDetailModal(row.uid)">详情</n-button>
                    <n-button type="error" text @click="showDeleteModal(row.uid)">撤回</n-button>
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
  <n-modal v-model:show="showUpdate" preset="card" class="TemplateModal TemplateModal--xxl" title="采购申请">
    <n-spin :show="isSubmitting">
    <div class="TemplateModal__split">
      <div class="TemplateModal__split-main TemplateModal__sections">
        <n-form :model="formData" ref="formRef" :rules="formRule" class="TemplateForm">
          <n-grid cols="2" x-gap="16" y-gap="0">
            <n-gi span="2">
              <div class="TemplateForm-section">
                <div class="TemplateForm-section__title">基本信息</div>
              </div>
            </n-gi>
            <n-gi>
              <n-form-item label="申请单号">
                <n-input disabled placeholder="自动生成编码" v-model:value="formData.code" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="申请日期" class="w-full">
                <n-date-picker
                  type="date"
                  placeholder="请选择申请日期"
                  v-model:value="formData.applyTime"
                  class="w-full"
                  clearable
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="到货需求日期" class="w-full">
                <n-date-picker
                  type="date"
                  placeholder="请选择需求日期"
                  v-model:value="formData.expectTime"
                  class="w-full"
                  clearable
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="需求来源" path="sourceType">
                <n-select
                  filterable
                  clearable
                  placeholder="请选择需求来源"
                  v-model:value="formData.sourceType"
                  :options="formData.sourceTypeOptions"
                  class="w-full"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <n-form-item label="到货地址">
                <n-input placeholder="请输入到货地址" v-model:value="formData.address" />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <div class="TemplateForm-section TemplateForm-section__head">
                <div class="TemplateForm-section__title">采购物料明细</div>
                <n-button type="info" secondary @click="showItemsModal">添加物料</n-button>
              </div>
            </n-gi>
            <n-gi span="2">
              <n-form-item path="detailList" :show-label="false">
                <div
                  class="TemplateForm-table-wrap w-full"
                  :style="{ '--template-form-table-max': `${TEMPLATE_MODAL_TABLE_MAX}px` }"
                >
                  <vxe-table
                    v-if="formData.detailList && formData.detailList.length > 0"
                    class="w-full"
                    :data="formData.detailList"
                    border
                    stripe
                    :max-height="TEMPLATE_MODAL_TABLE_MAX"
                    :row-config="{ isHover: true }"
                    :size="appStore.componentSize"
                  >
                      <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="15%" />
                      <vxe-column
                        field="supplierName"
                        title="预期供应商"
                        show-overflow="tooltip"
                        align="center"
                        width="20%"
                      >
                        <template #default="{ row }">
                          <n-select
                            filterable
                            clearable
                            :size="appStore.componentSize"
                            :options="formData.supplierOptions"
                            v-model:value="row.supplierUid"
                          />
                        </template>
                      </vxe-column>
                      <vxe-column
                        field="availableQuantity"
                        title="可用库存"
                        align="center"
                        show-overflow="tooltip"
                        width="10%"
                      />
                      <vxe-column title="采购数量" align="center" show-overflow="tooltip" width="15%">
                        <template #default="{ row }">
                          <vxe-number-input v-model="row.quantity" :min="1" />
                        </template>
                      </vxe-column>
                      <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
                      <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="15%" />
                      <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
                      <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />

                      <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />

                      <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="80">
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
                    <el-empty :image-size="80" class="TemplateForm-empty" description="无数据" v-else />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <div class="TemplateForm-section">
                <div class="TemplateForm-section__title">其他</div>
              </div>
            </n-gi>
            <n-gi span="2">
              <n-form-item label="备注">
                <n-input type="textarea" v-model:value="formData.remark" placeholder="请输入备注" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>
        <div class="TemplateForm-actions">
          <n-flex justify="end">
            <n-button @click="showUpdate = false">取消</n-button>
            <n-button type="primary" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">提交申请</n-button>
          </n-flex>
        </div>
      </div>
      <div class="TemplateModal__split-side">
        <FlowSchemaPreview
          class="h-full"
          :flow-type="FlowDefinitionTypeOptions.PURCHASE_APPLY_FLOW"
          title="采购申请流程"
        />
      </div>
    </div>
    </n-spin>
  </n-modal>
  <n-modal v-model:show="showItems" preset="card" class="TemplateModal TemplateModal--lg" title="选择物料">
    <div class="space-y-3">
      <n-form inline :size="appStore.componentSize">
        <n-form-item label="搜索:">
          <n-input v-model:value="itemsQuery.key" clearable placeholder="名称/规格/材质" />
        </n-form-item>
        <n-form-item>
          <div class="flex gap-2">
            <n-button type="info" secondary strong @click="selectItems">查询</n-button>
            <n-button secondary strong @click="selectItems()"> 重置</n-button>
          </div>
        </n-form-item>
      </n-form>
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
        <vxe-column fixed="left" type="checkbox" width="40" align="center" />
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
        <vxe-column title="参考税额/元" show-overflow="tooltip" align="center" width="15%">
          <template #default="{ row }">
            {{ formatMoney(calcTaxAmount(row.purchasePriceWithTax, row.vatTaxRate, 1)) }}
          </template>
        </vxe-column>
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
    </div>
    <div class="TemplateForm-actions">
      <n-flex justify="end">
        <n-button size="small" type="primary" @click="confirmUpdateItems">确定</n-button>
      </n-flex>
    </div>
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
  <n-modal v-model:show="showDetail" preset="card" class="TemplateModal TemplateModal--xxl" title="采购申请详情">
    <PurchaseModalDetailShell :loading="detailLoading">
        <n-card title="采购申请信息" :bordered="false" class="detail-card">
          <n-descriptions bordered :column="2" label-placement="left">
            <n-descriptions-item label="申请单号">{{ detailData.code || "-" }}</n-descriptions-item>
            <n-descriptions-item label="流程状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="申请日期">{{ detailData.applyTimeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="到货日期">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="需求来源">{{ detailData.sourceTypeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="当前节点">{{ detailData.currentNodeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="到货地址" :span="2">{{ detailData.address || "-" }}</n-descriptions-item>
            <n-descriptions-item label="备注" :span="2">{{ detailData.remark || "-" }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="采购订单" :bordered="false" class="detail-card">
          <div class="flex items-center justify-between gap-4">
            <div class="text-sm text-gray-500">当前已生成 {{ detailData.purchaseOrderCount || 0 }} 张采购订单</div>
            <n-button
              type="primary"
              secondary
              :loading="creatingOrder"
              :disabled="!detailData.canCreatePurchaseOrder"
              @click="createPurchaseOrder"
            >
              补生成采购订单
            </n-button>
          </div>
          <div class="mt-3 text-xs text-gray-400">
            仅流程已完成的采购申请可生成采购订单，系统会按供应商自动拆单并跳过已生成部分。
          </div>
          <div v-if="detailData.purchaseOrderCount" class="mt-3 text-xs text-gray-500">
            可在当前弹窗中继续查看该申请生成的采购订单。
            <n-button text type="info" size="tiny" @click="openRelatedPurchaseOrderList(detailData.code)">
              查看相关采购订单
            </n-button>
          </div>
        </n-card>

        <n-card title="采购物料信息" :bordered="false" class="detail-card">
          <vxe-table
            :data="detailData.detailList || []"
            border
            stripe
            show-overflow
            align="center"
            :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
          >
            <vxe-column field="name" title="名称" min-width="140" />
            <vxe-column field="supplierName" title="供应商" min-width="140" />
            <vxe-column field="typeName" title="类型" min-width="120" />
            <vxe-column field="unitName" title="单位" min-width="100" />
            <vxe-column field="spec" title="规格" min-width="140" />
            <vxe-column field="material" title="材质" min-width="120" />
            <vxe-column field="quantity" title="采购数量" min-width="100" />
            <vxe-column field="purchasePriceWithTax" title="含税单价" min-width="110" />
            <vxe-column field="vatTaxRate" title="税率(%)" min-width="90" />
            <vxe-column title="不含税单价" min-width="110">
              <template #default="{ row }">
                {{ formatMoney(row.purchasePriceWithoutTax || calcPriceWithoutTax(row.purchasePriceWithTax, row.vatTaxRate)) }}
              </template>
            </vxe-column>
            <vxe-column title="税额" min-width="110">
              <template #default="{ row }">
                {{ formatMoney(calcTaxAmount(row.purchasePriceWithTax, row.vatTaxRate, row.quantity)) }}
              </template>
            </vxe-column>
            <vxe-column title="含税小计" min-width="120">
              <template #default="{ row }">
                {{ formatMoney(calcAmountWithTax(row.purchasePriceWithTax, row.quantity)) }}
              </template>
            </vxe-column>
            <vxe-column title="不含税小计" min-width="120">
              <template #default="{ row }">
                {{ formatMoney(calcAmountWithoutTax(row.purchasePriceWithTax, row.vatTaxRate, row.quantity)) }}
              </template>
            </vxe-column>
            <vxe-column field="availableQuantity" title="可用库存" min-width="100" />
            <vxe-column field="remark" title="备注" min-width="180" />
          </vxe-table>
        </n-card>
      <template #side>
        <FlowSchemaPreview title="流程进度" :schema-data="detailData.flowSchema" />
      </template>
    </PurchaseModalDetailShell>
  </n-modal>

  <n-modal v-model:show="showRelatedOrderList" preset="card" class="TemplateModal TemplateModal--lg" title="相关采购订单">
    <n-spin :show="loading">
      <div class="TemplateModal__sections">
      <n-card title="采购订单列表" :bordered="false" class="detail-card">
      <vxe-table
        border
        stripe
        show-overflow
        align="center"
        :data="relatedOrderList.list || []"
        :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
      >
        <vxe-column field="code" title="订单编号" min-width="170">
          <template #default="{ row }">
            <n-button text type="info" @click="openRelatedPurchaseOrder(row.uid, row.code)">
              {{ row.code || "-" }}
            </n-button>
          </template>
        </vxe-column>
        <vxe-column field="orderTypeName" title="订单类型" min-width="110" />
        <vxe-column field="supplierName" title="供应商" min-width="140" />
        <vxe-column field="totalAmount" title="含税金额" min-width="120" />
        <vxe-column field="statusName" title="状态" min-width="110" />
        <vxe-column field="expectTimeName" title="预计到货" min-width="120" />
      </vxe-table>
      </n-card>
      </div>
    </n-spin>
  </n-modal>

  <PurchaseOrderRelatedModal
    v-model:show="showRelatedOrder"
    :uid="relatedOrder.uid"
    :code="relatedOrder.code"
  />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
