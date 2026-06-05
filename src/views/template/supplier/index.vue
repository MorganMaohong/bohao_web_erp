<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
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
import { resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { SupplierForm, SupplierQuery, SupplierVo } from "@/model/template/supplier"
import { SupplierService } from "@/services/template/SupplierService"
import { VxePagerEvents } from "vxe-pc-ui"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<SupplierForm>({})
const formRef = ref<FormInst>()
const loading = ref(false)
const formRule = {
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  }
}
const query = ref<SupplierQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<SupplierVo, void>>({
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
  SupplierService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
      VxeTableRef.value?.setAllTreeExpand?.(true)
    })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  SupplierService.form(uid).then((data) => {
    formData.value = data
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    SupplierService.addOrUpdate(formData.value)
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
  SupplierService.delete(formData.value.uid)
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

const { triggerInputSearch, flushInputSearch, withResetSuppressed } = useAutoListSearch(doSearch)

async function reset() {
  await withResetSuppressed(async () => {
    query.value = { currentPage: 1, pageSize: 50 }
  })
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
    $table?.connect?.($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <SearchQueryForm
            label-placement="left"
            label-align="right"
            label-width="70"
            ref="queryFormRef"
            class="list-search-form"
          >
            <div class="flex gap-4">
              <n-grid :cols="3" :x-gap="12" :y-gap="12">
                <n-gi>
                  <n-form-item label="名称">
                    <n-input
                      class="w-full"
                      clearable
                      v-model:value="query.name"
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
          <ListPageToolbar>
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()">新增供应商</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1 erp-list-table-wrap">
            <ListPageTable
              :data="data.list"
              :loading="loading"
              :size="componentSize"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
            >
              <vxe-column field="code" title="编码" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="contactName" title="联系人" show-overflow="tooltip" align="center" width="12%" />
              <vxe-column field="contactPhone" title="联系电话" show-overflow="tooltip" align="center" width="14%" />
              <vxe-column field="taxNo" title="税号" show-overflow="tooltip" align="center" width="16%" />
              <vxe-column field="categoryName" title="供应商分类" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="levelName" title="供应商等级" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="settlementName" title="结算期限" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column
                field="settlementMethod"
                title="结算方式"
                show-overflow="tooltip"
                align="center"
                width="15%"
              />
              <vxe-column field="creditLimit" title="信用额度" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="bankName" title="开户银行" show-overflow="tooltip" align="center" width="16%" />
              <vxe-column
                field="bankAccountName"
                title="银行账户名"
                show-overflow="tooltip"
                align="center"
                width="16%"
              />
              <vxe-column field="bankAccountNo" title="银行账号" show-overflow="tooltip" align="center" width="18%" />
              <vxe-column
                field="startTimeName"
                title="签约开始日期"
                show-overflow="tooltip"
                align="center"
                width="15%"
              />
              <vxe-column field="endTimeName" title="签约结束日期" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="address" title="详情地址" show-overflow="tooltip" align="center" width="30%" />
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
                    <n-button type="info" text :size="appStore.searchBarSize" @click="showUpdateModal(row.uid)"
                      >编辑</n-button
                    >
                    <n-button type="error" text :size="appStore.searchBarSize" @click="showDeleteModal(row.uid)"
                      >删除</n-button
                    >
                  </n-flex>
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
  <FormModal v-model:show="showUpdate" title="供应商信息" size="lg">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="2" x-gap="16" y-gap="0">
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">基本信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="供应商编码">
            <n-input disabled :value="formData.code" placeholder="自动生成编码" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入名称" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="联系人">
            <n-input v-model:value="formData.contactName" placeholder="请输入联系人" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="联系电话">
            <n-input v-model:value="formData.contactPhone" placeholder="请输入联系电话" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="供应商分类">
            <n-select
              v-model:value="formData.category"
              placeholder="请选择分类"
              :options="formData.categoryOptions"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="供应商等级">
            <n-select
              v-model:value="formData.level"
              placeholder="请选择等级"
              :options="formData.levelOptions"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="税号">
            <n-input v-model:value="formData.taxNo" placeholder="请输入税号" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">合作信息</div>
          </div>
        </n-gi>
        <n-gi>
          <n-form-item label="签约开始日期">
            <n-date-picker
              v-model:value="formData.startTime"
              placeholder="请选择日期"
              type="date"
              class="w-full"
              :is-date-disabled="(ts: number) => !!formData.endTime && ts >= formData.endTime"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="签约结束日期">
            <n-date-picker
              v-model:value="formData.endTime"
              placeholder="请选择日期"
              type="date"
              class="w-full"
              :is-date-disabled="(ts: number) => !!formData.startTime && ts <= formData.startTime"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="结算期限">
            <n-select
              v-model:value="formData.settlement"
              placeholder="请选择期限"
              :options="formData.settlementOptions"
              clearable
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="结算方式">
            <n-input v-model:value="formData.settlementMethod" placeholder="如银行转账、商业汇票等" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="信用额度(元)">
            <n-input-number
              v-model:value="formData.creditLimit"
              placeholder="请输入信用额度"
              class="w-full"
              :min="0"
              :show-button="false"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">银行信息</div>
          </div>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="开户银行">
            <n-input v-model:value="formData.bankName" placeholder="请输入开户银行" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="银行账户名">
            <n-input v-model:value="formData.bankAccountName" placeholder="请输入银行账户名" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="银行账号">
            <n-input v-model:value="formData.bankAccountNo" placeholder="请输入银行账号" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <div class="TemplateForm-section">
            <div class="TemplateForm-section__title">其他信息</div>
          </div>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="详细地址">
            <n-input v-model:value="formData.address" placeholder="请输入详细地址" />
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
