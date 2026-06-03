<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import FormModal from "@/components/FormModal/index.vue"
import ListPageToolbar from "@/components/ListPageToolbar/index.vue"
import SearchQueryForm from "@/components/SearchQueryForm/index.vue"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import { useAppStore } from "@/store/modules/app"
import { FormInst, NButton } from "naive-ui"
import { ItemDictService } from "@/services/template/ItemDictService"
import { ItemDictForm, ItemDictQuery, ItemDictVo } from "@/model/template/item-dict"
import type { OptionVo } from "@/model"
import { resetRef } from "@/utils"
import { UpdateDragSortForm } from "@/model"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { Reset, Search } from "@vicons/carbon"

const appStore = useAppStore()
const componentSize = computed(() => appStore.componentSize as any)
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const isSubmitting = ref(false)
const showUpdate = ref(false)
const showDelete = ref(false)
const formData = ref<ItemDictForm>({})
const formRef = ref<FormInst>()
const loading = ref(false)
const formRule = {
  nodeKind: {
    required: true,
    message: "请选择节点类型",
    trigger: ["input", "blur"]
  },
  code: {
    required: true,
    message: "请输入编码",
    trigger: ["input", "blur"]
  },
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"]
  }
}
const query = ref<ItemDictQuery>({})
const data = ref<ItemDictVo[]>([])
const updateDragSortForm = ref<UpdateDragSortForm>({})
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()

const parentTreeOptions = computed(() => formData.value.treeOptions || [])

const leafCategoryOptions = computed(() =>
  data.value
    .filter((row) => row.nodeKind === "CATEGORY" && row.leafCategory && !row.virtualNode)
    .map((row) => ({
      label: row.categoryPathName || row.name || "",
      value: row.uid || ""
    }))
)

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value.$el.clientHeight - 20
}

function buildTableData(list: ItemDictVo[]): ItemDictVo[] {
  const result: ItemDictVo[] = []
  for (const row of list) {
    if (isLeafCategoryRow(row)) {
      const { spec1Tags, spec2Tags, brandTags, ...categoryRow } = row
      result.push({
        ...categoryRow,
        nodeKind: categoryRow.nodeKind || "CATEGORY"
      })
      const parentUid = row.uid || ""
      result.push(createTagRow(parentUid, "spec1", "规格1", spec1Tags, 1))
      result.push(createTagRow(parentUid, "spec2", "规格2", spec2Tags, 2))
      result.push(createTagRow(parentUid, "brand", "品牌", brandTags, 3))
      continue
    }
    result.push(row)
  }
  return result
}

function createTagRow(
  parentUid: string,
  kind: "spec1" | "spec2" | "brand",
  label: string,
  tags: OptionVo[] | undefined,
  sort: number
): ItemDictVo {
  return {
    uid: `vg-${kind}-${parentUid}`,
    parentUid,
    name: label,
    code: "",
    nodeKindName: "分组",
    virtualNode: true,
    tagRowKind: kind,
    displayTags: tags || [],
    sort
  }
}

function select() {
  loading.value = true
  ItemDictService.select(query.value)
    .then((res) => {
      data.value = buildTableData(res)
    })
    .finally(() => {
      loading.value = false
      VxeTableRef.value?.setAllTreeExpand(true)
    })
}

function showUpdateModal(uid?: string) {
  formData.value = resetRef(formData.value)
  showUpdate.value = true
  ItemDictService.form(uid).then((res) => {
    formData.value = res
  })
}

function showCopyModal(uid: string) {
  showUpdate.value = true
  formData.value = resetRef(formData.value)
  ItemDictService.form(uid).then((res) => {
    formData.value = res
    formData.value.uid = undefined
    formData.value.id = undefined
  })
}

function syncItemsCodesAfterDictChange() {
  return ItemDictService.syncItemCodes().catch((err) => {
    window.$message?.warning("物料编码批量同步失败，请稍后重试")
    return Promise.reject(err)
  })
}

function confirmUpdate() {
  formRef.value?.validate((err) => {
    if (err) return
    if (isSubmitting.value) return
    isSubmitting.value = true
    ItemDictService.addOrUpdate(formData.value)
      .then(() => syncItemsCodesAfterDictChange())
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
  ItemDictService.delete(formData.value.uid)
    .then(() => syncItemsCodesAfterDictChange())
    .then(() => {
      showDelete.value = false
      select()
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function updateSort() {
  return ItemDictService.updateSort(updateDragSortForm.value)
    .then(() => syncItemsCodesAfterDictChange())
    .then(() => {
      select()
    })
    .catch((err) => Promise.reject(err))
}

function search() {
  select()
}

function reset() {
  query.value = resetRef(query.value)
  select()
}

function rowName(row: ItemDictVo) {
  if (row.virtualNode) return row.name
  if (row.nodeKind === "CATEGORY") return row.categoryPathName || row.name
  return row.name
}

function isLeafCategoryRow(row: ItemDictVo) {
  return row.nodeKind === "CATEGORY" && row.leafCategory
}

function isTagDisplayRow(row: ItemDictVo) {
  return Boolean(row.tagRowKind)
}

function tagType(row: ItemDictVo) {
  return row.tagRowKind === "brand" ? "success" : "info"
}

function canOperate(row: ItemDictVo) {
  return !row.virtualNode && !isTagDisplayRow(row)
}

function canDragRow(row: ItemDictVo) {
  if (row.virtualNode || isTagDisplayRow(row)) return false
  return row.nodeKind === "CATEGORY" || row.nodeKindName === "品类"
}

function normalizeParentUid(parentUid?: string) {
  return parentUid ?? ""
}

function isValidCategoryDrag(dragRow: ItemDictVo, targetRow: ItemDictVo, dragToChild?: boolean) {
  if (dragToChild) return false
  if (!canDragRow(dragRow) || !canDragRow(targetRow)) return false
  if (dragRow.uid === targetRow.uid) return false
  if (targetRow.uid === dragRow.parentUid) return false
  return normalizeParentUid(dragRow.parentUid) === normalizeParentUid(targetRow.parentUid)
}

/** 落到规格/品牌行时，解析为其所属的末级品类 */
function resolveDropTarget(row?: ItemDictVo): ItemDictVo | null {
  if (!row) return null
  if (canDragRow(row)) return row
  if (isTagDisplayRow(row) && row.parentUid) {
    return data.value.find((item) => item.uid === row.parentUid && canDragRow(item)) || null
  }
  return null
}

function rowClassName({ row }: { row: ItemDictVo }) {
  return isTagDisplayRow(row) ? "ItemDict-row--tag" : ""
}

const rowDragConfig = {
  showIcon: true,
  showGuidesStatus: true,
  // 允许跨过规格/品牌展示行，在同父级品类之间排序（含子品类）
  isCrossDrag: true,
  visibleMethod({ row }: { row: ItemDictVo }) {
    return canDragRow(row)
  },
  dragStartMethod({ row }: { row: ItemDictVo }) {
    return canDragRow(row)
  },
  async dragEndMethod({
    newRow,
    dragRow,
    dragPos,
    dragToChild
  }: {
    newRow?: ItemDictVo
    dragRow?: ItemDictVo
    dragPos?: string
    dragToChild?: boolean
  }) {
    if (!dragRow) return false
    const targetRow = resolveDropTarget(newRow)
    if (!targetRow) {
      window.$message?.warning("请将品类拖动到其他品类行")
      return false
    }
    if (!isValidCategoryDrag(dragRow, targetRow, dragToChild)) {
      window.$message?.warning("仅支持同级品类排序，不可拖入其他品类")
      return false
    }
    updateDragSortForm.value.oldUid = dragRow.uid
    updateDragSortForm.value.newUid = targetRow.uid
    updateDragSortForm.value.dragPos = dragPos
    try {
      await updateSort()
    } catch {
      window.$message?.error("排序失败，请稍后重试")
    }
    return false
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
          <SearchQueryForm label-placement="left" >
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="名称:">
                  <n-input clearable v-model:value="query.name" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="规格1:">
                  <n-input clearable v-model:value="query.spec1Name" placeholder="规格1名称" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="规格2:">
                  <n-input clearable v-model:value="query.spec2Name" placeholder="规格2名称" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="primary" @click="search">
                      <template #icon>
                        <n-icon><Search /></n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button @click="reset">
                      <template #icon>
                        <n-icon><Reset /></n-icon>
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
            <n-button type="primary" :size="appStore.searchBarSize" @click="showUpdateModal()">新增</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </ListPageToolbar>
          <m-card ref="TableCardRef" class="flex-1 ItemDict-table">
            <vxe-table
              :column-config="{ resizable: true }"
              :data="data"
              border
              stripe
              :loading="loading"
              :size="componentSize"
              :tree-config="{ transform: true, rowField: 'uid', parentField: 'parentUid' }"
              :row-config="{ drag: true, isHover: true }"
              :height="TableCardMaxHeight"
              :row-drag-config="rowDragConfig"
              :row-class-name="rowClassName"
              ref="VxeTableRef"
            >
              <vxe-column
                field="name"
                title="名称"
                tree-node
                drag-sort
                min-width="360"
                :show-overflow="false"
              >
                <template #default="{ row }">
                  <div v-if="isTagDisplayRow(row)" class="ItemDict-tagRow">
                    <div class="ItemDict-tagRow__label">{{ row.name }}：</div>
                    <div class="ItemDict-tagRow__tags">
                      <n-flex size="small" wrap>
                        <n-tag
                          v-for="tag in row.displayTags || []"
                          :key="tag.value"
                          size="small"
                          :type="tagType(row)"
                          class="ItemDict-tag"
                          @click="showUpdateModal(tag.value)"
                        >
                          {{ tag.label }}
                        </n-tag>
                        <span v-if="!(row.displayTags || []).length" class="ItemDict-tagRow__empty">—</span>
                      </n-flex>
                    </div>
                  </div>
                  <span v-else class="ItemDict-name">{{ rowName(row) }}</span>
                </template>
              </vxe-column>
              <vxe-column field="code" title="编码" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="nodeKindName" title="类型" show-overflow="tooltip" align="center" width="100" />
              <vxe-column field="remark" title="备注" show-overflow="tooltip" align="center" min-width="120" />
              <vxe-column fixed="right" title="操作" align="center" width="180">
                <template #default="{ row }">
                  <n-flex v-if="canOperate(row)" justify="center">
                    <n-button type="primary" text :size="appStore.searchBarSize" @click="showCopyModal(row.uid)">复制</n-button>
                    <n-button type="info" text :size="appStore.searchBarSize" @click="showUpdateModal(row.uid)">编辑</n-button>
                    <n-button type="error" text :size="appStore.searchBarSize" @click="showDeleteModal(row.uid)">删除</n-button>
                  </n-flex>
                </template>
              </vxe-column>
            </vxe-table>
          </m-card>
        </m-card>
      </template>
    </l-card>
  </div>
  <FormModal v-model:show="showUpdate" title="物料字典" size="md" height-mode="auto">
    <n-form :model="formData" ref="formRef" :rules="formRule">
      <n-grid cols="1">
        <n-gi>
          <n-form-item label="节点类型" path="nodeKind">
            <n-select
              v-model:value="formData.nodeKind"
              :options="formData.nodeKindOptions"
              :disabled="Boolean(formData.uid)"
              placeholder="请选择节点类型"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="上级">
            <n-tree-select
              v-if="formData.nodeKind === 'CATEGORY' || !formData.nodeKind"
              v-model:value="formData.parentUid"
              :options="parentTreeOptions"
              key-field="value"
              clearable
              placeholder="上级品类，可留空"
            />
            <n-select
              v-else
              v-model:value="formData.parentUid"
              :options="leafCategoryOptions"
              clearable
              filterable
              placeholder="请选择末级品类"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="编码" path="code">
            <n-input v-model:value="formData.code" placeholder="如 DQ、1P；同级不可重复" />
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
      <n-flex justify="end" :size="12">
        <n-button v-if="formData.uid" type="error" quaternary @click="showDeleteModal(formData.uid!)">删除</n-button>
        <n-button type="primary" @click="confirmUpdate" :loading="isSubmitting" :disabled="isSubmitting">
          确定
        </n-button>
      </n-flex>
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

.ItemDict-table {
  :deep(.vxe-tree--btn-wrapper) {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    vertical-align: middle;
  }

  :deep(.vxe-cell--tree-node) {
    display: inline-flex !important;
    flex-flow: row nowrap;
    align-items: center;
    width: 100%;
    max-width: 100%;
  }

  :deep(.vxe-cell--drag-handle) {
    display: inline-flex !important;
    flex-shrink: 0;
    align-items: center;
    align-self: center;
    vertical-align: middle;
  }

  :deep(.vxe-cell--tree-node > .vxe-cell--wrapper),
  :deep(.vxe-cell--tree-node > .vxe-tree-cell) {
    flex: 1;
    min-width: 0;
    display: inline-flex;
    align-items: center;
  }

  :deep(.ItemDict-row--tag) {
    height: auto !important;

    .vxe-body--column {
      height: auto !important;
    }

    .vxe-cell {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      white-space: normal !important;
      align-items: flex-start !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }
  }

  :deep(.ItemDict-row--tag .vxe-cell--tree-node) {
    flex-wrap: nowrap !important;
    align-items: flex-start !important;
  }

  :deep(.ItemDict-row--tag .vxe-cell--drag-handle) {
    display: none !important;
  }

  :deep(.ItemDict-row--tag .vxe-cell--tree-node .vxe-tree--btn-wrapper) {
    align-self: flex-start;
    margin-top: 2px;
  }

  :deep(.ItemDict-row--tag .vxe-cell--tree-node > .vxe-cell--wrapper),
  :deep(.ItemDict-row--tag .vxe-cell--tree-node > .vxe-tree-cell) {
    align-items: flex-start;
  }
}

.ItemDict-name {
  vertical-align: middle;
}

.ItemDict-tagRow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  text-align: left;
  line-height: 1.5;
}

.ItemDict-tagRow__label {
  flex-shrink: 0;
  color: var(--n-text-color-2);
  font-size: 13px;
  line-height: 22px;
  white-space: nowrap;
}

.ItemDict-tagRow__tags {
  width: 100%;
  overflow: visible;
}

.ItemDict-tagRow__empty {
  color: var(--n-text-color-3);
  font-size: 13px;
}

.ItemDict-tag {
  cursor: pointer;
}
</style>
