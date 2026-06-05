import { purchaseApplyOrderApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  PurchaseApplyDetail,
  PurchaseApplyOrderForm,
  PurchaseApplyOrderQuery,
  PurchaseApplyOrderQueryData,
  PurchaseApplyOrderVo
} from "@/model/purchase"

export const PurchaseApplyOrderService = {
  async addOrUpdate(data: PurchaseApplyOrderForm): Promise<void> {
    try {
      const url = data.uid ? purchaseApplyOrderApi.update.url : purchaseApplyOrderApi.add.url
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
      const url = purchaseApplyOrderApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async createPurchaseOrder(
    uid: string
  ): Promise<{ createdCount?: number; skippedCount?: number; orderUids?: string[] }> {
    try {
      const url = purchaseApplyOrderApi.createOrder.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: PurchaseApplyOrderQuery): Promise<PageVo<PurchaseApplyOrderVo, PurchaseApplyOrderQueryData>> {
    try {
      const url = purchaseApplyOrderApi.select.url
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
  async form(uid?: string): Promise<PurchaseApplyOrderForm> {
    try {
      const url = uid ? purchaseApplyOrderApi.form.url + `/${uid}` : purchaseApplyOrderApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<PurchaseApplyDetail> {
    try {
      const url = purchaseApplyOrderApi.detail.url + `/${uid}`
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
