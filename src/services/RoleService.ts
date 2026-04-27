import request from "@/utils/request"
import { OptionVo, PageVo } from "src/model"
import { RoleForm, RoleGroupForm, RoleQuery, RoleQueryData, RoleVo } from "@/model/role"
import { roleApi } from "@/services/api"

// 用户服务封装
export const RoleService = {
  async options(): Promise<OptionVo[]> {
    try {
      const res = await request({
        url: roleApi.options.url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: RoleQuery): Promise<PageVo<RoleVo, RoleQueryData>> {
    try {
      const res = await request({
        url: roleApi.select.url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<RoleForm> {
    try {
      const url = uid ? `${roleApi.form.url}/${uid}` : roleApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: RoleForm): Promise<void> {
    try {
      const url = data.uid ? roleApi.update.url : roleApi.add.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    try {
      const url = `${roleApi.delete.url}/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdateGroup(data: RoleGroupForm): Promise<void> {
    try {
      const url = data.uid ? roleApi.updateGroup.url : roleApi.addGroup.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteGroup(uid: string): Promise<void> {
    try {
      const url = `${roleApi.deleteGroup.url}/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async groupForm(uid: string): Promise<RoleGroupForm> {
    try {
      const url = uid ? `${roleApi.groupForm.url}/${uid}` : roleApi.groupForm.url
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
