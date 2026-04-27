import request from "@/utils/request"
import { OptionVo, PageVo } from "src/model"
import {
  RepairWorkOrderDetail,
  RepairWorkOrderForm,
  RepairWorkOrderQuery,
  RepairWorkOrderQueryData,
  RepairWorkOrderVo
} from "@/model/operations/repair/workOrder"

import { repairWorkOrderApi } from "@/services/api"

export const RepairWorkOrderService = {
  async detail(workOrderUid: string): Promise<RepairWorkOrderDetail> {
    try {
      const url = repairWorkOrderApi.detail.url + `/${workOrderUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async add(data: RepairWorkOrderForm): Promise<void> {
    try {
      const res = await request({ url: repairWorkOrderApi.add.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async select(data: RepairWorkOrderQuery): Promise<PageVo<RepairWorkOrderVo, RepairWorkOrderQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderApi.select.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    try {
      const res = await request({ url: repairWorkOrderApi.delete.url + `/${uid}`, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async form(uid = ""): Promise<RepairWorkOrderForm> {
    try {
      const url = uid ? repairWorkOrderApi.form.url + `/${uid}` : repairWorkOrderApi.form.url
      const res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectLeaderOption(projectUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderApi.selectLeaderOption.url + `/${projectUid}`
      const res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectTransformOption(projectUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderApi.selectTransformOption.url + `/${projectUid}`
      const res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  }
  /*async selectReviewOption(projectUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderApi.selectReviewOption.url + `/${projectUid}`
      let res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async selectReviewTemplateOption(projectUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderApi.selectReviewTemplateOption.url + `/${projectUid}`
      let res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async selectReviewTemplateFlowList(reviewTmpUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderApi.selectReviewTemplateFlowList.url + `/${reviewTmpUid}`
      let res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async addOrUpdateReviewTemplate(data: ReviewTemplateForm): Promise<RepairWorkOrderReviewTemplate> {
    try {
      const url = data.uid ? repairWorkOrderApi.updateReviewTemplate.url : repairWorkOrderApi.saveReviewTemplate.url
      let res = await request({ url: url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async deleteReviewTemplate(reviewTmpUid: string): Promise<RepairWorkOrderReviewTemplate> {
    try {
      const url = repairWorkOrderApi.deleteReviewTemplate.url + `/${reviewTmpUid}`
      let res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async deleteReviewTemplateFlow(reviewFlowUid: string): Promise<void> {
    try {
      const url = repairWorkOrderApi.deleteReviewTemplateFlow.url + `/${reviewFlowUid}`
      let res = await request({ url: url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async addOrUpdateReviewTemplateFlow(data: ReviewTemplateFlowForm): Promise<void> {
    try {
      const url = data.uid
        ? repairWorkOrderApi.updateReviewTemplateFlow.url
        : repairWorkOrderApi.addReviewTemplateFlow.url
      let res = await request({ url: url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },*/
  /*async updateReviewFlowSort(data: RepairWorkOrderReviewFlowDrag): Promise<void> {
    try {
      const url = repairWorkOrderApi.updateReviewFlowSort.url
      let res = await request({ url: url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  }*/
}
