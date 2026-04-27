// src/types/global.d.ts
import type { MessageApiInjection, NotificationApiInjection } from "naive-ui"

declare namespace global {
  interface Options {
    label: string
    value: string
  }

  interface TreeOptions {
    label: string
    value: string
    children: TreeOptions[]
  }

  interface RespListData {
    currentPage: number
    pageSize: number
    count: number
    list: any[]
    extraData: any
  }

  interface ReqListBody {
    currentPage: number
    pageSize: number
    [key: string]: any // 索引签名，允许额外的字段
  }
}

declare global {
  interface Window {
    $message?: MessageApiInjection
    $notification?: NotificationApiInjection
  }
}
