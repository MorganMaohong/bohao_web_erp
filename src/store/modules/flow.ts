import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

export const useFlowStore = defineStore("flow", () => {
  const projectUid = ref<string>("")
  return { projectUid }
})

/** 在 setup 外使用 */
export function useFlowStoreHook() {
  return useFlowStore(store)
}
