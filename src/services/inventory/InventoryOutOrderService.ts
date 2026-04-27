import { inventoryOutboundApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  InventoryOutOrderForm,
  InventoryOutOrderQuery,
  InventoryOutOrderQueryData,
  InventoryOutOrderVo
} from "@/model/inventory/outbound"

export const InventoryOutOrderService = {
  async addOrUpdate(data: InventoryOutOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryOutboundApi.update.url : inventoryOutboundApi.add.url
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
  async complete(data: InventoryOutOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryOutboundApi.complete.url : inventoryOutboundApi.complete.url
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
      const url = inventoryOutboundApi.delete.url + `/${uid}`
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
      const url = inventoryOutboundApi.cancel.url + `/${uid}`
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
      const url = inventoryOutboundApi.deleteDetail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: InventoryOutOrderQuery): Promise<PageVo<InventoryOutOrderVo, InventoryOutOrderQueryData>> {
    try {
      const url = inventoryOutboundApi.select.url
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
  async form(uid?: string): Promise<InventoryOutOrderForm> {
    try {
      const url = uid ? inventoryOutboundApi.form.url + `/${uid}` : inventoryOutboundApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<InventoryOutOrderForm> {
    try {
      const url = inventoryOutboundApi.detail.url + `/${uid}`
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
