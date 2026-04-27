import { BaseEntityLd, OptionVo, PageQuery } from "src/model"

export interface RepairWorkOrderLeaderVo extends RepairWorkOrderLeader {
  projectName?: string
}

export interface RepairWorkOrderLeaderAndTransferAndRejectTake {}

export interface RepairWorkOrderLeaderAndTransferAndRejectTakeVo extends BaseSnap {
  leaderLeaderUid?: string
  transferLeaderUid?: string
  transferTransferUid?: string
  rejectTakeDispatchUid?: string
  rejectTakeLeaderUid?: string
}

export interface RepairWorkOrderCompleteVo extends RepairWorkOrderComplete {
  projectName?: string
}

export interface RepairWorkOrderReviewVo extends RepairWorkOrderComplete {
  projectName?: string
}

export interface RepairWorkOrderCompleteVo extends RepairWorkOrderComplete {
  projectName?: string
}

export interface RepairWorkOrderDispatchVo extends RepairWorkOrderDispatch {
  projectName?: string
}

export interface RepairWorkOrderHandlerVo extends RepairWorkOrderHandler {
  projectName?: string
}

export interface RepairWorkOrderRejectTakeVo extends RepairWorkOrderRejectTake {
  projectName?: string
}

export interface RepairWorkOrderCompleteConfirmVo extends RepairWorkOrderReview {
  projectName?: string
}

export interface RepairWorkOrderTransferVo extends RepairWorkOrderTransfer {
  projectName?: string
}

export interface RepairWorkOrderLeader extends BaseSnap {
  leaderUid?: string
}

export interface RepairWorkOrderComplete extends BaseSnap {}

export interface RepairWorkOrderDispatch extends BaseSnap {
  leaderUid?: string
  dispatchUid?: string
}

export interface RepairWorkOrderHandlerLogVo extends RepairWorkOrderHandler {
  handlerName?: string
  imageList?: string[]
}

export interface RepairWorkOrderHandlerLog extends BaseEntityLd {
  handlerUid?: string
  remark?: string
  images?: string
}

export interface RepairWorkOrderHandler extends BaseSnap {
  leaderUid?: string
  handlerUid?: string
  dispatchUid?: string
}

export interface RepairWorkOrderRejectTake extends BaseSnap {
  dispatchUid?: string
  leaderUid?: string
}

export interface RepairWorkOrderReview extends BaseSnap {
  reviewUid?: string
  handlerUid?: string
  reviewFlowSnapUid?: string
  reviewFlowTmpSnapUid?: string
}

export interface RepairWorkOrderTransfer extends BaseSnap {
  leaderUid?: string
  transferUid?: string
}

export interface BaseSnap extends BaseEntityLd {
  nextEvent?: string // 下一步事件
  preEvent?: string // 上一步事件
  nextStepUid?: string // 下一步步骤的唯一标识符
  preStepUid?: string // 上一步步骤的唯一标识符
  workOrderUid?: string // 工单唯一标识符
  complete?: boolean // 该步骤是否完成
  projectUid?: string // 项目唯一标识符
  name?: string // 工单名称
  remark?: string // 工单备注 (可选)
  level?: string // 等级 (可选)
}

export interface RepairWorkOrderSnapQuery extends PageQuery {
  projectUid?: string
  name?: string
  level?: string
}

export interface RepairWorkOrderSnapCount {
  waitAcceptCount?: number
  processingCount?: number
  waitTakeOrderCount?: number
  waitConfirmTransferCount?: number
  waitRejectReviewCount?: number
  waiteReviewCount?: number
  waitCompleteConfirmCount?: number
  completeCount?: number
}

export interface RepairWorkOrderSnapQueryData {
  projectOption?: OptionVo[]
  levelOption?: OptionVo[]
}
