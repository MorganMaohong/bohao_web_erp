import { templateWarehouseApi } from "@/services/api"
import request from "@/utils/request"
import { OptionVo, PageVo } from "@/model"
import { WarehouseForm, WarehouseQuery, WarehouseVo } from "@/model/stock"

export const WarehouseService = {
  async addOrUpdate(data: WarehouseForm): Promise<void> {
    try {
      const url = data.uid ? templateWarehouseApi.update.url : templateWarehouseApi.add.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    try {
      const url = templateWarehouseApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: WarehouseQuery): Promise<PageVo<WarehouseVo, void>> {
    try {
      const url = templateWarehouseApi.select.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async options(): Promise<OptionVo[]> {
    try {
      const res = await request({
        url: templateWarehouseApi.options.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid?: string): Promise<WarehouseForm> {
    try {
      const url = uid ? templateWarehouseApi.form.url + `/${uid}` : templateWarehouseApi.form.url
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
