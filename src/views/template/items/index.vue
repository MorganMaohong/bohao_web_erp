<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import FormModal from "@/components/FormModal/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { formatDateTime, resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { ItemsService } from "@/services/template/ItemsService"
import { ItemDictService } from "@/services/template/ItemDictService"
import { ItemsForm, ItemsQuery, ItemsQueryData, ItemsVo } from "@/model/template/items"
import FastUpload from "@/components/FastUpload/FastUpload.vue"
import { AddPhotoAlternateRound } from "@vicons/material"
import { getSpec1Name, getSpec2Name } from "@/utils/itemSpec"
import { formatMoney } from "@/utils/purchasePrice"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<ItemsForm>({})
const formRef = ref<FormInst>()
const loading = ref(false)
const codePreview = ref("")
const formRule = {
  itemBizType: {
    required: true,
    message: "请选择物料业务类型",
    trigger: ["input", "blur"]
  },
  type: {
    required: true,
    message: "请选择品类",
    trigger: ["input", "blur"]
  },
  brandUid: {
    required: true,
    message: "请选择品牌",
    trigger: ["input", "blur"]
  },
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  },
  unit: {
    required: true,
    message: "请选择单位",
    trigger: ["input", "blur"]
  }
}
const query = ref<ItemsQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<ItemsVo, ItemsQueryData>>({
  currentPage: 1,
  pageSize: 50,
  count: 0,
  list: [],
  extraData: {}
})
const queryFormData = ref<ItemsForm>({})
const querySpec1Options = ref(queryFormData.value.spec1Options || [])
const querySpec2Options = ref(queryFormData.value.spec2Options || [])
const queryBrandOptions = ref(queryFormData.value.brandOptions || [])
/** 重置时递增，强制规格/品牌下拉重建，避免无 options 时展示 uid */
const queryCascadeKey = ref(0)
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()
const showAdvancedFilter = ref(false)

const advancedFilterCount = computed(() => {
  let count = 0
  if (query.value.spec1Uid) count++
  if (query.value.spec2Uid) count++
  if (query.value.brandUid) count++
  if (query.value.itemBizType) count++
  return count
})

function bizTypeTagType(itemBizType?: string) {
  if (itemBizType === "finished_product") return "success"
  if (itemBizType === "component") return "info"
  return "default"
}

function buildSelectQuery(): ItemsQuery {
  const payload: ItemsQuery = { ...query.value }
  ;(["key", "code", "type", "itemBizType", "spec1Uid", "spec2Uid", "brandUid"] as const).forEach((field) => {
    const value = payload[field]
    if (value === "" || value === null) {
      payload[field] = undefined
    }
  })
  return payload
}

function select() {
  loading.value = true
  ItemsService.select(buildSelectQuery())
    .then((res) => {
      data.value = res
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
      VxeTableRef.value?.setAllTreeExpand?.(true)
    })
}

function loadQueryOptions() {
  ItemsService.form().then((res) => {
    queryFormData.value = res
  })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  formData.value.spec1Uid = undefined
  formData.value.spec2Uid = undefined
  codePreview.value = ""
  showUpdate.value = true
  ItemsService.form(uid).then((data) => {
    formData.value = data
    codePreview.value = data.code || ""
    refreshCodePreview()
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  codePreview.value = ""
  ItemsService.form(uid).then((res) => {
    formData.value = res
    formData.value.uid = undefined
    formData.value.id = undefined
    formData.value.code = undefined
    refreshCodePreview()
  })
}

function confirmUpdate() {
  normalizePrice()
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    refreshCodePreview()
      .then(() => {
        // 提交前以最新字典重算编码，避免字典变更后仍提交旧编码
        if (codePreview.value) {
          formData.value.code = codePreview.value
        }
        return ItemsService.addOrUpdate(formData.value)
      })
      .then(() => {
        showUpdate.value = false
        select()
      })
      .finally(() => {
        isSubmitting.value = false
      })
  })
}

function showDeleteModal(uid: string) {
  showDelete.value = true
  formData.value.uid = uid
}

function confirmDelete() {
  if (!formData.value.uid) return
  isSubmitting.value = true
  ItemsService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function doSearch() {
  query.value.currentPage = 1
  select()
}

const { triggerInputSearch, flushInputSearch, triggerSelectSearch, withResetSuppressed } = useAutoListSearch(doSearch)

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

function clearQueryCascade() {
  query.value.spec1Uid = undefined
  query.value.spec2Uid = undefined
  query.value.brandUid = undefined
  querySpec1Options.value = []
  querySpec2Options.value = []
  queryBrandOptions.value = []
}

function pageChange(event: { currentPage: number; pageSize: number }) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function handlerBeforeUpload(v: string) {
  formData.value.image = v
}

const priceWithoutTaxPreview = computed(() => {
  const price = Number(formData.value.purchasePriceWithTax || 0)
  const rate = Number(formData.value.vatTaxRate || 0)
  if (!price) return 0
  return Number((price / (1 + rate / 100)).toFixed(4))
})

const taxAmountPreview = computed(() => {
  const withTax = Number(formData.value.purchasePriceWithTax || 0)
  const withoutTax = Number(formData.value.purchasePriceWithoutTax || 0)
  return Number((withTax - withoutTax).toFixed(4))
})

const salePriceWithoutTaxPreview = computed(() => {
  const price = Number(formData.value.salePriceWithTax || 0)
  const rate = Number(formData.value.vatTaxRate || 0)
  if (!price) return 0
  return Number((price / (1 + rate / 100)).toFixed(4))
})

watch(
  () => [formData.value.purchasePriceWithTax, formData.value.vatTaxRate],
  () => {
    formData.value.purchasePriceWithoutTax = priceWithoutTaxPreview.value
    formData.value.taxAmount = taxAmountPreview.value
  }
)

watch(
  () => [formData.value.salePriceWithTax, formData.value.vatTaxRate],
  () => {
    formData.value.salePriceWithoutTax = salePriceWithoutTaxPreview.value
  }
)

function normalizePrice() {
  if (formData.value.purchasePriceWithTax !== undefined && formData.value.purchasePriceWithTax !== null) {
    formData.value.purchasePriceWithoutTax = priceWithoutTaxPreview.value
    formData.value.taxAmount = taxAmountPreview.value
  }
  if (formData.value.salePriceWithTax !== undefined && formData.value.salePriceWithTax !== null) {
    formData.value.salePriceWithoutTax = salePriceWithoutTaxPreview.value
  }
}

async function handleUpdateTypeValue(v: string | null) {
  formData.value.spec1Uid = undefined
  formData.value.spec2Uid = undefined
  formData.value.brandUid = undefined
  if (!v) {
    formData.value.specOptions = []
    formData.value.spec1Options = []
    formData.value.spec2Options = []
    formData.value.brandOptions = []
    codePreview.value = ""
    return
  }
  try {
    const picker = await ItemDictService.picker(v)
    formData.value.specOptions = picker.specOptions || []
    formData.value.spec1Options = picker.spec1Options || []
    formData.value.spec2Options = picker.spec2Options || []
    formData.value.brandOptions = picker.brandOptions || []
  } catch {
    formData.value.specOptions = []
    formData.value.spec1Options = []
    formData.value.spec2Options = []
    formData.value.brandOptions = []
  }
  refreshCodePreview()
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

function handleUpdateSpec1Value(v: string | null) {
  if (!v) {
    formData.value.spec2Uid = undefined
  }
  refreshCodePreview()
}

function handleUpdateSpec2Value(v: string | null) {
  if (v && !formData.value.spec1Uid) {
    formData.value.spec2Uid = undefined
    window.$message?.warning("请先选择规格1")
    return
  }
  refreshCodePreview()
}

function handleUpdateUnitValue(v: string) {}

async function refreshCodePreview() {
  if (!formData.value.type) {
    if (!formData.value.uid) codePreview.value = ""
    return
  }
  if (!formData.value.brandUid) {
    if (!formData.value.uid) codePreview.value = ""
    return
  }
  try {
    codePreview.value = await ItemDictService.buildCode({
      categoryUid: formData.value.type,
      spec1Uid: formData.value.spec1Uid,
      spec2Uid: formData.value.spec2Uid,
      brandUid: formData.value.brandUid
    })
  } catch {
    if (!formData.value.uid) codePreview.value = ""
  }
}

watch(
  () => query.value.spec1Uid,
  (v) => {
    if (!v) query.value.spec2Uid = undefined
  }
)

watch(
  () => [query.value.itemBizType, query.value.spec1Uid, query.value.spec2Uid, query.value.brandUid],
  () => {
    triggerSelectSearch()
  }
)

watch(
  () => [formData.value.spec1Uid, formData.value.spec2Uid, formData.value.brandUid],
  () => {
    refreshCodePreview()
  }
)

onMounted(() => {
  loadQueryOptions()
  select()
  const $table = VxeTableRef.value
  const $toolbar = VxeToolbarRef.value
  if ($table && $toolbar) {
    $table?.connect?.($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer items-page">
    <l-card class="w-full h-full items-page__card" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            ref="queryFormRef"
            class="items-page__search list-search-form"
          >
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
                      :key="`query-type-${queryCascadeKey}`"
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
      </template>
      <template #default>
        <div class="items-page__body">
          <m-card class="w-full flex flex-col" padding="0">
            <ListPageToolbar justify="between" class="items-page__toolbar">
              <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()">新增物料</n-button>
              <vxe-toolbar ref="VxeToolbarRef" custom />
            </ListPageToolbar>
            <m-card class="erp-list-table-wrap" padding="0">
              <ListPageTable
                :data="data.list"
                :loading="loading"
                :cell-height="64"
                ref="VxeTableRef"
                :size="componentSize"
              >
                <vxe-column field="code" title="物料编码" align="center" min-width="200" />
                <vxe-column field="name" title="名称" align="center" min-width="200" />
                <vxe-column title="图片" align="center" width="72">
                  <template #default="{ row }">
                    <n-image
                      v-if="row.image"
                      :src="row.image"
                      width="48"
                      height="48"
                      object-fit="cover"
                      class="items-page__thumb"
                      preview-disabled
                    />
                    <span v-else class="items-page__thumb-empty">—</span>
                  </template>
                </vxe-column>
                <vxe-column field="typeName" title="品类" align="center" min-width="200" />
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
                <vxe-column field="unitName" title="单位" align="center" min-width="70" />
                <vxe-column field="brand" title="品牌" align="center" min-width="110" />
                <vxe-column title="规格1" align="center" min-width="110">
                  <template #default="{ row }">{{ getSpec1Name(row) }}</template>
                </vxe-column>
                <vxe-column title="规格2" align="center" min-width="110">
                  <template #default="{ row }">{{ getSpec2Name(row) }}</template>
                </vxe-column>
                <vxe-column field="material" title="材质" align="center" min-width="200" />
                <vxe-column title="采购含税" align="center" min-width="116">
                  <template #default="{ row }">
                    <span class="erp-list-table__money">{{ formatMoney(row.purchasePriceWithTax) }}</span>
                  </template>
                </vxe-column>
                <vxe-column title="销售含税" align="center" min-width="116">
                  <template #default="{ row }">
                    <span class="erp-list-table__money">{{ formatMoney(row.salePriceWithTax) }}</span>
                  </template>
                </vxe-column>
                <vxe-column
                  field="vatTaxRate"
                  title="税率%"
                  align="center"
                  min-width="88"
                  class-name="erp-list-table__col-secondary"
                >
                  <template #default="{ row }">
                    <span>{{ row.vatTaxRate != null && row.vatTaxRate !== "" ? `${row.vatTaxRate}%` : "—" }}</span>
                  </template>
                </vxe-column>
                <vxe-column title="采购不含税" align="center" min-width="116" class-name="erp-list-table__col-secondary">
                  <template #default="{ row }">
                    <span class="erp-list-table__money">{{ formatMoney(row.purchasePriceWithoutTax) }}</span>
                  </template>
                </vxe-column>
                <vxe-column title="税额" align="center" min-width="100" class-name="erp-list-table__col-secondary">
                  <template #default="{ row }">
                    <span class="erp-list-table__money">{{ formatMoney(row.taxAmount) }}</span>
                  </template>
                </vxe-column>
                <vxe-column title="销售不含税" align="center" min-width="116" class-name="erp-list-table__col-secondary">
                  <template #default="{ row }">
                    <span class="erp-list-table__money">{{ formatMoney(row.salePriceWithoutTax) }}</span>
                  </template>
                </vxe-column>
                <vxe-column
                  field="remark"
                  title="备注"
                  align="center"
                  min-width="200"
                  class-name="erp-list-table__col-secondary"
                />
                <vxe-column title="创建时间" align="center" min-width="168" class-name="erp-list-table__col-secondary">
                  <template #default="{ row }">
                    <span class="erp-list-table__time">{{ row.createTime ? formatDateTime(row.createTime) : "—" }}</span>
                  </template>
                </vxe-column>
                <vxe-column title="更新时间" align="center" min-width="168" class-name="erp-list-table__col-secondary">
                  <template #default="{ row }">
                    <span class="erp-list-table__time">{{ row.updateTime ? formatDateTime(row.updateTime) : "—" }}</span>
                  </template>
                </vxe-column>
                <vxe-column fixed="right" title="操作" align="center" width="180">
                  <template #default="{ row }">
                    <n-flex justify="center">
                      <n-button type="primary" text :size="appStore.searchBarSize" @click="showCopyModal(row.uid)"
                        >复制
                      </n-button>
                      <n-button type="info" text :size="appStore.searchBarSize" @click="showUpdateModal(row.uid)"
                        >编辑
                      </n-button>
                      <n-button type="error" text :size="appStore.searchBarSize" @click="showDeleteModal(row.uid)"
                        >删除
                      </n-button>
                    </n-flex>
                  </template>
                </vxe-column>
              </ListPageTable>
            </m-card>
          </m-card>
        </div>
      </template>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end items-page__pager">
          <vxe-pager
            :size="componentSize"
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
        </m-card>
      </template>
    </l-card>
  </div>
  <!-- 弹窗 -->
  <FormModal v-model:show="showUpdate" title="物料信息" size="lg">
    <n-form :model="formData" ref="formRef" :rules="formRule" class="ItemsForm">
      <n-grid cols="2" x-gap="16" y-gap="0">
        <n-gi span="2">
          <n-form-item label="图片">
            <FastUpload @before-upload="handlerBeforeUpload">
              <div class="ItemsForm-upload" v-if="formData.image">
                <n-image :src="formData.image" preview-disabled class="cursor-pointer" />
              </div>
              <div v-else class="ItemsForm-upload ItemsForm-upload--empty">
                <n-icon size="40">
                  <AddPhotoAlternateRound />
                </n-icon>
              </div>
            </FastUpload>
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="ItemsForm-section">
            <div class="ItemsForm-section__title">基本信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="物料编码">
            <n-input
              :value="codePreview || formData.code"
              disabled
              placeholder="选择品类、规格1/规格2、品牌后自动生成"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入名称" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="业务类型" path="itemBizType">
            <n-select
              v-model:value="formData.itemBizType"
              :options="formData.itemBizTypeOptions"
              placeholder="请选择业务类型"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="品类" path="type">
            <n-cascader
              v-model:value="formData.type"
              placeholder="请选择末级品类"
              expand-trigger="hover"
              :options="formData.typeOptions"
              check-strategy="child"
              :show-path="true"
              :filterable="true"
              @update:value="handleUpdateTypeValue"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="单位" path="unit">
            <n-cascader
              v-model:value="formData.unit"
              placeholder="请选择单位"
              expand-trigger="hover"
              :options="formData.unitOptions"
              check-strategy="child"
              :show-path="true"
              :filterable="true"
              @update:value="handleUpdateUnitValue"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="供应商" path="supplierUid">
            <n-select
              v-model:value="formData.supplierUid"
              :options="formData.supplierOptions"
              placeholder="请选择供应商"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="ItemsForm-section">
            <div class="ItemsForm-section__title">规格信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="品牌" path="brandUid">
            <n-select
              v-model:value="formData.brandUid"
              :options="formData.brandOptions || []"
              label-field="label"
              value-field="value"
              placeholder="请选择品牌"
              clearable
              filterable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="规格1">
            <n-select
              v-model:value="formData.spec1Uid"
              :options="formData.spec1Options || []"
              label-field="label"
              value-field="value"
              clearable
              filterable
              :disabled="!formData.type"
              placeholder="请选择规格1"
              @update:value="handleUpdateSpec1Value"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="规格2">
            <n-select
              v-model:value="formData.spec2Uid"
              :options="formData.spec2Options || []"
              label-field="label"
              value-field="value"
              clearable
              filterable
              :disabled="!formData.type || !formData.spec1Uid"
              placeholder="请先选择规格1"
              @update:value="handleUpdateSpec2Value"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="材质">
            <n-input v-model:value="formData.material" placeholder="请输入材质" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="ItemsForm-section">
            <div class="ItemsForm-section__title">价格信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="增值税率(%)">
            <n-input-number
              v-model:value="formData.vatTaxRate"
              placeholder="如 13"
              :show-button="false"
              :min="0"
              :max="100"
              class="w-full"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="采购单价(含税)">
            <n-input-number
              class="w-full"
              v-model:value="formData.purchasePriceWithTax"
              placeholder="请输入含税单价"
              :show-button="false"
              :min="0"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="采购单价(不含税)">
            <n-input-number
              class="w-full"
              v-model:value="formData.purchasePriceWithoutTax"
              placeholder="自动计算"
              :show-button="false"
              :min="0"
              disabled
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="税额">
            <n-input-number
              class="w-full"
              v-model:value="formData.taxAmount"
              placeholder="自动计算"
              :show-button="false"
              :min="0"
              disabled
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="销售单价(含税)">
            <n-input-number
              class="w-full"
              v-model:value="formData.salePriceWithTax"
              placeholder="请输入含税单价"
              :show-button="false"
              :min="0"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="销售单价(不含税)">
            <n-input-number
              class="w-full"
              v-model:value="formData.salePriceWithoutTax"
              placeholder="自动计算"
              :show-button="false"
              :min="0"
              disabled
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="备注">
            <n-input type="textarea" v-model:value="formData.remark" placeholder="请输入备注" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-button type="primary" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">确定</n-button>
    </template>
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

.ItemsForm-section {
  margin-top: 4px;
}

.ItemsForm-section__title {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--n-text-color-1);
  padding-bottom: 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--n-divider-color);
}

.ItemsForm-upload {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed var(--n-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--n-primary-color);
  }

  :deep(.n-image) {
    width: 100%;
    height: 100%;
  }
}

.ItemsForm-upload--empty {
  color: var(--n-text-color-3);
  background: var(--n-action-color);
}

.items-page {
  height: 100%;
  min-height: 0;

  &__card {
    height: 100%;
    min-height: 0;

    // LCard 主体：搜索栏展开后在此区域滚动，避免表格被压扁
    :deep(> .flex-1.min-h-0) {
      overflow-y: auto !important;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }
  }

  &__body {
    min-height: min(100%, 480px);
  }
}

.items-page__search {
  padding: 8px 8px 4px;

  :deep(.n-form-item) {
    width: 100%;
  }

  :deep(.n-form-item .n-form-item-blank) {
    flex: 1;
    min-width: 0;
  }

  :deep(.n-form-item-label) {
    padding-right: 8px;
  }
}

.items-page__search-actions-item {
  :deep(.n-form-item-blank) {
    display: flex;
    align-items: center;
  }
}

.items-page__search-actions {
  display: flex;
  //flex-wrap: wrap;
  gap: 8px;
}

.items-page__advanced {
  padding: 4px 0 8px;
  border-top: 1px dashed var(--n-divider-color);
  margin-top: 4px;
}

.items-page__head-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--n-text-color-1);
}

.items-page__thumb {
  border-radius: 8px;
}

.items-page__thumb-empty {
  color: var(--n-text-color-3);
  font-size: 13px;
}

.items-page__pager {
  padding: 0 12px 8px;
}

</style>
