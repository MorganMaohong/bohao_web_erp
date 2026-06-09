import { computed, type ComputedRef, type Ref } from "vue"
import { TaskCenterAction, TaskCenterActionField } from "@/model/flow"

export function useBizTaskActions(
  actionList: Ref<TaskCenterAction[] | undefined> | ComputedRef<TaskCenterAction[] | undefined> | (() => TaskCenterAction[] | undefined)
) {
  const listRef = typeof actionList === "function" ? computed(actionList) : actionList
  function getBizAction(action: string) {
    return (listRef.value || []).find((item) => item.action === action)
  }

  function getActionField(action: string, field: string): TaskCenterActionField | undefined {
    return getBizAction(action)?.fields?.find((item) => item.field === field)
  }

  function hasBizAction(action: string) {
    return Boolean(getBizAction(action))
  }

  function getBizActionHint(action: string) {
    return getBizAction(action)?.hint || ""
  }

  const actions = computed(() => listRef.value || [])

  return {
    actions,
    getBizAction,
    getActionField,
    hasBizAction,
    getBizActionHint
  }
}
