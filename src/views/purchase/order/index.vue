<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { PageVo } from "@/model"
import {
  PurchaseOrderDetail,
  PurchaseOrderForm,
  PurchaseOrderQuery,
  PurchaseOrderQueryData,
  PurchaseOrderVo
} from "@/model/purchase"
import { PurchaseOrderService } from "@/services/purchase/PurchaseOrderService"
import { useAppStore } from "@/store/modules/app"
import { resetRef } from "@/utils"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import { calcPriceWithoutTax, formatMoney, syncPurchasePriceRows, validatePurchasePriceRows } from "@/utils/purchasePrice"

const PurchaseOrderStatus = {
  WAIT_CONFIRM: "wait_confirm",
  REJECT: "reject"
} as const

const appStore = useAppStore()
const loading = ref(false)
const submitting = ref(false)
const showDetail = ref(false)
const showConfirm = ref(false)
const query = ref<PurchaseOrderQuery>({
  currentPage: 1,
  pageSize: 20,
  key: "",
  status: "",
  orderType: ""
})
const data = ref<PageVo<PurchaseOrderVo, PurchaseOrderQueryData>>({})
const detailData = ref<PurchaseOrderDetail>({ detailList: [], inboundOrderList: [] })
const confirmData = ref<PurchaseOrderForm>({ detailList: [] })

function select() {
  loading.value = true
  PurchaseOrderService.select(query.value)
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
  select()
}

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function showDetailModal(uid?: string) {
  if (!uid) return
  showDetail.value = true
  loading.value = true
  PurchaseOrderService.detail(uid)
    .then((res) => {
      detailData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function showConfirmModal(uid?: string) {
  if (!uid) return
  showConfirm.value = true
  submitting.value = true
  PurchaseOrderService.form(uid)
    .then((res) => {
      confirmData.value = res
    })
    .finally(() => {
      submitting.value = false
    })
}

function canConfirm(row?: PurchaseOrderVo) {
  return row?.status === PurchaseOrderStatus.WAIT_CONFIRM || row?.status === PurchaseOrderStatus.REJECT
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
    if (!item.purchasePriceWithoutTax || item.purchasePriceWithoutTax <= 0) {
      window.$message?.error(`【${item.name || "物料"}】不含税单价计算异常`)
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

onMounted(() => {
  select()
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
                  <n-input v-model:value="query.key" clearable placeholder="订单编号/备注" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="订单类型:">
                  <n-select
                    v-model:value="query.orderType"
                    clearable
                    :options="data.extraData?.orderTypeOptions || []"
                    label-field="name"
                    value-field="uid"
                  />
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
                    <n-button @click="search" type="info" icon-placement="left" secondary strong>
                      <template #icon>
                        <n-icon><Search /></n-icon>
                      </template>
                      查询
                    </n-button>
                    <n-button @click="reset" icon-placement="left" secondary strong>
                      <template #icon>
                        <n-icon><Reset /></n-icon>
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
        keep-source
        resizable
        :loading="loading"
        :data="data.list || []"
        :height="'auto'"
      >
        <vxe-column field="code" title="订单编号" min-width="170" />
        <vxe-column field="orderTypeName" title="订单类型" min-width="110" />
        <vxe-column field="applyOrderCode" title="申请单号" min-width="170" />
        <vxe-column field="sourceOrderCode" title="来源订单" min-width="170" />
        <vxe-column field="supplierName" title="供应商" min-width="140" />
        <vxe-column field="totalAmount" title="含税金额" min-width="120" />
        <vxe-column field="expectTimeName" title="预计到货" min-width="120" />
        <vxe-column field="statusName" title="状态" min-width="110" />
        <vxe-column field="createTime" title="创建时间" min-width="170" />
        <vxe-column title="操作" fixed="right" width="180">
          <template #default="{ row }">
            <div class="flex gap-2">
              <n-button text type="info" @click="showDetailModal(row.uid)">详情</n-button>
              <n-button v-if="canConfirm(row)" text type="primary" @click="showConfirmModal(row.uid)">确认订单</n-button>
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

    <n-modal v-model:show="showDetail" preset="card" style="width: 1200px" title="采购订单详情">
      <n-spin :show="loading">
        <n-descriptions bordered :column="3" label-placement="left">
          <n-descriptions-item label="订单编号">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="订单类型">{{ detailData.orderTypeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请单号">{{ detailData.applyOrderCode || "-" }}</n-descriptions-item>
          <n-descriptions-item label="来源订单">{{ detailData.sourceOrderCode || "-" }}</n-descriptions-item>
          <n-descriptions-item label="供应商">{{ detailData.supplierName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="预计到货">{{ detailData.expectTimeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="申请状态">{{ detailData.applyOrderStatusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注">{{ detailData.remark || "-" }}</n-descriptions-item>
        </n-descriptions>

        <div class="mt-4">
          <div class="font-600 mb-2">订单明细</div>
          <vxe-table border stripe show-overflow :data="detailData.detailList || []" max-height="320">
            <vxe-column field="name" title="物料名称" min-width="160" />
            <vxe-column field="spec" title="规格型号" min-width="150" />
            <vxe-column field="unitName" title="单位" min-width="90" />
            <vxe-column field="applyQuantity" title="申请数量" min-width="100" />
            <vxe-column field="quantity" title="到货数量" min-width="100" />
            <vxe-column field="inboundQuantity" title="已入库" min-width="100" />
            <vxe-column field="returnQuantity" title="已退货" min-width="100" />
            <vxe-column field="availableInboundQuantity" title="可入库" min-width="100" />
            <vxe-column field="availableReturnQuantity" title="可退货" min-width="100" />
            <vxe-column field="purchasePriceWithTax" title="含税单价" min-width="110" />
            <vxe-column field="vatTaxRate" title="税率(%)" min-width="90" />
          </vxe-table>
        </div>

        <div v-if="detailData.inboundOrderList?.length" class="mt-4">
          <div class="font-600 mb-2">相关采购入库</div>
          <vxe-table border stripe show-overflow :data="detailData.inboundOrderList || []" max-height="260">
            <vxe-column field="code" title="入库单号" min-width="170" />
            <vxe-column field="warehouseName" title="仓库" min-width="120" />
            <vxe-column field="timeName" title="入库时间" min-width="160" />
            <vxe-column field="totalQuantity" title="入库总数" min-width="110" />
            <vxe-column field="statusName" title="状态" min-width="100" />
          </vxe-table>
        </div>

        <div v-if="detailData.flowSchema" class="mt-4">
          <div class="font-600 mb-2">审批流程</div>
          <flow-schema-preview
            :flow-schema="detailData.flowSchema"
            :flow-type="FlowDefinitionTypeOptions.PURCHASE_ORDER_FLOW"
          />
        </div>
      </n-spin>
    </n-modal>

    <n-modal v-model:show="showConfirm" preset="card" style="width: 1280px" title="确认采购订单">
      <n-spin :show="submitting">
        <n-form label-placement="left" label-width="90">
          <n-grid :cols="3" x-gap="12">
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
          </n-grid>
          <n-form-item label="备注">
            <n-input v-model:value="confirmData.remark" type="textarea" maxlength="200" show-count />
          </n-form-item>
        </n-form>

        <vxe-table border stripe show-overflow :data="confirmData.detailList || []" max-height="420">
          <vxe-column field="name" title="物料名称" min-width="160" />
          <vxe-column field="spec" title="规格型号" min-width="150" />
          <vxe-column field="unitName" title="单位" min-width="90" />
          <vxe-column field="applyQuantity" title="申请数量" min-width="100" />
          <vxe-column title="到货数量" min-width="120">
            <template #default="{ row }">
              <n-input-number v-model:value="row.quantity" :min="0" :precision="2" class="w-full" />
            </template>
          </vxe-column>
          <vxe-column title="含税单价" min-width="130">
            <template #default="{ row }">
              <n-input-number v-model:value="row.purchasePriceWithTax" :min="0" :precision="4" class="w-full" />
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
          <vxe-column title="明细备注" min-width="180">
            <template #default="{ row }">
              <n-input v-model:value="row.remark" maxlength="100" />
            </template>
          </vxe-column>
        </vxe-table>
      </n-spin>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showConfirm = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmOrder">提交审批</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
