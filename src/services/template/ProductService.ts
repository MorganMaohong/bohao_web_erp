import { templateProductApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import { ProductForm, ProductQuery, ProductQueryData, ProductVo } from "@/model/template/product"

export const ProductService = {
  async addOrUpdate(data: ProductForm): Promise<void> {
    try {
      const url = data.uid ? templateProductApi.update.url : templateProductApi.add.url
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
      const url = templateProductApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: ProductQuery): Promise<PageVo<ProductVo, ProductQueryData>> {
    try {
      const url = templateProductApi.select.url
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
  async form(uid?: string): Promise<ProductForm> {
    try {
      const url = uid ? templateProductApi.form.url + `/${uid}` : templateProductApi.form.url
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
