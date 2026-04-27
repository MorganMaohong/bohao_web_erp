import request from "@/utils/request"
import { factoryAppearanceApi } from "@/services/api"
import {
  FactoryAppearanceDetail,
  FactoryAppearanceForm,
  FactoryAppearanceQuery,
  FactoryAppearanceQueryData,
  FactoryAppearanceVo,
  FactoryGroupForm,
  FactoryGroupQuery,
  FactoryGroupQueryData,
  FactoryGroupVo
} from "@/model/operations/factory"
import { PageVo } from "@/model"

export const FactoryAppearanceService = {
  async addGroup(data: FactoryGroupForm): Promise<void> {
    try {
      const url = factoryAppearanceApi.addGroup.url
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
  async updateGroup(data: FactoryGroupForm): Promise<void> {
    try {
      const url = factoryAppearanceApi.updateGroup.url
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
  async deleteGroup(uid: string): Promise<void> {
    try {
      const url = factoryAppearanceApi.deleteGroup.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectGroup(data: FactoryGroupQuery): Promise<PageVo<FactoryGroupVo, FactoryGroupQueryData>> {
    try {
      const url = factoryAppearanceApi.selectGroup.url
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
  async formGroup(uid: string): Promise<FactoryGroupForm> {
    try {
      const url = uid ? factoryAppearanceApi.formGroup.url + `/${uid}` : factoryAppearanceApi.formGroup.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<FactoryAppearanceForm> {
    try {
      const url = uid ? factoryAppearanceApi.form.url + `/${uid}` : factoryAppearanceApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<FactoryAppearanceDetail> {
    try {
      const res = await request({
        url: factoryAppearanceApi.detail.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdateGroup(data: FactoryGroupForm): Promise<void> {
    try {
      const url = data.uid ? factoryAppearanceApi.updateGroup.url : factoryAppearanceApi.addGroup.url
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
  async addOrUpdate(data: FactoryAppearanceForm): Promise<void> {
    try {
      const url = data.uid ? factoryAppearanceApi.update.url : factoryAppearanceApi.add.url
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
  async select(data: FactoryAppearanceQuery): Promise<PageVo<FactoryAppearanceVo, FactoryAppearanceQueryData>> {
    try {
      const res = await request({
        url: factoryAppearanceApi.select.url,
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
      const res = await request({
        url: factoryAppearanceApi.delete.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getProjectListByGroupUid(uid: string): Promise<string[]> {
    try {
      const res = await request({
        url: factoryAppearanceApi.getProjectListByGroupUid.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async output(uid: string): Promise<void> {
    try {
      const res = await request({
        url: factoryAppearanceApi.output.url + `/${uid}`,
        method: "POST",
        responseType: "blob"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
