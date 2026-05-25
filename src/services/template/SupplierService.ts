import { PageVo } from "@/model"
import { templateSupplierApi } from "@/services/api"
import request from "@/utils/request"
import { SupplierForm, SupplierQuery, SupplierVo } from "@/model/template/supplier"

export const SupplierService = {
  async addOrUpdate(data: SupplierForm): Promise<void> {
    try {
      const url = data.uid ? templateSupplierApi.update.url : templateSupplierApi.add.url
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
      const url = templateSupplierApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: SupplierQuery): Promise<PageVo<SupplierVo, void>> {
    try {
      const url = templateSupplierApi.select.url
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
  async form(uid?: string): Promise<SupplierForm> {
    try {
      const url = uid ? templateSupplierApi.form.url + `/${uid}` : templateSupplierApi.form.url
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
