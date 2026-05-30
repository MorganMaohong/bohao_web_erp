import { SEARCH_BAR_SIZE } from "@/config/ui"

/** 列表搜索区 / 工具栏尺寸（与 config/ui.ts SEARCH_BAR_SIZE 同源） */
export function useSearchBarSize() {
  return {
    searchBarSize: SEARCH_BAR_SIZE
  }
}
