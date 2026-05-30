<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from "vue"
import FormModal from "@/components/FormModal/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import { ItemsService } from "@/services/template/ItemsService"
import { ItemDictService } from "@/services/template/ItemDictService"
import { ItemsForm, ItemsQuery, ItemsQueryData, ItemsVo } from "@/model/template/items"
import FastUpload from "@/components/FastUpload/FastUpload.vue"
import { AddPhotoAlternateRound } from "@vicons/material"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
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
const querySpecOptions = ref(queryFormData.value.specOptions || [])
const queryBrandOptions = ref(queryFormData.value.brandOptions || [])
/** 重置时递增，强制规格/品牌下拉重建，避免无 options 时展示 uid */
const queryCascadeKey = ref(0)
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  ItemsService.select(query.value)
    .then((res) => {
      data.value = res
      if (query.value.type) {
        querySpecOptions.value = res.extraData?.specOptions || querySpecOptions.value
        queryBrandOptions.value = res.extraData?.brandOptions || queryBrandOptions.value
      } else {
        querySpecOptions.value = []
        queryBrandOptions.value = []
      }
    })
    .finally(() => {
      loading.value = false
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function loadQueryOptions() {
  ItemsService.form().then((res) => {
    queryFormData.value = res
  })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  formData.value.specUidList = []
  codePreview.value = ""
  showUpdate.value = true
  ItemsService.form(uid).then((data) => {
    formData.value = data
    formData.value.specUidList = Array.isArray(data.specUidList) ? [...data.specUidList] : []
    codePreview.value = data.code || ""
    refreshCodePreview()
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  ItemsService.form(uid).then((res) => {
    formData.value = res
    formData.value.uid = undefined
    formData.value.id = undefined
    formData.value.code = undefined
  })
}

function confirmUpdate() {
  normalizePrice()
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    ItemsService.addOrUpdate(formData.value)
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

function search() {
  query.value.currentPage = 1
  select()
}

function clearQueryCascade() {
  query.value.specUid = undefined
  query.value.brandUid = undefined
  querySpecOptions.value = []
  queryBrandOptions.value = []
}

async function reset() {
  clearQueryCascade()
  query.value.key = undefined
  query.value.itemBizType = undefined
  query.value.type = undefined
  query.value.currentPage = 1
  query.value.pageSize = 50
  queryCascadeKey.value += 1
  await nextTick()
  select()
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
  formData.value.specUidList = []
  formData.value.brandUid = undefined
  if (!v) {
    formData.value.specOptions = []
    formData.value.brandOptions = []
    codePreview.value = ""
    return
  }
  try {
    const picker = await ItemDictService.picker(v)
    formData.value.specOptions = picker.specOptions || []
    formData.value.brandOptions = picker.brandOptions || []
  } catch {
    formData.value.specOptions = []
    formData.value.brandOptions = []
  }
  refreshCodePreview()
}

async function handleQueryTypeValue(v: string | null) {
  clearQueryCascade()
  if (!v) return
  try {
    const picker = await ItemDictService.treePicker(v)
    querySpecOptions.value = picker.specOptions || []
    queryBrandOptions.value = picker.brandOptions || []
  } catch {
    querySpecOptions.value = []
    queryBrandOptions.value = []
  }
}

function handleUpdateSpecValue(v: string[] | null) {
  if (!v || v.length <= 2) return
  formData.value.specUidList = v.slice(0, 2)
  window.$message?.warning("规格最多选择两个")
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
      specUids: formData.value.specUidList || [],
      brandUid: formData.value.brandUid
    })
  } catch {
    if (!formData.value.uid) codePreview.value = ""
  }
}

watch(
  () => [formData.value.specUidList, formData.value.brandUid],
  () => {
    refreshCodePreview()
  },
  { deep: true }
)

onMounted(() => {
  loadQueryOptions()
  select()
  getCardProps()
  const $table = VxeTableRef.value
  const $toolbar = VxeToolbarRef.value
  if ($table && $toolbar) {
    $table.connect($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm label-placement="left" ref="queryFormRef">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.key" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="业务类型:">
                  <n-select clearable v-model:value="query.itemBizType" :options="queryFormData.itemBizTypeOptions" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="品类:">
                  <n-cascader
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
              <n-gi>
                <n-form-item label="规格:">
                  <n-select
                    :key="`query-spec-${queryCascadeKey}`"
                    clearable
                    filterable
                    v-model:value="query.specUid"
                    :options="querySpecOptions"
                    label-field="label"
                    value-field="value"
                    :disabled="!query.type"
                    placeholder="请先选择品类"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="品牌:">
                  <n-select
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
              <n-gi span="2">
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="primary" @click="search">
                      <template #icon>
                        <n-icon>
                          <Search />
                        </n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset">
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
          </SearchQueryForm>
        </m-card>
      </template>
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <ListPageToolbar>
            <n-button type="primary" @click="showUpdateModal()">新增物料</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :cell-config="{ height: 80 }"
              :row-config="{ isHover: true }"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
              :size="componentSize"
            >
              <vxe-column field="code" title="物料编码" show-overflow="tooltip" align="center" width="12%" />
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="18%" />
              <vxe-column title="图片" show-overflow="tooltip" align="center" width="10%">
                <template #default="{ row }">
                  <div class="flex justify-center items-center">
                    <n-image :src="row.image" class="max-h-[4rem] max-w-[4rem]" />
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="typeName" title="品类" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="itemBizTypeName" title="业务类型" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="brand" title="品牌" show-overflow="tooltip" align="center" width="10%" />

              <vxe-column field="spec" title="规格" align="center" width="15%">
                <template #default="{ row }">
                  <n-flex justify="center" size="small">
                    <n-tag v-for="spec in (row.spec || '').split('、').filter(Boolean)" :key="spec" type="info">
                      {{ spec }}
                    </n-tag>
                  </n-flex>
                </template>
              </vxe-column>
              <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="vatTaxRate" title="增值税率" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column
                field="purchasePriceWithTax"
                title="采购单价（含税）"
                show-overflow="tooltip"
                align="center"
                width="15%"
              />
              <vxe-column
                field="purchasePriceWithoutTax"
                title="采购单价（不含税）"
                show-overflow="tooltip"
                align="center"
                width="15%"
              />
              <vxe-column field="taxAmount" title="税额" show-overflow="tooltip" align="center" width="12%" />
              <vxe-column
                field="salePriceWithTax"
                title="销售单价（含税）"
                show-overflow="tooltip"
                align="center"
                width="15%"
              />
              <vxe-column
                field="salePriceWithoutTax"
                title="销售单价（不含税）"
                show-overflow="tooltip"
                align="center"
                width="15%"
              />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="30%" />
              <vxe-column
                field="createTime"
                title="创建时间"
                show-overflow="tooltip"
                align="center"
                :visible="false"
                width="20%"
              />
              <vxe-column
                field="updateTime"
                title="更新时间"
                show-overflow="tooltip"
                align="center"
                :visible="false"
                width="20%"
              />
              <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="180">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <n-button type="primary" text @click="showCopyModal(row.uid)">复制</n-button>
                    <n-button type="info" text @click="showUpdateModal(row.uid)">编辑</n-button>
                    <n-button type="error" text @click="showDeleteModal(row.uid)">删除</n-button>
                  </n-flex>
                </template>
              </vxe-column>
            </vxe-table>
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
            <n-input :value="codePreview || formData.code" disabled placeholder="选择品类、规格、品牌后自动生成" />
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
          <n-form-item label="规格">
            <n-select
              v-model:value="formData.specUidList"
              :options="formData.specOptions || []"
              label-field="label"
              value-field="value"
              multiple
              filterable
              :disabled="!formData.type"
              placeholder="可多选，按选择顺序参与编码"
              @update:value="handleUpdateSpecValue"
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
</style>
