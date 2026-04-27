import request from "@/utils/request"

import { UpdateVarByGroupForm } from "@/model/var"

import { warnApi } from "@/services/api"
import { WarnGroup } from "@/model/warn"

export const WarnGroupService = {
  async updateWarnByGroup(data: UpdateVarByGroupForm): Promise<void> {
    try {
      const url = warnApi.updateWarnByGroup.url
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
  async addOrUpdate(data: WarnGroup): Promise<void> {
    try {
      const url = data.uid ? warnApi.updateGroup.url : warnApi.addGroup.url
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
      const url = warnApi.deleteGroup.url + `/${uid}`
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
