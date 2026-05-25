<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { Reset, Search } from "@vicons/carbon"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import {
  InventoryInboundDetail,
  InventoryInOrderForm,
  InventoryInOrderQuery,
  InventoryInOrderVo
} from "@/model/inventory/inbound"
import { InventoryInOrderService } from "@/services/inventory/InventoryInOrderService"
import { WarehouseService } from "@/services/template/WarehouseService"
import { OptionVo } from "@/model"
import { resetRef } from "@/utils"
import { useAppStore } from "@/store/modules/app"
import { InventInOrderStatusDict, InventInOrderTypeDict } from "@/constants/enum"
import {
  TEMPLATE_MODAL_TABLE_MAX,
  TEMPLATE_MODAL_TABLE_DETAIL_MAX
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

const query = ref<InventoryInOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  status: "",
  type: InventInOrderTypeDict.PURCHASE_INBOUND
})
const data = ref<PageVo<InventoryInOrderVo, any>>({
  currentPage: 1,
  pageSize: 20,
  count: 0,
  list: [],
  extraData: {}
})
const detailData = ref<InventoryInboundDetail>({ detailList: [], imageList: [] })
const formData = ref<InventoryInOrderForm>({ detailList: [] })
const warehouseOptions = ref<OptionVo[]>([])

function loadWarehouseOptions() {
  if (formData.value.warehouseOptions?.length) {
    warehouseOptions.value = formData.value.warehouseOptions
    return Promise.resolve()
  }
  return WarehouseService.options().then((list) => {
    warehouseOptions.value = list
  })
}

function getQueryString(value: unknown) {
  return Array.isArray(value) ? value[0] : (value as string | undefined)
}

function select() {
  loading.value = true
  return InventoryInOrderService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function openMatchedDetailByCode(code?: string) {
  if (!code) return
  const matched = (data.value.list || []).find((item) => item.code === code || item.purchaseOrderCode === code)
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

function search() {
  query.value.currentPage = 1
  select()
}

function reset() {
  query.value = resetRef(query.value)
  query.value.currentPage = 1
  query.value.pageSize = 20
  query.value.type = InventInOrderTypeDict.PURCHASE_INBOUND
  select()
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
  InventoryInOrderService.detail(uid)
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
  Promise.all([InventoryInOrderService.form(uid), loadWarehouseOptions()])
    .then(([res]) => {
      formData.value = res
      showHandle.value = true
    })
    .finally(() => {
      submitting.value = false
    })
}

function canHandle(row?: InventoryInOrderVo) {
  return row?.status === InventInOrderStatusDict.WAIT_COMPLETE
}

function useAllInbound() {
  ;(formData.value.detailList || []).forEach((item) => {
    item.quantity = Number(item.availableQuantity || 0)
  })
}

function validateForm() {
  if (!formData.value.warehouseUid) {
    window.$message?.error("请选择入库仓库")
    return false
  }
  const list = (formData.value.detailList || []).filter((item) => Number(item.quantity) > 0)
  if (!list.length) {
    window.$message?.error("请至少填写一条入库数量")
    return false
  }
  for (const item of list) {
    const quantity = Number(item.quantity) || 0
    const available = Number(item.availableQuantity) || 0
    if (quantity <= 0 || quantity > available) {
      window.$message?.error(`【${item.name || "物料"}】入库数量不能超过剩余可入库数量`)
      return false
    }
  }
  formData.value.detailList = list
  formData.value.type = InventInOrderTypeDict.PURCHASE_INBOUND
  return true
}

function confirmInbound() {
  if (!validateForm() || submitting.value) return
  submitting.value = true
  InventoryInOrderService.complete(formData.value)
    .then(() => {
      window.$message?.success("采购入库成功")
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
  loadWarehouseOptions()
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <n-form label-placement="left" :size="appStore.componentSize" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="关键字:">
                  <n-input v-model:value="query.key" clearable placeholder="入库单号/备注" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="状态:">
                  <n-select
                    v-model:value="query.status"
                    clearable
                    :options="data.extraData?.statusOptions || []"
                    label-field="name"
                    value-field="uid"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="info" secondary strong @click="search">
                      <template #icon>
                        <n-icon>
                          <Search />
                        </n-icon>
                      </template>
                      查询
                    </n-button>
                    <n-button secondary strong @click="reset">
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

      <vxe-table
        border
        stripe
        show-overflow
        align="center"
        :size="appStore.componentSize"
        :loading="loading"
        :data="data.list || []"
        height="auto"
      >
        <vxe-column field="code" title="采购入库单号" min-width="170">
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
        <vxe-column field="warehouseName" title="仓库" min-width="140" />
        <vxe-column field="timeName" title="入库时间" min-width="170" />
        <vxe-column field="statusName" title="状态" min-width="100" />
        <vxe-column field="remark" title="备注" min-width="200" />
        <vxe-column title="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex justify-center gap-2">
              <n-button text type="info" @click="showDetailModal(row.uid)">详情</n-button>
              <n-button v-if="canHandle(row)" text type="primary" @click="showHandleModal(row.uid)">入库</n-button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>

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

    <n-modal v-model:show="showHandle" preset="card" class="TemplateModal TemplateModal--xxl" title="采购入库执行">
      <n-spin :show="submitting">
      <n-form :model="formData" class="TemplateForm" label-placement="left" label-width="96">
          <n-grid cols="2" x-gap="16" y-gap="0">
            <n-gi span="2">
              <div class="TemplateForm-section">
                <div class="TemplateForm-section__title">入库信息</div>
              </div>
            </n-gi>
            <n-gi>
              <n-form-item label="入库单号">
                <n-input :value="formData.code" disabled />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="入库时间">
                <n-date-picker v-model:value="formData.time" type="datetime" class="w-full" clearable />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="入库仓库">
                <n-select
                  v-model:value="formData.warehouseUid"
                  :options="warehouseOptions"
                  filterable
                  clearable
                  placeholder="请选择入库仓库"
                  class="w-full"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <n-form-item label="备注">
                <n-input v-model:value="formData.remark" type="textarea" placeholder="请输入备注" />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <div class="TemplateForm-section TemplateForm-section__head">
                <div class="TemplateForm-section__title">入库明细</div>
                <n-button type="info" secondary @click="useAllInbound">全部入库</n-button>
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
            <vxe-column field="spec" title="规格型号" min-width="150" />
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="totalQuantity" title="订单数量" min-width="110" />
            <vxe-column field="availableQuantity" title="剩余可入库" min-width="110" />
            <vxe-column title="本次入库" min-width="140">
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
            <n-gi span="2">
              <div class="TemplateForm-actions">
                <n-flex justify="end">
                  <n-button @click="showHandle = false">取消</n-button>
                  <n-button type="primary" :loading="submitting" @click="confirmInbound">确定入库</n-button>
                </n-flex>
              </div>
            </n-gi>
          </n-grid>
        </n-form>
      </n-spin>
    </n-modal>

    <n-modal v-model:show="showDetail" preset="card" class="TemplateModal TemplateModal--xxl" title="采购入库详情">
      <PurchaseModalDetailShell :loading="loading">
        <n-card title="入库详情" :bordered="false" class="detail-card">
          <n-descriptions bordered :column="2" label-placement="left">
            <n-descriptions-item label="入库单号">{{ detailData.code || "-" }}</n-descriptions-item>
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
            <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="入库时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
            <n-descriptions-item label="备注" :span="2">{{ detailData.remark || "-" }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="入库明细" :bordered="false" class="detail-card">
          <vxe-table
            border
            stripe
            show-overflow
            align="center"
            :data="detailData.detailList || []"
            :max-height="TEMPLATE_MODAL_TABLE_DETAIL_MAX"
          >
            <vxe-column field="name" title="物料名称" min-width="160" />
            <vxe-column field="spec" title="规格型号" min-width="150" />
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="quantity" title="入库数量" min-width="110" />
            <vxe-column field="returnedQuantity" title="已退货数量" min-width="110" />
          </vxe-table>
        </n-card>
      </PurchaseModalDetailShell>
    </n-modal>

    <PurchaseOrderRelatedModal v-model:show="showRelatedOrder" :uid="relatedOrder.uid" :code="relatedOrder.code" />
  </div>
</template>

