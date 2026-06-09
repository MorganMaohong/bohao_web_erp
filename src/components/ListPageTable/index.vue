<script lang="ts" setup>
import { computed, nextTick, ref, useAttrs, watch } from "vue"
import type { VxeTableInstance, VxeTablePropTypes } from "vxe-table"
import { ERP_LIST_TABLE_SCROLL_X, ERP_LIST_TABLE_SCROLL_Y } from "@/constants/list-table"

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    data?: unknown[]
    loading?: boolean
    size?: VxeTablePropTypes.Size
    height?: number | string
    /** 与 height 二选一；有值时同样启用纵向虚拟滚动 */
    maxHeight?: number | string
    /** 行高（px）；物料等有图片列的页面可传 64 */
    cellHeight?: number
  }>(),
  {}
)

const attrs = useAttrs()
const tableRef = ref<VxeTableInstance>()

const passthroughAttrs = computed(() => {
  const raw = attrs as Record<string, unknown>
  const {
    class: _class,
    data: _data,
    loading: _loading,
    size: _size,
    height: _height,
    maxHeight: _maxHeight,
    "max-height": _maxHeightKebab,
    columnConfig: _columnConfig,
    "column-config": _columnConfigKebab,
    scrollX: _scrollX,
    "scroll-x": _scrollXKebab,
    scrollY: _scrollY,
    "scroll-y": _scrollYKebab,
    rowConfig: _rowConfig,
    "row-config": _rowConfigKebab,
    cellConfig: _cellConfig,
    "cell-config": _cellConfigKebab,
    ...rest
  } = raw
  return rest
})

const tableData = computed(() => props.data ?? (attrs.data as unknown[] | undefined))
const tableLoading = computed(() => props.loading ?? (attrs.loading as boolean | undefined))
const tableSize = computed(() => props.size ?? (attrs.size as VxeTablePropTypes.Size | undefined))

/** height 为 0 时不传给 vxe-table，避免首屏渲染空白 */
const tableHeight = computed(() => {
  const h = props.height ?? (attrs.height as number | string | undefined)
  if (h == null || h === "" || h === 0) return undefined
  return h
})

const tableMaxHeight = computed(() => {
  const h =
    props.maxHeight ??
    (attrs.maxHeight as number | string | undefined) ??
    (attrs["max-height"] as number | string | undefined)
  if (h == null || h === "" || h === 0) return undefined
  return h
})

const useVirtualScrollY = computed(() => tableHeight.value != null || tableMaxHeight.value != null)

const tableClass = computed(() => {
  const extra = attrs.class
  const base = ["erp-list-table"]
  if (!extra) return base
  return Array.isArray(extra) ? [...base, ...extra] : [...base, String(extra)]
})

const columnConfig = computed<VxeTablePropTypes.ColumnConfig>(() => ({
  resizable: true,
  ...((attrs.columnConfig ?? attrs["column-config"]) as VxeTablePropTypes.ColumnConfig | undefined)
}))

const scrollX = computed<VxeTablePropTypes.ScrollX>(() => ({
  ...ERP_LIST_TABLE_SCROLL_X,
  ...((attrs.scrollX ?? attrs["scroll-x"]) as VxeTablePropTypes.ScrollX | undefined)
}))

const scrollY = computed<VxeTablePropTypes.ScrollY | undefined>(() => {
  const user = (attrs.scrollY ?? attrs["scroll-y"]) as VxeTablePropTypes.ScrollY | undefined
  if (user) return user
  return useVirtualScrollY.value ? ERP_LIST_TABLE_SCROLL_Y : undefined
})

const rowConfig = computed<VxeTablePropTypes.RowConfig>(() => ({
  isHover: true,
  keyField: "uid",
  ...((attrs.rowConfig ?? attrs["row-config"]) as VxeTablePropTypes.RowConfig | undefined)
}))

const cellConfig = computed<VxeTablePropTypes.CellConfig | undefined>(() => {
  const user = (attrs.cellConfig ?? attrs["cell-config"]) as VxeTablePropTypes.CellConfig | undefined
  if (props.cellHeight == null && !user) return undefined
  return { height: props.cellHeight, ...user }
})

const treeConfig = computed(
  () => (attrs.treeConfig ?? attrs["tree-config"]) as VxeTablePropTypes.TreeConfig | undefined
)

/** expandAll 仅在 vxe-table 初始化时生效一次，数据异步加载后需主动展开 */
watch(
  [tableData, treeConfig],
  ([rows, config]) => {
    if (!config?.expandAll || !rows?.length) return
    nextTick(() => {
      tableRef.value?.setAllTreeExpand?.(true)
    })
  },
  { flush: "post" }
)

defineExpose(
  new Proxy({} as VxeTableInstance, {
    get(_target, prop) {
      const table = tableRef.value as Record<string | symbol, unknown> | undefined
      if (!table) return undefined
      const val = table[prop as string]
      return typeof val === "function" ? (val as (...args: unknown[]) => unknown).bind(table) : val
    }
  })
)

watch([tableHeight, tableMaxHeight], ([height, maxHeight]) => {
  if (height == null && maxHeight == null) return
  nextTick(() => {
    tableRef.value?.recalculate?.()
  })
})
</script>

<template>
  <vxe-table
    v-bind="passthroughAttrs"
    ref="tableRef"
    border="inner"
    stripe
    :class="tableClass"
    :data="tableData"
    :loading="tableLoading"
    :size="tableSize"
    :height="tableHeight"
    :max-height="tableMaxHeight"
    :column-config="columnConfig"
    :scroll-x="scrollX"
    :scroll-y="scrollY"
    :row-config="rowConfig"
    :cell-config="cellConfig"
  >
    <slot />
  </vxe-table>
</template>
