import { BaseEntity, OptionVo, PageQuery } from "src/model"

export interface InspectionDaily extends BaseEntity {
  projectUid?: string
  remark?: string

  factoryLooksImages?: string
  ledgerInspectionRecordImages?: string
  equipmentMaintainImages?: string
  customProjectName?: string
  longitude?: number
  latitude?: number
  address?: string
  adsName?: string
}

export interface InspectionDailyDetail extends InspectionDaily {
  factoryLooksImageList?: string[]
  ledgerInspectionRecordImageList?: string[]
  equipmentMaintainImageList?: string[]
  jobName?: string
  createName?: string
  projectName?: string
}

export interface InspectionDailyForm extends InspectionDaily {
  projectOptions?: OptionVo[]

  factoryLooksImageList?: string[]
  ledgerInspectionRecordImageList?: string[]
  equipmentMaintainImageList?: string[]
  createTimestamp?: number
}

export interface InspectionDailyImage extends BaseEntity {
  url: string
}

export interface InspectionDailyQuery extends PageQuery {
  projectUidList?: string[]
  userUidList?: string[]
  createStartTime?: number
  createEndTime?: number
  desc: boolean
}

export interface InspectionDailyVo extends InspectionDaily {
  createName?: string
  jobName?: string
  projectName?: string

  factoryLooksImageList?: string[]
  ledgerInspectionRecordImageList?: string[]
  equipmentMaintainImageList?: string[]
}

export interface InspectionDailyQueryData {
  projectOptions?: OptionVo[]
  userOptions?: OptionVo[]
}
