import request from "@/utils/request"
import { LoginVo } from "@/model/auth"
import { flowInstanceApi } from "@/services/api"
import { FlowInstanceForm } from "@/model/flow"

export const FlowInstanceService = {
  async addOrUpdate(data: FlowInstanceForm): Promise<LoginVo> {
    try {
      const res = await request({
        url: flowInstanceApi.add.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: FlowInstanceForm): Promise<LoginVo> {
    try {
      const res = await request({
        url: flowInstanceApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(v: string): Promise<FlowInstanceForm> {
    try {
      const url = v ? flowInstanceApi.form.url + `/${v}` : flowInstanceApi.form.url
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
