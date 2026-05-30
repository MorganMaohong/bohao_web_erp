<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
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
import { WarehouseService } from "@/services/template/WarehouseService"
import { WarehouseForm, WarehouseQuery, WarehouseVo } from "@/model/stock"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<WarehouseForm>({})
const formRef = ref<FormInst>()
const loading = ref(false)
const formRule = {
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  }
}
const query = ref<WarehouseQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<WarehouseVo, void>>({
  currentPage: 1,
  pageSize: 50,
  count: 0,
  list: [],
  extraData: undefined
})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  WarehouseService.select(query.value)
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
  WarehouseService.form(uid).then((data) => {
    formData.value = data
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  WarehouseService.form(uid).then((res) => {
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
    WarehouseService.addOrUpdate(formData.value)
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
  WarehouseService.delete(formData.value.uid)
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

function pageChange(event: { currentPage: number; pageSize: number }) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
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
          <SearchQueryForm label-placement="left" ref="queryFormRef" >
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.key" />
                </n-form-item>
              </n-gi>
              <n-gi>
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
            <n-button type="primary" @click="showUpdateModal()">新增仓库</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
              :size="componentSize"
            >
              <vxe-column field="code" title="编码" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="address" title="地址" show-overflow="tooltip" align="center" width="30%" />
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
  <FormModal v-model:show="showUpdate" title="仓库信息" size="md" height-mode="auto">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="2" x-gap="16" y-gap="0">
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">基本信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="仓库编码">
            <n-input :value="formData.code" disabled placeholder="自动生成编码" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入仓库名称" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">位置信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="区域">
            <n-input v-model:value="formData.area" placeholder="请输入区域" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="地址" path="address">
            <n-input v-model:value="formData.address" placeholder="请输入仓库地址" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">其他信息</div>
          </div>
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

.TemplateForm-section {
  margin-top: 4px;
}

.TemplateForm-section__title {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--n-text-color-1);
  padding-bottom: 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--n-divider-color);
}
</style>
