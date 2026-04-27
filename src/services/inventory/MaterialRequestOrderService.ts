import request from "@/utils/request"
import { inventoryCommonApi, inventoryMaterialRequestApi } from "@/services/api"
import { OptionVo, PageVo } from "@/model"
import {
  MaterialRequestDetail,
  MaterialRequestIssueForm,
  MaterialRequestOrderForm,
  MaterialRequestOrderQuery,
  MaterialRequestOrderQueryData,
  MaterialRequestOrderVo
} from "@/model/inventory/request"

export const MaterialRequestOrderService = {
  async addOrUpdate(data: MaterialRequestOrderForm): Promise<void> {
    const url = data.uid ? inventoryMaterialRequestApi.update.url : inventoryMaterialRequestApi.add.url
    const res = await request({
      url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async delete(uid: string): Promise<void> {
    const res = await request({
      url: `${inventoryMaterialRequestApi.delete.url}/${uid}`,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async deleteDetail(uid: string): Promise<void> {
    const res = await request({
      url: `${inventoryMaterialRequestApi.deleteDetail.url}/${uid}`,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async select(data: MaterialRequestOrderQuery): Promise<PageVo<MaterialRequestOrderVo, MaterialRequestOrderQueryData>> {
    const res = await request({
      url: inventoryMaterialRequestApi.select.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async issueSelect(
    data: MaterialRequestOrderQuery
  ): Promise<PageVo<MaterialRequestOrderVo, MaterialRequestOrderQueryData>> {
    const res = await request({
      url: inventoryMaterialRequestApi.issueSelect.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async form(uid?: string): Promise<MaterialRequestOrderForm> {
    const res = await request({
      url: uid ? `${inventoryMaterialRequestApi.form.url}/${uid}` : inventoryMaterialRequestApi.form.url,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async detail(uid: string): Promise<MaterialRequestDetail> {
    const res = await request({
      url: `${inventoryMaterialRequestApi.detail.url}/${uid}`,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async issueDetail(uid: string): Promise<MaterialRequestDetail> {
    const res = await request({
      url: `${inventoryMaterialRequestApi.issueDetail.url}/${uid}`,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async issuePartial(data: MaterialRequestIssueForm): Promise<any> {
    const res = await request({
      url: inventoryMaterialRequestApi.issuePartial.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async issueAll(data: MaterialRequestIssueForm): Promise<any> {
    const res = await request({
      url: inventoryMaterialRequestApi.issueAll.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async unableIssue(data: MaterialRequestIssueForm): Promise<any> {
    const res = await request({
      url: inventoryMaterialRequestApi.unableIssue.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async usageTypeOptions(): Promise<OptionVo[]> {
    const res = await request({
      url: inventoryCommonApi.usageTypeOptions.url,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async bizTypeOptions(): Promise<OptionVo[]> {
    const res = await request({
      url: inventoryCommonApi.bizTypeOptions.url,
      method: "POST"
    })
    return Promise.resolve(res.data)
  },
  async bizObjectOptions(bizType?: string): Promise<OptionVo[]> {
    if (!bizType) return Promise.resolve([])
    const res = await request({
      url: `${inventoryCommonApi.bizObjectOptions.url}/${bizType}`,
      method: "POST"
    })
    return Promise.resolve(res.data)
  }
}
