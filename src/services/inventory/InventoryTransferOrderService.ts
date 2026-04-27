import { inventoryTransferOrderApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  InventoryTransferDetail,
  InventoryTransferOrderForm,
  InventoryTransferOrderQuery,
  InventoryTransferOrderQueryData,
  InventoryTransferOrderVo
} from "@/model/inventory/transfer"

export const InventoryTransferOrderService = {
  async addOrUpdate(data: InventoryTransferOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryTransferOrderApi.update.url : inventoryTransferOrderApi.add.url
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
  async complete(data: InventoryTransferOrderForm): Promise<void> {
    try {
      const url = data.uid ? inventoryTransferOrderApi.complete.url : inventoryTransferOrderApi.complete.url
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
      const url = inventoryTransferOrderApi.delete.url + `/${uid}`
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
      const url = inventoryTransferOrderApi.cancel.url + `/${uid}`
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
      const url = inventoryTransferOrderApi.deleteDetail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(
    data: InventoryTransferOrderQuery
  ): Promise<PageVo<InventoryTransferOrderVo, InventoryTransferOrderQueryData>> {
    try {
      const url = inventoryTransferOrderApi.select.url
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
  async form(uid?: string): Promise<InventoryTransferOrderForm> {
    try {
      const url = uid ? inventoryTransferOrderApi.form.url + `/${uid}` : inventoryTransferOrderApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<InventoryTransferDetail> {
    try {
      const url = inventoryTransferOrderApi.detail.url + `/${uid}`
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
