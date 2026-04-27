import { BaseEntity, OptionVo, PageQuery } from "src/model"

export interface ComportV2 extends BaseEntity {
  /** 网关sn码 */
  gatewaySn?: string

  /** 节点Id */
  nodeId?: string

  /** 节点名称 */
  name?: string

  /** 节点类型 */
  type?: string

  /** 协议 modbus s7 */
  protocol?: string

  /** 协议uid */
  protocolSeriesUid?: string

  /** modbus从机地址 */
  slavesId?: number

  /** 网关uid */
  gatewayUid?: string

  /** 通讯口 */
  comport?: string

  /** 通讯口连接参数 */
  linkParam?: Record<string, any> // JSON 类型，使用 Record 表示

  /** plc参数 */
  plcParam?: Record<string, any> // JSON 类型，使用 Record 表示

  /** 标记删除 */
  markDelete?: boolean

  /** 在线状态 */
  status?: string
}

export interface ComportVo extends ComportV2 {}

export interface ComportQuery extends PageQuery {
  gatewayUid?: string
}

export interface UpdateVarByComportForm {
  varUidList?: string[]
  comportOptions: OptionVo[]
  comportUid: string
  createGroup: boolean
}
