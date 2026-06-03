import request from "@/utils/request"
import { PageVo } from "@/model"
import { InventoryFlowQuery, InventoryFlowQueryData, InventoryFlowVo } from "@/model/inventory"
import { inventoryFlowApi } from "@/services/api"

export const InventoryFlowService = {
  async select(data: InventoryFlowQuery): Promise<PageVo<InventoryFlowVo, InventoryFlowQueryData>> {
    try {
      const url = inventoryFlowApi.select.url
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
