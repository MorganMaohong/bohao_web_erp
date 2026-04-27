import { templateItemsApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import { ItemsForm, ItemsQuery, ItemsQueryData, ItemsVo } from "src/model/template/items"

export const ItemsService = {
  async addOrUpdate(data: ItemsForm): Promise<void> {
    try {
      const url = data.uid ? templateItemsApi.update.url : templateItemsApi.add.url
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
      const url = templateItemsApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: ItemsQuery): Promise<PageVo<ItemsVo, ItemsQueryData>> {
    try {
      const url = templateItemsApi.select.url
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
  async form(uid?: string): Promise<ItemsForm> {
    try {
      const url = uid ? templateItemsApi.form.url + `/${uid}` : templateItemsApi.form.url
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
