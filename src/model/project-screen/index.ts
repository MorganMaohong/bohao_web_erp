import { BaseEntityLd, OptionVo, PageQuery, TreeOptionVo } from "@/model"
import { UserVo } from "@/model/user"

export interface ProjectScreen extends BaseEntityLd {
  name: string
  type: string
  longitude: string
  latitude: string
  address: string
  process: number
  expansionProcessJson: string
  expansionCarouselJson: string
  remediationJson: string
  startTime: string
  endTime: string
}

export interface ProjectScreenForm extends ProjectScreen {
  typeOptions: OptionVo[]
  expansionProcessList: string[]
  expansionCarouselList: string[]
  remediationList: string[]
  operationFormList: ProjectScreenOperationVo[]
  startTimestamp: number
  endTimestamp: number
}

export interface ProjectScreenOperation extends BaseEntityLd {
  tabs: boolean
  title: string
  workFocus: string
  requires: string
  relatedWorkJson: string
  projectScreenUid: string
  groupUid: string
}

export interface ProjectScreenOperationForm extends ProjectScreenOperation {
  groupOptions: OptionVo[]
  relatedWorkList: string[]
}

export interface ProjectScreenOperationVo extends ProjectScreenOperation {
  children: ProjectScreenOperation[]
}

export interface ProjectScreenQuery extends PageQuery {
  name: string
  type: string
}

export interface ProjectScreenVo extends ProjectScreen {
  typeName: string
}

export interface ProjectScreenQueryData {
  typeOptions: OptionVo[]
}

export interface UserOverviewData {
  data: UserVo[]
  deptTree: TreeOptionVo[]
  statusOptions: OptionVo[]
}

export interface UserOverviewQuery {
  deptUid: string
  name: string
}

export interface UploadImageForm {
  // 扩建项目进度
  expansionProcessList: string[]
  // 扩建项目轮播
  expansionCarouselList: string[]
  // 整治项目图片
  remediationList: string[]
  operationFormList: ProjectScreenOperationVo[]
  projectOptions: OptionVo[]
  projectUid: string
  type: string
}
