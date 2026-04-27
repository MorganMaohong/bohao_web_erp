import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

export const useRepairWorkOrderStore = defineStore("repairWorkOrder", () => {
  const update = ref<boolean>(false)
  return { update }
})
