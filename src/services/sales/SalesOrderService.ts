import { PageVo } from "@/model"
import { InventoryOutOrderForm } from "@/model/inventory/outbound"
import { SalesOrderDetail, SalesOrderForm, SalesOrderQuery, SalesOrderQueryData, SalesOrderVo } from "@/model/sales"
import { salesOrderApi } from "@/services/api"
import request from "@/utils/request"

export const SalesOrderService = {
  async addOrUpdate(data: SalesOrderForm): Promise<void> {
    try {
      const url = data.uid ? salesOrderApi.update.url : salesOrderApi.add.url
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
      const url = salesOrderApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: SalesOrderQuery): Promise<PageVo<SalesOrderVo, SalesOrderQueryData>> {
    try {
      const url = salesOrderApi.select.url
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
  async form(uid?: string): Promise<SalesOrderForm> {
    try {
      const url = uid ? salesOrderApi.form.url + `/${uid}` : salesOrderApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<SalesOrderDetail> {
    try {
      const url = salesOrderApi.detail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async confirm(data: SalesOrderForm): Promise<void> {
    try {
      const res = await request({
        url: salesOrderApi.confirm.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async outboundForm(uid: string): Promise<InventoryOutOrderForm> {
    try {
      const url = salesOrderApi.outboundForm.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async outbound(data: InventoryOutOrderForm): Promise<void> {
    try {
      const res = await request({
        url: salesOrderApi.outbound.url,
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
      const url = salesOrderApi.close.url + `/${uid}`
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
      const url = salesOrderApi.cancel.url + `/${uid}`
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
