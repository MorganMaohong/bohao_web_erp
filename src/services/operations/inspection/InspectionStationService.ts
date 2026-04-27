import request from "@/utils/request"
import { inspectionStationApi } from "@/services/api"
import {
  InspectionStationDetail,
  InspectionStationForm,
  InspectionStationImage,
  InspectionStationQuery,
  InspectionStationQueryData,
  InspectionStationVo
} from "@/model/operations/inspection/station"
import { PageVo } from "src/model"
import { InspectionDailyImage } from "@/model/operations/inspection/daily"

export const InspectionStationService = {
  async form(uid: string): Promise<InspectionStationForm> {
    try {
      const url = uid ? inspectionStationApi.form.url + `/${uid}` : inspectionStationApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async detail(uid: string): Promise<InspectionStationDetail> {
    try {
      const res = await request({
        url: inspectionStationApi.detail.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: InspectionStationForm): Promise<void> {
    try {
      const url = data.uid ? inspectionStationApi.update.url : inspectionStationApi.add.url
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
  async select(data: InspectionStationQuery): Promise<PageVo<InspectionStationVo, InspectionStationQueryData>> {
    try {
      const res = await request({
        url: inspectionStationApi.select.url,
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
        url: inspectionStationApi.delete.url + `/${uid}`,
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
        url: inspectionStationApi.checkImage.url,
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
        url: inspectionStationApi.addImage.url,
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
        url: inspectionStationApi.deleteImage.url,
        method: "POST",
        data: { url }
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectImage(): Promise<InspectionStationImage[]> {
    try {
      const res = await request({
        url: inspectionStationApi.selectImage.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
