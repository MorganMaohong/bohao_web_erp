import { PageQuery, OptionVo } from "src/model"
import { GatewayBase } from "@/model/var"

export interface WarnRecord extends GatewayBase {
  /** 报警uid */
  warnUid: string

  /** 报警详情 */
  name: string

  /** 项目uid */
  projectUid: string

  /** 是否确认 */
  confirm: boolean

  /** 确认信息/解决方案等信息 */
  confirmMessage: string

  /** 确认规则 */
  confirmStrategyType?: string

  /** 报警记录规则 */
  recordStrategyType?: string

  /** 报警记录的值，如果选择了上传值或变量值 */
  recordValue?: string

  /** 严重程度 */
  severityType?: string

  /** 报警恢复/未恢复 当报警没有被触发时候恢复 */
  recover: boolean

  /** 确认时间 */
  confirmTime?: string // ISO 8601 字符串，或者改用 Date 类型

  /** 恢复时间 */
  recoverTime?: string // 同上
}

/**
 * WarnRecordQuery，报警记录查询Form
 */
export interface WarnRecordQuery extends PageQuery {
  /**
   * 活跃报警/历史报警
   */
  confirm?: string
  /**
   * 确认规则
   */
  confirmStrategyType?: string

  /**
   * 结束时间 时间戳
   */
  endTime?: number
  /**
   * 所属网关
   */
  gatewayUid?: string
  gatewayUidList?: string[]
  /**
   * 报警详情
   */
  name?: string

  /**
   * 所属项目
   */
  projectUid?: string
  projectUidList?: string[]
  /**
   * 活跃报警/历史报警
   */
  recover?: string
  /**
   * 报警程度
   */
  severityType?: string
  /**
   * 开始时间 时间戳
   */
  startTime?: number

  [property: string]: any

  desc: boolean
}

/**
 * WarnQueryData
 */
export interface WarnQueryData {
  /**
   * 确认类型列表
   */
  confirmOptions?: OptionVo[]
  /**
   * 确认规则列表
   */
  cstOptions?: OptionVo[]
  /**
   * 网关列表
   */
  gatewayOptions?: OptionVo[]
  /**
   * 项目列表
   */
  projectOptions?: OptionVo[]
  /**
   * 恢复类型
   */
  recoverOptions?: OptionVo[]
  /**
   * 严重程度列表
   */
  severityTypeOptions?: OptionVo[]
}

/**
 * WarnRecordVo，报警记录Vo
 */
export interface WarnRecordVo {
  /**
   * 是否确认
   */
  confirm?: boolean
  /**
   * 确认信息/解决方案等信息
   */
  confirmMessage: string
  /**
   * 确认规则名称
   */
  confirmStrategyName?: string
  /**
   * 确认规则
   */
  confirmStrategyType?: string
  /**
   * 确认时间
   */
  confirmTime?: Date
  createColumn?: string
  /**
   * 网关名称
   */
  gatewayName?: string
  /**
   * 网关sn码
   */
  gatewaySn?: string
  /**
   * 网关uid
   */
  gatewayUid: string
  /**
   * Id
   */
  id?: number
  /**
   * 报警详情
   */
  name?: string
  /**
   * 项目名称
   */
  projectName?: string
  /**
   * 项目uid
   */
  projectUid?: string
  /**
   * 记录规则名称
   */
  recordStrategyName?: string
  /**
   * 报警记录规则
   */
  recordStrategyType?: string
  /**
   * 报警记录的值，如果选择了上传值或变量值
   */
  recordValue?: string
  /**
   * 报警恢复/未恢复 当报警没有被触发时候恢复
   */
  recover?: boolean
  /**
   * 恢复类型名称
   */
  recoverName?: string
  /**
   * 恢复时间
   */
  recoverTime?: Date
  /**
   * 报警类型/严重类型
   */
  severityName?: string
  /**
   * 严重程度
   */
  severityType?: string
  /**
   * 唯一uid
   */
  uid?: string
  updateColumn?: string
  /**
   * 报警uid
   */
  warnUid?: string

  [property: string]: any
}

/**
 * WarnQueryData
 */
export interface WarnQueryData {
  /**
   * 确认类型列表
   */
  confirmOptions?: OptionVo[]
  /**
   * 确认规则列表
   */
  cstOptions?: OptionVo[]
  /**
   * 网关列表
   */
  gatewayOptions?: OptionVo[]
  /**
   * 项目列表
   */
  projectOptions?: OptionVo[]
  /**
   * 恢复类型
   */
  recoverOptions?: OptionVo[]
  /**
   * 严重程度列表
   */
  severityTypeOptions?: OptionVo[]
}

export interface WarnRecordForm extends WarnRecord {}
