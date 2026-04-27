import { OptionVo, TreeOptionVo, BaseEntityLd, PageQuery, BaseEntity } from "src/model"
import { RepairWorkOrderHandlerLogVo } from "@/model/operations/repair/workOrder/snap"

export interface RepairWorkOrderQuery extends PageQuery {
  name?: string
  projectGroupUid?: string
  projectUidList?: string[]
  createStartTime?: number
  createEndTime?: number
  desc: boolean
}

export interface RepairWorkOrderQueryData {}

/**
 * RepairWorkOrderVo，维修工单表单
 */
export interface RepairWorkOrderVo extends RepairWorkOrder {
  leaderName?: string
  projectName?: string
  levelName?: string
}

export interface RepairWorkOrderDetail extends RepairWorkOrder {
  leaderName?: string
  projectName?: string
  levelName?: string
  createName?: string
  statusName?: string
  imageList?: string[]
  logList: RepairWorkOrderLogVo[]
  handlerLogList: RepairWorkOrderHandlerLogVo[]
}

export interface RepairWorkOrderLog extends BaseEntity {
  workOrderUid?: string
  event?: string
  status?: string
}

export interface RepairWorkOrderLogVo extends RepairWorkOrderLog {
  createName?: string
  eventName?: string
  statusName?: string
}

/**
 * RepairWorkOrderForm，维修工单表单
 */
export interface RepairWorkOrderForm extends RepairWorkOrder {
  projectOption?: OptionVo[]
  /**
   * 紧急程度数据
   */
  severityTypeOption?: OptionVo[]
  leaderOption?: OptionVo[]
  reviewOption?: OptionVo[]
  reviewTemplateOption?: OptionVo[]
  reviewTemplateUid?: string
}

interface RepairWorkOrder extends BaseEntityLd {
  /** 当前负责人 */
  leaderUid: string

  /** 图片数组（JSON字符串或URL数组） */
  images: string

  /** 项目 UID */
  projectUid: string

  /** 描述，备注 */
  remark: string
  name: string

  /** 当前状态 */
  status: string

  /** 报修等级 */
  level: string
  phone: string
}

export interface RepairWorkOrderReviewTemplate extends BaseEntityLd {
  name?: string
  projectUid?: string
}

export interface ReviewTemplateForm extends RepairWorkOrderReviewTemplate {
  flowList: ReviewTemplateFlowForm[]
}

export interface RepairWorkOrderReviewFlow extends BaseEntity {
  name?: string
  reviewTmpUid?: string
}

export interface ReviewTemplateFlowForm extends RepairWorkOrderReviewFlow {
  sourceUidList: string[]
}

export interface RepairWorkOrderReviewFlowVo extends RepairWorkOrderReviewFlow {
  items?: RepairWorkOrderReviewFlowItem[]
}

export interface RepairWorkOrderReviewFlowItem extends BaseEntity {
  sourceUid?: string
  reviewFlowUid?: string
}

export interface RepairWorkOrderReviewFlowDrag {
  newFlowUid?: string
  newFlowSort?: number
  oldFlowUid?: string
  oldFlowSort?: number
}
