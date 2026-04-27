import { computed, ref } from "vue"
import { defineStore } from "pinia"
import store from "@/store"
import { TaskCenterService } from "@/services/TaskCenterService"

export const useTaskStore = defineStore("task", () => {
  const flowPendingCount = ref(0)
  const bizPendingCount = ref(0)
  const loading = ref(false)

  const pendingCount = computed(() => flowPendingCount.value + bizPendingCount.value)

  const refreshPendingCount = async () => {
    loading.value = true
    try {
      const data = await TaskCenterService.getPendingTasks({ currentPage: 1, pageSize: 10000 })
      const list = data.list || []
      flowPendingCount.value = list.filter((item) => item.taskSource === "flow").length
      bizPendingCount.value = list.filter((item) => item.taskSource === "biz").length
    } catch {
      flowPendingCount.value = 0
      bizPendingCount.value = 0
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    flowPendingCount.value = 0
    bizPendingCount.value = 0
  }

  return {
    flowPendingCount,
    bizPendingCount,
    pendingCount,
    loading,
    refreshPendingCount,
    clear
  }
})

export function useTaskStoreHook() {
  return useTaskStore(store)
}
