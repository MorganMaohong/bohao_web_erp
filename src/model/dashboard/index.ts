import { BaseEntity, OptionVo, PageQuery } from "@/model"

export interface DashboardForm {
  imageOptions: OptionVo[]
  quickForm: DashboardQuickForm
  titleForm: DashboardTitleForm
}

export interface DashboardQuick extends BaseEntity {
  menuUid: string
}

export interface DashboardQuickForm {
  subMenuOptions: OptionVo[]
  selectQuickUidList: string[]
}

export interface DashboardTitle extends BaseEntity {
  title: string
  userProp: string
  def: boolean
}

export interface DashboardTitleForm extends DashboardTitle {
  userPropOptions: OptionVo[]
}

export interface DashboardAnnouncement extends BaseEntity {
  title: string
}

export interface DashboardAnnouncementVo extends DashboardAnnouncement {
  createName: string
}

export interface DashboardAnnouncementQuery extends PageQuery {
  title: string
  startCreateTime: number
  endCreateTime: number
}

export interface DashboardLineChartForm {
  projectOptions: OptionVo[]
  timeOptions: OptionVo[]
  projectUid: string
  time: string
}

export interface DashboardLineChartData {
  dataX: string[]
  dataY: string[]
  time: string
}

export interface StatisticsData {
  /** 项目总数 */
  projectCount: number

  /** 在线项目总数 */
  onlineProjectCount: number

  /** 网关总数 */
  gatewayCount: number

  /** 在线网关总数 */
  onlineGatewayCount: number

  /** 活跃报警总数 */
  activeWarnCount: number

  /** 待处理工单总数 */
  waitProcessOrderCount: number
}

export interface WarnRecordDataItem {
  name: string
  gatewayName: string
  projectName: string
  createTime: string
}

export interface EchartDataItem {
  value: number
  name: string
}

export interface WarnRecordData {
  projectOptions: OptionVo[]
  list: WarnRecordDataItem[]
}

export interface WarnRecordDataQuery {
  projectUid: string
  startTimestamp: number
  endTimestamp: number
}
