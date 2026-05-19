import { purchasePriceApi } from "@/services/api"
import request from "@/utils/request"
import {
  PurchasePriceCompareQuery,
  PurchasePriceCompareVo,
  PurchasePriceHistoryQuery,
  PurchasePriceHistoryResultVo
} from "@/model/purchase"

export const PurchasePriceAnalysisService = {
  async compare(data: PurchasePriceCompareQuery): Promise<PurchasePriceCompareVo[]> {
    try {
      const url = purchasePriceApi.compare.url
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
  async history(data: PurchasePriceHistoryQuery): Promise<PurchasePriceHistoryResultVo> {
    try {
      const url = purchasePriceApi.history.url
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
