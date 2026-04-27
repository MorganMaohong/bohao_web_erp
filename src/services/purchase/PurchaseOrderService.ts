import { purchaserOrderApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  PurchaseOrderDetail,
  PurchaseOrderForm,
  PurchaseOrderQuery,
  PurchaseOrderQueryData,
  PurchaseOrderVo
} from "@/model/purchase"
import { InventoryInOrderForm } from "@/model/inventory/inbound"
import { InventoryOutOrderForm } from "@/model/inventory/outbound"

export const PurchaseOrderService = {
  async confirm(data: PurchaseOrderForm): Promise<void> {
    try {
      const url = purchaserOrderApi.confirm.url
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
  async inboundForm(uid: string): Promise<InventoryInOrderForm> {
    try {
      const url = purchaserOrderApi.inboundForm.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async inbound(data: InventoryInOrderForm): Promise<void> {
    try {
      const url = purchaserOrderApi.inbound.url
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
  async returnForm(inOrderUid: string): Promise<InventoryOutOrderForm> {
    try {
      const url = purchaserOrderApi.returnForm.url + `/${inOrderUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async returns(data: InventoryOutOrderForm): Promise<void> {
    try {
      const url = purchaserOrderApi.returns.url
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
  async close(uid: string): Promise<void> {
    try {
      const url = purchaserOrderApi.close.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<PurchaseOrderForm> {
    try {
      const url = purchaserOrderApi.form.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<PurchaseOrderDetail> {
    try {
      const url = purchaserOrderApi.detail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: PurchaseOrderQuery): Promise<PageVo<PurchaseOrderVo, PurchaseOrderQueryData>> {
    try {
      const url = purchaserOrderApi.select.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
