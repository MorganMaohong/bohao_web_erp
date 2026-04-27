import { productionPlanApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo } from "@/model"
import {
  ProductionPlanDetail,
  ProductionPlanCloseForm,
  ProductionPlanFinishInboundForm,
  ProductionPlanForm,
  ProductionPlanIssueForm,
  ProductionPlanProcessForm,
  ProductionPlanProcessNodeCompleteForm,
  ProductionPlanQuery
} from "@/model/product"

export const ProductionPlanService = {
  async select(data: ProductionPlanQuery): Promise<PageVo<ProductionPlanDetail, void>> {
    const res = await request({ url: productionPlanApi.select.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async form(uid?: string): Promise<ProductionPlanForm> {
    const url = uid ? `${productionPlanApi.form.url}/${uid}` : productionPlanApi.form.url
    const res = await request({ url, method: "POST" })
    return Promise.resolve(res.data)
  },
  async addOrUpdate(data: ProductionPlanForm): Promise<void> {
    const url = data.uid ? productionPlanApi.update.url : productionPlanApi.add.url
    const res = await request({ url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async close(data: ProductionPlanCloseForm): Promise<void> {
    const res = await request({ url: productionPlanApi.close.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async delete(uid: string): Promise<void> {
    const res = await request({ url: `${productionPlanApi.delete.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async detail(uid: string): Promise<ProductionPlanDetail> {
    const res = await request({ url: `${productionPlanApi.detail.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async prepareForm(uid: string): Promise<ProductionPlanDetail> {
    const res = await request({ url: `${productionPlanApi.prepareForm.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async prepareUpdate(data: ProductionPlanDetail): Promise<void> {
    const res = await request({ url: productionPlanApi.prepareUpdate.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async prepareConfirm(uid: string): Promise<void> {
    const res = await request({ url: `${productionPlanApi.prepareConfirm.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async issueForm(uid: string): Promise<ProductionPlanIssueForm> {
    const res = await request({ url: `${productionPlanApi.issueForm.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async issue(data: ProductionPlanIssueForm): Promise<void> {
    const res = await request({ url: productionPlanApi.issue.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async issueConfirm(uid: string): Promise<void> {
    const res = await request({ url: `${productionPlanApi.issueConfirm.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async processForm(uid: string) {
    const res = await request({ url: `${productionPlanApi.processForm.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async processAdd(uid: string, data: ProductionPlanProcessForm): Promise<void> {
    const res = await request({ url: `${productionPlanApi.processAdd.url}/${uid}`, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async processUpdate(uid: string, data: ProductionPlanProcessForm): Promise<void> {
    const res = await request({ url: `${productionPlanApi.processUpdate.url}/${uid}`, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async processDelete(uid: string, processUid: string): Promise<void> {
    const res = await request({ url: `${productionPlanApi.processDelete.url}/${uid}/${processUid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async processNodeComplete(uid: string, data: ProductionPlanProcessNodeCompleteForm): Promise<void> {
    const res = await request({ url: `${productionPlanApi.processNodeComplete.url}/${uid}`, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async processNodeRework(uid: string, processUid: string, nodeUid: string): Promise<void> {
    const res = await request({
      url: `${productionPlanApi.processNodeRework.url}/${uid}/${processUid}/${nodeUid}`,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async processConfirmComplete(uid: string): Promise<void> {
    const res = await request({ url: `${productionPlanApi.processConfirmComplete.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async finishInboundForm(uid: string): Promise<ProductionPlanFinishInboundForm> {
    const res = await request({ url: `${productionPlanApi.finishInboundForm.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async finishInbound(data: ProductionPlanFinishInboundForm): Promise<void> {
    const res = await request({ url: productionPlanApi.finishInbound.url, method: "POST", data })
    return Promise.resolve(res.data)
  }
}
