import request from "@/utils/request"

import { UpdateVarByGroupForm, VarGroup } from "@/model/var"
import { variableApi } from "@/services/api"

export const VarGroupService = {
  async updateVarByGroup(data: UpdateVarByGroupForm): Promise<void> {
    try {
      const url = variableApi.updateVarByGroup.url
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
  async addOrUpdate(data: VarGroup): Promise<void> {
    try {
      const url = data.uid ? variableApi.updateGroup.url : variableApi.addGroup.url
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
      const url = variableApi.deleteGroup.url + `/${uid}`
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
