import { inventoryInboundApi } from "@/services/api"
import request from "@/utils/request"
import {
  InventoryInOrderForm,
  InventoryInOrderQuery,
  InventoryInOrderQueryData,
  InventoryInOrderVo
} from "@/model/inventory/inbound"
import { PageVo } from "@/model"

export const InventoryInOrderService = {
  async addOrUpdate(data: InventoryInOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryInboundApi.update.url : inventoryInboundApi.add.url
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
  async complete(data: InventoryInOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryInboundApi.complete.url : inventoryInboundApi.complete.url
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
      const url = inventoryInboundApi.delete.url + `/${uid}`
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
      const url = inventoryInboundApi.cancel.url + `/${uid}`
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
      const url = inventoryInboundApi.deleteDetail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: InventoryInOrderQuery): Promise<PageVo<InventoryInOrderVo, InventoryInOrderQueryData>> {
    try {
      const url = inventoryInboundApi.select.url
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
  async form(uid?: string): Promise<InventoryInOrderForm> {
    try {
      const url = uid ? inventoryInboundApi.form.url + `/${uid}` : inventoryInboundApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<InventoryInOrderForm> {
    try {
      const url = inventoryInboundApi.detail.url + `/${uid}`
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
