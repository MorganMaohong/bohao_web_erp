import request from "@/utils/request"
import { messageApi } from "@/services/api"
import { SysMessageVo } from "@/model/notify/sysMessage"

export const MessageService = {
  async mine(): Promise<SysMessageVo[]> {
    const res = await request({
      url: messageApi.mine.url,
      method: "POST"
    })
    return res.data as SysMessageVo[]
  },
  async unreadCount(): Promise<number> {
    const res = await request({
      url: messageApi.unreadCount.url,
      method: "POST"
    })
    return Number(res.data || 0)
  },
  async markRead(uid: string): Promise<void> {
    await request({
      url: `${messageApi.markRead.url}/${uid}`,
      method: "POST"
    })
  },
  async markAllRead(): Promise<void> {
    await request({
      url: messageApi.markAllRead.url,
      method: "POST"
    })
  }
}
