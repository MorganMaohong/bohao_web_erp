<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import LCard from "@/components/LCard/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import MCard from "@/components/MCard/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import { useAppStore } from "@/store/modules/app"
import { NButton, NTag } from "naive-ui"
import { PageVo } from "@/model"
import { VxeTableInstance, VxeTablePropTypes } from "vxe-table"
import { Box, ChartPie, Store } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import { ItemDictService } from "@/services/template/ItemDictService"
import { InventoryOverviewService } from "@/services/inventory/InventoryOverviewService"
import { InventoryFlowService } from "@/services/inventory/InventoryFlowService"
import {
  InventoryFlowQuery,
  InventoryFlowQueryData,
  InventoryFlowVo,
  InventoryOverviewDetail,
  InventoryOverviewSummary,
  InventoryQuery,
  InventoryQueryData,
  InventoryVo
} from "@/model/inventory"
import { TEMPLATE_MODAL_TABLE_MAX } from "@/constants/template-ui"
import { formatItemSpecLabel, getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import ItemPriceDetailDescriptions from "@/components/ItemPrice/ItemPriceDetailDescriptions.vue"

const appStore = useAppStore()
const showAdvancedFilter = ref(false)
const showDetail = ref(false)
const detailLoading = ref(false)
const loading = ref(false)
const query = ref<InventoryQuery>({
  key: "",
  warehouseUidList: [],
  currentPage: 1,
  pageSize: 50
})
const querySpec1Options = ref<InventoryQueryData["spec1Options"]>([])
const querySpec2Options = ref<InventoryQueryData["spec2Options"]>([])
const queryBrandOptions = ref<InventoryQueryData["brandOptions"]>([])
const queryCascadeKey = ref(0)
const data = ref<PageVo<InventoryVo, InventoryQueryData>>({
  list: [],
  count: 0,
  currentPage: 0,
  pageSize: 0,
  extraData: {
    supplierOptions: [],
    typeOptions: [],
    specOptions: [],
    brandOptions: [],
    unitOptions: [],
    warehouseOptions: []
  }
})
const detailData = ref<InventoryOverviewDetail>({})
const flowLoading = ref(false)
const flowQuery = ref<InventoryFlowQuery>({
  currentPage: 1,
  pageSize: 50,
  itemUid: undefined,
  warehouseUidList: [],
  businessType: undefined
})
const flowData = ref<{
  list: InventoryFlowVo[]
  count: number
  currentPage: number
  pageSize: number
  extraData?: InventoryFlowQueryData
}>({
  list: [],
  count: 0,
  currentPage: 1,
  pageSize: 50
})
const VxeTableRef = ref<VxeTableInstance>()
const mergeCells = ref<VxeTablePropTypes.MergeCells>([])

const summary = computed<InventoryOverviewSummary>(() => data.value.extraData?.summary || {})

const advancedFilterCount = computed(() => {
  let count = 0
  if (query.value.type) count++
  if (query.value.spec1Uid) count++
  if (query.value.spec2Uid) count++
  if (query.value.brandUid) count++
  return count
})

const occupiedQuantity = computed(() => {
  const locked = Number(detailData.value.lockedQuantity)
  if (Number.isFinite(locked) && locked >= 0) {
    return locked
  }
  const total = stockQuantity(detailData.value)
  const available = Number(detailData.value.availableQuantity) || 0
  return Math.max(total - available, 0)
})

const statCards = computed(() => [
  {
    key: "itemCount",
    label: "库存品种",
    value: formatNumber(summary.value.itemCount ?? data.value.count),
    hint: "符合筛选条件的物料条目",
    tone: "primary"
  },
  {
    key: "totalQuantity",
    label: "库存总量",
    value: formatNumber(summary.value.totalQuantity),
    hint: "账面库存合计",
    tone: "info"
  },
  {
    key: "availableQuantity",
    label: "可用库存",
    value: formatNumber(summary.value.availableQuantity),
    hint: "可继续出库/调拨/领料",
    tone: "success"
  },
  {
    key: "lockedQuantity",
    label: "占用库存",
    value: formatNumber(summary.value.lockedQuantity),
    hint: "草稿出库、待出库领料等锁定",
    tone: "warning"
  }
])

function clearQueryCascade() {
  query.value.spec1Uid = undefined
  query.value.spec2Uid = undefined
  query.value.brandUid = undefined
  querySpec1Options.value = []
  querySpec2Options.value = []
  queryBrandOptions.value = []
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

function formatNumber(value?: number | string | null) {
  const num = Number(value)
  if (!Number.isFinite(num)) return "0"
  return Number.isInteger(num) ? String(num) : num.toFixed(2)
}

function stockQuantity(row: InventoryVo) {
  const total = row.totalQuantity ?? row.quantity
  return Number(total) || 0
}

function rowLockedQuantity(row: InventoryVo) {
  const locked = Number(row.lockedQuantity)
  if (Number.isFinite(locked) && locked >= 0) {
    return locked
  }
  return Math.max(stockQuantity(row) - (Number(row.availableQuantity) || 0), 0)
}

function isLowAvailable(row: InventoryVo) {
  const available = Number(row.availableQuantity) || 0
  const total = stockQuantity(row)
  return total > 0 && available <= total * 0.2
}

function changeQuantityClass(value?: number | string | null) {
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return "qty qty--zero"
  return num > 0 ? "qty qty--in" : "qty qty--out"
}

function bizTypeTagType(itemBizType?: string) {
  if (itemBizType === "finished_product") return "success"
  if (itemBizType === "component") return "info"
  return "default"
}

async function selectDetailFlow() {
  if (!flowQuery.value.itemUid || !flowQuery.value.warehouseUidList?.length) {
    flowData.value = { list: [], count: 0, currentPage: 1, pageSize: flowQuery.value.pageSize }
    return
  }
  flowLoading.value = true
  try {
    const res = await InventoryFlowService.select(flowQuery.value)
    flowData.value = {
      list: res.list || [],
      count: res.count || 0,
      currentPage: res.currentPage || flowQuery.value.currentPage,
      pageSize: res.pageSize || flowQuery.value.pageSize,
      extraData: res.extraData
    }
  } finally {
    flowLoading.value = false
  }
}

function resetDetailFlowQuery() {
  flowQuery.value = {
    currentPage: 1,
    pageSize: 50,
    itemUid: detailData.value.itemUid,
    warehouseUidList: detailData.value.warehouseUid ? [detailData.value.warehouseUid] : [],
    businessType: undefined
  }
}

function flowPageChange(event: VxePagerEvents) {
  flowQuery.value.currentPage = event.currentPage
  flowQuery.value.pageSize = event.pageSize
  selectDetailFlow()
}

function select() {
  loading.value = true
  InventoryOverviewService.select(query.value)
    .then((res) => {
      data.value = res
      mergeCells.value = buildMergeCells(res.list || [])
      if (query.value.type) {
        querySpec1Options.value = res.extraData?.spec1Options || querySpec1Options.value
        querySpec2Options.value = res.extraData?.spec2Options || querySpec2Options.value
        queryBrandOptions.value = res.extraData?.brandOptions || queryBrandOptions.value
      } else {
        querySpec1Options.value = []
        querySpec2Options.value = []
        queryBrandOptions.value = []
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function buildMergeCells(list: InventoryVo[]) {
  const merges: VxeTablePropTypes.MergeCells = []
  let start = 0
  let count = 1

  for (let i = 1; i <= list.length; i++) {
    if (i < list.length && list[i].warehouseUid === list[start].warehouseUid) {
      count++
    } else {
      if (count > 1) {
        merges.push({ row: start, col: 0, rowspan: count, colspan: 1 })
      }
      start = i
      count = 1
    }
  }
  return merges
}

async function showDetailModal(uid?: string) {
  if (!uid) return
  showDetail.value = true
  detailLoading.value = true
  detailData.value = {}
  flowData.value = { list: [], count: 0, currentPage: 1, pageSize: 50 }
  try {
    detailData.value = await InventoryOverviewService.detail(uid)
    resetDetailFlowQuery()
    await selectDetailFlow()
  } finally {
    detailLoading.value = false
  }
}

function doSearch() {
  query.value.currentPage = 1
  select()
}

const { triggerInputSearch, flushInputSearch, triggerSelectSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    clearQueryCascade()
    query.value = {
      currentPage: 1,
      pageSize: 50,
      key: "",
      type: undefined,
      spec1Uid: undefined,
      spec2Uid: undefined,
      brandUid: undefined,
      warehouseUidList: []
    }
    queryCascadeKey.value += 1
    showAdvancedFilter.value = false
  })
}

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

watch(
  () => query.value.spec1Uid,
  (v) => {
    if (!v) query.value.spec2Uid = undefined
  }
)

watch(
  () => [query.value.spec1Uid, query.value.spec2Uid, query.value.brandUid],
  () => {
    triggerSelectSearch()
  }
)

onMounted(() => {
  select()
})
</script>

<template>
  <div class="LayoutContainer inventory-overview">
    <l-card class="w-full inventory-overview__shell" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            class="inventory-overview__search list-search-form"
          >
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="关键字">
                    <n-input
                      class="w-full"
                      clearable
                      v-model:value="query.key"
                      placeholder="名称 / 材质"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="仓库">
                    <n-select
                      class="w-full"
                      clearable
                      filterable
                      multiple
                      max-tag-count="responsive"
                      v-model:value="query.warehouseUidList"
                      placeholder="选择仓库"
                      :options="data.extraData.warehouseOptions"
                      @update:value="triggerSelectSearch"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="品类">
                    <n-cascader
                      class="w-full"
                      :key="`query-type-${queryCascadeKey}`"
                      v-model:value="query.type"
                      :options="data.extraData.typeOptions"
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
                        :key="`query-spec1-${queryCascadeKey}`"
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
                        :key="`query-spec2-${queryCascadeKey}`"
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
                        :key="`query-brand-${queryCascadeKey}`"
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
      </template>

      <template #default>
        <div class="inventory-overview__page">
          <div class="inventory-overview__top">
            <div class="inventory-overview__hero">
              <div class="inventory-overview__hero-icon">
                <n-icon size="20" :component="ChartPie" />
              </div>
              <div class="inventory-overview__hero-text">
                <div class="inventory-overview__hero-title">库存概览</div>
                <div class="inventory-overview__hero-desc">按仓库查看实时库存、可用量与占用情况</div>
              </div>
            </div>

            <div class="inventory-overview__stats">
              <div
                v-for="card in statCards"
                :key="card.key"
                class="inventory-overview__stat-card"
                :class="`inventory-overview__stat-card--${card.tone}`"
              >
                <div class="inventory-overview__stat-label">{{ card.label }}</div>
                <div class="inventory-overview__stat-value">{{ card.value }}</div>
                <div class="inventory-overview__stat-hint">{{ card.hint }}</div>
              </div>
            </div>
          </div>

          <div class="inventory-overview__table-head">
            <div class="inventory-overview__table-title">
              <n-icon size="18" :component="Box" />
              <span>库存明细</span>
              <n-tag size="small" round>共 {{ data.count || 0 }} 条</n-tag>
            </div>
            <div class="inventory-overview__legend">
              <span class="inventory-overview__legend-item"> <i class="dot dot--success" />可用充足 </span>
              <span class="inventory-overview__legend-item"> <i class="dot dot--warning" />可用偏低 </span>
            </div>
          </div>
          <div class="inventory-overview__table-zone erp-list-table-wrap">
            <ListPageTable
              :data="data.list"
              :loading="loading"
              :cell-height="72"
              :row-class-name="({ row }) => (isLowAvailable(row) ? 'inventory-overview-row--warn' : '')"
              ref="VxeTableRef"
              :merge-cells="mergeCells"
              :size="appStore.componentSize"
            >
              <vxe-column field="warehouseName" title="仓库" align="left" min-width="130">
                <template #default="{ row }">
                  <div class="inventory-overview__warehouse-cell">
                    <n-icon size="16" :component="Store" />
                    <span>{{ row.warehouseName || "-" }}</span>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="name" title="物料" align="left" min-width="160" show-overflow="tooltip" />
              <vxe-column title="图片" align="center" width="76">
                <template #default="{ row }">
                  <n-image v-if="row.image" :src="row.image" class="inventory-overview__thumb" object-fit="cover" />
                  <span v-else class="inventory-overview__thumb-placeholder">-</span>
                </template>
              </vxe-column>
              <vxe-column field="typeName" title="类型" align="center" min-width="100" show-overflow="tooltip" />
              <vxe-column field="supplierName" title="供应商" align="center" min-width="120" show-overflow="tooltip" />
              <vxe-column title="规格1" align="center" min-width="110" show-overflow="tooltip">
                <template #default="{ row }">{{ getSpec1Name(row) }}</template>
              </vxe-column>
              <vxe-column title="规格2" align="center" min-width="110" show-overflow="tooltip">
                <template #default="{ row }">{{ getSpec2Name(row) }}</template>
              </vxe-column>
              <vxe-column field="unitName" title="单位" align="center" width="72" />
              <vxe-column title="库存数量" align="center" width="100">
                <template #default="{ row }">
                  <span class="qty qty--total">{{ stockQuantity(row) }}</span>
                </template>
              </vxe-column>
              <vxe-column title="可用" align="center" width="88">
                <template #default="{ row }">
                  <n-tag size="small" :type="isLowAvailable(row) ? 'warning' : 'success'" :bordered="false">
                    {{ row.availableQuantity ?? 0 }}
                  </n-tag>
                </template>
              </vxe-column>
              <vxe-column title="占用" align="center" width="88">
                <template #default="{ row }">
                  <span class="qty qty--locked">{{ rowLockedQuantity(row) }}</span>
                </template>
              </vxe-column>
              <vxe-column fixed="right" title="操作" align="center" width="72">
                <template #default="{ row }">
                  <n-button type="primary" text @click="showDetailModal(row.uid)">详情</n-button>
                </template>
              </vxe-column>
            </ListPageTable>
          </div>
        </div>
      </template>

      <template #footer>
        <m-card class="w-full flex items-center justify-end inventory-overview__pager" padding="8">
          <vxe-pager
            :size="appStore.componentSize"
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

  <FormModal v-model:show="showDetail" title="库存详情" size="xxl">
    <n-spin :show="detailLoading">
      <n-space vertical :size="16">
        <div class="inventory-overview__detail-hero">
          <n-image
            v-if="detailData.image"
            :src="detailData.image"
            class="inventory-overview__detail-image"
            object-fit="cover"
          />
          <div class="inventory-overview__detail-main">
            <div class="inventory-overview__detail-name">{{ detailData.name || "-" }}</div>
            <div class="inventory-overview__detail-meta">
              {{ detailData.warehouseName || "-" }} · {{ detailData.typeName || "-" }} ·
              {{ formatItemSpecLabel(detailData) }}
            </div>
            <div class="inventory-overview__detail-qty">
              <n-tag type="info" :bordered="false">库存 {{ stockQuantity(detailData) }}</n-tag>
              <n-tag type="success" :bordered="false">可用 {{ detailData.availableQuantity ?? 0 }}</n-tag>
              <n-tag type="warning" :bordered="false">占用 {{ occupiedQuantity }}</n-tag>
            </div>
          </div>
        </div>
        <n-descriptions bordered :column="3" label-placement="left" title="物料信息">
          <n-descriptions-item label="物料编码">{{ detailData.code || "-" }}</n-descriptions-item>
          <n-descriptions-item label="仓库">{{ detailData.warehouseName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="品类">{{ detailData.typeName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="业务类型">
            <n-tag
              v-if="detailData.itemBizTypeName"
              size="small"
              :type="bizTypeTagType(detailData.itemBizType)"
              :bordered="false"
            >
              {{ detailData.itemBizTypeName }}
            </n-tag>
            <span v-else>-</span>
          </n-descriptions-item>
          <n-descriptions-item label="供应商">{{ detailData.supplierName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="品牌">{{ detailData.brand || "-" }}</n-descriptions-item>
          <n-descriptions-item label="单位">{{ detailData.unitName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="规格1">{{ getSpec1Name(detailData) || "-" }}</n-descriptions-item>
          <n-descriptions-item label="规格2">{{ getSpec2Name(detailData) || "-" }}</n-descriptions-item>
          <n-descriptions-item label="材质">{{ detailData.material || "-" }}</n-descriptions-item>
          <n-descriptions-item label="库存数量">{{ formatNumber(stockQuantity(detailData)) }}</n-descriptions-item>
          <n-descriptions-item label="可用库存">{{ formatNumber(detailData.availableQuantity) }}</n-descriptions-item>
          <n-descriptions-item label="占用库存">{{ formatNumber(occupiedQuantity) }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ detailData.createTime || "-" }}</n-descriptions-item>
          <n-descriptions-item label="更新时间">{{ detailData.updateTime || "-" }}</n-descriptions-item>
          <n-descriptions-item label="备注" :span="3">{{ detailData.remark || "-" }}</n-descriptions-item>
          <ItemPriceDetailDescriptions :data="detailData" />
        </n-descriptions>
        <div>
          <div class="inventory-overview__section-head">
            <div class="inventory-overview__section-title">库存流水</div>
            <n-select
              class="inventory-overview__flow-filter"
              clearable
              filterable
              placeholder="业务类型"
              :options="flowData.extraData?.businessTypeOptions || []"
              v-model:value="flowQuery.businessType"
              @update:value="
                () => {
                  flowQuery.currentPage = 1
                  selectDetailFlow()
                }
              "
            />
          </div>
          <ListPageTable
            :data="flowData.list"
            :loading="flowLoading"
            :max-height="TEMPLATE_MODAL_TABLE_MAX"
            :size="appStore.componentSize"
          >
            <vxe-column field="businessTypeName" title="业务类型" align="center" min-width="120" show-overflow="tooltip" />
            <vxe-column field="beforeQuantity" title="变动前" align="center" width="96">
              <template #default="{ row }">
                <span class="qty">{{ formatNumber(row.beforeQuantity) }}</span>
              </template>
            </vxe-column>
            <vxe-column field="changeQuantity" title="变动数量" align="center" width="104">
              <template #default="{ row }">
                <span :class="changeQuantityClass(row.changeQuantity)">
                  {{ formatNumber(row.changeQuantity) }}
                </span>
              </template>
            </vxe-column>
            <vxe-column field="afterQuantity" title="变动后" align="center" width="96">
              <template #default="{ row }">
                <span class="qty">{{ formatNumber(row.afterQuantity) }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="createTimeName"
              title="变动时间"
              align="center"
              min-width="160"
              show-overflow="tooltip"
            />
          </ListPageTable>
          <div class="inventory-overview__flow-pager">
            <vxe-pager
              :size="appStore.componentSize"
              v-model:currentPage="flowQuery.currentPage"
              v-model:pageSize="flowQuery.pageSize"
              :total="flowData.count"
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
              @page-change="flowPageChange"
            />
          </div>
        </div>
      </n-space>
    </n-spin>
  </FormModal>
</template>

<style lang="scss" scoped>
.inventory-overview {
  &__shell {
    background: linear-gradient(180deg, var(--n-color-modal) 0%, var(--n-body-color) 120px);
  }

  &__page {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__top {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__hero {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__hero-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: var(--n-primary-color);
    background: rgba(24, 160, 88, 0.12);
    flex-shrink: 0;
  }

  &__hero-title {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.3;
  }

  &__hero-desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--n-text-color-3);
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  &__stat-card {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--n-border-color);
    background: var(--n-color-modal);
  }

  &__stat-card--primary {
    border-color: rgba(24, 160, 88, 0.25);
    background: linear-gradient(135deg, rgba(24, 160, 88, 0.08), transparent);
  }

  &__stat-card--info {
    border-color: rgba(32, 128, 240, 0.2);
    background: linear-gradient(135deg, rgba(32, 128, 240, 0.06), transparent);
  }

  &__stat-card--success {
    border-color: rgba(24, 160, 88, 0.2);
  }

  &__stat-card--warning {
    border-color: rgba(240, 160, 32, 0.25);
    background: linear-gradient(135deg, rgba(240, 160, 32, 0.08), transparent);
  }

  &__stat-label {
    font-size: 13px;
    color: var(--n-text-color-3);
  }

  &__stat-value {
    margin-top: 4px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
  }

  &__stat-hint {
    margin-top: 4px;
    font-size: 11px;
    color: var(--n-text-color-3);
  }

  &__search-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__advanced {
    margin-top: 4px;
    padding-top: 12px;
    border-top: 1px solid var(--n-border-color);
  }

  &__table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 0;
  }

  &__table-zone {
    border-radius: 10px;
    border: 1px solid var(--n-border-color);
    background: var(--n-color-modal);
  }

  &__table-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  &__legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--n-text-color-3);
  }

  &__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &__warehouse-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  &__thumb {
    width: 48px;
    height: 48px;
    border-radius: 8px;
  }

  &__thumb-placeholder {
    color: var(--n-text-color-3);
  }

  &__pager {
    padding: 0 12px 8px;
  }

  &__detail-hero {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  &__detail-image {
    width: 88px;
    height: 88px;
    border-radius: 10px;
    flex-shrink: 0;
  }

  &__detail-name {
    font-size: 18px;
    font-weight: 600;
  }

  &__detail-meta {
    margin-top: 6px;
    font-size: 13px;
    color: var(--n-text-color-3);
  }

  &__detail-qty {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  &__section-title {
    font-size: 14px;
    font-weight: 600;
  }

  &__flow-filter {
    width: 200px;
  }

  &__flow-pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }
}

.qty--in {
  color: #18a058;
  font-weight: 600;
}

.qty--out {
  color: #d03050;
  font-weight: 600;
}

.qty--zero {
  color: var(--n-text-color-3);
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot--success {
  background: #18a058;
}

.dot--warning {
  background: #f0a020;
}

.qty {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.qty--total {
  color: var(--n-text-color-1);
}

.qty--locked {
  color: #f0a020;
}

:deep(.inventory-overview-row--warn) {
  background-color: rgba(240, 160, 32, 0.06) !important;
}

@media (max-width: 1200px) {
  .inventory-overview__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
