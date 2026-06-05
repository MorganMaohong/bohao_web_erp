import { ComponentSizeEnum } from "@/constants/app-key"

/**
 * 列表页搜索栏、搜索栏下方工具栏（新增等）的控件尺寸。
 * 修改此值即可全局生效。
 */
export const SEARCH_BAR_SIZE = ComponentSizeEnum.medium

/** 挂载在 SearchQueryForm / ListPageToolbar 上的尺寸 class */
export const SEARCH_BAR_CONTROL_CLASS = `erp-control-size-${SEARCH_BAR_SIZE}`

export type SearchBarSize = typeof SEARCH_BAR_SIZE
