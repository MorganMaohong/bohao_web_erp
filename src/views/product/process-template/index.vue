<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { VxePagerEvents } from "vxe-pc-ui"
import { useAppStore } from "@/store/modules/app"
import LCard from "@/components/LCard/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import FormModal from "@/components/FormModal/index.vue"
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
const componentSize = computed(() => appStore.componentSize as "small" | "medium" | "large")
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()
const loading = ref(false)
const submitting = ref(false)
const showEdit = ref(false)
const query = ref<ProductionProcessTemplateQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<ProductionProcessTemplateVo, void>>({})
const formData = ref<ProductionProcessTemplateForm>({ nodeList: [] })

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value?.$el?.clientHeight
    ? TableCardRef.value.$el.clientHeight - 20
    : 520
}

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

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
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
          <SearchQueryForm label-placement="left" >
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="模板:">
                  <n-input v-model:value="query.key" clearable />
                </n-form-item>
              </n-gi>
              <n-gi span="3">
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="primary" @click="search">
                      <template #icon><n-icon><Search /></n-icon></template>
                      搜索
                    </n-button>
                    <n-button @click="reset">
                      <template #icon><n-icon><Reset /></n-icon></template>
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
            <n-button type="primary" :size="appStore.searchBarSize" @click="openEdit()">新增模板</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              ref="VxeTableRef"
              :column-config="{ resizable: true }"
              :data="data.list || []"
              border
              stripe
              :loading="loading"
              :row-config="{ isHover: true }"
              :height="TableCardMaxHeight"
              :size="componentSize"
            >
              <vxe-column field="name" title="模板名称" show-overflow="tooltip" align="center" min-width="180" />
              <vxe-column field="nodeCount" title="节点数量" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" min-width="220" />
              <vxe-column fixed="right" title="操作" align="center" width="180">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <n-button type="primary" text :size="appStore.searchBarSize" @click="openEdit(row.uid)">编辑</n-button>
                    <n-button type="info" text :size="appStore.searchBarSize" @click="handleCopy(row.uid)">复制</n-button>
                    <n-button type="error" text :size="appStore.searchBarSize" @click="handleDelete(row.uid)">删除</n-button>
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
            :total="data.count || 0"
            :layouts="['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total']"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>

    <FormModal v-model:show="showEdit" title="工序模板" size="xl">

      <n-form class="TemplateForm">
        <n-grid cols="2" x-gap="16" y-gap="0">
          <n-gi span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">基本信息</div>
            </div>
          </n-gi>
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
          <n-gi span="2">
            <div class="TemplateForm-section TemplateForm-section__head">
              <div class="TemplateForm-section__title">工序节点</div>
              <n-button type="primary" @click="addNode">新增节点</n-button>
            </div>
          </n-gi>
          <n-gi span="2">
            <n-table striped :size="componentSize">
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
          </n-gi>
        </n-grid>
      </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showEdit = false">取消</n-button>
                <n-button type="primary" :loading="submitting" @click="submit">保存</n-button>
      </n-flex>
    </template>
  </FormModal>
  </div>
</template>
