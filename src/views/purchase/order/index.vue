<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { useRoute } from "vue-router"
import LCard from "@/components/LCard/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { PageVo } from "@/model"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import {
  PurchaseOrderDetail,
  PurchaseOrderDetailVo,
  PurchaseOrderForm,
  PurchaseOrderQuery,
  PurchaseOrderQueryData,
  PurchaseOrderVo,
  PurchasePriceCompareVo,
  PurchasePriceHistoryQuery,
  PurchasePriceHistoryResultVo
} from "@/model/purchase"
import { PurchaseOrderService } from "@/services/purchase/PurchaseOrderService"
import { PurchasePriceAnalysisService } from "@/services/purchase/PurchasePriceAnalysisService"
import { useAppStore } from "@/store/modules/app"
import { PurchaseOrderStatusDict } from "@/constants/enum"
import {
  TEMPLATE_MODAL_TABLE_MAX_TALL,
  TEMPLATE_MODAL_TABLE_DETAIL_MAX,
  TEMPLATE_MODAL_TABLE_PICKER_MAX,
  TEMPLATE_MODAL_TABLE_RECORD_MAX
} from "@/constants/template-ui"
import {
  calcAmountWithoutTax,
  calcAmountWithTax,
  calcPriceWithoutTax,
  calcTaxAmount,
  formatMoney,
  syncPurchasePriceRows,
  validatePurchasePriceRows
} from "@/utils/purchasePrice"
import PurchaseApplyRelatedModal from "@/views/purchase/components/PurchaseApplyRelatedModal.vue"
import PurchaseOrderDetailView from "@/views/purchase/components/PurchaseOrderDetailView.vue"
import PurchaseInboundRelatedModal from "@/views/purchase/components/PurchaseInboundRelatedModal.vue"
import PurchaseModalDetailShell from "@/views/purchase/components/PurchaseModalDetailShell.vue"
import PurchaseOrderRelatedModal from "@/views/purchase/components/PurchaseOrderRelatedModal.vue"

const appStore = useAppStore()
const route = useRoute()
const loading = ref(false)
const detailLoading = ref(false)
const confirmLoading = ref(false)
const submitting = ref(false)
const priceCompareLoading = ref(false)
const priceHistoryLoading = ref(false)
const showDetail = ref(false)
const showConfirm = ref(false)
const showPriceHistory = ref(false)
const showRelatedApply = ref(false)
const showRelatedOrder = ref(false)
const showRelatedInbound = ref(false)
const relatedApply = ref<{ uid?: string; code?: string }>({})
const relatedOrder = ref<{ uid?: string; code?: string }>({})
const relatedInbound = ref<{ uid?: string; code?: string }>({})
const query = ref<PurchaseOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  status: "",
  orderType: ""
})
const data = ref<PageVo<PurchaseOrderVo, PurchaseOrderQueryData>>({
  currentPage: 1,
  pageSize: 20,
  count: 0,
  list: [],
  extraData: {} as PurchaseOrderQueryData
})
const detailData = ref<PurchaseOrderDetail>({ detailList: [], inboundOrderList: [] })
const confirmData = ref<PurchaseOrderForm>({ detailList: [] })
const priceCompareList = ref<PurchasePriceCompareVo[]>([])
const priceHistoryQuery = ref<PurchasePriceHistoryQuery>({ currentPage: 1, pageSize: 20 })
const priceHistoryData = ref<PurchasePriceHistoryResultVo>({ list: [], supplierOptions: [] })
const priceCompareMap = computed<Record<string, PurchasePriceCompareVo>>(() =>
  Object.fromEntries(
    (priceCompareList.value || [])
      .filter((item) => item.orderDetailUid)
      .map((item) => [item.orderDetailUid as string, item])
  )
)
let priceCompareTimer: number | undefined

function getQueryString(value: unknown) {
  return Array.isArray(value) ? value[0] : (value as string | undefined)
}

function select() {
  loading.value = true
  return PurchaseOrderService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function openMatchedDetailByCode(code?: string) {
  if (!code) return
  const matched = (data.value.list || []).find(
    (item) => item.code === code || item.applyOrderCode === code || item.sourceOrderCode === code
  )
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

function openRelatedApply(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedApply.value = { uid, code }
  showRelatedApply.value = true
}

function openRelatedOrder(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedOrder.value = { uid, code }
  showRelatedOrder.value = true
}

function openRelatedInbound(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedInbound.value = { uid, code }
  showRelatedInbound.value = true
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
      orderType: undefined
    }
  })
}

function pageChange(event: { currentPage: number; pageSize: number }) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function showDetailModal(uid?: string) {
  if (!uid) return
  showDetail.value = true
  detailLoading.value = true
  PurchaseOrderService.detail(uid)
    .then((res) => {
      detailData.value = res
    })
    .finally(() => {
      detailLoading.value = false
    })
}

function showConfirmModal(uid?: string) {
  if (!uid) return
  showConfirm.value = true
  confirmLoading.value = true
  priceCompareList.value = []
  PurchaseOrderService.form(uid)
    .then((res) => {
      confirmData.value = res
      loadPriceCompare()
    })
    .finally(() => {
      confirmLoading.value = false
    })
}

function loadPriceCompare() {
  if (!confirmData.value.uid) return
  if (priceCompareTimer) {
    window.clearTimeout(priceCompareTimer)
    priceCompareTimer = undefined
  }
  priceCompareLoading.value = true
  PurchasePriceAnalysisService.compare({
    orderUid: confirmData.value.uid,
    detailList: (confirmData.value.detailList || []).map((item) => ({
      orderDetailUid: item.uid,
      itemUid: item.itemUid,
      itemName: item.name,
      supplierUid: item.supplierUid || confirmData.value.supplierUid,
      quantity: item.quantity,
      vatTaxRate: item.vatTaxRate,
      purchasePriceWithTax: item.purchasePriceWithTax
    }))
  })
    .then((res) => {
      priceCompareList.value = res || []
    })
    .finally(() => {
      priceCompareLoading.value = false
    })
}

function scheduleLoadPriceCompare() {
  if (!showConfirm.value || !confirmData.value.uid) return
  if (priceCompareTimer) {
    window.clearTimeout(priceCompareTimer)
  }
  priceCompareTimer = window.setTimeout(() => {
    loadPriceCompare()
  }, 500)
}

function getPriceCompare(row: PurchaseOrderDetailVo) {
  return row.uid ? priceCompareMap.value[row.uid] : undefined
}

function formatDiffPercent(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return "-"
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
}

function warningTagType(level?: string) {
  if (level === "danger") return "error"
  if (level === "warning") return "warning"
  if (level === "success") return "success"
  if (level === "normal") return "info"
  return "default"
}

function loadPriceHistory() {
  if (!priceHistoryQuery.value.itemUid) return
  priceHistoryLoading.value = true
  PurchasePriceAnalysisService.history(priceHistoryQuery.value)
    .then((res) => {
      priceHistoryData.value = res || { list: [], supplierOptions: [] }
    })
    .finally(() => {
      priceHistoryLoading.value = false
    })
}

function showPriceHistoryModal(row: PurchaseOrderDetailVo) {
  priceHistoryQuery.value = {
    orderUid: confirmData.value.uid,
    itemUid: row.itemUid,
    supplierUid: row.supplierUid || confirmData.value.supplierUid,
    currentPage: 1,
    pageSize: 20
  }
  priceHistoryData.value = { list: [], supplierOptions: [] }
  showPriceHistory.value = true
  loadPriceHistory()
}

function priceHistorySupplierChange() {
  priceHistoryQuery.value.currentPage = 1
  loadPriceHistory()
}

function priceHistoryPageChange(event: { currentPage: number; pageSize: number }) {
  priceHistoryQuery.value.currentPage = event.currentPage
  priceHistoryQuery.value.pageSize = event.pageSize
  loadPriceHistory()
}

function priceReasonRequired(row: PurchaseOrderDetailVo) {
  return Boolean(getPriceCompare(row)?.priceReasonRequired)
}

function priceReasonTip(row: PurchaseOrderDetailVo) {
  return getPriceCompare(row)?.priceReasonTip || "价格波动较大，请填写说明"
}

function canConfirm(row?: PurchaseOrderVo) {
  return row?.status === PurchaseOrderStatusDict.WAIT_CONFIRM || row?.status === PurchaseOrderStatusDict.REJECT
}

function validateConfirmForm() {
  if (!confirmData.value.detailList?.length) {
    window.$message?.error("采购订单明细不能为空")
    return false
  }
  syncPurchasePriceRows(confirmData.value.detailList)
  for (const item of confirmData.value.detailList) {
    if (!item.quantity || item.quantity <= 0) {
      window.$message?.error(`【${item.name || "物料"}】到货数量必须大于0`)
      return false
    }
  }
  if (!validatePurchasePriceRows(confirmData.value.detailList, (text) => window.$message?.error(text))) {
    return false
  }
  for (const item of confirmData.value.detailList) {
    if (priceReasonRequired(item) && !item.priceCompareReason?.trim()) {
      window.$message?.error(`【${item.name || "物料"}】价格波动较大，请填写价格说明`)
      return false
    }
  }
  return true
}

function confirmOrder() {
  if (!validateConfirmForm() || submitting.value) return
  submitting.value = true
  PurchaseOrderService.confirm(confirmData.value)
    .then(() => {
      window.$message?.success("采购订单已提交审批")
      showConfirm.value = false
      select()
      if (detailData.value.uid === confirmData.value.uid) {
        return PurchaseOrderService.detail(confirmData.value.uid as string).then((res) => {
          detailData.value = res
        })
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

watch(
  () => [route.query.openUid, route.query.openCode],
  () => {
    applyRouteOpen()
  }
)

watch(
  () =>
    showConfirm.value
      ? JSON.stringify(
          (confirmData.value.detailList || []).map((item) => ({
            uid: item.uid,
            itemUid: item.itemUid,
            supplierUid: item.supplierUid || confirmData.value.supplierUid,
            quantity: item.quantity,
            vatTaxRate: item.vatTaxRate,
            purchasePriceWithTax: item.purchasePriceWithTax
          }))
        )
      : "",
  () => {
    scheduleLoadPriceCompare()
  }
)

onMounted(() => {
  applyRouteOpen()
})

onBeforeUnmount(() => {
  if (priceCompareTimer) {
    window.clearTimeout(priceCompareTimer)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm label-placement="left" label-align="right" label-width="70" class="list-search-form">
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="关键字">
                    <n-input
                      class="w-full"
                      v-model:value="query.key"
                      clearable
                      placeholder="订单编号/备注"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="订单类型">
                    <n-select
                      class="w-full"
                      v-model:value="query.orderType"
                      clearable
                      filterable
                      placeholder="全部"
                      :options="data.extraData?.orderTypeOptions || []"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="状态">
                    <n-select
                      class="w-full"
                      v-model:value="query.status"
                      clearable
                      filterable
                      placeholder="全部"
                      :options="data.extraData?.statusOptions || []"
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

      <div class="erp-list-table-wrap">
        <ListPageTable
          show-overflow
          align="center"
          keep-source
          resizable
          :loading="loading"
          :data="data.list || []"
          :size="appStore.componentSize"
          :height="'auto'"
        >
          <vxe-column field="code" title="订单编号" min-width="170">
            <template #default="{ row }">
              <n-button text type="info" @click="showDetailModal(row.uid)">{{ row.code || "-" }}</n-button>
            </template>
          </vxe-column>
          <vxe-column field="orderTypeName" title="订单类型" min-width="110" />
          <vxe-column field="applyOrderCode" title="申请单号" min-width="170">
            <template #default="{ row }">
              <n-button
                v-if="row.applyOrderCode"
                text
                type="info"
                @click="openRelatedApply(row.applyOrderUid, row.applyOrderCode)"
              >
                {{ row.applyOrderCode }}
              </n-button>
              <span v-else>-</span>
            </template>
          </vxe-column>
          <vxe-column field="sourceOrderCode" title="来源订单" min-width="170">
            <template #default="{ row }">
              <n-button
                v-if="row.sourceOrderCode"
                text
                type="info"
                @click="openRelatedOrder(row.sourceOrderUid, row.sourceOrderCode)"
              >
                {{ row.sourceOrderCode }}
              </n-button>
              <span v-else>-</span>
            </template>
          </vxe-column>
          <vxe-column field="supplierName" title="供应商" min-width="140" />
          <vxe-column field="totalAmount" title="含税金额" min-width="120" />
          <vxe-column field="totalAmountWithoutTax" title="不含税金额" min-width="120" />
          <vxe-column field="expectTimeName" title="预计到货" min-width="120" />
          <vxe-column field="statusName" title="状态" min-width="110" />
          <vxe-column field="createTime" title="创建时间" min-width="170" />
          <vxe-column title="操作" fixed="right" width="180">
            <template #default="{ row }">
              <div class="flex justify-center gap-2">
                <n-button text type="info" @click="showDetailModal(row.uid)">详情</n-button>
                <n-button v-if="canConfirm(row)" text type="primary" @click="showConfirmModal(row.uid)"
                  >确认订单
                </n-button>
              </div>
            </template>
          </vxe-column>
        </ListPageTable>
      </div>

      <template #footer>
        <vxe-pager
          :current-page="query.currentPage"
          :page-size="query.pageSize"
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
      </template>
    </l-card>

    <FormModal v-model:show="showDetail" title="采购订单" size="full">
      <PurchaseModalDetailShell :loading="detailLoading">
        <PurchaseOrderDetailView
          :detail="detailData"
          :loading="detailLoading"
          @open-apply="openRelatedApply"
          @open-order="openRelatedOrder"
          @open-inbound="openRelatedInbound"
        />
        <template #side>
          <FlowSchemaPreview v-if="detailData.flowSchema" title="流程进度" :schema-data="detailData.flowSchema" />
          <n-empty v-else description="暂无流程数据" />
        </template>
      </PurchaseModalDetailShell>
    </FormModal>

    <PurchaseApplyRelatedModal v-model:show="showRelatedApply" :uid="relatedApply.uid" :code="relatedApply.code" />
    <PurchaseOrderRelatedModal v-model:show="showRelatedOrder" :uid="relatedOrder.uid" :code="relatedOrder.code" />
    <PurchaseInboundRelatedModal
      v-model:show="showRelatedInbound"
      :uid="relatedInbound.uid"
      :code="relatedInbound.code"
    />

    <FormModal v-model:show="showConfirm" title="确认采购订单" size="xxl" :loading="confirmLoading">
      <n-form :model="confirmData" class="TemplateForm" label-placement="left" label-width="96">
        <n-grid cols="2" x-gap="16" y-gap="0">
          <n-gi span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">订单信息</div>
            </div>
          </n-gi>
          <n-gi>
            <n-form-item label="订单编号">
              <n-input :value="confirmData.code" disabled />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="订单类型">
              <n-input :value="confirmData.orderTypeName" disabled />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="预计到货">
              <n-date-picker v-model:value="confirmData.expectTime" type="date" clearable class="w-full" />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="备注">
              <n-input v-model:value="confirmData.remark" type="textarea" maxlength="200" show-count />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <div class="TemplateForm-section TemplateForm-section__head">
              <div class="TemplateForm-section__title">订单明细</div>
              <n-button tertiary type="info" :loading="priceCompareLoading" @click="loadPriceCompare">
                刷新历史价格
              </n-button>
            </div>
          </n-gi>
          <n-gi span="2">
            <n-alert type="info" show-icon class="mb-3">
              历史价格仅统计审批通过及后续状态的采购订单，不包含当前订单、待审批和驳回订单。
            </n-alert>
          </n-gi>
          <n-gi span="2">
            <div
              class="TemplateForm-table-wrap w-full"
              :style="{ '--template-form-table-max': `${TEMPLATE_MODAL_TABLE_MAX_TALL}px` }"
            >
              <vxe-table
                border
                stripe
                show-overflow
                :size="appStore.componentSize"
                align="center"
                :loading="priceCompareLoading"
                :data="confirmData.detailList || []"
                :max-height="TEMPLATE_MODAL_TABLE_MAX_TALL"
                :cell-config="{ height: 160 }"
              >
                <vxe-column field="name" title="物料名称" min-width="160" />
                <vxe-column title="规格1" min-width="150">
                  <template #default="{ row }">{{ getSpec1Name(row) }}</template>
                </vxe-column>
                <vxe-column title="规格2" min-width="150">
                  <template #default="{ row }">{{ getSpec2Name(row) }}</template>
                </vxe-column>
                <vxe-column field="unitName" title="单位" min-width="90" />
                <vxe-column field="applyQuantity" title="申请数量" min-width="100" />
                <vxe-column title="到货数量" min-width="120">
                  <template #default="{ row }">
                    <n-input-number v-model:value="row.quantity" :min="1" :precision="2" class="w-full" />
                  </template>
                </vxe-column>
                <vxe-column title="含税单价" min-width="130">
                  <template #default="{ row }">
                    <n-input-number
                      v-model:value="row.purchasePriceWithTax"
                      :min="0.0001"
                      :precision="4"
                      class="w-full"
                    />
                  </template>
                </vxe-column>
                <vxe-column title="税率(%)" min-width="110">
                  <template #default="{ row }">
                    <n-input-number v-model:value="row.vatTaxRate" :min="0" :max="100" :precision="2" class="w-full" />
                  </template>
                </vxe-column>
                <vxe-column title="不含税单价（自动）" min-width="140">
                  <template #default="{ row }">
                    {{ formatMoney(calcPriceWithoutTax(row.purchasePriceWithTax, row.vatTaxRate)) }}
                  </template>
                </vxe-column>
                <vxe-column title="税额" min-width="120">
                  <template #default="{ row }">
                    {{ formatMoney(calcTaxAmount(row.purchasePriceWithTax, row.vatTaxRate, row.quantity)) }}
                  </template>
                </vxe-column>
                <vxe-column title="含税小计" min-width="120">
                  <template #default="{ row }">
                    {{ formatMoney(calcAmountWithTax(row.purchasePriceWithTax, row.quantity)) }}
                  </template>
                </vxe-column>
                <vxe-column title="不含税小计" min-width="130">
                  <template #default="{ row }">
                    {{ formatMoney(calcAmountWithoutTax(row.purchasePriceWithTax, row.vatTaxRate, row.quantity)) }}
                  </template>
                </vxe-column>
                <vxe-column title="历史比价" min-width="300" fixed="right" cell-render>
                  <template #default="{ row }">
                    <div v-if="getPriceCompare(row)?.historyCount" class="price-compare-cell">
                      <div>
                        同供应商最近含税：
                        <span class="font-medium">
                          {{ formatMoney(getPriceCompare(row)?.lastSameSupplierPriceWithTax) }}
                        </span>
                        <span class="text-gray-400">
                          {{ getPriceCompare(row)?.lastSameSupplierOrderCode || "" }}
                        </span>
                      </div>
                      <div>
                        同供应商最近不含税：
                        <span class="font-medium">
                          {{ formatMoney(getPriceCompare(row)?.lastSameSupplierPriceWithoutTax) }}
                        </span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span>不含税均价：{{ formatMoney(getPriceCompare(row)?.avgHistoryPriceWithoutTax) }}</span>
                        <n-tag size="small" :type="warningTagType(getPriceCompare(row)?.warningLevel)">
                          {{ formatDiffPercent(getPriceCompare(row)?.currentVsAvgWithoutTaxRate) }}
                        </n-tag>
                      </div>
                      <div>
                        历史最低不含税：
                        <span class="font-medium">
                          {{ formatMoney(getPriceCompare(row)?.minHistoryPriceWithoutTax) }}
                        </span>
                        <span class="text-gray-400">
                          {{ getPriceCompare(row)?.minHistorySupplierName || "" }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <n-tag size="small" :type="warningTagType(getPriceCompare(row)?.warningLevel)">
                          {{ getPriceCompare(row)?.warningText }}
                        </n-tag>
                        <n-button text size="tiny" type="primary" @click="showPriceHistoryModal(row)">
                          查看记录
                        </n-button>
                      </div>
                    </div>
                    <div v-else class="flex items-center justify-center gap-2">
                      <n-tag size="small" type="default">暂无历史价格</n-tag>
                      <n-button text size="tiny" type="primary" @click="showPriceHistoryModal(row)">
                        查看记录
                      </n-button>
                    </div>
                  </template>
                </vxe-column>
                <vxe-column title="价格说明" min-width="220" fixed="right">
                  <template #default="{ row }">
                    <div class="price-reason-cell">
                      <n-input
                        v-model:value="row.priceCompareReason"
                        :placeholder="priceReasonRequired(row) ? '必填：说明本次价格波动原因' : '选填'"
                        maxlength="150"
                        show-count
                      />
                      <div v-if="priceReasonRequired(row)" class="price-reason-tip">
                        {{ priceReasonTip(row) }}
                      </div>
                    </div>
                  </template>
                </vxe-column>
                <vxe-column title="明细备注" min-width="180">
                  <template #default="{ row }">
                    <n-input v-model:value="row.remark" maxlength="100" />
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="showConfirm = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmOrder">提交审批</n-button>
        </n-flex>
      </template>
    </FormModal>

    <FormModal v-model:show="showPriceHistory" title="物料历史采购记录" size="xl">
      <n-spin :show="priceHistoryLoading">
        <div class="TemplateModal__sections">
          <n-card :bordered="false" class="detail-card">
            <div class="history-toolbar">
              <div>
                <div class="history-title">{{ priceHistoryData.itemName || "物料" }}</div>
                <div class="history-subtitle">默认展示当前供应商，可切换查看其他供应商历史价格。</div>
              </div>
              <n-select
                v-model:value="priceHistoryQuery.supplierUid"
                filterable
                clearable
                class="w-[260px]"
                placeholder="全部供应商"
                :options="priceHistoryData.supplierOptions || []"
                @update:value="priceHistorySupplierChange"
              />
            </div>
            <vxe-table
              border
              stripe
              show-overflow
              align="center"
              :size="appStore.componentSize"
              :loading="priceHistoryLoading"
              :data="priceHistoryData.list || []"
              :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
            >
              <vxe-column field="orderCode" title="订单编号" min-width="150" />
              <vxe-column field="supplierName" title="供应商" min-width="150" />
              <vxe-column field="orderStatusName" title="订单状态" min-width="110" />
              <vxe-column field="orderTimeName" title="订单时间" min-width="120" />
              <vxe-column field="quantity" title="数量" min-width="100" />
              <vxe-column field="vatTaxRate" title="税率(%)" min-width="100" />
              <vxe-column title="含税单价" min-width="120">
                <template #default="{ row }">
                  {{ formatMoney(row.purchasePriceWithTax) }}
                </template>
              </vxe-column>
              <vxe-column title="不含税单价" min-width="130">
                <template #default="{ row }">
                  {{ formatMoney(row.purchasePriceWithoutTax) }}
                </template>
              </vxe-column>
              <vxe-column title="含税小计" min-width="120">
                <template #default="{ row }">
                  {{ formatMoney(row.totalAmountWithTax) }}
                </template>
              </vxe-column>
              <vxe-column title="不含税小计" min-width="130">
                <template #default="{ row }">
                  {{ formatMoney(row.totalAmountWithoutTax) }}
                </template>
              </vxe-column>
            </vxe-table>
            <vxe-pager
              :current-page="priceHistoryQuery.currentPage"
              :page-size="priceHistoryQuery.pageSize"
              :total="priceHistoryData.count || 0"
              :layouts="['PrevPage', 'Number', 'NextPage', 'Sizes', 'Total']"
              @page-change="priceHistoryPageChange"
            />
          </n-card>
        </div>
      </n-spin>
    </FormModal>
  </div>
</template>

<style lang="scss" scoped>
.price-compare-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.5;
}

.price-reason-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.price-reason-tip {
  color: #d97706;
  font-size: 12px;
  line-height: 1.4;
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.history-title {
  color: #1f2937;
  font-weight: 600;
}

.history-subtitle {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}
</style>
