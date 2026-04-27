export interface ComportV2 {
  /** 网关sn码 */
  gatewaySn: string

  /** 节点Id */
  nodeId: string

  /** 节点名称 */
  name: string

  /** 节点类型 */
  type: string

  /** 协议 modbus s7 */
  protocol: string

  /** 协议uid */
  protocolSeriesUid: string

  /** modbus从机地址 */
  slavesId: number

  /** 网关uid */
  gatewayUid: string

  /** 通讯口 */
  comport: string

  /** 通讯口连接参数 */
  linkParam: string

  /** plc参数 */
  plcParam: string

  /** 标记删除 */
  markDelete: boolean

  /** 在线状态 */
  status: string
}
