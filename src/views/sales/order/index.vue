<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { Add } from "@vicons/carbon"
import { FormInst } from "naive-ui"
import { VxeTableInstance } from "vxe-table"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { OptionVo, PageVo } from "@/model"
import { InventoryOutOrderForm } from "@/model/inventory/outbound"
import { SalesOrderDetail, SalesOrderForm, SalesOrderQuery, SalesOrderQueryData, SalesOrderVo } from "@/model/sales"
import { ItemsQuery, ItemsVo } from "@/model/template/items"
import { WarehouseQuery, WarehouseVo } from "@/model/stock"
import { SalesOrderService } from "@/services/sales/SalesOrderService"
import { ItemsService } from "@/services/template/ItemsService"
import { WarehouseService } from "@/services/template/WarehouseService"
import { useAppStore } from "@/store/modules/app"
import { formatMoney } from "@/utils/purchasePrice"
import { formatItemSpecLabel, getSpec1Name, getSpec2Name } from "@/utils/itemSpec"

const SalesOrderStatus = {
  WAIT_CONFIRM: "wait_confirm",
  APPROVED: "approved",
  PART_OUT: "part_out"
} as const

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const loading = ref(false)
const submitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showItems = ref(false)
const showOutbound = ref(false)
const formRef = ref<FormInst>()
const outboundFormRef = ref<FormInst>()
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<any>()
const VxeItemsRef = ref<VxeTableInstance>()
const query = ref<SalesOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  customerUid: "",
  status: "",
  orderType: ""
})
const data = ref<PageVo<SalesOrderVo, SalesOrderQueryData>>({
  currentPage: 1,
  pageSize: 20,
  count: 0,
  list: [],
  extraData: {}
})
const formData = ref<SalesOrderForm>({ detailList: [] })
const detailData = ref<SalesOrderDetail>({ detailList: [], outboundOrderList: [] })
const deleteUid = ref("")
const itemsQuery = ref<ItemsQuery>({ currentPage: 1, pageSize: 50, key: "" })
const itemsData = ref<PageVo<ItemsVo, any>>({ currentPage: 1, pageSize: 50, count: 0, list: [], extraData: {} })
const outboundData = ref<InventoryOutOrderForm>({ detailList: [] })
const warehouseQuery = ref<WarehouseQuery>({ currentPage: 1, pageSize: 200 })
const warehouseOptions = ref<OptionVo[]>([])
const formRule = {
  customerUid: { required: true, message: "请选择客户", trigger: ["input", "blur"] },
  saleTime: { required: true, type: "number", message: "请选择销售日期", trigger: ["input", "blur"] },
  detailList: {
    required: true,
    validator() {
      if (!formData.value.detailList?.length) return new Error("销售明细不能为空")
      for (const item of formData.value.detailList) {
        if (!item.quantity || item.quantity <= 0) return new Error(`【${item.name}】销售数量必须大于0`)
        if (!item.salePriceWithTax || item.salePriceWithTax <= 0)
          return new Error(`【${item.name}】销售含税单价必须大于0`)
      }
      return true
    },
    trigger: ["input", "blur"]
  }
}
const outboundRule = {
  warehouseUid: { required: true, message: "请选择出库仓库", trigger: ["input", "blur"] },
  detailList: {
    required: true,
    validator() {
      if (!outboundData.value.detailList?.length) return new Error("出库明细不能为空")
      for (const item of outboundData.value.detailList) {
        if (!item.quantity || item.quantity <= 0) return new Error(`【${item.name}】出库数量必须大于0`)
        if (item.availableQuantity && item.quantity > item.availableQuantity)
          return new Error(`【${item.name}】出库数量不能大于待出库数量`)
      }
      return true
    },
    trigger: ["input", "blur"]
  }
}
const canEditForm = computed(() => !formData.value.uid || formData.value.status === SalesOrderStatus.WAIT_CONFIRM)

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  SalesOrderService.select(query.value)
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

const { triggerInputSearch, flushInputSearch, triggerSelectSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    query.value = { currentPage: 1, pageSize: 20, key: "", customerUid: "", status: "", orderType: "" }
  })
}

function pageChange(event: any) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function showUpdateModal(uid?: string) {
  showUpdate.value = true
  formData.value = { detailList: [] }
  SalesOrderService.form(uid).then((res) => {
    formData.value = { ...res, detailList: res.detailList || [] }
  })
}

function confirmUpdate(confirm = false) {
  formRef.value?.validate((err) => {
    if (err || submitting.value) return
    submitting.value = true
    const request = confirm ? SalesOrderService.confirm(formData.value) : SalesOrderService.addOrUpdate(formData.value)
    request
      .then(() => {
        showUpdate.value = false
        select()
      })
      .finally(() => {
        submitting.value = false
      })
  })
}

function showDeleteModal(uid: string) {
  deleteUid.value = uid
  showDelete.value = true
}

function confirmDelete() {
  if (!deleteUid.value) return
  submitting.value = true
  SalesOrderService.delete(deleteUid.value)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function showDetailModal(uid: string) {
  showDetail.value = true
  loading.value = true
  SalesOrderService.detail(uid)
    .then((res) => {
      detailData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function closeOrder(uid: string) {
  SalesOrderService.close(uid).then(() => select())
}

function cancelOrder(uid: string) {
  SalesOrderService.cancel(uid).then(() => select())
}

function selectItems() {
  loading.value = true
  ItemsService.select(itemsQuery.value)
    .then((res) => {
      itemsData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function showItemsModal() {
  showItems.value = true
  selectItems()
}

function confirmSelectItems() {
  const records = VxeItemsRef.value?.getCheckboxRecords() as ItemsVo[]
  const exists = new Set((formData.value.detailList || []).map((item) => item.itemUid))
  const appendList = (records || [])
    .filter((item) => item.uid && !exists.has(item.uid))
    .map((item) => ({
      itemUid: item.uid,
      name: item.name,
      image: item.image,
      type: item.type,
      typeName: item.typeName,
      unit: item.unit,
      unitName: item.unitName,
      spec: formatItemSpecLabel(item),
      spec1Name: item.spec1Name,
      spec2Name: item.spec2Name,
      material: item.material,
      vatTaxRate: item.vatTaxRate ? item.vatTaxRate * 100 : 0,
      salePriceWithTax: item.purchasePriceWithTax || 0,
      quantity: 1,
      remark: item.remark
    }))
  formData.value.detailList = [...(formData.value.detailList || []), ...appendList]
  showItems.value = false
}

function removeDetail(index: number) {
  formData.value.detailList?.splice(index, 1)
}

function showOutboundModal(uid: string) {
  showOutbound.value = true
  outboundData.value = { detailList: [] }
  SalesOrderService.outboundForm(uid).then((res) => {
    outboundData.value = { ...res, detailList: res.detailList || [] }
  })
}

function confirmOutbound() {
  outboundFormRef.value?.validate((err) => {
    if (err || submitting.value) return
    submitting.value = true
    SalesOrderService.outbound(outboundData.value)
      .then(() => {
        showOutbound.value = false
        select()
      })
      .finally(() => {
        submitting.value = false
      })
  })
}

function loadWarehouseOptions() {
  WarehouseService.select(warehouseQuery.value).then((res: PageVo<WarehouseVo, void>) => {
    warehouseOptions.value = (res.list || []).map((item) => ({ label: item.name, value: item.uid }))
  })
}

function canOutbound(row: SalesOrderVo) {
  return row.status === SalesOrderStatus.APPROVED || row.status === SalesOrderStatus.PART_OUT
}

onMounted(() => {
  select()
  loadWarehouseOptions()
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
          <SearchQueryForm label-placement="left" label-align="right" label-width="70" class="list-search-form">
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="关键字">
                    <n-input
                      class="w-full"
                      clearable
                      v-model:value="query.key"
                      placeholder="订单号/备注"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="客户">
                    <n-select
                      class="w-full"
                      clearable
                      v-model:value="query.customerUid"
                      :options="data.extraData?.customerOptions"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="状态">
                    <n-select
                      class="w-full"
                      clearable
                      v-model:value="query.status"
                      :options="data.extraData?.statusOptions"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="类型">
                    <n-select
                      class="w-full"
                      clearable
                      v-model:value="query.orderType"
                      :options="data.extraData?.orderTypeOptions"
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
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()">新增销售订单</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1 erp-list-table-wrap">
            <ListPageTable
              :data="data.list"
              :loading="loading"
              :size="componentSize"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
            >
              <vxe-column field="code" title="订单号" show-overflow="tooltip" align="center" width="150" />
              <vxe-column field="customerName" title="客户" show-overflow="tooltip" align="center" width="180" />
              <vxe-column field="orderTypeName" title="订单类型" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="statusName" title="状态" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="saleTimeName" title="销售日期" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="expectTimeName" title="期望出库" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="totalQuantity" title="数量" show-overflow="tooltip" align="center" width="100" />
              <vxe-column field="outboundQuantity" title="已出库" show-overflow="tooltip" align="center" width="100" />
              <vxe-column field="totalAmount" title="含税金额" show-overflow="tooltip" align="center" width="120">
                <template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template>
              </vxe-column>
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" min-width="180" />
              <vxe-column fixed="right" title="操作" align="center" width="250">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <n-button text type="info" :size="appStore.searchBarSize" @click="showDetailModal(row.uid)"
                      >详情</n-button
                    >
                    <n-button
                      v-if="row.status === SalesOrderStatus.WAIT_CONFIRM"
                      text
                      type="primary"
                      :size="appStore.searchBarSize"
                      @click="showUpdateModal(row.uid)"
                      >编辑</n-button
                    >
                    <n-button
                      v-if="canOutbound(row)"
                      text
                      type="success"
                      :size="appStore.searchBarSize"
                      @click="showOutboundModal(row.uid)"
                      >出库</n-button
                    >
                    <n-button
                      v-if="row.status === SalesOrderStatus.WAIT_CONFIRM"
                      text
                      type="warning"
                      :size="appStore.searchBarSize"
                      @click="cancelOrder(row.uid)"
                      >取消</n-button
                    >
                    <n-button
                      v-if="row.status !== SalesOrderStatus.WAIT_CONFIRM"
                      text
                      type="warning"
                      :size="appStore.searchBarSize"
                      @click="closeOrder(row.uid)"
                      >关闭</n-button
                    >
                    <n-button
                      v-if="row.status === SalesOrderStatus.WAIT_CONFIRM"
                      text
                      type="error"
                      :size="appStore.searchBarSize"
                      @click="showDeleteModal(row.uid)"
                      >删除</n-button
                    >
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
            :size="componentSize"
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

  <FormModal v-model:show="showUpdate" title="销售订单" size="xl">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="4" x-gap="12">
        <n-gi>
          <n-form-item label="订单号">
            <n-input disabled :value="formData.code" placeholder="自动生成" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="客户" path="customerUid">
            <n-select
              v-model:value="formData.customerUid"
              :disabled="!canEditForm"
              :options="formData.customerOptions"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="订单类型">
            <n-select
              v-model:value="formData.orderType"
              :disabled="!canEditForm"
              :options="formData.orderTypeOptions"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="销售日期" path="saleTime">
            <n-date-picker v-model:value="formData.saleTime" :disabled="!canEditForm" type="date" class="w-full" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="期望出库">
            <n-date-picker v-model:value="formData.expectTime" :disabled="!canEditForm" type="date" class="w-full" />
          </n-form-item>
        </n-gi>
        <n-gi span="3">
          <n-form-item label="备注">
            <n-input v-model:value="formData.remark" :disabled="!canEditForm" />
          </n-form-item>
        </n-gi>
      </n-grid>
      <n-form-item path="detailList">
        <div class="w-full">
          <div class="mb-2 flex justify-between items-center">
            <span class="font-medium">销售明细</span>
            <n-button v-if="canEditForm" type="info" secondary @click="showItemsModal">
              <template #icon
                ><n-icon><Add /></n-icon
              ></template>
              选择物料
            </n-button>
          </div>
          <vxe-table :data="formData.detailList" border :size="componentSize">
            <vxe-column field="name" title="物料" min-width="160" show-overflow="tooltip" />
            <vxe-column title="规格1" width="120" show-overflow="tooltip">
              <template #default="{ row }">{{ getSpec1Name(row) }}</template>
            </vxe-column>
            <vxe-column title="规格2" width="120" show-overflow="tooltip">
              <template #default="{ row }">{{ getSpec2Name(row) }}</template>
            </vxe-column>
            <vxe-column field="unitName" title="单位" width="90" />
            <vxe-column field="quantity" title="数量" width="140">
              <template #default="{ row }">
                <n-input-number v-model:value="row.quantity" :disabled="!canEditForm" :min="0" :show-button="false" />
              </template>
            </vxe-column>
            <vxe-column field="vatTaxRate" title="税率%" width="120">
              <template #default="{ row }">
                <n-input-number v-model:value="row.vatTaxRate" :disabled="!canEditForm" :min="0" :show-button="false" />
              </template>
            </vxe-column>
            <vxe-column field="salePriceWithTax" title="含税单价" width="150">
              <template #default="{ row }">
                <n-input-number
                  v-model:value="row.salePriceWithTax"
                  :disabled="!canEditForm"
                  :min="0"
                  :show-button="false"
                />
              </template>
            </vxe-column>
            <vxe-column field="remark" title="备注" min-width="150">
              <template #default="{ row }">
                <n-input v-model:value="row.remark" :disabled="!canEditForm" />
              </template>
            </vxe-column>
            <vxe-column v-if="canEditForm" title="操作" width="90" align="center">
              <template #default="{ rowIndex }">
                <n-button text type="error" @click="removeDetail(rowIndex)">移除</n-button>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showUpdate = false">取消</n-button>
        <n-button v-if="canEditForm" type="primary" @click="confirmUpdate(false)" :loading="submitting">保存</n-button>
        <n-button v-if="formData.uid && canEditForm" type="success" @click="confirmUpdate(true)" :loading="submitting">
          确认订单
        </n-button>
      </n-flex>
    </template>
  </FormModal>

  <FormModal v-model:show="showItems" title="选择物料" size="lg">
    <n-form inline :size="appStore.searchBarSize">
      <n-form-item label="关键字">
        <n-input v-model:value="itemsQuery.key" clearable placeholder="名称/编码" />
      </n-form-item>
      <n-form-item>
        <n-button type="info" @click="selectItems">搜索</n-button>
      </n-form-item>
    </n-form>
    <vxe-table ref="VxeItemsRef" :data="itemsData.list" border :size="componentSize" max-height="420">
      <vxe-column type="checkbox" width="50" />
      <vxe-column field="code" title="编码" width="130" />
      <vxe-column field="name" title="名称" min-width="160" />
      <vxe-column title="规格1" width="130">
        <template #default="{ row }">{{ getSpec1Name(row) }}</template>
      </vxe-column>
      <vxe-column title="规格2" width="130">
        <template #default="{ row }">{{ getSpec2Name(row) }}</template>
      </vxe-column>
      <vxe-column field="unitName" title="单位" width="90" />
      <vxe-column field="purchasePriceWithTax" title="参考含税价" width="130" />
    </vxe-table>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showItems = false">取消</n-button>
        <n-button type="primary" @click="confirmSelectItems">确定</n-button>
      </n-flex>
    </template>
  </FormModal>

  <FormModal v-model:show="showOutbound" title="销售出库" size="xl" :loading="submitting">
    <n-form :model="outboundData" ref="outboundFormRef" :rules="outboundRule">
      <n-grid cols="3" x-gap="12">
        <n-gi>
          <n-form-item label="出库仓库" path="warehouseUid">
            <n-select v-model:value="outboundData.warehouseUid" :options="warehouseOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="出库时间">
            <n-date-picker v-model:value="outboundData.time" type="datetime" class="w-full" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="销售订单">
            <n-input disabled :value="outboundData.bizName" />
          </n-form-item>
        </n-gi>
      </n-grid>
      <n-form-item path="detailList">
        <vxe-table :data="outboundData.detailList" border :size="componentSize">
          <vxe-column field="name" title="物料" min-width="160" />
          <vxe-column field="unitName" title="单位" width="90" />
          <vxe-column field="availableQuantity" title="待出库" width="120" />
          <vxe-column field="quantity" title="本次出库" width="160">
            <template #default="{ row }">
              <n-input-number v-model:value="row.quantity" :min="0" :max="row.availableQuantity" :show-button="false" />
            </template>
          </vxe-column>
          <vxe-column field="remark" title="备注" min-width="160">
            <template #default="{ row }">
              <n-input v-model:value="row.remark" />
            </template>
          </vxe-column>
        </vxe-table>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showOutbound = false">取消</n-button>
        <n-button type="primary" @click="confirmOutbound" :loading="submitting">确认出库</n-button>
      </n-flex>
    </template>
  </FormModal>

  <FormModal v-model:show="showDetail" title="销售订单详情" size="lg">
    <n-descriptions :column="4" bordered size="small">
      <n-descriptions-item label="订单号">{{ detailData.code }}</n-descriptions-item>
      <n-descriptions-item label="客户">{{ detailData.customerName }}</n-descriptions-item>
      <n-descriptions-item label="状态">{{ detailData.statusName }}</n-descriptions-item>
      <n-descriptions-item label="订单类型">{{ detailData.orderTypeName }}</n-descriptions-item>
      <n-descriptions-item label="销售日期">{{ detailData.saleTimeName }}</n-descriptions-item>
      <n-descriptions-item label="期望出库">{{ detailData.expectTimeName }}</n-descriptions-item>
      <n-descriptions-item label="总数量">{{ detailData.totalQuantity }}</n-descriptions-item>
      <n-descriptions-item label="已出库">{{ detailData.outboundQuantity }}</n-descriptions-item>
    </n-descriptions>
    <div class="mt-4 font-medium">销售明细</div>
    <vxe-table :data="detailData.detailList" border :size="componentSize" max-height="300">
      <vxe-column field="name" title="物料" min-width="160" />
      <vxe-column title="规格1" width="120">
        <template #default="{ row }">{{ getSpec1Name(row) }}</template>
      </vxe-column>
      <vxe-column title="规格2" width="120">
        <template #default="{ row }">{{ getSpec2Name(row) }}</template>
      </vxe-column>
      <vxe-column field="unitName" title="单位" width="90" />
      <vxe-column field="quantity" title="数量" width="100" />
      <vxe-column field="outboundQuantity" title="已出库" width="100" />
      <vxe-column field="availableOutboundQuantity" title="待出库" width="100" />
      <vxe-column field="salePriceWithTax" title="含税单价" width="120" />
      <vxe-column field="totalAmount" title="含税金额" width="120" />
    </vxe-table>
    <div class="mt-4 font-medium">出库记录</div>
    <vxe-table :data="detailData.outboundOrderList" border :size="componentSize" max-height="220">
      <vxe-column field="code" title="出库单号" width="150" />
      <vxe-column field="warehouseName" title="仓库" width="150" />
      <vxe-column field="timeName" title="出库时间" width="170" />
      <vxe-column field="totalQuantity" title="数量" width="100" />
      <vxe-column field="statusName" title="状态" width="100" />
      <vxe-column field="remark" title="备注" min-width="160" />
    </vxe-table>
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
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
