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
import { Activity, Store } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import { ItemDictService } from "@/services/template/ItemDictService"
import { InventoryFlowService } from "@/services/inventory/InventoryFlowService"
import { InventoryFlowQuery, InventoryFlowQueryData, InventoryFlowVo } from "@/model/inventory"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"

const appStore = useAppStore()
const showAdvancedFilter = ref(false)
const showDetail = ref(false)
const loading = ref(false)
const query = ref<InventoryFlowQuery>({
  key: "",
  warehouseUidList: [],
  currentPage: 1,
  pageSize: 50
})
const querySpec1Options = ref<InventoryFlowQueryData["spec1Options"]>([])
const querySpec2Options = ref<InventoryFlowQueryData["spec2Options"]>([])
const queryBrandOptions = ref<InventoryFlowQueryData["brandOptions"]>([])
const queryCascadeKey = ref(0)
const data = ref<PageVo<InventoryFlowVo, InventoryFlowQueryData>>({
  list: [],
  count: 0,
  currentPage: 1,
  pageSize: 50,
  extraData: {
    warehouseOptions: [],
    supplierOptions: [],
    typeOptions: [],
    businessTypeOptions: []
  }
})
const detailData = ref<InventoryFlowVo>({})
const VxeTableRef = ref<VxeTableInstance>()
const mergeCells = ref<VxeTablePropTypes.MergeCells>([])

const advancedFilterCount = computed(() => {
  let count = 0
  if (query.value.type) count++
  if (query.value.spec1Uid) count++
  if (query.value.spec2Uid) count++
  if (query.value.brandUid) count++
  if (query.value.businessType) count++
  if (query.value.supplierUidList?.length) count++
  return count
})

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

function changeQuantityClass(value?: number | string | null) {
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return "qty qty--zero"
  return num > 0 ? "qty qty--in" : "qty qty--out"
}

function select() {
  loading.value = true
  InventoryFlowService.select(query.value)
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

function buildMergeCells(list: InventoryFlowVo[]) {
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

function showDetailModal(row: InventoryFlowVo) {
  detailData.value = { ...row }
  showDetail.value = true
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
      businessType: undefined,
      warehouseUidList: [],
      supplierUidList: []
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
  () => [
    query.value.spec1Uid,
    query.value.spec2Uid,
    query.value.brandUid,
    query.value.businessType,
    query.value.supplierUidList
  ],
  () => {
    triggerSelectSearch()
  }
)

onMounted(() => {
  select()
})
</script>

<template>
  <div class="LayoutContainer inventory-flow">
    <l-card class="w-full inventory-flow__shell" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            class="inventory-flow__search list-search-form"
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
                      :options="data.extraData?.warehouseOptions"
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
                      :options="data.extraData?.typeOptions"
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
                  <n-gi>
                    <n-form-item label="业务类型">
                      <n-select
                        class="w-full"
                        clearable
                        filterable
                        v-model:value="query.businessType"
                        :options="data.extraData?.businessTypeOptions"
                        placeholder="选择业务类型"
                      />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="供应商">
                      <n-select
                        class="w-full"
                        clearable
                        filterable
                        multiple
                        max-tag-count="responsive"
                        v-model:value="query.supplierUidList"
                        placeholder="选择供应商"
                        :options="data.extraData?.supplierOptions"
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
        <div class="inventory-flow__page">
          <div class="inventory-flow__table-head">
            <div class="inventory-flow__table-title">
              <n-icon size="18" :component="Activity" />
              <span>流水明细</span>
            </div>
            <div class="inventory-flow__legend">
              <span class="inventory-flow__legend-item"> <i class="dot dot--in" />数量增加 </span>
              <span class="inventory-flow__legend-item"> <i class="dot dot--out" />数量减少 </span>
            </div>
          </div>

          <div class="inventory-flow__table-zone erp-list-table-wrap">
            <ListPageTable
              :data="data.list"
              :loading="loading"
              :cell-height="72"
              ref="VxeTableRef"
              :merge-cells="mergeCells"
              :size="appStore.componentSize"
            >
              <vxe-column field="warehouseName" title="仓库" align="left" min-width="130">
                <template #default="{ row }">
                  <div class="inventory-flow__warehouse-cell">
                    <n-icon size="16" :component="Store" />
                    <span>{{ row.warehouseName || "-" }}</span>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="name" title="物料" align="left" min-width="150" show-overflow="tooltip" />
              <vxe-column title="图片" align="center" width="76">
                <template #default="{ row }">
                  <n-image v-if="row.image" :src="row.image" class="inventory-flow__thumb" object-fit="cover" />
                  <span v-else class="inventory-flow__thumb-placeholder">-</span>
                </template>
              </vxe-column>
              <vxe-column
                field="businessTypeName"
                title="业务类型"
                align="center"
                min-width="110"
                show-overflow="tooltip"
              />
              <vxe-column field="typeName" title="品类" align="center" min-width="100" show-overflow="tooltip" />
              <vxe-column field="supplierName" title="供应商" align="center" min-width="110" show-overflow="tooltip" />
              <vxe-column title="规格1" align="center" min-width="100" show-overflow="tooltip">
                <template #default="{ row }">{{ getSpec1Name(row) }}</template>
              </vxe-column>
              <vxe-column title="规格2" align="center" min-width="100" show-overflow="tooltip">
                <template #default="{ row }">{{ getSpec2Name(row) }}</template>
              </vxe-column>
              <vxe-column field="unitName" title="单位" align="center" width="72" />
              <vxe-column field="beforeQuantity" title="变动前" align="center" width="88">
                <template #default="{ row }">
                  <span class="qty">{{ formatNumber(row.beforeQuantity) }}</span>
                </template>
              </vxe-column>
              <vxe-column field="changeQuantity" title="变动数量" align="center" width="96">
                <template #default="{ row }">
                  <span :class="changeQuantityClass(row.changeQuantity)">
                    {{ formatNumber(row.changeQuantity) }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="afterQuantity" title="变动后" align="center" width="88">
                <template #default="{ row }">
                  <span class="qty">{{ formatNumber(row.afterQuantity) }}</span>
                </template>
              </vxe-column>
              <vxe-column
                field="createTimeName"
                title="变动时间"
                align="center"
                min-width="150"
                show-overflow="tooltip"
              />
              <vxe-column fixed="right" title="操作" align="center" width="72">
                <template #default="{ row }">
                  <n-button type="primary" text @click="showDetailModal(row)">详情</n-button>
                </template>
              </vxe-column>
            </ListPageTable>
          </div>
        </div>
      </template>

      <template #footer>
        <m-card class="w-full flex items-center justify-end inventory-flow__pager" padding="8">
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

  <FormModal v-model:show="showDetail" title="流水详情" size="xl" height-mode="auto">
    <n-space vertical :size="14">
      <div class="inventory-flow__detail-hero">
        <n-image
          v-if="detailData.image"
          :src="detailData.image"
          class="inventory-flow__detail-image"
          object-fit="cover"
        />
        <div class="inventory-flow__detail-main">
          <div class="inventory-flow__detail-name">{{ detailData.name || "-" }}</div>
          <div class="inventory-flow__detail-meta">
            {{ detailData.warehouseName || "-" }} · {{ detailData.businessTypeName || "-" }}
          </div>
          <div class="inventory-flow__detail-qty">
            <n-tag type="info" :bordered="false">变动前 {{ formatNumber(detailData.beforeQuantity) }}</n-tag>
            <n-tag :type="Number(detailData.changeQuantity) >= 0 ? 'success' : 'error'" :bordered="false">
              变动 {{ formatNumber(detailData.changeQuantity) }}
            </n-tag>
            <n-tag type="default" :bordered="false">变动后 {{ formatNumber(detailData.afterQuantity) }}</n-tag>
          </div>
        </div>
      </div>
      <n-descriptions bordered :column="2" label-placement="left" size="small">
        <n-descriptions-item label="品类">{{ detailData.typeName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="供应商">{{ detailData.supplierName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="规格1">{{ getSpec1Name(detailData) }}</n-descriptions-item>
        <n-descriptions-item label="规格2">{{ getSpec2Name(detailData) }}</n-descriptions-item>
        <n-descriptions-item label="材质">{{ detailData.material || "-" }}</n-descriptions-item>
        <n-descriptions-item label="单位">{{ detailData.unitName || "-" }}</n-descriptions-item>
        <n-descriptions-item label="变动时间">{{
          detailData.createTimeName || detailData.createTime || "-"
        }}</n-descriptions-item>
        <n-descriptions-item label="业务单号" :span="2">{{ detailData.businessUid || "-" }}</n-descriptions-item>
      </n-descriptions>
    </n-space>
  </FormModal>
</template>

<style lang="scss" scoped>
.inventory-flow {
  &__shell {
    background: linear-gradient(180deg, var(--n-color-modal) 0%, var(--n-body-color) 120px);
  }

  &__page {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    width: 72px;
    height: 72px;
    border-radius: 10px;
    flex-shrink: 0;
  }

  &__detail-name {
    font-size: 17px;
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
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot--in {
  background: #18a058;
}

.dot--out {
  background: #d03050;
}

.qty {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.qty--in {
  color: #18a058;
}

.qty--out {
  color: #d03050;
}

.qty--zero {
  color: var(--n-text-color-3);
}
</style>
