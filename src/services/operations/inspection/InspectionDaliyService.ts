import request from "@/utils/request"
import { inspectionDailyApi } from "@/services/api"
import {
  InspectionDailyDetail,
  InspectionDailyForm,
  InspectionDailyImage,
  InspectionDailyQuery,
  InspectionDailyQueryData,
  InspectionDailyVo
} from "@/model/operations/inspection/daily"
import { PageVo } from "src/model"

export const InspectionDailyService = {
  async form(uid: string): Promise<InspectionDailyForm> {
    try {
      const url = uid ? inspectionDailyApi.form.url + `/${uid}` : inspectionDailyApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<InspectionDailyDetail> {
    try {
      const res = await request({
        url: inspectionDailyApi.detail.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: InspectionDailyForm): Promise<void> {
    try {
      const url = data.uid ? inspectionDailyApi.update.url : inspectionDailyApi.add.url
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
  async select(data: InspectionDailyQuery): Promise<PageVo<InspectionDailyVo, InspectionDailyQueryData>> {
    try {
      const res = await request({
        url: inspectionDailyApi.select.url,
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
        url: inspectionDailyApi.delete.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async checkImage(url: string): Promise<InspectionDailyImage> {
    try {
      const res = await request({
        url: inspectionDailyApi.checkImage.url,
        method: "POST",
        data: { url }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addImage(url: string): Promise<void> {
    try {
      const res = await request({
        url: inspectionDailyApi.addImage.url,
        method: "POST",
        data: { url }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteImage(url: string): Promise<void> {
    try {
      const res = await request({
        url: inspectionDailyApi.deleteImage.url,
        method: "POST",
        data: { url }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectImage(): Promise<InspectionDailyImage[]> {
    try {
      const res = await request({
        url: inspectionDailyApi.selectImage.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
