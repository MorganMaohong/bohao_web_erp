import request from "@/utils/request"
import { PageVo } from "src/model"
import { WarnForm, WarnGroupData, WarnQuery, WarnVo } from "@/model/warn"
import { warnApi } from "@/services/api"

export const WarnService = {
  async select(data: WarnQuery): Promise<PageVo<WarnVo, void>> {
    try {
      const url = warnApi.select.url
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
  async selectGroup(uid: string): Promise<WarnGroupData> {
    try {
      const url = warnApi.selectGroup.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(gatewayUid: string, uid: string): Promise<WarnForm> {
    try {
      const url = uid ? warnApi.form.url + `/${gatewayUid}/${uid}` : warnApi.form.url + `/${gatewayUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: WarnForm): Promise<void> {
    try {
      const url = data.uid ? warnApi.update.url : warnApi.add.url
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
      const url = warnApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteds(data: string[]): Promise<void> {
    try {
      const url = warnApi.delete.url
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
