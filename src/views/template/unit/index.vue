<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { FormInst } from "naive-ui"
import { Reset, Search } from "@vicons/carbon"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { UnitForm, UnitQuery, UnitVo } from "@/model/template/unit"
import { UnitService } from "@/services/template/UnitService"
import { useAppStore } from "@/store/modules/app"
import { resetRef } from "@/utils"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()
const formRef = ref<FormInst>()
const loading = ref(false)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const query = ref<UnitQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<UnitVo, void>>({ currentPage: 1, pageSize: 50, count: 0, list: [], extraData: undefined })
const formData = ref<UnitForm>({})

const categoryOptions = [
  { label: "数量", value: "quantity" },
  { label: "重量", value: "weight" },
  { label: "长度", value: "length" },
  { label: "面积", value: "area" },
  { label: "体积", value: "volume" },
  { label: "包装", value: "package" }
]

const enabledOptions = [
  { label: "启用", value: true },
  { label: "停用", value: false }
]

const formRule = {
  code: {
    required: true,
    message: "请输入单位编码",
    trigger: ["input", "blur"]
  },
  name: {
    required: true,
    message: "请输入单位名称",
    trigger: ["input", "blur"]
  }
}

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value?.$el?.clientHeight - 20 || 500
}

function select() {
  loading.value = true
  UnitService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  UnitService.form(uid).then((res) => {
    formData.value = {
      enabled: true,
      precisionScale: 0,
      convertRate: 1,
      sort: 0,
      ...res
    }
  })
}

function showCopyModal(uid?: string) {
  if (!uid) return
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  UnitService.form(uid).then((res) => {
    formData.value = {
      enabled: true,
      precisionScale: 0,
      convertRate: 1,
      sort: 0,
      ...res,
      uid: undefined,
      id: undefined
    }
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err || isSubmitting.value) return
    isSubmitting.value = true
    UnitService.addOrUpdate(formData.value)
      .then(() => {
        showUpdate.value = false
        select()
      })
      .finally(() => {
        isSubmitting.value = false
      })
  })
}

function showDeleteModal(uid?: string) {
  if (!uid) return
  showDelete.value = true
  formData.value.uid = uid
}

function confirmDelete() {
  if (!formData.value.uid) return
  isSubmitting.value = true
  UnitService.delete(formData.value.uid)
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

function reset() {
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
          <n-form label-placement="left" :size="appStore.componentSize" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="关键词:">
                  <n-input v-model:value="query.key" clearable placeholder="编码 / 名称" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="分类:">
                  <n-select v-model:value="query.category" clearable :options="categoryOptions" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="状态:">
                  <n-select v-model:value="query.enabled" clearable :options="enabledOptions" />
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
            <n-button type="primary" :size="appStore.componentSize" @click="showUpdateModal()">新增单位</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              ref="VxeTableRef"
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :height="TableCardMaxHeight"
              :row-config="{ isHover: true }"
              :size="appStore.componentSize"
            >
              <vxe-column field="code" title="编码" align="center" show-overflow="tooltip" min-width="120" />
              <vxe-column field="name" title="名称" align="center" show-overflow="tooltip" min-width="120" />
              <vxe-column field="category" title="分类" align="center" show-overflow="tooltip" width="110" />
              <vxe-column field="precisionScale" title="精度" align="center" width="90" />
              <vxe-column
                field="baseUnitName"
                title="基准单位"
                align="center"
                show-overflow="tooltip"
                min-width="120"
              />
              <vxe-column field="convertRate" title="换算率" align="center" width="120" />
              <vxe-column field="enabled" title="状态" align="center" width="90">
                <template #default="{ row }">
                  <n-tag :type="row.enabled === false ? 'error' : 'success'" size="small">
                    {{ row.enabled === false ? "停用" : "启用" }}
                  </n-tag>
                </template>
              </vxe-column>
              <vxe-column field="sort" title="排序" align="center" width="90" />
              <vxe-column field="remark" title="备注" align="center" show-overflow="tooltip" min-width="160" />
              <vxe-column fixed="right" title="操作" align="center" width="180">
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

  <n-modal v-model:show="showUpdate" preset="card" class="w-[760px]" title="单位信息">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="2" x-gap="12">
        <n-gi>
          <n-form-item label="单位编码" path="code">
            <n-input v-model:value="formData.code" placeholder="如 kg / pcs / box" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="单位名称" path="name">
            <n-input v-model:value="formData.name" placeholder="如 千克 / 个 / 箱" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="单位分类">
            <n-select v-model:value="formData.category" clearable :options="categoryOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="状态">
            <n-switch v-model:value="formData.enabled">
              <template #checked>启用</template>
              <template #unchecked>停用</template>
            </n-switch>
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="上级单位">
            <n-tree-select
              v-model:value="formData.parentUid"
              clearable
              :options="formData.unitOptions"
              key-field="value"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="基准单位">
            <n-tree-select
              v-model:value="formData.baseUnitUid"
              clearable
              :options="formData.unitOptions"
              key-field="value"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="小数精度">
            <n-input-number v-model:value="formData.precisionScale" class="w-full" :min="0" :max="8" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="换算率">
            <n-input-number v-model:value="formData.convertRate" class="w-full" :min="0.000001" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="排序">
            <n-input-number v-model:value="formData.sort" class="w-full" :min="0" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="备注">
            <n-input v-model:value="formData.remark" type="textarea" />
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
    content="确定删除该单位吗?"
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
