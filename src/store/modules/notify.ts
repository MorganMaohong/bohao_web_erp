import { computed, ref } from "vue"
import { defineStore } from "pinia"
import store from "@/store"
import { NotifyMessage } from "@/model/notify"
import { MessageService } from "@/services/MessageService"
import { SysMessageVo } from "@/model/notify/sysMessage"

export const useNotifyStore = defineStore("notify", () => {
  const items = ref<NotifyMessage[]>([])
  const connectionStatus = ref<"disconnected" | "connecting" | "connected">("disconnected")
  const lastConnectedAt = ref("")

  const unreadCount = computed(() => items.value.filter((item) => !item.read).length)

  const prepend = (message: NotifyMessage) => {
    items.value = [message, ...items.value.filter((item) => item.id !== message.id)].slice(0, 100)
  }

  const replaceAll = (list: NotifyMessage[]) => {
    items.value = list
  }

  const markAllRead = () => {
    items.value = items.value.map((item) => ({ ...item, read: true }))
  }

  const markRead = (id: string) => {
    items.value = items.value.map((item) => (item.id === id ? { ...item, read: true } : item))
  }

  const clear = () => {
    items.value = []
  }

  const setConnectionStatus = (status: "disconnected" | "connecting" | "connected") => {
    connectionStatus.value = status
    if (status === "connected") {
      lastConnectedAt.value = new Date().toISOString()
    }
  }

  const parseExtra = (extra?: string): Record<string, any> => {
    if (!extra) return {}
    try {
      const parsed = JSON.parse(extra)
      return parsed && typeof parsed === "object" ? parsed : {}
    } catch {
      return {}
    }
  }

  const resolveRoutePath = (extra: Record<string, any>) => {
    if (typeof extra.routePath === "string" && extra.routePath) return extra.routePath
    if (extra.taskUid || extra.taskSource) return "/other/task"
    return ""
  }

  const fromSysMessage = (item: SysMessageVo): NotifyMessage => ({
    ...(() => {
      const extra = parseExtra(item.extra)
      return {
        id: item.uid || `${item.createTime || ""}-${item.title || ""}`,
        uid: item.uid,
        title: item.title || "系统通知",
        content: item.content || "",
        level: item.type === "error" ? "error" : item.type === "warning" ? "warning" : "info",
        timestamp: item.createTime || "",
        read: item.status === "read",
        routePath: resolveRoutePath(extra),
        extra,
        raw: item
      }
    })()
  })

  const refresh = async () => {
    const list = await MessageService.mine()
    replaceAll(list.map(fromSysMessage))
  }

  const markReadRemote = async (id: string) => {
    markRead(id)
    const current = items.value.find((item) => item.id === id)
    if (current?.uid) {
      await MessageService.markRead(current.uid)
    }
  }

  const markAllReadRemote = async () => {
    markAllRead()
    await MessageService.markAllRead()
  }

  return {
    items,
    unreadCount,
    connectionStatus,
    lastConnectedAt,
    prepend,
    replaceAll,
    markRead,
    markAllRead,
    markReadRemote,
    markAllReadRemote,
    clear,
    setConnectionStatus,
    refresh
  }
})

export function useNotifyStoreHook() {
  return useNotifyStore(store)
}
