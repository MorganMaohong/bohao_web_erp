import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

export const useGatewayTreeStore = defineStore("gatewayTree", () => {
  const uid = ref<string>("")
  const groupUid = ref<string>("")
  const sn = ref<string>("")
  const update = ref<boolean>(false)
  const clean = () => {
    uid.value = ""
    groupUid.value = ""
    sn.value = ""
    groupUid.value = ""
  }
  return { uid, groupUid, sn, update, clean }
})

/** 在 setup 外使用 */
export function useGatewayTreeStoreHook() {
  return useGatewayTreeStore(store)
}
