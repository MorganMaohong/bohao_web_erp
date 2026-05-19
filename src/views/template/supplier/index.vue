<script lang="ts" setup>
import { onMounted, ref } from "vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { resetRef } from "@/utils"
import { PageVo } from "@/model"
import { VxeTableInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"
import { Supplier, SupplierForm, SupplierQuery } from "@/model/template/supplier"
import { SupplierService } from "@/services/template/SupplierService"
import { VxePagerEvents } from "vxe-pc-ui"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<SupplierForm>({})
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
const query = ref<SupplierQuery>({ currentPage: 1, pageSize: 50 })
const data = ref<PageVo<Supplier, void>>({})
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
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  SupplierService.form(uid).then((data) => {
    formData.value = data
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  SupplierService.form(uid).then((res) => {
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

function search() {
  select()
}

function reset() {
  query.value = { currentPage: 1, pageSize: 50 }
  select()
}

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
  select()
}

function updateEndTimeValue(v) {
  if (v <= formData.value.startTime) {
    formData.value.endTime = 0
    window.$message.error("结束日期不能小于开始日期")
  }
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
            <n-button type="primary" :size="appStore.componentSize" @click="showUpdateModal()">新增供应商</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data.list"
              border
              stripe
              :loading="loading"
              :size="appStore.componentSize"
              :row-config="{ isHover: true }"
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
              <vxe-column field="settlementMethod" title="结算方式" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="creditLimit" title="信用额度" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="bankName" title="开户银行" show-overflow="tooltip" align="center" width="16%" />
              <vxe-column field="bankAccountName" title="银行账户名" show-overflow="tooltip" align="center" width="16%" />
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
  <n-modal v-model:show="showUpdate" preset="card" class="w-[800px]" title="供应商信息">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="2" x-gap="12">
        <n-gi>
          <n-form-item label="编码">
            <n-input disabled placeholder="自动生成编码" />
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
          <n-form-item label="联系人电话">
            <n-input v-model:value="formData.contactPhone" placeholder="请输入联系人电话" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="供应商分类">
            <n-select v-model:value="formData.category" placeholder="请选择分类" :options="formData.categoryOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="供应商等级">
            <n-select v-model:value="formData.level" placeholder="请选择等级" :options="formData.levelOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="签约开始日期" class="w-full">
            <n-date-picker
              v-model:value="formData.startTime"
              placeholder=""
              type="date"
              class="w-full"
              :is-date-disabled="(ts: number) => ts >= formData.endTime"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="签约结束日期" class="w-full">
            <n-date-picker
              v-model:value="formData.endTime"
              placeholder=""
              type="date"
              class="w-full"
              :is-date-disabled="(ts: number) => formData.startTime && ts <= formData.startTime"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="税号">
            <n-input v-model:value="formData.taxNo" placeholder="请输入供应商税号" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="结算期限">
            <n-select
              v-model:value="formData.settlement"
              placeholder="请选择期限"
              :options="formData.settlementOptions"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="结算方式">
            <n-input
              v-model:value="formData.settlementMethod"
              placeholder="如微信、支付宝、银行转账、商业汇票等"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="信用额度/元">
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
          <n-form-item label="详细地址">
            <n-input v-model:value="formData.address" placeholder="请输入地址" />
          </n-form-item>
        </n-gi>
        <n-gi span="2">
          <n-form-item label="备注">
            <n-input type="textarea" v-model:value="formData.remark" placeholder="" />
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
