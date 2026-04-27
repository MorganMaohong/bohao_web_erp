import { BaseEntity, OptionVo, PageQuery, TreeOptionVo } from "src/model"

export interface RepairPermissionSponsorForm extends RepairPermissionForm {}

export interface RepairPermissionLeaderForm extends RepairPermissionForm {}

export interface RepairPermissionReviewForm extends RepairPermissionForm {}

export interface RepairPermissionDispatchForm extends RepairPermissionForm {}

export interface RepairPermissionForm {
  projectUid: string
  deptOptions: OptionVo[]
  postOptions: OptionVo[]
  userOptions: OptionVo[]
  selectUserUidList: string[]
  selectPostUidList: string[]
  selectDeptUidList: string[]
}

export interface RepairPermTemplateQuery {
  name: string
}

export interface RepairPermTemplate extends BaseEntity {
  name: string
}

export interface RepairTemplatePermissionForm extends RepairPermTemplate {
  deptOptions: OptionVo[]
  postOptions: OptionVo[]
  userOptions: OptionVo[]
  selectDispatchUserUidList: string[]
  selectDispatchPostUidList: string[]
  selectDispatchDeptUidList: string[]
  selectLeaderDeptUidList: string[]
  selectLeaderPostUidList: string[]
  selectLeaderUserUidList: string[]
  selectReviewDeptUidList: string[]
  selectReviewPostUidList: string[]
  selectReviewUserUidList: string[]
}

export interface RepairSetPermForm {
  projectUid: string
  templateOptions: OptionVo[]
  templateUidList: string[]
}

export interface RepairPatchSetPermForm {
  projectUidList: string[]
  templateOptions: OptionVo[]
  templateUidList: string[]
}

export interface RepairPermTmpForm extends RepairPermTemplate {
  userOptions: OptionVo[]
  selectUserUidList: string[]
  selectProjectUidList: string[]
}

export interface RepairPermTmpQuery extends PageQuery {
  name: string
}
