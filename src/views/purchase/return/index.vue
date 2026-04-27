<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { InventoryOutOrderForm, InventoryOutOrderQuery, InventoryOutOrderVo, InventoryOutboundDetail } from "@/model/inventory/outbound"
import { InventoryOutOrderService } from "@/services/inventory/InventoryOutOrderService"
import { resetRef } from "@/utils"
import { useAppStore } from "@/store/modules/app"
import { InventOutOrderTypeDict, InventOutOrderStatusDict, PurchaseReturnTypeDict } from "@/constants/enum"

const appStore = useAppStore()
const loading = ref(false)
const submitting = ref(false)
const showDetail = ref(false)
const showHandle = ref(false)

const query = ref<InventoryOutOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  status: "",
  purchaseReturnType: "",
  type: InventOutOrderTypeDict.PURCHASE_RETURN
})
const data = ref<PageVo<InventoryOutOrderVo, any>>({})
const detailData = ref<InventoryOutboundDetail>({ detailList: [], imageList: [] })
const formData = ref<InventoryOutOrderForm>({
  detailList: [],
  purchaseReturnType: PurchaseReturnTypeDict.REFUND
})

function select() {
  loading.value = true
  InventoryOutOrderService.select(query.value)
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
  query.value.type = InventOutOrderTypeDict.PURCHASE_RETURN
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
  formData.value.detailList = list
  formData.value.type = InventOutOrderTypeDict.PURCHASE_RETURN
  return true
}

function confirmReturn() {
  if (!validateForm() || submitting.value) return
  submitting.value = true
  InventoryOutOrderService.complete(formData.value)
    .then(() => {
      window.$message?.success("采购退货成功")
      showHandle.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

onMounted(() => {
  select()
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <n-form inline :size="appStore.componentSize">
            <n-form-item label="关键字:">
              <n-input v-model:value="query.key" clearable placeholder="退货单号/备注" />
            </n-form-item>
            <n-form-item label="退货方式:">
              <n-select
                v-model:value="query.purchaseReturnType"
                clearable
                :options="data.extraData?.purchaseReturnTypeOptions || []"
                label-field="name"
                value-field="uid"
                style="width: 180px"
              />
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
        <vxe-column field="code" title="采购退货单号" min-width="170" />
        <vxe-column field="purchaseOrderCode" title="采购订单" min-width="170" />
        <vxe-column field="purchaseReturnTypeName" title="退货方式" min-width="120" />
        <vxe-column field="totalQuantity" title="本次退货数量" min-width="120" />
        <vxe-column title="补发订单" min-width="200">
          <template #default="{ row }">
            {{ formatCodeList(row.resendOrderCodeList) }}
          </template>
        </vxe-column>
        <vxe-column field="timeName" title="退货时间" min-width="170" />
        <vxe-column field="statusName" title="状态" min-width="100" />
        <vxe-column title="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <n-button text type="info" @click="showDetailModal(row.uid)">详情</n-button>
              <n-button v-if="canHandle(row)" text type="primary" @click="showHandleModal(row.uid)">退货</n-button>
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

    <n-modal v-model:show="showHandle" preset="card" style="width: 1280px" title="采购退货执行">
      <n-form label-placement="left" label-width="100">
        <n-grid :cols="2" x-gap="12">
          <n-gi>
            <n-form-item label="退货单号">
              <n-input :value="formData.code" disabled />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="退货时间">
              <n-date-picker v-model:value="formData.time" type="datetime" class="w-full" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="退货方式">
          <n-radio-group v-model:value="formData.purchaseReturnType">
            <n-space>
              <n-radio :value="PurchaseReturnTypeDict.REFUND">退货退款</n-radio>
              <n-radio :value="PurchaseReturnTypeDict.RESEND">重新补发</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="formData.remark" type="textarea" />
        </n-form-item>
      </n-form>

      <div v-if="(formData.recordList || []).length" class="mb-4">
        <div class="text-base font-medium mb-2">历史退货记录</div>
        <vxe-table border stripe show-overflow :data="formData.recordList || []" max-height="220">
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

        <vxe-table border stripe show-overflow :data="formData.detailList || []" max-height="420">
          <vxe-column field="name" title="物料名称" min-width="160" />
          <vxe-column field="spec" title="规格型号" min-width="150" />
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

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showHandle = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmReturn">确定退货</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetail" preset="card" style="width: 1180px" title="采购退货详情">
      <n-spin :show="loading">
        <n-descriptions bordered :column="3">
          <n-descriptions-item label="退货单号">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="采购订单">{{ detailData.purchaseOrderCode || "-" }}</n-descriptions-item>
          <n-descriptions-item label="退货方式">{{ detailData.purchaseReturnTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="退货时间">{{ detailData.timeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="补发订单">{{ formatCodeList(detailData.resendOrderCodeList) }}</n-descriptions-item>
        </n-descriptions>
        <div v-if="(detailData.recordList || []).length" class="mt-4">
          <div class="text-base font-medium mb-2">退货操作记录</div>
          <vxe-table border stripe show-overflow :data="detailData.recordList || []" max-height="220">
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
        <div class="mt-4">
          <vxe-table border stripe show-overflow :data="detailData.detailList || []" max-height="360">
            <vxe-column field="name" title="物料名称" min-width="160" />
            <vxe-column field="spec" title="规格型号" min-width="150" />
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="quantity" title="退货数量" min-width="110" />
          </vxe-table>
        </div>
      </n-spin>
    </n-modal>
  </div>
</template>
