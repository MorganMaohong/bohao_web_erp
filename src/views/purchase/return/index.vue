<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { useRoute } from "vue-router"
import LCard from "@/components/LCard/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import {
  InventoryOutboundDetail,
  InventoryOutOrderForm,
  InventoryOutOrderQuery,
  InventoryOutOrderVo
} from "@/model/inventory/outbound"
import { InventoryOutOrderService } from "@/services/inventory/InventoryOutOrderService"
import { resetRef } from "@/utils"
import { useAppStore } from "@/store/modules/app"
import { InventOutOrderStatusDict, InventOutOrderTypeDict, PurchaseReturnTypeDict } from "@/constants/enum"
import {
  TEMPLATE_MODAL_TABLE_MAX,
  TEMPLATE_MODAL_TABLE_DETAIL_MAX,
  TEMPLATE_MODAL_TABLE_RECORD_MAX
} from "@/constants/template-ui"
import PurchaseOrderRelatedModal from "@/views/purchase/components/PurchaseOrderRelatedModal.vue"
import PurchaseModalDetailShell from "@/views/purchase/components/PurchaseModalDetailShell.vue"

const appStore = useAppStore()
const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const showDetail = ref(false)
const showHandle = ref(false)
const showRelatedOrder = ref(false)
const relatedOrder = ref<{ uid?: string; code?: string }>({})

const query = ref<InventoryOutOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  status: "",
  purchaseReturnType: "",
  type: InventOutOrderTypeDict.PURCHASE_RETURN
})
const data = ref<PageVo<InventoryOutOrderVo, any>>({
  currentPage: 1,
  pageSize: 20,
  count: 0,
  list: [],
  extraData: {}
})
const detailData = ref<InventoryOutboundDetail>({ detailList: [], imageList: [] })
const formData = ref<InventoryOutOrderForm>({
  detailList: [],
  purchaseReturnType: PurchaseReturnTypeDict.REFUND
})

function getQueryString(value: unknown) {
  return Array.isArray(value) ? value[0] : (value as string | undefined)
}

function select() {
  loading.value = true
  return InventoryOutOrderService.select(query.value)
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
    (item) => item.code === code || item.purchaseOrderCode === code || (item.resendOrderCodeList || []).includes(code)
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

function openRelatedOrder(uid?: string, code?: string) {
  if (!uid && !code) return
  relatedOrder.value = { uid, code }
  showRelatedOrder.value = true
}

function getResendOrderUid(index: number) {
  const uids = (detailData.value.resendOrderUids || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  return uids[index]
}

function doSearch() {
  query.value.currentPage = 1
  select()
}

const { triggerInputSearch, flushInputSearch, triggerSelectSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    query.value = resetRef(query.value)
    query.value.currentPage = 1
    query.value.pageSize = 20
    query.value.type = InventOutOrderTypeDict.PURCHASE_RETURN
  })
}

function pageChange(event: { currentPage: number; pageSize: number }) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function showDetailModal(uid?: string) {
  if (!uid) return
  loading.value = true
  showDetail.value = true
  InventoryOutOrderService.detail(uid)
    .then((res) => {
      detailData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function showHandleModal(uid?: string) {
  if (!uid) return
  submitting.value = true
  InventoryOutOrderService.form(uid)
    .then((res) => {
      formData.value = res
      if (!formData.value.purchaseReturnType) {
        formData.value.purchaseReturnType = PurchaseReturnTypeDict.REFUND
      }
      showHandle.value = true
    })
    .finally(() => {
      submitting.value = false
    })
}

function canHandle(row?: InventoryOutOrderVo) {
  return row?.status === InventOutOrderStatusDict.WAIT_COMPLETE
}

function formatCodeList(list?: string[]) {
  return (list || []).filter(Boolean).join("、") || "-"
}

function validateForm() {
  if (!formData.value.purchaseReturnType) {
    window.$message?.error("请选择退货方式")
    return false
  }
  const list = (formData.value.detailList || []).filter((item) => Number(item.quantity) > 0)
  if (!list.length) {
    window.$message?.error("请至少填写一条退货数量")
    return false
  }
  for (const item of list) {
    const quantity = Number(item.quantity) || 0
    const available = Number(item.availableQuantity) || 0
    if (quantity <= 0 || quantity > available) {
      window.$message?.error(`【${item.name || "物料"}】退货数量不能超过最大可退数量`)
      return false
    }
  }
  formData.value.type = InventOutOrderTypeDict.PURCHASE_RETURN
  return true
}

function confirmReturn() {
  if (!validateForm() || submitting.value) return
  const payload: InventoryOutOrderForm = {
    ...formData.value,
    type: InventOutOrderTypeDict.PURCHASE_RETURN,
    detailList: (formData.value.detailList || []).filter((item) => Number(item.quantity) > 0)
  }
  submitting.value = true
  InventoryOutOrderService.complete(payload)
    .then(() => {
      window.$message?.success("采购退货成功")
      showHandle.value = false
      select()
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

onMounted(() => {
  applyRouteOpen()
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
                      placeholder="退货单号/采购订单/备注"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="退货方式">
                    <n-select
                      class="w-full"
                      v-model:value="query.purchaseReturnType"
                      clearable
                      :options="data.extraData?.purchaseReturnTypeOptions || []"
                      placeholder="全部"
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

      <div class="erp-list-table-wrap">
        <ListPageTable
          show-overflow
          :size="appStore.componentSize"
          align="center"
          :loading="loading"
          :data="data.list || []"
          height="auto"
        >
        <vxe-column field="code" title="采购退货单号" min-width="170">
          <template #default="{ row }">
            <n-button text type="info" @click="showDetailModal(row.uid)">{{ row.code || "-" }}</n-button>
          </template>
        </vxe-column>
        <vxe-column field="purchaseOrderCode" title="采购订单" min-width="170">
          <template #default="{ row }">
            <n-button
              v-if="row.purchaseOrderCode"
              text
              type="info"
              @click="openRelatedOrder(row.purchaseOrderUid, row.purchaseOrderCode)"
            >
              {{ row.purchaseOrderCode }}
            </n-button>
            <span v-else>-</span>
          </template>
        </vxe-column>
        <vxe-column field="purchaseReturnTypeName" title="退货方式" min-width="120" />
        <vxe-column field="totalQuantity" title="本次退货数量" min-width="120" />
        <vxe-column title="补发订单" min-width="200">
          <template #default="{ row }">
            <n-space v-if="(row.resendOrderCodeList || []).length" justify="center">
              <n-button
                v-for="code in row.resendOrderCodeList"
                :key="code"
                text
                type="info"
                @click="openRelatedOrder(undefined, code)"
              >
                {{ code }}
              </n-button>
            </n-space>
            <span v-else>-</span>
          </template>
        </vxe-column>
        <vxe-column field="timeName" title="退货时间" min-width="170" />
        <vxe-column field="statusName" title="状态" min-width="100" />
        <vxe-column title="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex justify-center gap-2">
              <n-button text type="info" @click="showDetailModal(row.uid)">详情</n-button>
              <n-button v-if="canHandle(row)" text type="primary" @click="showHandleModal(row.uid)">退货</n-button>
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

    <FormModal v-model:show="showHandle" title="采购退货执行" size="xxl" :loading="submitting">
      <n-form :model="formData" class="TemplateForm" label-placement="left" label-width="96">
        <n-grid cols="2" x-gap="16" y-gap="0">
          <n-gi span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">退货信息</div>
            </div>
          </n-gi>
          <n-gi>
            <n-form-item label="退货单号">
              <n-input :value="formData.code" disabled />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="退货时间">
              <n-date-picker v-model:value="formData.time" type="datetime" class="w-full" clearable />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="退货方式">
              <n-radio-group v-model:value="formData.purchaseReturnType">
                <n-space>
                  <n-radio :value="PurchaseReturnTypeDict.REFUND">退货退款</n-radio>
                  <n-radio :value="PurchaseReturnTypeDict.RESEND">重新补发</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="备注">
              <n-input v-model:value="formData.remark" type="textarea" placeholder="请输入备注" />
            </n-form-item>
          </n-gi>
          <n-gi v-if="(formData.recordList || []).length" span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">历史退货记录</div>
            </div>
          </n-gi>
          <n-gi v-if="(formData.recordList || []).length" span="2">
            <div
              class="TemplateForm-table-wrap w-full"
              :style="{ '--template-form-table-max': `${TEMPLATE_MODAL_TABLE_RECORD_MAX}px` }"
            >
              <vxe-table
                border
                stripe
                show-overflow
                align="center"
                :size="appStore.componentSize"
                :data="formData.recordList || []"
                :max-height="TEMPLATE_MODAL_TABLE_RECORD_MAX"
              >
                <vxe-column field="code" title="退货单号" min-width="160" />
                <vxe-column field="purchaseReturnTypeName" title="退货方式" min-width="120" />
                <vxe-column field="totalQuantity" title="退货数量" min-width="110" />
                <vxe-column field="timeName" title="时间" min-width="170" />
                <vxe-column title="补发订单" min-width="180">
                  <template #default="{ row }">
                    {{ formatCodeList(row.resendOrderCodeList) }}
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
          </n-gi>
          <n-gi span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">退货明细</div>
            </div>
          </n-gi>
          <n-gi span="2">
            <div
              class="TemplateForm-table-wrap w-full"
              :style="{ '--template-form-table-max': `${TEMPLATE_MODAL_TABLE_MAX}px` }"
            >
              <vxe-table
                border
                stripe
                show-overflow
                align="center"
                :max-height="TEMPLATE_MODAL_TABLE_MAX"
                :data="formData.detailList || []"
              >
                <vxe-column field="name" title="物料名称" min-width="160" />
                <vxe-column title="规格1" min-width="150">
                  <template #default="{ row }">{{ getSpec1Name(row) }}</template>
                </vxe-column>
                <vxe-column title="规格2" min-width="150">
                  <template #default="{ row }">{{ getSpec2Name(row) }}</template>
                </vxe-column>
                <vxe-column field="unitName" title="单位" min-width="90" />
                <vxe-column field="totalQuantity" title="确认到货" min-width="110" />
                <vxe-column field="availableQuantity" title="剩余可退" min-width="110" />
                <vxe-column title="本次退货" min-width="140">
                  <template #default="{ row }">
                    <n-input-number
                      v-model:value="row.quantity"
                      :min="0"
                      :max="Number(row.availableQuantity || 0)"
                      :precision="2"
                      class="w-full"
                    />
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="showHandle = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmReturn">确定退货</n-button>
        </n-flex>
      </template>
    </FormModal>

    <FormModal v-model:show="showDetail" title="采购退货详情" size="xxl">
      <PurchaseModalDetailShell :loading="loading">
        <n-card title="退货详情" :bordered="false" class="detail-card">
          <n-descriptions bordered :column="2" label-placement="left">
            <n-descriptions-item label="退货单号">{{ detailData.code || "-" }}</n-descriptions-item>
            <n-descriptions-item label="采购订单">
              <n-button
                v-if="detailData.purchaseOrderCode"
                text
                type="info"
                @click="openRelatedOrder(detailData.purchaseOrderUid, detailData.purchaseOrderCode)"
              >
                {{ detailData.purchaseOrderCode }}
              </n-button>
              <span v-else>-</span>
            </n-descriptions-item>
            <n-descriptions-item label="退货方式">{{ detailData.purchaseReturnTypeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="退货时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="补发订单" :span="2">
              <n-space v-if="(detailData.resendOrderCodeList || []).length">
                <n-button
                  v-for="(code, index) in detailData.resendOrderCodeList"
                  :key="code"
                  text
                  type="info"
                  @click="openRelatedOrder(getResendOrderUid(index), code)"
                >
                  {{ code }}
                </n-button>
              </n-space>
              <span v-else>-</span>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card v-if="(detailData.recordList || []).length" title="退货操作记录" :bordered="false" class="detail-card">
          <vxe-table
            border
            stripe
            show-overflow
            align="center"
            :data="detailData.recordList || []"
            :max-height="TEMPLATE_MODAL_TABLE_RECORD_MAX"
          >
            <vxe-column field="code" title="退货单号" min-width="160" />
            <vxe-column field="purchaseReturnTypeName" title="退货方式" min-width="120" />
            <vxe-column field="totalQuantity" title="退货数量" min-width="110" />
            <vxe-column field="timeName" title="时间" min-width="170" />
            <vxe-column title="补发订单" min-width="180">
              <template #default="{ row }">
                {{ formatCodeList(row.resendOrderCodeList) }}
              </template>
            </vxe-column>
          </vxe-table>
        </n-card>

        <n-card title="退货明细" :bordered="false" class="detail-card">
          <vxe-table
            border
            stripe
            show-overflow
            align="center"
            :data="detailData.detailList || []"
            :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
          >
            <vxe-column field="name" title="物料名称" min-width="160" />
            <vxe-column title="规格1" min-width="150">
              <template #default="{ row }">{{ getSpec1Name(row) }}</template>
            </vxe-column>
            <vxe-column title="规格2" min-width="150">
              <template #default="{ row }">{{ getSpec2Name(row) }}</template>
            </vxe-column>
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="quantity" title="退货数量" min-width="110" />
          </vxe-table>
        </n-card>
      </PurchaseModalDetailShell>
    </FormModal>

    <PurchaseOrderRelatedModal v-model:show="showRelatedOrder" :uid="relatedOrder.uid" :code="relatedOrder.code" />
  </div>
</template>
