<script lang="ts" setup>
import { onMounted, ref } from "vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import FastUpload from "@/components/FastUpload/FastUpload.vue"
import { AddPhotoAlternateRound } from "@vicons/material"
import { ProductService } from "@/services/template/ProductService"
import { ProductForm, ProductQuery, ProductVo } from "@/model/template/product"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<ProductForm>({})
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
const query = ref<ProductQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<ProductVo, void>>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  ProductService.select(query.value)
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
  ProductService.form(uid).then((data) => {
    formData.value = data
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  ProductService.form(uid).then((res) => {
    formData.value = res
    formData.value.uid = null
    formData.value.id = null
  })
}

function confirmUpdate() {
  console.log(formData.value)
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    ProductService.addOrUpdate(formData.value)
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
  ProductService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function search() {
  select()
}

function reset() {
  query.value = resetRef(query.value)
  query.value = { currentPage: 1, pageSize: 50 }
  select()
}

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function handlerBeforeUpload(v: string) {
  formData.value.image = v
}

/*
function handleUpdateTypeValue(v: string) {}

function handleUpdateUnitValue(v: string) {}
*/

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
                  <n-input clearable v-model:value="query.key" />
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
            <n-button type="primary" :size="appStore.componentSize" @click="showUpdateModal()">新增产品</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
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
            >
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="20%" />
              <vxe-column title="图片" show-overflow="tooltip" align="center" width="10%">
                <template #default="{ row }">
                  <div class="flex justify-center items-center">
                    <n-image :src="row.image" class="max-h-[4rem] max-w-[4rem]" />
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="10%" />
              <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" width="25%" />
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
  <!-- 弹窗 -->
  <n-modal v-model:show="showUpdate" preset="card" class="w-[700px]" title="产品信息">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="2" x-gap="12">
        <n-gi span="2">
          <n-form-item label="图片">
            <FastUpload @before-upload="handlerBeforeUpload">
              <div class="max-w-[120px] max-h-[120px]" v-if="formData.image">
                <n-image :src="formData.image" preview-disabled class="cursor-pointer" />
              </div>
              <n-icon v-else size="60" class="cursor-pointer">
                <AddPhotoAlternateRound />
              </n-icon>
            </FastUpload>
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入名称" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="类型" path="type">
            <n-cascader
              v-model:value="formData.type"
              placeholder="请选择类型"
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
          <n-form-item label="规格">
            <n-input v-model:value="formData.spec" placeholder="请输入规格" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
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
