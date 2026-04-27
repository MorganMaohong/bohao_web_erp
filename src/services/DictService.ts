import request from "@/utils/request"
import { OptionVo } from "src/model"
import { dictApi } from "@/services/api"

// 用户服务封装
export const DictService = {
  async getOptions(code: string): Promise<OptionVo[]> {
    try {
      const res = await request({
        url: dictApi.getOptions.url + `/${code}`,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getOptionsList(data: string[]): Promise<Record<string, OptionVo[]>> {
    try {
      const res = await request({
        url: dictApi.getOptionsList.url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
