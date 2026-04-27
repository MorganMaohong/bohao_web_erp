export type NotifyLevel = "info" | "success" | "warning" | "error"

export interface NotifyMessage {
  id: string
  uid?: string
  title: string
  content: string
  level: NotifyLevel
  timestamp: string
  read: boolean
  routePath?: string
  extra?: Record<string, any>
  raw?: unknown
}
