import request from "@/utils/request"
import { dashboardApi } from "@/services/api"
import {
  DashboardAnnouncement,
  DashboardAnnouncementQuery,
  DashboardAnnouncementVo,
  DashboardForm,
  DashboardLineChartData,
  DashboardLineChartForm,
  EchartDataItem,
  StatisticsData,
  WarnRecordData,
  WarnRecordDataQuery
} from "@/model/dashboard"
import { PageVo } from "@/model"

export const DashboardService = {
  async form(): Promise<DashboardForm> {
    try {
      const res = await request({
        url: dashboardApi.form.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdateAnnouncement(data: DashboardAnnouncement): Promise<void> {
    try {
      const url = data.uid ? dashboardApi.updateAnnouncement.url : dashboardApi.addAnnouncement.url
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
  async getStatisticsData(): Promise<StatisticsData> {
    try {
      const res = await request({
        url: dashboardApi.getStatisticsData.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getAnnouncementData(data: DashboardAnnouncementQuery): Promise<PageVo<DashboardAnnouncementVo, void>> {
    try {
      const res = await request({
        url: dashboardApi.getAnnouncementData.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getActiveWarnData(data: WarnRecordDataQuery): Promise<WarnRecordData> {
    try {
      const res = await request({
        url: dashboardApi.getActiveWarnData.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getGatewayDistributionData(): Promise<EchartDataItem[]> {
    try {
      const res = await request({
        url: dashboardApi.getGatewayDistributionData.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getCarouselData(): Promise<string[]> {
    try {
      const res = await request({
        url: dashboardApi.getCarouselData.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getLineCharForm(): Promise<DashboardLineChartForm> {
    try {
      const res = await request({
        url: dashboardApi.getLineCharForm.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getLineCharData(data: DashboardLineChartForm): Promise<DashboardLineChartData> {
    try {
      const res = await request({
        url: dashboardApi.getLineCharData.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
