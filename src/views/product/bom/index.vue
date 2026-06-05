<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useAutoListSearch } from "@/hooks/useAutoListSearch"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { useAppStore } from "@/store/modules/app"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import ListPageTable from "@/components/ListPageTable/index.vue"
import ListSearchActions from "@/components/ListSearchActions/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { ProductionBomForm, ProductionBomItemVo, ProductionBomProductVo, ProductionBomQuery } from "@/model/product"
import { ProductionBomService } from "@/services/product/ProductionBomService"
import { ItemsService } from "@/services/template/ItemsService"
import { ItemsVo } from "@/model/template/items"
import { formatItemSpecLabel, getSpec1Name, getSpec2Name, type ItemSpecRow } from "@/utils/itemSpec"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as "small" | "medium" | "large")
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()
const loading = ref(false)
const submitting = ref(false)
const showEdit = ref(false)
const query = ref<ProductionBomQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<ProductionBomProductVo, void>>({})
const formData = ref<ProductionBomForm>({ detailList: [], componentOptions: [] })
const componentItems = ref<ItemsVo[]>([])

const componentMap = computed<Record<string, ItemsVo>>(() =>
  Object.fromEntries((componentItems.value || []).filter((item) => item.uid).map((item) => [item.uid as string, item]))
)

const componentSelectOptions = computed(() =>
  componentItems.value.map((item) => ({
    label: formatItemOptionLabel(item),
    value: item.uid
  }))
)

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value?.$el?.clientHeight ? TableCardRef.value.$el.clientHeight - 20 : 520
}

function formatItemOptionLabel(item?: Pick<ItemsVo, "name" | "spec" | "spec1Name" | "spec2Name">) {
  const name = item?.name
  if (!name) return ""
  const specLabel = formatItemSpecLabel(item)
  return specLabel !== "-" ? `${name} / ${specLabel}` : name
}

function copyItemSpecMeta(target: ItemSpecRow, source?: ItemsVo | null) {
  if (!source) return
  target.spec = source.spec
  target.spec1Name = source.spec1Name
  target.spec2Name = source.spec2Name
}

function loadComponentItems() {
  return ItemsService.select({ currentPage: 1, pageSize: 500, itemBizType: "component" }).then((res) => {
    componentItems.value = res.list || []
  })
}

function select() {
  loading.value = true
  ProductionBomService.select(query.value)
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

const { triggerInputSearch, flushInputSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    query.value = {
      currentPage: 1,
      pageSize: 50,
      key: ""
    }
  })
}

function pageChange(event: { currentPage: number; pageSize: number }) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function openEdit(uid?: string) {
  if (!uid) return
  showEdit.value = true
  submitting.value = true
  Promise.all([ProductionBomService.form(uid), loadComponentItems()])
    .then(([res]) => {
      formData.value = { ...res, detailList: res.detailList || [], componentOptions: res.componentOptions || [] }
      const savedDetailMap = Object.fromEntries(
        (res.detailList || [])
          .filter((item) => item.componentItemUid)
          .map((item) => [item.componentItemUid as string, item])
      )
      ;(formData.value.detailList || []).forEach((item) => {
        syncDetailFromComponent(item)
        const saved = savedDetailMap[item.componentItemUid || ""]
        if (saved) {
          item.totalQuantity = saved.totalQuantity
          item.availableQuantity = saved.availableQuantity
        }
      })
    })
    .finally(() => {
      submitting.value = false
    })
}

function syncDetailFromComponent(item: ProductionBomItemVo) {
  const source = componentMap.value[item.componentItemUid || ""]
  if (!source) return
  item.name = source.name
  item.image = source.image
  item.type = source.type
  item.typeName = source.typeName
  item.unit = source.unit
  item.unitName = source.unitName
  item.material = source.material
  copyItemSpecMeta(item, source)
}

function addDetail() {
  formData.value.detailList = formData.value.detailList || []
  formData.value.detailList.push({ quantity: 1 })
}

function removeDetail(index: number) {
  formData.value.detailList?.splice(index, 1)
}

function handleComponentChange(item: ProductionBomItemVo) {
  syncDetailFromComponent(item)
}

function submit() {
  const detailList = formData.value.detailList || []
  if (!formData.value.productItemUid) {
    window.$message?.error("成品不能为空")
    return
  }
  const componentUidSet = new Set<string>()
  for (const item of detailList) {
    if (!item.componentItemUid) {
      window.$message?.error("请选择零件物料")
      return
    }
    if (componentUidSet.has(item.componentItemUid)) {
      window.$message?.error("BOM 零件不能重复")
      return
    }
    componentUidSet.add(item.componentItemUid)
    if (!item.quantity || Number(item.quantity) <= 0) {
      window.$message?.error("BOM用量必须大于0")
      return
    }
  }
  submitting.value = true
  ProductionBomService.update(formData.value)
    .then(() => {
      showEdit.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

onMounted(() => {
  select()
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
                  <n-form-item label="成品">
                    <n-input
                      class="w-full"
                      v-model:value="query.key"
                      clearable
                      placeholder="名称/规格/材质"
                      @update:value="triggerInputSearch"
                      @keyup.enter="flushInputSearch"
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
          <ListPageToolbar justify="end">
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1 erp-list-table-wrap">
            <ListPageTable
              ref="VxeTableRef"
              :data="data.list || []"
              :loading="loading"
              :height="TableCardMaxHeight"
              :size="componentSize"
            >
              <vxe-column field="name" title="成品" show-overflow="tooltip" align="center" min-width="160" />
              <vxe-column title="规格1" show-overflow="tooltip" align="center" min-width="120">
                <template #default="{ row }">{{ getSpec1Name(row) }}</template>
              </vxe-column>
              <vxe-column title="规格2" show-overflow="tooltip" align="center" min-width="120">
                <template #default="{ row }">{{ getSpec2Name(row) }}</template>
              </vxe-column>
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="90" />
              <vxe-column field="bomCount" title="BOM数量" show-overflow="tooltip" align="center" width="100" />
              <vxe-column fixed="right" title="操作" align="center" width="120">
                <template #default="{ row }">
                  <n-button type="primary" text @click="openEdit(row.uid)">编辑BOM</n-button>
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

    <FormModal v-model:show="showEdit" title="编辑生产BOM" size="xl">
      <n-form class="TemplateForm">
        <n-alert type="info" :show-icon="false" class="mb-3"> 当前成品：{{ formData.productName || "-" }} </n-alert>
        <div class="TemplateForm-section TemplateForm-section__head">
          <div class="TemplateForm-section__title">BOM 明细</div>
          <n-button type="primary" @click="addDetail">新增零件</n-button>
        </div>
        <div class="TemplateForm-table-wrap w-full overflow-x-auto">
          <n-table striped :size="componentSize" class="min-w-[960px]">
            <thead>
              <tr>
                <th class="min-w-[240px]">零件</th>
                <th class="min-w-[100px]">规格1</th>
                <th class="min-w-[100px]">规格2</th>
                <th class="min-w-[90px]">类型</th>
                <th class="min-w-[70px]">单位</th>
                <th class="min-w-[90px]">库存</th>
                <th class="min-w-[100px]">用量</th>
                <th class="min-w-[140px]">备注</th>
                <th class="w-[80px]">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in formData.detailList || []" :key="index">
                <td>
                  <n-select
                    v-model:value="item.componentItemUid"
                    :options="componentSelectOptions"
                    clearable
                    filterable
                    @update:value="handleComponentChange(item)"
                  />
                </td>
                <td>{{ getSpec1Name(item) }}</td>
                <td>{{ getSpec2Name(item) }}</td>
                <td>{{ item.typeName || "-" }}</td>
                <td>{{ item.unitName || "-" }}</td>
                <td>{{ item.availableQuantity ?? item.totalQuantity ?? "-" }}</td>
                <td>
                  <n-input-number v-model:value="item.quantity" :min="0.000001" class="w-full" />
                </td>
                <td>
                  <n-input v-model:value="item.remark" />
                </td>
                <td>
                  <n-button type="error" tertiary @click="removeDetail(index)">删除</n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </n-form>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="submit">保存</n-button>
        </n-flex>
      </template>
    </FormModal>
  </div>
</template>
