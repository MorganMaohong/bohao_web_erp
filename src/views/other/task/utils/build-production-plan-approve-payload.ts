import { FlowTaskSubmitForm, TaskCenterDetail } from "@/model/flow"
import { ProductionPlanDetail } from "@/model/product"

export function buildProductionPlanApprovePayload(
  detail: TaskCenterDetail,
  notify: (message: string) => void
): Partial<FlowTaskSubmitForm> | false {
  const plan = (detail.data || {}) as ProductionPlanDetail
  if (!plan.uid) {
    notify("生产计划数据异常")
    return false
  }
  if (!plan.name || !plan.startTime || !plan.planCompleteTime) {
    notify("请完整填写生产计划基础信息")
    return false
  }
  if (!plan.productList?.length) {
    notify("请至少保留一个成品")
    return false
  }
  for (const item of plan.productList) {
    if (!item.itemUid || !item.warehouseUid || !item.quantity || Number(item.quantity) <= 0) {
      notify("请完整填写生产计划成品信息")
      return false
    }
  }
  return {
    formData: {
      uid: plan.uid,
      name: plan.name,
      startTime: plan.startTime,
      planCompleteTime: plan.planCompleteTime,
      remark: plan.remark,
      imageList: plan.imageList || [],
      docList: plan.docList || [],
      productList: plan.productList || []
    }
  }
}
