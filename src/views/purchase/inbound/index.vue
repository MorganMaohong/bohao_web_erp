<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { InventoryInboundDetail, InventoryInOrderForm, InventoryInOrderQuery, InventoryInOrderVo } from "@/model/inventory/inbound"
import { InventoryInOrderService } from "@/services/inventory/InventoryInOrderService"
import { WarehouseService } from "@/services/template/WarehouseService"
import { WarehouseQuery, WarehouseVo } from "@/model/stock"
import { resetRef } from "@/utils"
import { useAppStore } from "@/store/modules/app"
import { InventInOrderTypeDict, InventInOrderStatusDict } from "@/constants/enum"

const appStore = useAppStore()
const loading = ref(false)
const submitting = ref(false)
const showDetail = ref(false)
const showHandle = ref(false)

const query = ref<InventoryInOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  status: "",
  type: InventInOrderTypeDict.PURCHASE_INBOUND
})
const data = ref<PageVo<InventoryInOrderVo, any>>({})
const detailData = ref<InventoryInboundDetail>({ detailList: [], imageList: [] })
const formData = ref<InventoryInOrderForm>({ detailList: [] })
const warehouseQuery = ref<WarehouseQuery>({ currentPage: 1, pageSize: 500 })
const warehouseData = ref<PageVo<WarehouseVo, void>>({})

const warehouseOptions = ref<{ label: string; value: string }[]>([])

function loadWarehouseOptions() {
  return WarehouseService.select(warehouseQuery.value).then((res) => {
    warehouseData.value = res
    warehouseOptions.value = (res.list || []).map((item) => ({
      label: `【${item.code || "-"}】${item.name || "-"}`,
      value: item.uid as string
    }))
  })
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

function pageChange(event: VxePagerEvents) {
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

onMounted(() => {
  select()
  loadWarehouseOptions()
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <n-form inline :size="appStore.componentSize">
            <n-form-item label="关键字:">
              <n-input v-model:value="query.key" clearable placeholder="入库单号/备注" />
            </n-form-item>
            <n-form-item label="状态:">
              <n-select
                v-model:value="query.status"
                clearable
                :options="data.extraData?.statusOptions || []"
                label-field="name"
                value-field="uid"
                style="width: 180px"
              />
            </n-form-item>
            <n-form-item>
              <div class="flex gap-2">
                <n-button type="info" secondary strong @click="search">
                  <template #icon><n-icon><Search /></n-icon></template>
                  查询
                </n-button>
                <n-button secondary strong @click="reset">
                  <template #icon><n-icon><Reset /></n-icon></template>
                  重置
                </n-button>
              </div>
            </n-form-item>
          </n-form>
        </m-card>
      </template>

      <vxe-table border stripe show-overflow :loading="loading" :data="data.list || []" height="auto">
        <vxe-column field="code" title="采购入库单号" min-width="170" />
        <vxe-column field="purchaseOrderUid" title="采购订单" min-width="170" />
        <vxe-column field="warehouseName" title="仓库" min-width="140" />
        <vxe-column field="timeName" title="入库时间" min-width="170" />
        <vxe-column field="statusName" title="状态" min-width="100" />
        <vxe-column field="remark" title="备注" min-width="200" />
        <vxe-column title="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <n-button text type="info" @click="showDetailModal(row.uid)">详情</n-button>
              <n-button v-if="canHandle(row)" text type="primary" @click="showHandleModal(row.uid)">入库</n-button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>

      <template #footer>
        <vxe-pager
          perfect
          :current-page="query.currentPage"
          :page-size="query.pageSize"
          :total="data.count || 0"
          :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'Sizes', 'Total']"
          @page-change="pageChange"
        />
      </template>
    </l-card>

    <n-modal v-model:show="showHandle" preset="card" style="width: 1280px" title="采购入库执行">
      <n-form label-placement="left" label-width="90">
        <n-grid :cols="3" x-gap="12">
          <n-gi>
            <n-form-item label="入库单号">
              <n-input :value="formData.code" disabled />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="入库时间">
              <n-date-picker v-model:value="formData.time" type="datetime" class="w-full" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="入库仓库">
              <n-select v-model:value="formData.warehouseUid" :options="warehouseOptions" clearable />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="备注">
          <n-input v-model:value="formData.remark" type="textarea" />
        </n-form-item>
      </n-form>

      <div class="mb-3 flex justify-end">
        <n-button type="primary" secondary strong @click="useAllInbound">全部入库</n-button>
      </div>

      <vxe-table border stripe show-overflow :data="formData.detailList || []" max-height="420">
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

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showHandle = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmInbound">确定入库</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetail" preset="card" style="width: 1180px" title="采购入库详情">
      <n-spin :show="loading">
        <n-descriptions bordered :column="3">
          <n-descriptions-item label="入库单号">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="采购订单">{{ detailData.purchaseOrderUid || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="入库时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注">{{ detailData.remark || "-" }}</n-descriptions-item>
        </n-descriptions>
        <div class="mt-4">
          <vxe-table border stripe show-overflow :data="detailData.detailList || []" max-height="360">
            <vxe-column field="name" title="物料名称" min-width="160" />
            <vxe-column field="spec" title="规格型号" min-width="150" />
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="quantity" title="入库数量" min-width="110" />
            <vxe-column field="returnedQuantity" title="已退货数量" min-width="110" />
          </vxe-table>
        </div>
      </n-spin>
    </n-modal>
  </div>
</template>
