import { BaseEntity, OptionVo, PageQuery } from "src/model"
import { GatewayBase, VarComportGroupVo } from "@/model/var"

export interface Warn extends GatewayBase {
  /**
   * 报警名称详情
   */
  name: string

  /**
   * 报警规则 x=y
   */
  warnStrategyType: string

  /**
   * 对比类型
   */
  contrastType: string

  /**
   * 所属变量x
   */
  x: string

  /**
   * 变量uid (隐藏)
   */
  dataTypeUid?: string

  /**
   * 对比值Y
   */
  y: string

  /**
   * 对比值Z
   */
  z?: string

  /**
   * 严重类型 (字典)
   */
  severityType: string

  /**
   * 确认规则 (字典)
   */
  confirmStrategyType: string

  /**
   * 报警组uid
   */
  groupUid: string

  /**
   * 所属项目uid
   */
  projectUid?: string

  /**
   * 开启关闭延迟推送
   */
  delayedPush: boolean

  /**
   * 开启 - 延迟时间 (秒)
   */
  delayedTime: number

  /**
   * 最后推送时间 (Unix 时间戳)
   */
  lastPushTime: number

  /**
   * 开启关闭推送报警恢复消息
   */
  alarmRecovery: boolean

  /**
   * 恢复消息
   */
  recoveryRemark?: string

  /**
   * 报警记录规则
   */
  recordStrategyType?: string

  /**
   * 记录的变量uid
   */
  recordVarUid?: string

  /**
   * 是否触发了报警
   */
  touchOff: boolean
  type: string
}

export interface WarnForm extends Warn {
  groupOptions: OptionVo[]
  varOptions: OptionVo[]
  warnStrategyOptions: OptionVo[]
  contrastOptions: OptionVo[]
  severityOptions: OptionVo[]
  confirmStrategyOptions: OptionVo[]
  recordStrategyOptions: OptionVo[]
  settingGatewayStatusOptions: OptionVo[]
  typeOptions: OptionVo[]
}

export interface WarnVo extends Warn {}

export interface WarnQuery extends PageQuery {
  name?: string
  gatewayUid: string
  groupUid: string
}

export interface WarnGroup extends GatewayBase {
  name?: string
  def?: boolean
  sort?: number
}

export interface WarnGroupVo extends WarnGroup {}

export interface WarnGroupData {
  defaultGroupUid?: string
  groupList?: WarnGroupVo[]
}

export interface UpdateWarnByGroupForm {
  warnUidList?: string[]
  sourceGroupUid?: string
  targetGroupUid?: string
}
