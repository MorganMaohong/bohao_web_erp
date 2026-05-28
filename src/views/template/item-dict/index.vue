<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import ErpFormModal from "@/components/ErpFormModal/index.vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { ItemDictService } from "@/services/template/ItemDictService"
import { ItemDictForm, ItemDictQuery, ItemDictVo } from "@/model/template/item-dict"
import { resetRef } from "@/utils"
import { UpdateDragSortForm } from "@/model"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<ItemDictForm>({})
const formRef = ref<FormInst>()
const loading = ref(false)
const formRule = {
  nodeKind: {
    required: true,
    message: "请选择节点类型",
    trigger: ["input", "blur"]
  },
  code: {
    required: true,
    message: "请输入编码",
    trigger: ["input", "blur"]
  },
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  }
}
const query = ref<ItemDictQuery>({})
const data = ref<ItemDictVo[]>([])
const updateDragSortForm = ref<UpdateDragSortForm>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

const parentTreeOptions = computed(() => formData.value.treeOptions || [])

const leafCategoryOptions = computed(() =>
  data.value
    .filter((row) => row.nodeKind === "CATEGORY" && row.leafCategory && !row.virtualNode)
    .map((row) => ({
      label: row.categoryPathName || row.name || "",
      value: row.uid || ""
    }))
)

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  ItemDictService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  ItemDictService.form(uid).then((res) => {
    formData.value = res
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  ItemDictService.form(uid).then((res) => {
    formData.value = res
    formData.value.uid = undefined
    formData.value.id = undefined
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    ItemDictService.addOrUpdate(formData.value)
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
  ItemDictService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function updateSort() {
  ItemDictService.updateSort(updateDragSortForm.value).then(() => {
    select()
  })
}

function search() {
  select()
}

function reset() {
  query.value = resetRef(query.value)
  select()
}

function rowName(row: ItemDictVo) {
  if (row.virtualNode) return row.name
  if (row.nodeKind === "CATEGORY") return row.categoryPathName || row.name
  return row.name
}

function canOperate(row: ItemDictVo) {
  return !row.virtualNode
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
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.name" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="primary" @click="search">
                      <template #icon>
                        <n-icon><Search /></n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset">
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
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <m-card padding="0" class="px-2 pt-2 flex items-center justify-between">
            <n-button type="primary" @click="showUpdateModal()">新增物料</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1 ItemDict-table">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data"
              border
              stripe
              :loading="loading"
              :size="componentSize"
              :tree-config="{ transform: true, rowField: 'uid', parentField: 'parentUid' }"
              :row-config="{ drag: true, isHover: true }"
              :height="TableCardMaxHeight"
              :row-drag-config="{
                isCrossDrag: true,
                async dragEndMethod({ newRow, oldRow }) {
                  if (newRow.virtualNode || oldRow.virtualNode) return false
                  if (newRow.parentUid === oldRow.parentUid && newRow.nodeKind === oldRow.nodeKind) {
                    updateDragSortForm.newSort = newRow.sort
                    updateDragSortForm.oldSort = oldRow.sort
                    updateDragSortForm.newUid = newRow.uid
                    updateDragSortForm.oldUid = oldRow.uid
                    updateSort()
                  }
                  return false
                }
              }"
              ref="VxeTableRef"
            >
              <vxe-column field="name" title="名称" show-overflow="tooltip" tree-node drag-sort min-width="220">
                <template #default="{ row }">
                  <span class="ItemDict-name">{{ rowName(row) }}</span>
                </template>
              </vxe-column>
              <vxe-column field="code" title="编码" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="nodeKindName" title="类型" show-overflow="tooltip" align="center" width="100" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" />
              <vxe-column fixed="right" title="操作" align="center" width="180">
                <template #default="{ row }">
                  <n-flex v-if="canOperate(row)" justify="center">
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
    </l-card>
  </div>
  <ErpFormModal v-model:show="showUpdate" title="物料字典" size="md">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="1">
        <n-gi>
          <n-form-item label="节点类型" path="nodeKind">
            <n-select
              v-model:value="formData.nodeKind"
              :options="formData.nodeKindOptions"
              :disabled="Boolean(formData.uid)"
              placeholder="请选择节点类型"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="上级">
            <n-tree-select
              v-if="formData.nodeKind === 'CATEGORY' || !formData.nodeKind"
              v-model:value="formData.parentUid"
              :options="parentTreeOptions"
              key-field="value"
              clearable
              placeholder="上级品类，可留空"
            />
            <n-select
              v-else
              v-model:value="formData.parentUid"
              :options="leafCategoryOptions"
              clearable
              filterable
              placeholder="请选择末级品类"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="编码" path="code">
            <n-input v-model:value="formData.code" placeholder="如 DQ、1P；同级不可重复" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="备注">
            <n-input type="textarea" v-model:value="formData.remark" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-button type="primary" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">
        确定
      </n-button>
    </template>
  </ErpFormModal>
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

.ItemDict-table {
  :deep(.vxe-tree--btn-wrapper) {
    display: inline-flex;
    vertical-align: middle;
  }

  :deep(.vxe-cell--tree-node) {
    display: flex;
    align-items: center;
  }

  :deep(.vxe-cell--drag-handle) {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }
}

.ItemDict-name {
  vertical-align: middle;
}
</style>
