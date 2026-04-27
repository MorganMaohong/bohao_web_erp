import { productionBomApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import { ProductionBomForm, ProductionBomProductVo, ProductionBomQuery } from "@/model/product"

export const ProductionBomService = {
  async select(data: ProductionBomQuery): Promise<PageVo<ProductionBomProductVo, void>> {
    const res = await request({ url: productionBomApi.select.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async form(productItemUid: string): Promise<ProductionBomForm> {
    const res = await request({ url: `${productionBomApi.form.url}/${productItemUid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async update(data: ProductionBomForm): Promise<void> {
    const res = await request({ url: productionBomApi.update.url, method: "POST", data })
    return Promise.resolve(res.data)
  }
}
