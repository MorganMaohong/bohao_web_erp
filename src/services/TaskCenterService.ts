import request from "@/utils/request"
import { TaskCenterApi } from "@/services/api"
import { PageQuery, PageVo } from "@/model"
import { BizTaskSubmitForm, FlowTaskSubmitForm, TaskCenterDetail, TaskCenterItem } from "@/model/flow"

export const TaskCenterService = {
  async getPendingTasks(data: PageQuery): Promise<PageVo<TaskCenterItem, void>> {
    const res = await request({
      url: TaskCenterApi.pending.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async getCompletedTasks(data: PageQuery): Promise<PageVo<TaskCenterItem, void>> {
    const res = await request({
      url: TaskCenterApi.completed.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async getCopyTasks(data: PageQuery): Promise<PageVo<TaskCenterItem, void>> {
    const res = await request({
      url: TaskCenterApi.copy.url,
      method: "POST",
      data
    })
    return Promise.resolve(res.data)
  },
  async getDetail(taskSource: "flow" | "biz", uid: string, type?: string): Promise<TaskCenterDetail> {
    const res = await request({
      url: `${TaskCenterApi.detail.url}/${taskSource}/${uid}`,
      method: "POST",
      params: type ? { type } : undefined
    })
    return Promise.resolve(res.data)
  },
  async submitFlow(action: "approve" | "reject", data: FlowTaskSubmitForm & { flowType?: string }): Promise<void> {
    const res = await request({
      url: TaskCenterApi.submit.url,
      method: "POST",
      data: {
        taskSource: "flow",
        taskUid: data.taskUid,
        flowType: data.flowType,
        action,
        comment: data.comment,
        variables: data.variables,
        formData: data.formData,
        priceDetailList: data.priceDetailList
      }
    })
    return Promise.resolve(res.data)
  },
  async submitBiz(data: BizTaskSubmitForm): Promise<any> {
    const res = await request({
      url: TaskCenterApi.submit.url,
      method: "POST",
      data: {
        taskSource: "biz",
        taskUid: data.taskUid,
        action: data.action,
        comment: data.comment,
        targetUserUid: data.targetUserUid,
        reviewUserUid: data.reviewUserUid,
        remark: data.remark,
        imageList: data.imageList,
        formData: data.formData
      }
    })
    return Promise.resolve(res.data)
  }
}
