import request from "@/utils/request"
import { PageVo } from "src/model"
import { ComportQuery, ComportVo, UpdateVarByComportForm } from "@/model/comport"
import { comportApi, variableApi } from "@/services/api"

export const ComportService = {
  async select(data: ComportQuery): Promise<PageVo<ComportVo, void>> {
    try {
      const res = await request({
        url: comportApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async update(data: ComportVo): Promise<void> {
    try {
      const res = await request({
        url: comportApi.update.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateVarByComport(data: UpdateVarByComportForm): Promise<void> {
    try {
      const res = await request({
        url: variableApi.updateVarByComport.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateVarByComportForm(gatewayUid: string): Promise<UpdateVarByComportForm> {
    try {
      const res = await request({
        url: variableApi.updateVarByComportForm.url + `/${gatewayUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    try {
      const res = await request({
        url: comportApi.delete.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
