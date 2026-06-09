<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { useRoute } from "vue-router"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst } from "naive-ui"
import { resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance } from "vxe-table"
import ItemPickerModal from "@/components/ItemPickerModal/index.vue"
import ItemDetailTable from "@/components/ItemDetailTable/index.vue"
import { ItemPickerVo } from "@/services/ItemPickerService"
import { cloneItemPrice } from "@/utils/itemPrice"
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
import { MaterialRequestOrderService } from "@/services/inventory/MaterialRequestOrderService"
import { FlowInstanceStatusDict } from "@/constants/enum"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import { TEMPLATE_MODAL_TABLE_MAX, TEMPLATE_MODAL_TABLE_DETAIL_MAX } from "@/constants/template-ui"
import { VxePagerEvents } from "vxe-pc-ui"
import { PurchaseOrderService } from "@/services/purchase/PurchaseOrderService"
import PurchaseOrderRelatedModal from "@/views/purchase/components/PurchaseOrderRelatedModal.vue"
import PurchaseApplyDetailView from "@/views/purchase/components/PurchaseApplyDetailView.vue"
import PurchaseModalDetailShell from "@/views/purchase/components/PurchaseModalDetailShell.vue"
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
  detailList: []
})
const formRef = ref<FormInst>()
const loading = ref(false)
const detailLoading = ref(false)
const creatingOrder = ref(false)
const isResubmit = computed(() => !!formData.value.uid && formData.value.status === FlowInstanceStatusDict.REJECTED)
const canDeleteApply = (status?: string) =>
  status === FlowInstanceStatusDict.REJECTED || status === FlowInstanceStatusDict.WITHDRAWN

function statusTagType(status?: string) {
  if (status === FlowInstanceStatusDict.REJECTED) return "error"
  if (status === FlowInstanceStatusDict.WITHDRAWN) return "warning"
  if (status === FlowInstanceStatusDict.COMPLETED) return "success"
  if (status === FlowInstanceStatusDict.RUNNING) return "info"
  return "default"
}
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
const query = ref<PurchaseApplyOrderQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<PurchaseApplyOrderVo, PurchaseApplyOrderQueryData>>({})
const VxeTableRef = ref<VxeTableInstance>()
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
    query.value.key = openCode
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

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  PurchaseApplyOrderService.form(uid).then((data) => {
    formData.value = data
    formData.value.detailList = formData.value.detailList || []
  })
}

function showItemsModal() {
  showItems.value = true
}

function confirmUpdateItems(records: ItemPickerVo[]) {
  if (!formData.value.detailList) {
    formData.value.detailList = []
  }

  const existUidSet = new Set(formData.value.detailList.map((item) => item.itemUid).filter(Boolean))

  const newDetails: PurchaseApplyOrderDetailVo[] = records
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
        price: cloneItemPrice(item.price) ?? {}
      }
    })

  if (newDetails.length < records.length) {
    window.$message?.warning("已跳过重复物料")
  }

  formData.value.detailList.push(...newDetails)
}

function confirmDeleteItems(_row: PurchaseApplyOrderDetailVo, index: number) {
  formData.value.detailList?.splice(index, 1)
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (!formData.value.usageType) {
      window.$message?.error("请选择用途类型")
      return
    }
    if (!formData.value.bizType) {
      window.$message?.error("请选择业务对象类型")
      return
    }
    if (formData.value.bizType !== "none" && !formData.value.bizUid) {
      window.$message?.error("请选择业务对象")
      return
    }
    if (isSubmitting.value) return
    isSubmitting.value = true
    PurchaseApplyOrderService.addOrUpdate(formData.value)
      .then(() => {
        showUpdate.value = false
        window.$message?.success(isResubmit.value ? "重新提交成功，已再次发起审批流程" : "提交成功")
        select()
      })
      .finally(() => {
        isSubmitting.value = false
      })
  })
}

async function onBizTypeChange(value: string) {
  formData.value.bizUid = ""
  formData.value.bizName = ""
  formData.value.bizObjectOptions = await MaterialRequestOrderService.bizObjectOptions(value)
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
  if (!formData.value.uid) return
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
      sourceType: undefined,
      usageType: undefined,
      status: undefined
    }
  })
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
                  <n-form-item label="关键词">
                    <n-input
                      class="w-full"
                      clearable
                      v-model:value="query.key"
                      placeholder="申请编号/备注/业务对象"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="需求来源">
                    <n-select
                      class="w-full"
                      clearable
                      filterable
                      v-model:value="query.sourceType"
                      :options="data.extraData?.sourceTypeOptions || []"
                      placeholder="全部"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="用途类型">
                    <n-select
                      class="w-full"
                      clearable
                      filterable
                      v-model:value="query.usageType"
                      :options="data.extraData?.usageTypeOptions || []"
                      placeholder="全部"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="流程状态">
                    <n-select
                      class="w-full"
                      clearable
                      filterable
                      v-model:value="query.status"
                      :options="data.extraData?.statusOptions || []"
                      placeholder="全部"
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
          <ListPageToolbar>
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()">新增申请</n-button>
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1 erp-list-table-wrap">
            <ListPageTable
              :data="data.list"
              :loading="loading"
              :size="appStore.componentSize"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
            >
              <vxe-column field="code" title="申请编号" show-overflow="tooltip" align="center">
                <template #default="{ row }">
                  <n-button text type="info" @click="showDetailModal(row.uid)">{{ row.code || "-" }}</n-button>
                </template>
              </vxe-column>
              <vxe-column field="sourceTypeName" title="需求来源" show-overflow="tooltip" align="center" />
              <vxe-column field="usageTypeName" title="用途类型" show-overflow="tooltip" align="center" />
              <vxe-column field="bizTypeName" title="业务类型" show-overflow="tooltip" align="center" />
              <vxe-column field="applyTimeName" title="申请时间" show-overflow="tooltip" align="center" />
              <vxe-column field="expectTimeName" title="到货时间" show-overflow="tooltip" align="center" />
              <vxe-column field="statusName" title="流程状态" show-overflow="tooltip" align="center" />
              <vxe-column field="currentNodeName" title="当前节点" show-overflow="tooltip" align="center" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" />
              <vxe-column field="createTime" title="创建时间" show-overflow="tooltip" align="center" :visible="false" />
              <vxe-column field="updateTime" title="更新时间" show-overflow="tooltip" align="center" :visible="false" />
              <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="220">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <n-button type="info" text :size="appStore.searchBarSize" @click="showDetailModal(row.uid)"
                      >详情</n-button
                    >
                    <n-button
                      v-if="row.status === FlowInstanceStatusDict.REJECTED"
                      type="info"
                      text
                      :size="appStore.searchBarSize"
                      @click="showUpdateModal(row.uid)"
                    >
                      重新提交
                    </n-button>
                    <n-button
                      v-if="canDeleteApply(row.status)"
                      type="error"
                      text
                      :size="appStore.searchBarSize"
                      @click="showDeleteModal(row.uid)"
                    >
                      删除
                    </n-button>
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
  <FormModal v-model:show="showUpdate" title="采购申请" size="full" :loading="isSubmitting">
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
            <n-gi>
              <n-form-item label="用途类型">
                <n-select
                  filterable
                  clearable
                  placeholder="请选择用途类型"
                  v-model:value="formData.usageType"
                  :options="formData.usageTypeOptions || []"
                  class="w-full"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="业务对象类型">
                <n-select
                  filterable
                  clearable
                  placeholder="请选择业务对象类型"
                  v-model:value="formData.bizType"
                  :options="formData.bizTypeOptions || []"
                  class="w-full"
                  @update:value="onBizTypeChange"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="业务对象">
                <n-select
                  filterable
                  clearable
                  placeholder="请选择业务对象"
                  v-model:value="formData.bizUid"
                  :options="formData.bizObjectOptions || []"
                  :disabled="!formData.bizType || formData.bizType === 'none'"
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
                <ItemDetailTable
                  :data="formData.detailList"
                  preset="purchase_apply_edit"
                  :supplier-options="formData.supplierOptions"
                  :max-height="TEMPLATE_MODAL_TABLE_MAX"
                  @delete="confirmDeleteItems"
                />
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
      </div>
      <div class="TemplateModal__split-side">
        <FlowSchemaPreview
          :flow-type="FlowDefinitionTypeOptions.PURCHASE_APPLY_FLOW"
          title="流程进度"
        />
      </div>
    </div>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showUpdate = false">取消</n-button>
        <n-button type="primary" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">
          {{ isResubmit ? "重新提交" : "提交申请" }}
        </n-button>
      </n-flex>
    </template>
  </FormModal>
  <ItemPickerModal v-model:show="showItems" scenario="purchase_apply" @confirm="confirmUpdateItems" />
  <n-modal
    :mask-closable="false"
    v-model:show="showDelete"
    preset="dialog"
    type="error"
    title="提示信息"
    content="确定删除该采购申请吗？"
    positive-text="确定"
    @positive-click="confirmDelete"
  />
  <FormModal v-model:show="showDetail" title="采购申请" size="full">
    <PurchaseModalDetailShell :loading="detailLoading">
      <PurchaseApplyDetailView :detail="detailData" :loading="detailLoading">
        <template #order-section>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-4">
              <span>当前已生成 {{ detailData.purchaseOrderCount || 0 }} 张采购订单</span>
              <n-button
                type="primary"
                secondary
                size="small"
                :loading="creatingOrder"
                :disabled="!detailData.canCreatePurchaseOrder"
                @click="createPurchaseOrder"
              >
                补生成采购订单
              </n-button>
            </div>
            <div class="text-xs text-gray-400">
              仅流程已完成的采购申请可生成采购订单，系统会按供应商自动拆单并跳过已生成部分。
            </div>
            <div v-if="detailData.purchaseOrderCount" class="text-xs text-gray-500">
              可在当前弹窗中继续查看该申请生成的采购订单。
              <n-button text type="info" size="tiny" @click="openRelatedPurchaseOrderList(detailData.code)">
                查看相关采购订单
              </n-button>
            </div>
          </div>
        </template>
      </PurchaseApplyDetailView>
      <template #side>
        <FlowSchemaPreview title="流程进度" :schema-data="detailData.flowSchema" />
      </template>
    </PurchaseModalDetailShell>
  </FormModal>

  <FormModal v-model:show="showRelatedOrderList" title="相关采购订单" size="lg">
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
  </FormModal>

  <PurchaseOrderRelatedModal v-model:show="showRelatedOrder" :uid="relatedOrder.uid" :code="relatedOrder.code" />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
