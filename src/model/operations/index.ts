import { PageQuery } from "src/model"

export interface Repair {}

export interface RepairQuery extends PageQuery {}

export interface RepairQueryData {}

export interface ProjectOrderForm {
  projectUid: string
  userUidList: string[]
}
