<script lang="ts" setup>
import { computed } from "vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ErTableThumb from "@/components/ErTableThumb/index.vue"
import { useAppStore } from "@/store/modules/app"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { OptionVo } from "@/model"
import {
  calcAmountWithoutTax,
  calcAmountWithTax,
  calcTaxAmount,
  formatMoney
} from "@/utils/purchasePrice"
import {
  displayPurchasePriceWithoutTax,
  displayPurchaseTaxAmount,
  displaySalePriceWithoutTax,
  ensureItemPrice,
  getPurchasePriceWithTax,
  getSalePriceWithTax,
  getVatTaxRate,
  syncNestedItemPrice
} from "@/utils/itemPrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"
import { getItemDetailTablePreset, ItemDetailTablePreset } from "@/constants/item-detail-table"
import { normalizeItemDetailRow } from "@/utils/itemDetailRow"

const props = withDefaults(
  defineProps<{
    data?: Record<string, unknown>[]
    preset: ItemDetailTablePreset
    loading?: boolean
    maxHeight?: number | string
    emptyDescription?: string
    supplierOptions?: OptionVo[]
  }>(),
  {
    data: () => [],
    loading: false,
    emptyDescription: "无数据"
  }
)

const emit = defineEmits<{
  delete: [row: Record<string, unknown>, index: number]
}>()

const appStore = useAppStore()
const { canViewItemPrice } = useItemPricePermission()
const componentSize = computed(() => appStore.componentSize as any)
const config = computed(() => getItemDetailTablePreset(props.preset))
const rows = computed(() => (props.data ?? []).map((row) => normalizeItemDetailRow(row)))

/** 编辑态新行常无 uid，须用 itemUid 作行键，避免虚拟滚动复用行导致下拉重复渲染 */
const rowConfig = computed(() => ({
  isHover: true,
  keyField: config.value.mode === "edit" ? "itemUid" : "uid"
}))

/** 表格内嵌下拉框与虚拟滚动冲突，需关闭纵向虚拟滚动 */
const scrollY = computed(() => (config.value.supplierEditable ? { enabled: false } : undefined))

const normalizedSupplierOptions = computed(() => {
  const seen = new Set<string>()
  return (props.supplierOptions || []).filter((opt) => {
    const value = String(opt.value ?? "")
    if (!value || seen.has(value)) return false
    seen.add(value)
    return true
  })
})

function bizTypeTagType(itemBizType?: string) {
  if (itemBizType === "finished_product") return "success"
  if (itemBizType === "component") return "info"
  return "default"
}

function syncDetailPrice(row: Record<string, unknown>) {
  syncNestedItemPrice(row)
}

function calcProfitQuantity(row: Record<string, unknown>) {
  const stock = Number(row.totalQuantity) || 0
  const input = Number(row.quantity) || 0
  return Math.max(input - stock, 0)
}

function calcLossQuantity(row: Record<string, unknown>) {
  const stock = Number(row.totalQuantity) || 0
  const input = Number(row.quantity) || 0
  return Math.max(stock - input, 0)
}

function calcRemainIssueQuantity(row: Record<string, unknown>) {
  return Math.max(Number(row.quantity || 0) - Number(row.issuedQuantity || 0), 0)
}
</script>

<template>
  <m-card class="w-full erp-list-table-wrap item-detail-table" padding="0">
    <ListPageTable
      v-if="rows.length > 0"
      :data="rows"
      :loading="loading"
      :cell-height="64"
      :max-height="maxHeight"
      :size="componentSize"
      :row-config="rowConfig"
      :scroll-y="scrollY"
    >
      <vxe-column
        v-if="config.showBatchNo"
        field="batchNo"
        title="批次号"
        show-overflow="tooltip"
        align="center"
        min-width="140"
      >
        <template v-if="config.mode === 'edit'" #default="{ row }">
          <vxe-input
            placeholder="自动生成批次号"
            :disabled="!config.batchNoEditable"
            v-model="row.batchNo"
          />
        </template>
      </vxe-column>
      <vxe-column v-if="config.showCode" title="物料编码" show-overflow="tooltip" align="center" min-width="160">
        <template #default="{ row }">{{ row.code || row.itemCode || "—" }}</template>
      </vxe-column>
      <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" min-width="160" />
      <vxe-column
        v-if="config.supplierEditable"
        title="预期供应商"
        show-overflow="tooltip"
        align="center"
        min-width="160"
      >
        <template #default="{ row, rowIndex }">
          <n-select
            :key="`supplier-${row.itemUid || row.uid || rowIndex}`"
            filterable
            clearable
            :size="componentSize"
            :options="normalizedSupplierOptions"
            v-model:value="row.supplierUid"
            @click.stop
          />
        </template>
      </vxe-column>
      <vxe-column v-if="config.showImage" title="图片" align="center" width="72">
        <template #default="{ row }">
          <ErTableThumb :src="row.image" />
        </template>
      </vxe-column>
      <vxe-column field="typeName" title="品类" show-overflow="tooltip" align="center" min-width="140" />
      <vxe-column v-if="config.showItemBizType" title="业务类型" align="center" min-width="100">
        <template #default="{ row }">
          <n-tag
            v-if="row.itemBizTypeName"
            size="small"
            :type="bizTypeTagType(row.itemBizType)"
            :bordered="false"
          >
            {{ row.itemBizTypeName }}
          </n-tag>
          <span v-else>—</span>
        </template>
      </vxe-column>
      <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" min-width="70" />
      <vxe-column v-if="config.showBrand" field="brand" title="品牌" show-overflow="tooltip" align="center" min-width="110" />
      <vxe-column title="规格1" show-overflow="tooltip" align="center" min-width="110">
        <template #default="{ row }">{{ getSpec1Name(row) }}</template>
      </vxe-column>
      <vxe-column title="规格2" show-overflow="tooltip" align="center" min-width="110">
        <template #default="{ row }">{{ getSpec2Name(row) }}</template>
      </vxe-column>
      <vxe-column
        v-if="config.showSupplier"
        field="supplierName"
        title="供应商"
        show-overflow="tooltip"
        align="center"
        min-width="140"
      />
      <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" min-width="140" />

      <template v-if="config.priceMode === 'readonly' && canViewItemPrice">
        <vxe-column title="税率%" align="center" min-width="88" class-name="erp-list-table__col-secondary">
          <template #default="{ row }">
            <span>{{ getVatTaxRate(row) != null ? `${getVatTaxRate(row)}%` : "—" }}</span>
          </template>
        </vxe-column>
        <vxe-column title="采购含税" align="center" min-width="116">
          <template #default="{ row }">
            <span class="erp-list-table__money">{{ formatMoney(getPurchasePriceWithTax(row)) }}</span>
          </template>
        </vxe-column>
        <vxe-column title="采购不含税" align="center" min-width="116" class-name="erp-list-table__col-secondary">
          <template #default="{ row }">
            <span class="erp-list-table__money">{{ displayPurchasePriceWithoutTax(row) }}</span>
          </template>
        </vxe-column>
        <vxe-column
          v-if="!config.showLineAmount"
          title="采购税额"
          align="center"
          min-width="100"
          class-name="erp-list-table__col-secondary"
        >
          <template #default="{ row }">
            <span class="erp-list-table__money">{{ displayPurchaseTaxAmount(row) }}</span>
          </template>
        </vxe-column>
        <template v-if="config.priceScope !== 'purchase'">
          <vxe-column title="销售含税" align="center" min-width="116">
            <template #default="{ row }">
              <span class="erp-list-table__money">{{ formatMoney(getSalePriceWithTax(row)) }}</span>
            </template>
          </vxe-column>
          <vxe-column title="销售不含税" align="center" min-width="116" class-name="erp-list-table__col-secondary">
            <template #default="{ row }">
              <span class="erp-list-table__money">{{ displaySalePriceWithoutTax(row) }}</span>
            </template>
          </vxe-column>
        </template>
      </template>

      <template v-else-if="config.priceMode === 'edit' && canViewItemPrice">
        <vxe-column title="税率%" show-overflow="tooltip" align="center" min-width="100">
          <template #default="{ row }">
            <vxe-number-input
              v-model="ensureItemPrice(row).vatTaxRate"
              @change="syncDetailPrice(row)"
              @wheel.stop
            />
          </template>
        </vxe-column>
        <vxe-column title="采购含税" show-overflow="tooltip" align="center" min-width="116">
          <template #default="{ row }">
            <vxe-number-input
              v-model="ensureItemPrice(row).purchasePriceWithTax"
              @change="syncDetailPrice(row)"
              @wheel.stop
            />
          </template>
        </vxe-column>
        <vxe-column title="采购不含税" show-overflow="tooltip" align="center" min-width="116">
          <template #default="{ row }">
            <vxe-number-input v-model="ensureItemPrice(row).purchasePriceWithoutTax" disabled />
          </template>
        </vxe-column>
        <vxe-column title="采购税额" show-overflow="tooltip" align="center" min-width="100">
          <template #default="{ row }">
            <vxe-number-input v-model="ensureItemPrice(row).taxAmount" disabled />
          </template>
        </vxe-column>
        <vxe-column title="销售含税" show-overflow="tooltip" align="center" min-width="116">
          <template #default="{ row }">
            <vxe-number-input
              v-model="ensureItemPrice(row).salePriceWithTax"
              @change="syncDetailPrice(row)"
              @wheel.stop
            />
          </template>
        </vxe-column>
        <vxe-column title="销售不含税" show-overflow="tooltip" align="center" min-width="116">
          <template #default="{ row }">
            <vxe-number-input v-model="ensureItemPrice(row).salePriceWithoutTax" disabled />
          </template>
        </vxe-column>
      </template>

      <vxe-column
        v-if="config.showRemark && !config.remarkAfterQuantity"
        field="remark"
        title="备注"
        show-overflow="tooltip"
        align="center"
        min-width="160"
        class-name="erp-list-table__col-secondary"
      >
        <template v-if="config.mode === 'edit' && config.remarkEditable !== false" #default="{ row }">
          <n-input v-model:value="row.remark" placeholder="备注" />
        </template>
      </vxe-column>

      <vxe-column
        v-if="config.showStock && config.showTotalStock !== false"
        field="totalQuantity"
        :title="config.stockQuantityLabel ?? '库存数量'"
        align="center"
        show-overflow="tooltip"
        min-width="100"
        :fixed="config.quantity?.fixed"
      >
        <template #default="{ row }">
          <span>{{ row.totalQuantity ?? "—" }}</span>
        </template>
      </vxe-column>
      <vxe-column
        v-if="config.showStock && config.showAvailableStock !== false"
        field="availableQuantity"
        title="可用库存"
        align="center"
        show-overflow="tooltip"
        min-width="100"
        :fixed="config.quantity?.fixed"
      >
        <template #default="{ row }">
          <span>{{ row.availableQuantity ?? "—" }}</span>
        </template>
      </vxe-column>

      <vxe-column
        v-if="config.showApplyQuantity"
        field="applyQuantity"
        title="申请数量"
        align="center"
        show-overflow="tooltip"
        min-width="100"
      />

      <vxe-column
        v-if="config.quantity"
        field="quantity"
        :title="config.quantity.label"
        align="center"
        show-overflow="tooltip"
        min-width="110"
        :fixed="config.quantity.fixed"
      >
        <template v-if="config.quantity.editable" #default="{ row }">
          <vxe-number-input
            v-model="row.quantity"
            :min="config.quantity.min ?? 1"
            :max="
              config.quantity.maxField
                ? Number(row[config.quantity.maxField as keyof typeof row]) || 0
                : undefined
            "
            @wheel.stop
          />
        </template>
      </vxe-column>

      <vxe-column
        v-if="config.showIssuedQuantity"
        field="issuedQuantity"
        title="已出库"
        align="center"
        show-overflow="tooltip"
        min-width="100"
        :fixed="config.quantity?.fixed"
      />

      <vxe-column
        v-if="config.showRemainQuantity"
        title="剩余可出库"
        align="center"
        show-overflow="tooltip"
        min-width="110"
        :fixed="config.quantity?.fixed"
      >
        <template #default="{ row }">{{ calcRemainIssueQuantity(row) }}</template>
      </vxe-column>

      <vxe-column
        v-if="config.showIssueQuantity"
        field="issueQuantity"
        title="本次出库"
        align="center"
        show-overflow="tooltip"
        min-width="140"
        :fixed="config.quantity?.fixed"
      >
        <template #default="{ row }">
          <vxe-number-input
            v-model="row.issueQuantity"
            :show-button="false"
            :min="0"
            :max="calcRemainIssueQuantity(row)"
            :controls="false"
            @wheel.stop
          />
        </template>
      </vxe-column>

      <vxe-column
        v-if="config.showRemark && config.remarkAfterQuantity"
        field="remark"
        title="备注"
        show-overflow="tooltip"
        align="center"
        min-width="160"
        class-name="erp-list-table__col-secondary"
        :fixed="config.quantity?.fixed"
      >
        <template v-if="config.mode === 'edit' && config.remarkEditable !== false" #default="{ row }">
          <n-input v-model:value="row.remark" placeholder="备注" />
        </template>
      </vxe-column>

      <vxe-column
        v-if="config.showInboundQuantity"
        field="inboundQuantity"
        title="已入库"
        align="center"
        show-overflow="tooltip"
        min-width="100"
      />
      <vxe-column
        v-if="config.showReturnQuantity"
        field="returnQuantity"
        title="已退货"
        align="center"
        show-overflow="tooltip"
        min-width="100"
      />
      <vxe-column
        v-if="config.showAvailableInboundQuantity"
        field="availableInboundQuantity"
        title="可入库"
        align="center"
        show-overflow="tooltip"
        min-width="100"
      />
      <vxe-column
        v-if="config.showAvailableReturnQuantity"
        field="availableReturnQuantity"
        title="可退货"
        align="center"
        show-overflow="tooltip"
        min-width="100"
      />

      <template v-if="config.showLineAmount && canViewItemPrice">
        <vxe-column title="税额" align="center" min-width="110" class-name="erp-list-table__col-secondary">
          <template #default="{ row }">
            <span class="erp-list-table__money">
              {{ formatMoney(calcTaxAmount(getPurchasePriceWithTax(row), getVatTaxRate(row), Number(row.quantity) || 0)) }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="含税小计" align="center" min-width="120">
          <template #default="{ row }">
            <span class="erp-list-table__money">
              {{ formatMoney(calcAmountWithTax(getPurchasePriceWithTax(row), Number(row.quantity) || 0)) }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="不含税小计" align="center" min-width="120" class-name="erp-list-table__col-secondary">
          <template #default="{ row }">
            <span class="erp-list-table__money">
              {{
                formatMoney(
                  calcAmountWithoutTax(getPurchasePriceWithTax(row), getVatTaxRate(row), Number(row.quantity) || 0)
                )
              }}
            </span>
          </template>
        </vxe-column>
      </template>

      <template v-if="config.showCheckDiff">
        <vxe-column
          v-if="config.mode === 'edit'"
          title="本次盘盈数量"
          align="center"
          show-overflow="tooltip"
          min-width="110"
          fixed="right"
        >
          <template #default="{ row }">
            <vxe-number-input disabled :model-value="calcProfitQuantity(row)" />
          </template>
        </vxe-column>
        <vxe-column
          v-else
          field="profitQuantity"
          title="盘盈数量"
          align="center"
          show-overflow="tooltip"
          min-width="110"
          fixed="right"
        />
        <vxe-column
          v-if="config.mode === 'edit'"
          title="本次盘亏数量"
          align="center"
          show-overflow="tooltip"
          min-width="110"
          fixed="right"
        >
          <template #default="{ row }">
            <vxe-number-input disabled :model-value="calcLossQuantity(row)" />
          </template>
        </vxe-column>
        <vxe-column
          v-else
          field="lossQuantity"
          title="盘亏数量"
          align="center"
          show-overflow="tooltip"
          min-width="110"
          fixed="right"
        />
      </template>

      <vxe-column
        v-if="config.showDelete"
        fixed="right"
        title="操作"
        align="center"
        show-overflow="tooltip"
        width="72"
      >
        <template #default="{ row, rowIndex }">
          <n-flex justify="center">
            <n-button type="error" text @click="emit('delete', row, rowIndex)">删除</n-button>
          </n-flex>
        </template>
      </vxe-column>
    </ListPageTable>
    <el-empty v-else :image-size="80" class="TemplateForm-empty" :description="emptyDescription" />
  </m-card>
</template>

<style lang="scss" scoped>
.item-detail-table {
  overscroll-behavior: contain;

  :deep(.vxe-table--body-wrapper),
  :deep(.vxe-table--body-inner-wrapper) {
    overscroll-behavior: contain;
  }
}
</style>
