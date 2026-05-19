import { BaseEntityLd, OptionVo, PageQuery } from "@/model"

export interface FlowInstance extends BaseEntityLd {
  name?: string
  flowType?: string
  status?: string
}

export interface FlowInstanceForm extends FlowInstance {
  flowTypeOptions?: OptionVo[]
  templateList?: OptionVo[]
  approveList?: []
}

export interface FlowInstanceQuery extends PageQuery {
  flowType?: string
}

export interface FlowInstanceQueryData {
  typeOptions?: OptionVo[]
}

export interface FlowInstanceApprove extends BaseEntityLd {
  flowInstanceUid?: string
  parentUid?: string
  name?: string
}

export interface FlowInstanceApproveForm extends FlowInstanceApprove {
  children?: FlowInstanceApprove[]
  path?: string
}

export interface FlowTask extends BaseEntityLd {
  instanceUid?: string
  nodeUid?: string
  taskName?: string
  assigneeUid?: string
  status?: string
  comment?: string
  flowType?: string
}

export interface TaskCenterItem extends BaseEntityLd {
  uid?: string
  taskSource?: "flow" | "biz"
  taskName?: string
  taskType?: string
  taskTypeName?: string
  status?: string
  statusName?: string
  flowType?: string
  flowTypeName?: string
  bizType?: string
  bizTypeName?: string
  instanceUid?: string
  bizUid?: string
  refUid?: string
  assigneeUid?: string
  assigneeName?: string
  sourceUserUid?: string
  sourceUserName?: string
  comment?: string
  result?: string
  completeTime?: string
}

export interface TaskCenterActionField {
  field?: string
  label?: string
  type?: string
  required?: boolean
  placeholder?: string
  options?: OptionVo[]
}

export interface TaskCenterAction {
  action?: string
  actionName?: string
  buttonType?: string
  hint?: string
  fields?: TaskCenterActionField[]
}

export interface TaskCenterDetail {
  uid?: string
  taskSource?: "flow" | "biz"
  taskName?: string
  taskType?: string
  taskTypeName?: string
  status?: string
  statusName?: string
  flowType?: string
  flowTypeName?: string
  bizType?: string
  bizTypeName?: string
  bizUid?: string
  refUid?: string
  instanceUid?: string
  assigneeUid?: string
  assigneeName?: string
  sourceUserUid?: string
  sourceUserName?: string
  detailType?: string
  hint?: string
  data?: any
  historyList?: any[]
  actionList?: TaskCenterAction[]
  meta?: Record<string, any>
  createTime?: string
}

export interface BizTaskSubmitForm {
  taskUid?: string
  action?: string
  comment?: string
  targetUserUid?: string
  reviewUserUid?: string
  remark?: string
  imageList?: string[]
  formData?: Record<string, any>
}

export interface FlowTaskVo extends FlowTask {
  data?: Record<string, any>
  flowTypeName?: string
  statusName?: string
}

export interface BizTask extends BaseEntityLd {
  bizType?: string
  taskType?: string
  taskName?: string
  bizUid?: string
  refUid?: string
  title?: string
  assigneeUid?: string
  sourceUserUid?: string
  status?: string
  result?: string
  comment?: string
  payloadJson?: string
  completeTime?: string
  bizTypeName?: string
  taskTypeName?: string
  statusName?: string
  assigneeName?: string
  sourceUserName?: string
  taskSource?: "flow" | "biz"
}

export interface FlowTaskSubmitForm {
  taskUid?: string
  comment?: string
  variables?: Record<string, any>
  formData?: Record<string, any>
  priceDetailList?: PurchaseApplyPriceSubmitItem[]
}

export interface FlowTaskQuery extends PageQuery {
  key?: string
}

export interface FlowLog extends BaseEntityLd {
  instanceUid?: string
  nodeUid?: string
  taskName?: string
  assigneeUid?: string
  status?: string
  comment?: string
  action?: string
  createTime?: string
}

export interface PurchaseApplyPriceSubmitItem {
  uid?: string
  supplierUid?: string
  vatTaxRate?: number
  purchasePriceWithTax?: number
  purchasePriceWithoutTax?: number
}
