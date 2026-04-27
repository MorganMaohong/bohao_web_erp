import { productionProcessTemplateApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  ProductionProcessTemplateForm,
  ProductionProcessTemplateQuery,
  ProductionProcessTemplateVo
} from "@/model/product"

export const ProductionProcessTemplateService = {
  async select(data: ProductionProcessTemplateQuery): Promise<PageVo<ProductionProcessTemplateVo, void>> {
    const res = await request({ url: productionProcessTemplateApi.select.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async form(uid?: string): Promise<ProductionProcessTemplateForm> {
    const url = uid ? `${productionProcessTemplateApi.form.url}/${uid}` : productionProcessTemplateApi.form.url
    const res = await request({ url, method: "POST" })
    return Promise.resolve(res.data)
  },
  async addOrUpdate(data: ProductionProcessTemplateForm): Promise<void> {
    const url = data.uid ? productionProcessTemplateApi.update.url : productionProcessTemplateApi.add.url
    const res = await request({ url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async delete(uid: string): Promise<void> {
    const res = await request({ url: `${productionProcessTemplateApi.delete.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async copy(uid: string): Promise<void> {
    const res = await request({ url: `${productionProcessTemplateApi.copy.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  }
}
