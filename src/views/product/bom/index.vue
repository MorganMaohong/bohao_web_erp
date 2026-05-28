<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { VxePagerEvents } from "vxe-pc-ui"
import { useAppStore } from "@/store/modules/app"
import LCard from "@/components/LCard/index.vue"
import ErpFormModal from "@/components/ErpFormModal/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { resetRef } from "@/utils"
import { ProductionBomForm, ProductionBomItemVo, ProductionBomProductVo, ProductionBomQuery } from "@/model/product"
import { ProductionBomService } from "@/services/product/ProductionBomService"

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

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value?.$el?.clientHeight
    ? TableCardRef.value.$el.clientHeight - 20
    : 520
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

function search() {
  query.value.currentPage = 1
  select()
}

function reset() {
  query.value = resetRef(query.value)
  query.value.currentPage = 1
  query.value.pageSize = 50
  select()
}

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function openEdit(uid?: string) {
  if (!uid) return
  showEdit.value = true
  submitting.value = true
  ProductionBomService.form(uid)
    .then((res) => {
      formData.value = { ...res, detailList: res.detailList || [], componentOptions: res.componentOptions || [] }
    })
    .finally(() => {
      submitting.value = false
    })
}

function addDetail() {
  formData.value.detailList = formData.value.detailList || []
  formData.value.detailList.push({ quantity: 1 })
}

function removeDetail(index: number) {
  formData.value.detailList?.splice(index, 1)
}

function handleComponentChange(item: ProductionBomItemVo) {
  const option = formData.value.componentOptions?.find((v) => v.value === item.componentItemUid)
  item.name = option?.label
}

function submit() {
  const detailList = formData.value.detailList || []
  if (!formData.value.productItemUid) {
    window.$message?.error("成品不能为空")
    return
  }
  for (const item of detailList) {
    if (!item.componentItemUid) {
      window.$message?.error("请选择零件物料")
      return
    }
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
    $table.connect($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <n-form label-placement="left" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="成品:">
                  <n-input v-model:value="query.key" clearable />
                </n-form-item>
              </n-gi>
              <n-gi span="3">
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="primary" @click="search">
                      <template #icon><n-icon><Search /></n-icon></template>
                      搜索
                    </n-button>
                    <n-button @click="reset">
                      <template #icon><n-icon><Reset /></n-icon></template>
                      重置
                    </n-button>
                  </div>
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-form>
        </m-card>
      </template>
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <m-card padding="0" class="px-2 pt-2 flex items-center justify-end">
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              ref="VxeTableRef"
              :column-config="{ resizable: true }"
              :data="data.list || []"
              border
              stripe
              :loading="loading"
              :row-config="{ isHover: true }"
              :height="TableCardMaxHeight"
              :size="componentSize"
            >
              <vxe-column field="name" title="成品" show-overflow="tooltip" align="center" min-width="180" />
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="140" />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="100" />
              <vxe-column field="bomCount" title="BOM数量" show-overflow="tooltip" align="center" width="120" />
              <vxe-column fixed="right" title="操作" align="center" width="140">
                <template #default="{ row }">
                  <n-button type="primary" text @click="openEdit(row.uid)">编辑BOM</n-button>
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
            :total="data.count || 0"
            :layouts="['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total']"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>

    <ErpFormModal v-model:show="showEdit" title="编辑生产BOM" size="lg">

      <n-form class="TemplateForm">
        <n-alert type="info" :show-icon="false" class="mb-3">
          当前成品：{{ formData.productName || "-" }}
        </n-alert>
        <div class="TemplateForm-section TemplateForm-section__head">
          <div class="TemplateForm-section__title">BOM 明细</div>
          <n-button type="primary" @click="addDetail">新增零件</n-button>
        </div>
        <n-table striped :size="componentSize">
          <thead>
            <tr>
              <th class="w-[260px]">零件</th>
              <th class="w-[120px]">用量</th>
              <th>备注</th>
              <th class="w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.detailList || []" :key="index">
              <td>
                <n-select
                  v-model:value="item.componentItemUid"
                  :options="formData.componentOptions"
                  clearable
                  filterable
                  @update:value="handleComponentChange(item)"
                />
              </td>
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
      </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showEdit = false">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="submit">保存</n-button>
      </n-flex>
    </template>
  </ErpFormModal>
  </div>
</template>
