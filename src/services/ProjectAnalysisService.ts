import { projectAnalysisApi } from "@/services/api"
import request from "@/utils/request"
import { OptionVo } from "@/model"

export const ProjectAnalysisService = {
  async getTestDimensionData(): Promise<any> {
    try {
      const res = await request({
        url: projectAnalysisApi.getTestDimensionData.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err)
    }
  },
  async reportList(data): Promise<any> {
    try {
      const res = await request({
        url: projectAnalysisApi.reportList.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async getReportUploadImage(): Promise<any> {
    try {
      const res = await request({
        url: projectAnalysisApi.getReportUploadImage.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async getReportSettingData(projectUid: string): Promise<any> {
    try {
      const url = `${projectAnalysisApi.getReportSettingData.url}/${projectUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async getReportStore(projectUid: string, previewUid: string): Promise<any> {
    try {
      const url = `${projectAnalysisApi.getReportStore.url}/${projectUid}/${previewUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async addReport(data): Promise<any> {
    try {
      const res = await request({
        url: projectAnalysisApi.addReport.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async saveReport(data): Promise<any> {
    try {
      const res = await request({
        url: projectAnalysisApi.saveReport.url,
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async reportStatus(key, data): Promise<any> {
    try {
      const url = `${projectAnalysisApi.reportStatus.url}/${key}`
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async deleteReport(key): Promise<any> {
    try {
      const url = `${projectAnalysisApi.deleteReport.url}/${key}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async reportUploadImage(data): Promise<any> {
    try {
      const res = await request({
        url: projectAnalysisApi.reportUploadImage.url,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data" // 确保设置为 multipart/form-data
        },
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  },
  async selectAnalysis(projectUid: string): Promise<OptionVo[]> {
    try {
      const url = `${projectAnalysisApi.selectAnalysis.url}/${projectUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      console.error(err)
      return Promise.reject(err) // 抛出错误到调用方
    }
  }
}
