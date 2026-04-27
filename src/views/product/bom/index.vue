<script lang="ts" setup>
import { h, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { NButton } from "naive-ui"
import { useAppStore } from "@/store/modules/app"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { resetRef } from "@/utils"
import { ProductionBomForm, ProductionBomItemVo, ProductionBomProductVo, ProductionBomQuery } from "@/model/product"
import { ProductionBomService } from "@/services/product/ProductionBomService"

const appStore = useAppStore()
const loading = ref(false)
const submitting = ref(false)
const showEdit = ref(false)
const query = ref<ProductionBomQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<ProductionBomProductVo, void>>({})
const formData = ref<ProductionBomForm>({ detailList: [], componentOptions: [] })

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
                <n-form-item label="成品:">
                  <n-input v-model:value="query.key" clearable />
                </n-form-item>
              </n-gi>
              <n-gi span="3">
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="info" secondary strong @click="search">
                      <template #icon><n-icon><Search /></n-icon></template>
                      搜索
                    </n-button>
                    <n-button type="tertiary" secondary strong @click="reset">
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
        <m-card class="h-full overflow-auto">
          <n-data-table :columns="[
            { title: '成品', key: 'name' },
            { title: '类型', key: 'typeName' },
            { title: '单位', key: 'unitName' },
            { title: 'BOM数量', key: 'bomCount' },
            {
              title: '操作',
              key: 'actions',
              render: (row: ProductionBomProductVo) => h(
                NButton,
                { type: 'primary', size: 'small', onClick: () => openEdit(row.uid) },
                { default: () => '编辑BOM' }
              )
            }
          ]" :data="data.list || []" :loading="loading" />
        </m-card>
      </template>
    </l-card>

    <n-modal v-model:show="showEdit" preset="card" title="编辑生产BOM" class="w-[1000px] max-w-[95vw]">
      <div class="space-y-4">
        <n-alert type="info" :show-icon="false">
          当前成品：{{ formData.productName || "-" }}
        </n-alert>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">BOM 明细</div>
          <n-button type="primary" @click="addDetail">新增零件</n-button>
        </div>
        <n-table striped size="small">
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
                <n-input-number v-model:value="item.quantity" :min="0" class="w-full" />
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
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="submit">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
