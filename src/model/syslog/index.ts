import { PageQuery } from "@/model"

export interface Syslog {
  id: number
  createTime: string
  userUid: string
  type: string
  ip: string
  uid: string
  description: string
  projectUid: string
  gatewayUid: string
  result: string
}

export interface SysLogVo extends Syslog {
  username: string
  userRealName: string
}

export interface SysLogQuery extends PageQuery {
  projectUid: string
  gatewayUid: string
  createStartTime: number
  createEndTime: number
  key: string
  desc: boolean
}
