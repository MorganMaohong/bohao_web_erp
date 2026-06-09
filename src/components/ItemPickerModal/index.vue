<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { debounce } from "lodash-es"
import FormModal from "@/components/FormModal/index.vue"
import ErTableThumb from "@/components/ErTableThumb/index.vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { useAppStore } from "@/store/modules/app"
import { PageVo } from "@/model"
import { InventoryQueryData } from "@/model/inventory"
import { ItemsForm, ItemsQueryData } from "@/model/template/items"
import { getItemPickerScenarioConfig, ItemPickerScenario } from "@/constants/item-picker"
import { ItemPickerQuery, ItemPickerQueryData, ItemPickerService, ItemPickerVo } from "@/services/ItemPickerService"
import { ItemsService } from "@/services/template/ItemsService"
import { ItemDictService } from "@/services/template/ItemDictService"
import { TEMPLATE_MODAL_TABLE_PICKER_MAX } from "@/constants/template-ui"
import { ERP_LIST_TABLE_SCROLL_X, ERP_LIST_TABLE_SCROLL_Y } from "@/constants/list-table"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { formatMoney } from "@/utils/purchasePrice"
import {
  displayPurchasePriceWithoutTax,
  displayPurchaseTaxAmount,
  displaySalePriceWithoutTax,
  getPurchasePriceWithTax,
  getSalePriceWithTax,
  getVatTaxRate
} from "@/utils/itemPrice"
import { useItemPricePermission } from "@/composables/useItemPricePermission"
import { VxeTableInstance } from "vxe-table"

const props = withDefaults(
  defineProps<{
    show: boolean
    scenario: ItemPickerScenario
    warehouseUid?: string
    title?: string
  }>(),
  {
    title: "物料信息"
  }
)

const emit = defineEmits<{
  "update:show": [value: boolean]
  confirm: [records: ItemPickerVo[]]
}>()

const appStore = useAppStore()
const { canViewItemPrice } = useItemPricePermission()
const componentSize = computed(() => appStore.componentSize as any)
const scenarioConfig = computed(() => getItemPickerScenarioConfig(props.scenario))
const loading = ref(false)
const query = ref<ItemPickerQuery>({
  scenario: props.scenario,
  currentPage: 1,
  pageSize: 50
})
const data = ref<PageVo<ItemPickerVo, ItemPickerQueryData>>({
  currentPage: 1,
  pageSize: 50,
  count: 0,
  list: [],
  extraData: {}
})
const queryFormData = ref<ItemsForm>({})
const querySpec1Options = ref<ItemsForm["spec1Options"]>([])
const querySpec2Options = ref<ItemsForm["spec2Options"]>([])
const queryBrandOptions = ref<ItemsForm["brandOptions"]>([])
const queryCascadeKey = ref(0)
const showAdvancedFilter = ref(false)
const tableRef = ref<VxeTableInstance>()
const rootRef = ref<HTMLElement | null>(null)
const filterRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const tableMaxHeight = ref(TEMPLATE_MODAL_TABLE_PICKER_MAX)
let tableResizeObserver: ResizeObserver | null = null

const TABLE_MIN_HEIGHT = 280

const advancedFilterCount = computed(() => {
  let count = 0
  if (query.value.spec1Uid) count++
  if (query.value.spec2Uid) count++
  if (query.value.brandUid) count++
  if (query.value.itemBizType) count++
  return count
})

function syncTableMaxHeight() {
  const root = rootRef.value
  if (root) {
    const filterHeight = filterRef.value?.offsetHeight ?? 0
    const footerHeight = footerRef.value?.offsetHeight ?? 0
    const available = root.clientHeight - filterHeight - footerHeight - 12
    if (available >= TABLE_MIN_HEIGHT) {
      tableMaxHeight.value = available
      return
    }
  }

  const viewportBudget = window.innerHeight - 48
  const filterApprox = showAdvancedFilter.value ? 200 : 110
  const chromeApprox = 220
  tableMaxHeight.value = Math.max(
    TABLE_MIN_HEIGHT,
    Math.min(TEMPLATE_MODAL_TABLE_PICKER_MAX, viewportBudget - filterApprox - chromeApprox)
  )
}

const debouncedSyncTableMaxHeight = debounce(() => {
  syncTableMaxHeight()
  nextTick(() => tableRef.value?.recalculate?.())
}, 80)

function bindTableResizeObserver() {
  tableResizeObserver?.disconnect()
  if (!rootRef.value) return
  tableResizeObserver = new ResizeObserver(() => debouncedSyncTableMaxHeight())
  tableResizeObserver.observe(rootRef.value)
  if (filterRef.value) tableResizeObserver.observe(filterRef.value)
}

function unbindTableResizeObserver() {
  tableResizeObserver?.disconnect()
  tableResizeObserver = null
}

function bizTypeTagType(itemBizType?: string) {
  if (itemBizType === "finished_product") return "success"
  if (itemBizType === "component") return "info"
  return "default"
}

function syncScenarioQuery() {
  query.value.scenario = props.scenario
  if (scenarioConfig.value.dataSource === "items") {
    query.value.warehouseUid = props.warehouseUid
    query.value.warehouseUidList = undefined
  } else {
    query.value.warehouseUid = undefined
    query.value.warehouseUidList = props.warehouseUid ? [props.warehouseUid] : undefined
  }
}

function select() {
  syncScenarioQuery()
  loading.value = true
  ItemPickerService.select(query.value)
    .then((res) => {
      data.value = res
      if (query.value.type) {
        const extra = res.extraData as ItemsQueryData | InventoryQueryData
        querySpec1Options.value = extra?.spec1Options || querySpec1Options.value
        querySpec2Options.value = extra?.spec2Options || querySpec2Options.value
        queryBrandOptions.value = extra?.brandOptions || queryBrandOptions.value
      } else if (!query.value.type) {
        querySpec1Options.value = []
        querySpec2Options.value = []
        queryBrandOptions.value = []
      }
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

function clearQueryCascade() {
  query.value.spec1Uid = undefined
  query.value.spec2Uid = undefined
  query.value.brandUid = undefined
  querySpec1Options.value = []
  querySpec2Options.value = []
  queryBrandOptions.value = []
}

async function reset() {
  await withResetSuppressed(async () => {
    clearQueryCascade()
    query.value.key = undefined
    query.value.code = undefined
    query.value.itemBizType = undefined
    query.value.type = undefined
    query.value.currentPage = 1
    query.value.pageSize = 50
    queryCascadeKey.value += 1
  })
}

function pageChange(event: { currentPage: number; pageSize: number }) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

async function handleQueryTypeValue(v: string | null) {
  clearQueryCascade()
  if (!v) {
    triggerSelectSearch()
    return
  }
  try {
    const picker = await ItemDictService.treePicker(v)
    querySpec1Options.value = picker.spec1Options || []
    querySpec2Options.value = picker.spec2Options || []
    queryBrandOptions.value = picker.brandOptions || []
  } catch {
    querySpec1Options.value = []
    querySpec2Options.value = []
    queryBrandOptions.value = []
  }
  triggerSelectSearch()
}

function loadQueryOptions() {
  ItemsService.form().then((res) => {
    queryFormData.value = res
  })
}

function resetModalState() {
  clearQueryCascade()
  query.value = {
    scenario: props.scenario,
    currentPage: 1,
    pageSize: 50
  }
  data.value = {
    currentPage: 1,
    pageSize: 50,
    count: 0,
    list: [],
    extraData: {}
  }
  showAdvancedFilter.value = false
  queryCascadeKey.value += 1
  syncScenarioQuery()
}

function updateShow(value: boolean) {
  emit("update:show", value)
}

function confirmSelect() {
  const records = tableRef.value?.getCheckboxRecords() as ItemPickerVo[] | undefined
  if (!records?.length) {
    window.$message?.warning("请选择物料")
    return
  }
  emit("confirm", records)
  updateShow(false)
}

watch(
  () => query.value.spec1Uid,
  (value) => {
    if (!value) query.value.spec2Uid = undefined
  }
)

watch(
  () => [query.value.itemBizType, query.value.spec1Uid, query.value.spec2Uid, query.value.brandUid],
  () => {
    triggerSelectSearch()
  }
)

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      unbindTableResizeObserver()
      return
    }
    if (scenarioConfig.value.requireWarehouse && !props.warehouseUid) {
      window.$message?.error(scenarioConfig.value.warehouseRequiredMessage)
      updateShow(false)
      return
    }
    resetModalState()
    loadQueryOptions()
    select()
    nextTick(() => {
      syncTableMaxHeight()
      bindTableResizeObserver()
      requestAnimationFrame(syncTableMaxHeight)
    })
  }
)

watch(showAdvancedFilter, () => {
  nextTick(debouncedSyncTableMaxHeight)
})

watch(loading, (value) => {
  if (!value) nextTick(debouncedSyncTableMaxHeight)
})

onBeforeUnmount(() => {
  debouncedSyncTableMaxHeight.cancel()
  unbindTableResizeObserver()
})

watch(
  () => props.scenario,
  () => {
    if (props.show) {
      resetModalState()
      select()
    }
  }
)
</script>

<template>
  <FormModal :show="show" :title="title" size="xxxl" @update:show="updateShow">
    <div v-if="show" ref="rootRef" class="item-picker-modal">
      <l-card class="item-picker-modal__card w-full h-full" shadow rounded padding="0">
        <template #header>
          <div ref="filterRef">
            <m-card>
              <SearchQueryForm label-placement="left" label-align="right" label-width="70" class="list-search-form">
                <div class="flex gap-4">
                  <n-grid :cols="3" :x-gap="12" :y-gap="12">
                    <n-gi>
                      <n-form-item label="名称">
                        <n-input
                          class="w-full"
                          clearable
                          v-model:value="query.key"
                          placeholder="请输入名称"
                          @update:value="triggerInputSearch"
                          @keyup.enter="flushInputSearch"
                        />
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="物料编码">
                        <n-input
                          class="w-full"
                          clearable
                          v-model:value="query.code"
                          placeholder="请输入物料编码"
                          @update:value="triggerInputSearch"
                          @keyup.enter="flushInputSearch"
                        />
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="品类">
                        <n-cascader
                          class="w-full"
                          :key="`item-picker-type-${queryCascadeKey}`"
                          v-model:value="query.type"
                          :options="queryFormData.typeOptions"
                          check-strategy="all"
                          clearable
                          filterable
                          expand-trigger="hover"
                          :show-path="true"
                          placeholder="请选择品类"
                          @update:value="handleQueryTypeValue"
                        />
                      </n-form-item>
                    </n-gi>
                    <template v-if="showAdvancedFilter">
                      <n-gi>
                        <n-form-item label="规格1">
                          <n-select
                            class="w-full"
                            :key="`item-picker-spec1-${queryCascadeKey}`"
                            clearable
                            filterable
                            v-model:value="query.spec1Uid"
                            :options="querySpec1Options"
                            label-field="label"
                            value-field="value"
                            :disabled="!query.type"
                            placeholder="请先选择品类"
                          />
                        </n-form-item>
                      </n-gi>
                      <n-gi>
                        <n-form-item label="规格2">
                          <n-select
                            class="w-full"
                            :key="`item-picker-spec2-${queryCascadeKey}`"
                            clearable
                            filterable
                            v-model:value="query.spec2Uid"
                            :options="querySpec2Options"
                            label-field="label"
                            value-field="value"
                            :disabled="!query.type || !query.spec1Uid"
                            placeholder="请先选择规格1"
                          />
                        </n-form-item>
                      </n-gi>
                      <n-gi>
                        <n-form-item label="品牌">
                          <n-select
                            class="w-full"
                            :key="`item-picker-brand-${queryCascadeKey}`"
                            clearable
                            filterable
                            v-model:value="query.brandUid"
                            :options="queryBrandOptions"
                            label-field="label"
                            value-field="value"
                            :disabled="!query.type"
                            placeholder="请先选择品类"
                          />
                        </n-form-item>
                      </n-gi>
                      <n-gi>
                        <n-form-item label="业务类型">
                          <n-select
                            class="w-full"
                            :key="`item-picker-itemBizType-${queryCascadeKey}`"
                            clearable
                            v-model:value="query.itemBizType"
                            :options="queryFormData.itemBizTypeOptions"
                            placeholder="全部类型"
                          />
                        </n-form-item>
                      </n-gi>
                    </template>
                  </n-grid>
                  <ListSearchActions
                    show-more
                    :show-advanced-filter="showAdvancedFilter"
                    :advanced-filter-count="advancedFilterCount"
                    @reset="reset"
                    @toggle-advanced="showAdvancedFilter = !showAdvancedFilter"
                  />
                </div>
              </SearchQueryForm>
            </m-card>
          </div>
        </template>
        <div class="item-picker-modal__table-wrap">
          <vxe-table
            class="erp-list-table"
            :data="data.list"
            border="inner"
            stripe
            :loading="loading"
            :row-config="{ isHover: true, keyField: 'uid' }"
            :cell-config="{ height: 64 }"
            :checkbox-config="{ trigger: 'row' }"
            :scroll-x="ERP_LIST_TABLE_SCROLL_X"
            :scroll-y="ERP_LIST_TABLE_SCROLL_Y"
            :column-config="{ resizable: true }"
            :size="componentSize"
            :height="tableMaxHeight"
            ref="tableRef"
          >
            <vxe-column type="checkbox" width="70" align="center" fixed="left" />
            <vxe-column field="code" title="物料编码" show-overflow="tooltip" align="center" min-width="200" />
            <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" min-width="200" />
            <vxe-column title="图片" align="center" width="72">
              <template #default="{ row }">
                <ErTableThumb :src="row.image" />
              </template>
            </vxe-column>
            <vxe-column field="typeName" title="品类" show-overflow="tooltip" align="center" min-width="200" />
            <vxe-column title="业务类型" align="center" min-width="100">
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
            <vxe-column field="brand" title="品牌" show-overflow="tooltip" align="center" min-width="110" />
            <vxe-column title="规格1" show-overflow="tooltip" align="center" min-width="110">
              <template #default="{ row }">{{ getSpec1Name(row) }}</template>
            </vxe-column>
            <vxe-column title="规格2" show-overflow="tooltip" align="center" min-width="110">
              <template #default="{ row }">{{ getSpec2Name(row) }}</template>
            </vxe-column>
            <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" min-width="200" />
            <vxe-column
              title="税率%"
              align="center"
              min-width="88"
              class-name="erp-list-table__col-secondary"
              :visible="canViewItemPrice"
            >
              <template #default="{ row }">
                <span>{{ getVatTaxRate(row) != null ? `${getVatTaxRate(row)}%` : "—" }}</span>
              </template>
            </vxe-column>
            <vxe-column title="采购含税" align="center" min-width="116" :visible="canViewItemPrice">
              <template #default="{ row }">
                <span class="erp-list-table__money">{{ formatMoney(getPurchasePriceWithTax(row)) }}</span>
              </template>
            </vxe-column>
            <vxe-column
              title="采购不含税"
              align="center"
              min-width="116"
              class-name="erp-list-table__col-secondary"
              :visible="canViewItemPrice"
            >
              <template #default="{ row }">
                <span class="erp-list-table__money">{{ displayPurchasePriceWithoutTax(row) }}</span>
              </template>
            </vxe-column>
            <vxe-column
              title="采购税额"
              align="center"
              min-width="100"
              class-name="erp-list-table__col-secondary"
              :visible="canViewItemPrice"
            >
              <template #default="{ row }">
                <span class="erp-list-table__money">{{ displayPurchaseTaxAmount(row) }}</span>
              </template>
            </vxe-column>
            <vxe-column title="销售含税" align="center" min-width="116" :visible="canViewItemPrice">
              <template #default="{ row }">
                <span class="erp-list-table__money">{{ formatMoney(getSalePriceWithTax(row)) }}</span>
              </template>
            </vxe-column>
            <vxe-column
              title="销售不含税"
              align="center"
              min-width="116"
              class-name="erp-list-table__col-secondary"
              :visible="canViewItemPrice"
            >
              <template #default="{ row }">
                <span class="erp-list-table__money">{{ displaySalePriceWithoutTax(row) }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="remark"
              title="备注"
              show-overflow="tooltip"
              align="center"
              min-width="200"
              class-name="erp-list-table__col-secondary"
            />
            <vxe-column
              field="totalQuantity"
              fixed="right"
              title="库存数量"
              align="center"
              show-overflow="tooltip"
              min-width="110"
              :visible="scenarioConfig.showStock"
            >
              <template #default="{ row }">
                <span>{{ row.totalQuantity ?? "—" }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="availableQuantity"
              fixed="right"
              title="可用库存"
              align="center"
              show-overflow="tooltip"
              min-width="110"
              :visible="scenarioConfig.showStock"
            >
              <template #default="{ row }">
                <span>{{ row.availableQuantity ?? "—" }}</span>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
        <template #footer>
          <div ref="footerRef">
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
          </div>
        </template>
      </l-card>
    </div>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="updateShow(false)">取消</n-button>
        <n-button type="primary" @click="confirmSelect">确定</n-button>
      </n-flex>
    </template>
  </FormModal>
</template>

<style lang="scss" scoped>
.item-picker-modal {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  max-height: calc(100vh - 120px);
  min-height: 420px;
  overflow: hidden;
}

.item-picker-modal__card {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.item-picker-modal__table-wrap {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
</style>
