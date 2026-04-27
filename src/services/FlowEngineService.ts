import request from "@/utils/request"
import { flowEngineApi } from "@/services/api"
import { FlowTaskSubmitForm } from "@/model/flow"

export const FlowEngineService = {
  async getStatus(businessUid: string): Promise<string> {
    const url = flowEngineApi.status.url
    try {
      const res = await request({
        url,
        method: "POST",
        params: {
          businessUid
        }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async startInstance(definitionType: string, businessUid: string, variables: Record<string, any>): Promise<string> {
    const url = flowEngineApi.start.url
    try {
      const res = await request({
        url,
        method: "POST",
        params: {
          definitionType,
          businessUid
        },
        data: variables
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async approve(form: FlowTaskSubmitForm): Promise<any> {
    const url = flowEngineApi.approve.url
    try {
      const res = await request({
        url,
        method: "POST",
        data: form
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async reject(form: FlowTaskSubmitForm): Promise<any> {
    const url = flowEngineApi.reject.url
    try {
      const res = await request({
        url,
        method: "POST",
        data: form
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async withdraw(instanceUid: string): Promise<any> {
    const url = flowEngineApi.withdraw.url
    try {
      const res = await request({
        url,
        method: "POST",
        params: {
          instanceUid
        }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
