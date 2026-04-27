import request from "@/utils/request"
import { FlowTaskApi } from "@/services/api"
import { FlowLog, FlowTask, FlowTaskVo } from "@/model/flow"

export const FlowTaskService = {
  async getPendingTasks(): Promise<FlowTask[]> {
    const url = FlowTaskApi.pending.url
    try {
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getCompletedTasks(): Promise<FlowTask[]> {
    const url = FlowTaskApi.completed.url
    try {
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getCopyTasks(): Promise<FlowTask[]> {
    const url = FlowTaskApi.copy.url
    try {
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getHistory(instanceUid: string): Promise<FlowLog[]> {
    const url = `${FlowTaskApi.history.url}/${instanceUid}`
    try {
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getDetail(uid: string, type: string): Promise<FlowTaskVo> {
    const url = FlowTaskApi.detail.url + `/${uid}/${type}`
    try {
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
