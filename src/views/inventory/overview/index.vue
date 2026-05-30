<script lang="ts" setup>
import { onMounted, ref } from "vue"
import LCard from "@/components/LCard/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { PageVo } from "@/model"
import { VxeTableInstance, VxeTablePropTypes, VxeToolbarInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"
import { VxePagerEvents } from "vxe-pc-ui"
import { ProductForm } from "@/model/template/product"
import { InventoryOverviewService } from "@/services/inventory/InventoryOverviewService"
import { InventoryQuery, InventoryQueryData, InventoryVo } from "@/model/inventory"

const appStore = useAppStore()
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showDetail = ref(false)
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
const query = ref<InventoryQuery>({
  key: "",
  supplierUidList: [],
  types: [],
  units: [],
  warehouseUidList: [],
  currentPage: 1,
  pageSize: 50
})
const data = ref<PageVo<InventoryVo, InventoryQueryData>>({
  list: [],
  count: 0,
  currentPage: 0,
  pageSize: 0,
  extraData: {
    supplierOptions: [],
    typeOptions: [],
    unitOptions: [],
    warehouseOptions: []
  }
})
const detailData = ref<InventoryVo>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()
const mergeCells = ref<VxeTablePropTypes.MergeCells>([])

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function select() {
  loading.value = true
  InventoryOverviewService.select(query.value)
    .then((res) => {
      data.value = res
      mergeCells.value = buildMergeCells(data.value.list)
    })
    .finally(() => {
      loading.value = false
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function buildMergeCells(list: InventoryVo[]) {
  const merges = []

  let start = 0
  let count = 1

  for (let i = 1; i <= list.length; i++) {
    if (i < list.length && list[i].warehouseUid === list[start].warehouseUid) {
      count++
    } else {
      if (count > 1) {
        merges.push({
          row: start,
          col: 0, // 第几列合并（warehouseUid那列）
          rowspan: count,
          colspan: 1
        })
      }

      start = i
      count = 1
    }
  }

  return merges
}

function showDetailModal(uid: string) {
  showDetail.value = true
  InventoryOverviewService.detail(uid).then((res) => {
    detailData.value = res
  })
}

function search() {
  select()
}

function reset() {
  query.value = {
    currentPage: 1,
    pageSize: 50,
    key: null,
    supplierUidList: [],
    types: [],
    units: [],
    warehouseUidList: []
  }
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
          <SearchQueryForm label-placement="left" ref="queryFormRef" >
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="关键字:">
                  <n-input clearable v-model:value="query.key" placeholder="名称 / 规格 / 材质" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="仓库名称:">
                  <n-select
                    clearable
                    v-model:value="query.warehouseUidList"
                    placeholder="选择仓库"
                    :options="data.extraData.warehouseOptions"
                    multiple
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="供应商名称:">
                  <n-select
                    clearable
                    v-model:value="query.supplierUidList"
                    placeholder="选择供应商"
                    :options="data.extraData.supplierOptions"
                    multiple
                  />
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
              :merge-cells="mergeCells"
              :size="appStore.componentSize"
            >
              <vxe-column field="warehouseName" title="仓库" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="name" title="名称" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column title="图片" show-overflow="tooltip" align="center" width="10%">
                <template #default="{ row }">
                  <div class="flex justify-center items-center">
                    <n-image :src="row.image" class="max-h-[4rem] max-w-[4rem]" />
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="typeName" title="类型" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="supplierName" title="供应商" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="unitName" title="单位" show-overflow="tooltip" align="center" width="5%" />
              <vxe-column field="spec" title="规格" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column field="material" title="材质" show-overflow="tooltip" align="center" width="15%" />
              <vxe-column
                fixed="right"
                field="quantity"
                title="库存数量"
                show-overflow="tooltip"
                align="center"
                width="6%"
              />
              <vxe-column
                fixed="right"
                field="availableQuantity"
                title="可用库存"
                show-overflow="tooltip"
                align="center"
                width="6%"
              />
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
              <!--              <vxe-column fixed="right" title="操作" align="center" show-overflow="tooltip" width="60">
                <template #default="{ row }">
                  <n-flex justify="center">
                    <n-button type="primary" text @click="showDetailModal(row.uid)">
                      详情
                    </n-button>
                  </n-flex>
                </template>
              </vxe-column>-->
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
  <n-modal v-model:show="showDetail" preset="card" class="w-[800px]" title="库存信息" />
</template>

<style lang="scss" scoped>
.vxe-toolbar {
  padding: 0;
}
</style>
