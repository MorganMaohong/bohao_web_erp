import { getToken } from "@/utils/cache/cookies"
import { useNotifyStoreHook } from "@/store/modules/notify"
import { useTaskStoreHook } from "@/store/modules/task"
import { useUserStoreHook } from "@/store/modules/user"
import type { NotifyLevel, NotifyMessage } from "@/model/notify"
import router from "@/router"

type WsPayload = Record<string, any>

function normalizeLevel(level?: string): NotifyLevel {
  switch ((level || "").toLowerCase()) {
    case "success":
      return "success"
    case "warn":
    case "warning":
      return "warning"
    case "error":
    case "danger":
      return "error"
    default:
      return "info"
  }
}

function normalizeUrlPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "")
  return normalized || "/"
}

function appendUserUid(baseUrl: string, userUid: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(userUid)}`
}

function resolveWsUrl(userUid: string) {
  const configuredUrl = import.meta.env.VITE_WS_URL?.trim()
  if (configuredUrl) {
    const replacedUrl = configuredUrl.includes("{uid}")
      ? configuredUrl.replace("{uid}", encodeURIComponent(userUid))
      : configuredUrl
    return replacedUrl.includes("{uid}") ? replacedUrl : appendUserUid(replacedUrl, userUid)
  }

  const configuredApiBase = import.meta.env.VITE_BASE_URL?.trim()
  const fallbackApiBase = `${window.location.origin}${(import.meta.env.VITE_BASE_API || "/api").trim()}`
  const apiBaseUrl = new URL(configuredApiBase || fallbackApiBase, window.location.origin)
  const protocol = apiBaseUrl.protocol === "https:" ? "wss:" : "ws:"
  const pathname = normalizeUrlPath(apiBaseUrl.pathname)

  return `${protocol}//${apiBaseUrl.host}${pathname}/ws/message/${encodeURIComponent(userUid)}`
}

function asText(value: unknown, fallback = "") {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function asTime(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString()
  return asText(value)
}

function buildNotifyMessage(payload: WsPayload): NotifyMessage {
  const extra = payload.extra && typeof payload.extra === "object" ? payload.extra : {}
  const content = asText(payload.content) || asText(payload.message) || asText(payload.msg) || JSON.stringify(payload)
  const title = asText(payload.title) || asText(payload.subject) || "系统通知"
  const timestamp = asTime(payload.timestamp) || asTime(payload.createTime) || asTime(payload.time) || new Date().toISOString()
  const routePath = asText(extra.routePath) || (extra.taskUid || extra.taskSource ? "/other/task" : "")

  return {
    id: asText(payload.uid) || asText(payload.id) || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    uid: asText(payload.uid) || asText(payload.id),
    title,
    content,
    level: normalizeLevel(payload.level || payload.type),
    timestamp,
    read: false,
    routePath,
    extra,
    raw: payload
  }
}

function enterNotifyTarget(message: NotifyMessage) {
  if (!message.routePath) return
  router.push({ path: message.routePath }).catch(() => undefined)
}

function parseMessage(data: string): NotifyMessage {
  try {
    const payload = JSON.parse(data)
    if (payload && typeof payload === "object") {
      const normalized = payload.data && typeof payload.data === "object" ? payload.data : payload
      return buildNotifyMessage(normalized)
    }
  } catch {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      title: "系统通知",
      content: data,
      level: "info",
      timestamp: new Date().toISOString(),
      read: false,
      raw: data
    }
  }

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    title: "系统通知",
    content: data,
    level: "info",
    timestamp: new Date().toISOString(),
    read: false,
    raw: data
  }
}

export const websocketUtil = {
  socket: null as WebSocket | null,
  currentUserUid: "",

  connect() {
    const notifyStore = useNotifyStoreHook()
    const userStore = useUserStoreHook()
    const token = getToken()?.trim()
    if (!token || token === "undefined" || token === "null") return
    const userUid = userStore.userInfo?.uid?.trim()
    if (!userUid) {
      notifyStore.setConnectionStatus("disconnected")
      return
    }
    if (this.socket && this.currentUserUid !== userUid) {
      this.disconnect(false)
    }
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    notifyStore.setConnectionStatus("connecting")

    try {
      this.currentUserUid = userUid
      this.socket = new WebSocket(resolveWsUrl(userUid))
    } catch (error) {
      notifyStore.setConnectionStatus("disconnected")
      this.currentUserUid = ""
      console.error("websocket 连接创建失败:", error)
      window.$message?.error("通知连接创建失败")
      return
    }

    this.socket.onopen = () => {
      notifyStore.setConnectionStatus("connected")
      window.$message?.success("通知连接已建立")
    }

    this.socket.onmessage = (event) => {
      const message = parseMessage(String(event.data || ""))
      notifyStore.prepend(message)
      if (message.routePath === "/other/task") {
        useTaskStoreHook().refreshPendingCount()
      }
      const notify = window.$notification
      const render = notify?.[message.level] || notify?.info
      render?.({
        title: message.title,
        content: message.content,
        duration: 5000,
        meta: message.routePath ? "点击查看详情" : message.timestamp ? new Date(message.timestamp).toLocaleString() : undefined,
        onClick: () => enterNotifyTarget(message)
      })
    }

    this.socket.onerror = (error) => {
      console.error("websocket 连接异常:", error)
      notifyStore.setConnectionStatus("disconnected")
      this.currentUserUid = ""
      window.$message?.error("通知连接异常")
    }

    this.socket.onclose = () => {
      notifyStore.setConnectionStatus("disconnected")
      this.socket = null
      this.currentUserUid = ""
    }
  },

  disconnect(showMessage = true) {
    const notifyStore = useNotifyStoreHook()
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.currentUserUid = ""
    notifyStore.setConnectionStatus("disconnected")
    if (showMessage) {
      window.$message?.info("通知连接已关闭")
    }
  }
}
