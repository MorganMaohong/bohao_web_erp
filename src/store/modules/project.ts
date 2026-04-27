import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

export const useProjectTreeStore = defineStore("projectTree", () => {
  const uid = ref<string>("")
  const groupUid = ref<string>("")
  const isGroup = ref<boolean>(false)
  const data = ref<[]>([])
  const update = ref<boolean>(false)
  const clean = () => {
    uid.value = ""
    groupUid.value = ""
  }
  return { uid, groupUid, data, isGroup, update, clean }
})

/** 在 setup 外使用 */
export function useProjectTreeStoreHook() {
  return useProjectTreeStore(store)
}
