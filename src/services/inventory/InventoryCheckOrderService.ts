import { inventoryCheckOrderApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  InventoryCheckDetail,
  InventoryCheckOrderForm,
  InventoryCheckOrderQuery,
  InventoryCheckOrderQueryData,
  InventoryCheckOrderVo
} from "@/model/inventory/check"

export const InventoryCheckOrderService = {
  async addOrUpdate(data: InventoryCheckOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryCheckOrderApi.update.url : inventoryCheckOrderApi.add.url
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
  async complete(data: InventoryCheckOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryCheckOrderApi.complete.url : inventoryCheckOrderApi.complete.url
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
      const url = inventoryCheckOrderApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async cancel(uid: string): Promise<void> {
    try {
      const url = inventoryCheckOrderApi.cancel.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteDetail(uid: string): Promise<void> {
    try {
      const url = inventoryCheckOrderApi.deleteDetail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: InventoryCheckOrderQuery): Promise<PageVo<InventoryCheckOrderVo, InventoryCheckOrderQueryData>> {
    try {
      const url = inventoryCheckOrderApi.select.url
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
  async form(uid?: string): Promise<InventoryCheckOrderForm> {
    try {
      const url = uid ? inventoryCheckOrderApi.form.url + `/${uid}` : inventoryCheckOrderApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<InventoryCheckDetail> {
    try {
      const url = inventoryCheckOrderApi.detail.url + `/${uid}`
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
