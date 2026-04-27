import request from "@/utils/request"
import { PageVo } from "src/model"
import {
  PermissionForm,
  PermissionGroupForm,
  PermissionQuery,
  PermissionQueryData,
  PermissionVo
} from "@/model/permission"
import { permissionApi } from "@/services/api"

// 用户服务封装
export const PermissionService = {
  async select(data: PermissionQuery): Promise<PageVo<PermissionVo, PermissionQueryData>> {
    try {
      const res = await request({
        url: permissionApi.select.url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<PermissionForm> {
    try {
      const url = uid ? `${permissionApi.form.url}/${uid}` : permissionApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: PermissionForm): Promise<void> {
    try {
      const url = data.uid ? permissionApi.update.url : permissionApi.add.url
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
      const url = `${permissionApi.delete.url}/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdateGroup(data: PermissionGroupForm): Promise<void> {
    try {
      const url = data.uid ? permissionApi.updateGroup.url : permissionApi.addGroup.url
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
      const url = `${permissionApi.deleteGroup.url}/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async groupForm(uid: string): Promise<PermissionGroupForm> {
    try {
      const url = uid ? `${permissionApi.groupForm.url}/${uid}` : permissionApi.groupForm.url
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
