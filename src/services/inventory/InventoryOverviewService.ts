import { inventoryOverviewApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import { InventoryQuery, InventoryQueryData, InventoryVo } from "@/model/inventory"

export const InventoryOverviewService = {
  async select(data: InventoryQuery): Promise<PageVo<InventoryVo, InventoryQueryData>> {
    try {
      const url = inventoryOverviewApi.select.url
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
  async detail(uid: string): Promise<void> {
    try {
      const url = inventoryOverviewApi.detail.url + `/${uid}`
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
