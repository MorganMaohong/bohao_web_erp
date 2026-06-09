import type { Component } from "vue"
import MaterialRequestIssueBizPanel from "@/views/other/task/panels/biz/MaterialRequestIssueBizPanel.vue"
import RepairWorkOrderBizPanel from "@/views/other/task/panels/biz/RepairWorkOrderBizPanel.vue"
import UserPasswordResetBizPanel from "@/views/other/task/panels/biz/UserPasswordResetBizPanel.vue"

export interface BizTaskPanelProps {
  detail: import("@/model/flow").TaskCenterDetail
  loading?: boolean
  bizTaskRow?: import("@/model/flow").BizTask
  submitForm?: import("@/model/flow").BizTaskSubmitForm
}

export interface BizTaskPanelAdapter {
  component: Component
}

const BIZ_PANEL_REGISTRY: Record<string, BizTaskPanelAdapter> = {
  repair_work_order: { component: RepairWorkOrderBizPanel },
  material_request: { component: MaterialRequestIssueBizPanel },
  user_password_reset: { component: UserPasswordResetBizPanel }
}

export function resolveBizPanel(detailType?: string): BizTaskPanelAdapter | undefined {
  if (!detailType) return undefined
  return BIZ_PANEL_REGISTRY[detailType]
}

export function isBizPanelRegistered(detailType?: string): boolean {
  return Boolean(resolveBizPanel(detailType))
}
