<script lang="ts" setup>
import { onMounted, ref } from "vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { DictionaryService } from "@/services/template/DictionaryService"
import { DictionaryForm, DictionaryQuery, DictionaryVo } from "@/model/template/dictionary"
import { resetRef } from "@/utils"
import { UpdateDragSortForm } from "@/model"
import { VxeTableInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<DictionaryForm>({})
const formRef = ref<FormInst>()
const loading = ref(false)
const formRule = {
  type: {
    required: true,
    message: "请选择类型",
    trigger: ["input", "blur"]
  },
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  }
}
const query = ref<DictionaryQuery>({})
const data = ref<DictionaryVo[]>([])
const updateDragSortForm = ref<UpdateDragSortForm>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  DictionaryService.select(query.value)
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
  DictionaryService.form(uid).then((data) => {
    formData.value = data
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  DictionaryService.form(uid).then((res) => {
    formData.value = res
    formData.value.uid = null
    formData.value.id = null
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    DictionaryService.addOrUpdate(formData.value)
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
  isSubmitting.value = true
  DictionaryService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function updateSort() {
  DictionaryService.updateSort(updateDragSortForm.value).then(() => {
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
          <n-form label-placement="left" :size="appStore.componentSize" ref="queryFormRef" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.name" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button @click="search" type="info" icon-placement="left" secondary strong>
                      <template #icon>
                        <n-icon>
                          <Search />
                        </n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset" type="tertiary" icon-placement="left" secondary strong>
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
          </n-form>
        </m-card>
      </template>
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <m-card padding="0" class="px-2 pt-2 flex items-center justify-between">
            <n-button type="primary" :size="appStore.componentSize" @click="showUpdateModal()">新增字典</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data"
              border
              stripe
              :loading="loading"
              :size="appStore.componentSize"
              :tree-config="{ transform: true, rowField: 'uid', parentField: 'parentUid' }"
              :row-config="{ drag: true, isHover: true }"
              :height="TableCardMaxHeight"
              :row-drag-config="{
                isCrossDrag: true,
                async dragEndMethod({ newRow, oldRow, dragRow, dragPos, dragToChild }) {
                  if (newRow.parentUid === oldRow.parentUid) {
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
              <vxe-column field="name" title="名称" show-overflow="tooltip" tree-node drag-sort />
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" />
              <vxe-column field="createTime" title="创建时间" show-overflow="tooltip" align="center" :visible="false" />
              <vxe-column field="updateTime" title="更新时间" show-overflow="tooltip" align="center" :visible="false" />
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
    </l-card>
  </div>
  <!-- 弹窗 -->
  <n-modal v-model:show="showUpdate" preset="card" class="w-[600px]" title="字典信息">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="1">
        <n-gi>
          <n-form-item label="类型" path="type">
            <n-select v-model:value="formData.type" :options="formData.typeOptions" :disabled="formData.uid" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="上级字典">
            <n-tree-select v-model:value="formData.parentUid" :options="formData.treeOptions" key-field="value" />
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
      <n-flex justify="end">
        <n-button type="primary" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">确定</n-button>
      </n-flex>
    </template>
  </n-modal>
  <n-modal
    :mask-closable="false"
    v-model:show="showDelete"
    preset="dialog"
    type="error"
    title="提示信息"
    content="确定删除吗?"
    positive-text="确定"
    @positive-click="confirmDelete"
    :size="appStore.componentSize"
  />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
