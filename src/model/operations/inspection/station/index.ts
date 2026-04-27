import { BaseEntity, OptionVo, PageQuery } from "src/model"

export interface InspectionStation extends BaseEntity {
  projectUid?: string
  remark?: string
  factoryLooksImages?: string
  workRecordImages?: string
  waterOutletImages?: string
  equipmentInspectionImages?: string
  customProjectName?: string
  longitude?: number
  latitude?: number
  address?: string
  adsName?: string
}

export interface InspectionStationForm extends InspectionStation {
  projectOptions?: OptionVo[]
  factoryLooksImageList?: string[]
  workRecordImageList?: string[]
  waterOutletImageList?: string[]
  equipmentInspectionImageList?: string[]
  createTimestamp?: number
}

export interface InspectionStationImage extends BaseEntity {
  url: string
}

export interface InspectionStationDetail extends InspectionStation {
  projectOptions?: OptionVo[]
  factoryLooksImageList?: string[]
  workRecordImageList?: string[]
  waterOutletImageList?: string[]
  equipmentInspectionImageList?: string[]
  jobName?: string
  createName?: string
}

export interface InspectionStationQuery extends PageQuery {
  projectUidList?: string[]
  userUidList?: string[]
  createStartTime?: number
  createEndTime?: number
  desc: boolean
}

export interface InspectionStationVo extends InspectionStation {
  createName?: string
  jobName?: string
  projectName?: string
  factoryLooksImageList?: string[]
  workRecordImageList?: string[]
  waterOutletImageList?: string[]
  equipmentInspectionImageList?: string[]
}

export interface InspectionStationQueryData {
  projectOptions?: OptionVo[]
  userOptions?: OptionVo[]
}
