import request from "@/utils/request"

import {
  VarComportGroupData,
  VarForm,
  VarQuery,
  VarQueryData,
  VarStoreForm,
  VarStoreQuery,
  VarStoreVo,
  VarVo
} from "@/model/var"
import { PageVo } from "src/model"
import { variableApi } from "@/services/api"

export const VarService = {
  async selectGroup(gatewayUid: string): Promise<VarComportGroupData> {
    try {
      const res = await request({
        url: variableApi.selectGroup.url + `/${gatewayUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateStore(data: VarStoreForm): Promise<void> {
    try {
      const res = await request({
        url: variableApi.updateStore.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: VarQuery): Promise<PageVo<VarVo, VarQueryData>> {
    try {
      const res = await request({
        url: variableApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectStore(data: VarStoreQuery): Promise<PageVo<VarStoreVo, void>> {
    try {
      const res = await request({
        url: variableApi.selectStore.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectVarCacheData(gatewayUid: string): Promise<Record<string, string>> {
    try {
      const res = await request({
        url: variableApi.selectVarCacheData.url + `/${gatewayUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(gatewayUid: string, uid: string): Promise<VarForm> {
    try {
      const url = uid ? `${variableApi.form.url}/${gatewayUid}/${uid}` : `${variableApi.form.url}/${gatewayUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: VarForm): Promise<void> {
    try {
      const url = data.uid ? variableApi.update.url : variableApi.add.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  } /*async copy(uid: string): Promise<void> {
    try {
      const url = variableApi.copy.url + `/${uid}`
      let res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },*/,
  async delete(uid: string): Promise<void> {
    try {
      const url = variableApi.delete.url + `/${uid}`
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
      const url = variableApi.deletePatch.url
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
  async write(uid: string, controlValue: string): Promise<void> {
    try {
      const url = variableApi.write.url + `/${uid}/${controlValue}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async uploadVarExcel(gatewayUid: string, groupUid: string, data: FormData): Promise<void> {
    try {
      const url = variableApi.uploadVarExcel.url + `/${gatewayUid}/${groupUid}`
      const res = await request({
        url,
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async exportVarExcel(gatewayUid: string): Promise<void> {
    try {
      const url = variableApi.exportVarExcel.url + `/${gatewayUid}`
      const res = await request({
        url,
        method: "POST",
        responseType: "blob"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async downloadTemplate(): Promise<void> {
    try {
      const url = variableApi.downloadTemplate.url
      const res = await request({
        url,
        method: "POST",
        responseType: "blob"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
