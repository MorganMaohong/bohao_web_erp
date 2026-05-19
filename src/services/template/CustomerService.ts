import { PageVo } from "@/model"
import { CustomerForm, CustomerQuery, CustomerVo } from "@/model/template/customer"
import { templateCustomerApi } from "@/services/api"
import request from "@/utils/request"

export const CustomerService = {
  async addOrUpdate(data: CustomerForm): Promise<void> {
    try {
      const url = data.uid ? templateCustomerApi.update.url : templateCustomerApi.add.url
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
      const url = templateCustomerApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: CustomerQuery): Promise<PageVo<CustomerVo, void>> {
    try {
      const url = templateCustomerApi.select.url
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
  async form(uid?: string): Promise<CustomerForm> {
    try {
      const url = uid ? templateCustomerApi.form.url + `/${uid}` : templateCustomerApi.form.url
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
