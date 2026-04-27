import { BaseEntityLd, OptionVo, TreeOptionVo } from "src/model"
import { ComportV2 } from "./comport"

export interface Gateway extends BaseEntityLd {
  sn: string // sn码，必填
  name: string // 名称，必填
  projectUid?: string // 用于绑定工程，可选
  modelUid: string // 型号uid，必填
  branUid?: string // 品牌uid，可选
  status?: string // 设备状态，可能的值：在线 离线 解绑，可选
  groupUid: string // 上级组uid，必填
  heartbeatTime?: number // 心跳时间，默认为 10000ms，可选
  reportTime?: number // 上报数据时间，默认为 5000ms，可选
}

export interface GatewayForm extends Gateway {
  groupOptions: TreeOptionVo[]
  permissionUidList?: string[]
  permissionOptions?: OptionVo[]
}

export interface GatewayInfo extends Gateway {
  projectName?: string
  groupName?: string
  deviceInfo?: GatewayDeviceInfo
  lteInfo?: GatewayLteInfo
  wanInfo?: GatewayWanInfo
  lanInfo?: GatewayLanInfo
  comportInfo?: ComportV2[]
}

export interface ProjectGatewayInfos {
  gatewayOptions?: OptionVo[]
  gatewayInfo: GatewayInfo
  gatewayUid: string
}

interface GatewayDeviceInfo {
  /** 产品型号 */
  model: string

  /** 产品唯一Id */
  sn: string

  /** 固件版本 */
  version: string

  /** 处理器当前符合百分比 */
  cpu: string

  /** 内存当前占用百分比 */
  ram: string

  /** 存储占用百分比 */
  flash: string

  /** 设备运行时间 单位(分钟) */
  // runTime: string
  upTime: string
}

interface GatewayLteInfo {
  /** 4g的ip */
  ip: string

  /** 4g的子网掩码 */
  mask: string

  /** 4g的网关 */
  gateway: string

  /** 4g的信号强度 0-100 */
  signal: string

  /** 4g的SIM卡号 */
  ccid: string

  /** 4g的模组的IMEI */
  imei: string

  /** 入网类型 */
  netInfo: string
}

interface GatewayLanInfo {
  /** ip地址 */
  ip: string

  /** 子网掩码 */
  mask: string

  /** 网关 */
  gateway: string

  /** mac地址 */
  mac: string

  /** 启用/关闭 */
  dhcpEnableName: string

  /** 是否使用DHCP */
  dhcpEnable: number

  /** DHCP起始地址 */
  dhcpStart: string

  /** DHCP结束地址 */
  dhcpEnd: string
}

interface GatewayWanInfo {
  /** 工作模式 */
  mode: number

  /** 工作模式名称 */
  modeName: string

  /** ip地址 */
  ip: string

  /** 子网掩码 */
  mask: string

  /** 网关 */
  gateway: string

  /** mac地址 */
  mac: string
}

export interface BindGatewayForm {
  gatewayUidList?: string[]
  projectUid?: string
  list?: TreeOptionVo[]
}

export interface GatewayPageVo {
  statusOptions?: OptionVo[]
  projectOptions?: OptionVo[]
  treeData?: OptionVo[]
  firstData?: GatewayTreeOptionVo
}

export interface GatewayTreeOptionVo {
  label?: string
  value?: string
  sn?: string
  def?: boolean
  status?: string
  group?: boolean
  children?: GatewayTreeOptionVo[]
}

export interface GatewayQuery {
  statusList?: string[]
  projectUidList?: string[]
  keyword?: string
}

export interface GatewayGroup extends BaseEntityLd {
  name?: string
  parentUid?: string
}

export interface GatewayGroupForm extends GatewayGroup {
  treeData?: TreeOptionVo[]
}
