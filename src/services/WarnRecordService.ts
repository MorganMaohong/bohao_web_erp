import { PageVo } from "@/model"
import { warnRecordApi } from "@/services/api"
import request from "@/utils/request"
import { WarnRecordForm, WarnRecordQuery, WarnRecordVo } from "@/model/warnrecord"

export const WarnRecordService = {
  async select(data: WarnRecordQuery): Promise<PageVo<WarnRecordVo, void>> {
    try {
      const url = warnRecordApi.select.url
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
  async confirm(data: WarnRecordForm): Promise<WarnRecordVo[]> {
    try {
      const url = warnRecordApi.confirm.url
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
      const url = `${warnRecordApi.delete.url}/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deletePatch(data: string[]): Promise<void> {
    try {
      const url = warnRecordApi.deletePatch.url
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
