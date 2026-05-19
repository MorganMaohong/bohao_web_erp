<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { FormInst } from "naive-ui"
import { VxeTableInstance } from "vxe-table"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { CustomerForm, CustomerQuery, CustomerVo } from "@/model/template/customer"
import { CustomerService } from "@/services/template/CustomerService"
import { useAppStore } from "@/store/modules/app"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const loading = ref(false)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formRef = ref<FormInst>()
const formData = ref<CustomerForm>({})
const query = ref<CustomerQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<CustomerVo, void>>({ currentPage: 1, pageSize: 50, count: 0, list: [], extraData: undefined })
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<any>()
const formRule = {
  name: {
    required: true,
    message: "请输入客户名称",
    trigger: ["input", "blur"]
  }
}

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  CustomerService.select(query.value)
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
  query.value = { currentPage: 1, pageSize: 50 }
  select()
}

function pageChange(event: any) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function showUpdateModal(uid?: string) {
  formData.value = {}
  showUpdate.value = true
  CustomerService.form(uid).then((res) => {
    formData.value = res
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err || isSubmitting.value) return
    isSubmitting.value = true
    CustomerService.addOrUpdate(formData.value)
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
  formData.value.uid = uid
  showDelete.value = true
}

function confirmDelete() {
  if (!formData.value.uid) return
  isSubmitting.value = true
  CustomerService.delete(formData.value.uid)
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
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
          <n-form label-placement="left" :size="componentSize" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="客户:">
                  <n-input clearable v-model:value="query.name" placeholder="名称/编码/联系人/电话" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button @click="search" type="info" icon-placement="left" secondary strong>
                      <template #icon>
                        <n-icon><Search /></n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset" type="tertiary" icon-placement="left" secondary strong>
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
            <n-button type="primary" :size="componentSize" @click="showUpdateModal()">新增客户</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :size="componentSize"
              :row-config="{ isHover: true }"
              :height="TableCardMaxHeight"
              ref="VxeTableRef"
            >
              <vxe-column field="code" title="编码" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="name" title="客户名称" show-overflow="tooltip" align="center" width="180" />
              <vxe-column field="contactName" title="联系人" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="contactPhone" title="联系电话" show-overflow="tooltip" align="center" width="150" />
              <vxe-column field="categoryName" title="客户分类" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="levelName" title="客户等级" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="settlementName" title="结算期限" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="creditLimit" title="信用额度" show-overflow="tooltip" align="center" width="130" />
              <vxe-column field="address" title="地址" show-overflow="tooltip" align="center" min-width="220" />
              <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="150">
                <template #default="{ row }">
                  <n-flex justify="center">
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
            :layouts="['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total']"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>
  </div>

  <n-modal v-model:show="showUpdate" preset="card" class="w-[820px]" title="客户信息">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="2" x-gap="12">
        <n-gi>
          <n-form-item label="编码">
            <n-input disabled :value="formData.code" placeholder="自动生成编码" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="客户名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入客户名称" />
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
          <n-form-item label="客户分类">
            <n-select v-model:value="formData.category" placeholder="请选择分类" :options="formData.categoryOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="客户等级">
            <n-select v-model:value="formData.level" placeholder="请选择等级" :options="formData.levelOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="结算期限">
            <n-select v-model:value="formData.settlement" placeholder="请选择期限" :options="formData.settlementOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="信用额度/元">
            <n-input-number v-model:value="formData.creditLimit" class="w-full" :min="0" :show-button="false" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="签约开始日期">
            <n-date-picker v-model:value="formData.startTime" type="date" class="w-full" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="签约结束日期">
            <n-date-picker v-model:value="formData.endTime" type="date" class="w-full" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="详细地址">
            <n-input v-model:value="formData.address" placeholder="请输入地址" />
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
    :size="componentSize"
  />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
