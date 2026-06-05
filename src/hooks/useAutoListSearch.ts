import { nextTick, ref } from "vue"
import { debounce } from "lodash-es"

/** 列表页搜索栏：input 防抖、select 即时触发，重置时抑制自动搜索 */
export function useAutoListSearch(onSearch: () => void, debounceMs = 400) {
  const suppressAutoSearch = ref(false)

  function search() {
    if (suppressAutoSearch.value) return
    onSearch()
  }

  const debouncedSearch = debounce(() => search(), debounceMs)

  function triggerInputSearch() {
    if (suppressAutoSearch.value) return
    debouncedSearch()
  }

  function flushInputSearch() {
    if (suppressAutoSearch.value) return
    debouncedSearch.flush()
  }

  function triggerSelectSearch() {
    if (suppressAutoSearch.value) return
    debouncedSearch.cancel()
    search()
  }

  async function withResetSuppressed(resetFn: () => void | Promise<void>) {
    suppressAutoSearch.value = true
    debouncedSearch.cancel()
    await resetFn()
    await nextTick()
    suppressAutoSearch.value = false
    search()
  }

  return {
    suppressAutoSearch,
    search,
    triggerInputSearch,
    flushInputSearch,
    triggerSelectSearch,
    withResetSuppressed
  }
}
