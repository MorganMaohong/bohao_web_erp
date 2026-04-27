<script lang="ts" setup>
import { h, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { NButton } from "naive-ui"
import { useAppStore } from "@/store/modules/app"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { PageVo } from "@/model"
import { resetRef } from "@/utils"
import {
  ProductionProcessTemplateForm,
  ProductionProcessTemplateNodeVo,
  ProductionProcessTemplateQuery,
  ProductionProcessTemplateVo
} from "@/model/product"
import { ProductionProcessTemplateService } from "@/services/product/ProductionProcessTemplateService"

const appStore = useAppStore()
const loading = ref(false)
const submitting = ref(false)
const showEdit = ref(false)
const query = ref<ProductionProcessTemplateQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<ProductionProcessTemplateVo, void>>({})
const formData = ref<ProductionProcessTemplateForm>({ nodeList: [] })

function select() {
  loading.value = true
  ProductionProcessTemplateService.select(query.value)
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
  showEdit.value = true
  submitting.value = true
  ProductionProcessTemplateService.form(uid)
    .then((res) => {
      formData.value = { ...res, nodeList: res.nodeList || [] }
    })
    .finally(() => {
      submitting.value = false
    })
}

function addNode() {
  formData.value.nodeList = formData.value.nodeList || []
  formData.value.nodeList.push({ sort: (formData.value.nodeList.length || 0) + 1 })
}

function removeNode(index: number) {
  formData.value.nodeList?.splice(index, 1)
}

function submit() {
  if (!formData.value.name) {
    window.$message?.error("请输入模板名称")
    return
  }
  if (!formData.value.nodeList?.length) {
    window.$message?.error("请至少新增一个工序节点")
    return
  }
  for (const node of formData.value.nodeList) {
    if (!node.name || !node.leaderUid || !node.durationValue || !node.durationUnit || !node.startRule) {
      window.$message?.error("请完整填写工序节点信息")
      return
    }
  }
  submitting.value = true
  ProductionProcessTemplateService.addOrUpdate(formData.value)
    .then(() => {
      showEdit.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function handleDelete(uid?: string) {
  if (!uid) return
  submitting.value = true
  ProductionProcessTemplateService.delete(uid)
    .then(() => {
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function handleCopy(uid?: string) {
  if (!uid) return
  submitting.value = true
  ProductionProcessTemplateService.copy(uid)
    .then(() => {
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
                <n-form-item label="模板:">
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
                    <n-button type="primary" @click="openEdit()">新增模板</n-button>
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
            { title: '模板名称', key: 'name' },
            { title: '节点数量', key: 'nodeCount' },
            { title: '备注', key: 'remark' },
            {
              title: '操作',
              key: 'actions',
              render: (row: ProductionProcessTemplateVo) => h('div', { class: 'flex gap-2' }, [
                h(NButton, { size: 'small', type: 'primary', onClick: () => openEdit(row.uid) }, { default: () => '编辑' }),
                h(NButton, { size: 'small', type: 'info', onClick: () => handleCopy(row.uid) }, { default: () => '复制' }),
                h(NButton, { size: 'small', type: 'error', tertiary: true, onClick: () => handleDelete(row.uid) }, { default: () => '删除' })
              ])
            }
          ]" :data="data.list || []" :loading="loading" />
        </m-card>
      </template>
    </l-card>

    <n-modal v-model:show="showEdit" preset="card" title="工序模板" class="w-[1200px] max-w-[95vw]">
      <div class="space-y-4">
        <n-grid :cols="2" x-gap="12">
          <n-gi>
            <n-form-item label="模板名称">
              <n-input v-model:value="formData.name" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="备注">
              <n-input v-model:value="formData.remark" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">工序节点</div>
          <n-button type="primary" @click="addNode">新增节点</n-button>
        </div>
        <n-table striped size="small">
          <thead>
            <tr>
              <th>名称</th>
              <th>负责人</th>
              <th>耗时</th>
              <th>单位</th>
              <th>开始规则</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.nodeList || []" :key="index">
              <td><n-input v-model:value="item.name" /></td>
              <td><n-select v-model:value="item.leaderUid" :options="formData.leaderOptions" filterable /></td>
              <td><n-input-number v-model:value="item.durationValue" :min="1" class="w-full" /></td>
              <td><n-select v-model:value="item.durationUnit" :options="formData.durationUnitOptions" /></td>
              <td><n-select v-model:value="item.startRule" :options="formData.startRuleOptions" /></td>
              <td><n-input v-model:value="item.remark" /></td>
              <td><n-button type="error" tertiary @click="removeNode(index)">删除</n-button></td>
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
