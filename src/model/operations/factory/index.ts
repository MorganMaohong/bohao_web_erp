import { BaseEntity, OptionVo, PageQuery, TreeOptionVo } from "@/model"

export interface FactoryAppearance extends BaseEntity {
  projectUid?: string
  scale?: string
  technology?: string
  phone?: string
  name?: string
  customProjectName?: string
  inFluentCoarseScreenImages?: string
  dutyRoomImages?: string
  onlineMonitoringImages?: string
  hazardousWasteRoomImages?: string
  powerDistributionRoomImages?: string
  fanRoomImages?: string
  dosingRoomImages?: string
  basinImages?: string
  biochemicalPoolSurfaceImages?: string
  artificialWetlandImages?: string
  siteGroundImages?: string
  groupUid: string
}

export interface FactoryAppearanceForm extends FactoryAppearance {
  inFluentCoarseScreenImageList?: string
  dutyRoomImageList?: string
  onlineMonitoringImageList?: string
  hazardousWasteRoomImageList?: string
  powerDistributionRoomImageList?: string
  fanRoomImageList?: string
  basinImageList?: string
  biochemicalPoolSurfaceImageList?: string
  artificialWetlandImageList?: string
  siteGroundImageList?: string
  projectOptions: OptionVo[]
}

export interface FactoryAppearanceVo extends FactoryAppearance {
  projectName?: string
  createName?: string
}

export interface FactoryAppearanceQuery extends PageQuery {
  projectUidList: string[]
  projectGroupUid: string
  createStartTime: number
  createEndTime: number
  projectName?: string
  groupUid: string
}

export interface FactoryAppearanceQueryData extends FactoryAppearance {
  projectOptions: OptionVo[]
  projectGroupTreeOptions: TreeOptionVo[]
}

export interface FactoryAppearanceDetail extends FactoryAppearanceVo {
  inFluentCoarseScreenImageList?: string
  dutyRoomImageList?: string
  onlineMonitoringImageList?: string
  hazardousWasteRoomImageList?: string
  powerDistributionRoomImageList?: string
  fanRoomImageList?: string
  dosingRoomImageList?: string
  basinImageList?: string
  biochemicalPoolSurfaceImageList?: string
  artificialWetlandImageList?: string
  siteGroundImageList?: string
  projectOptions: OptionVo[]
}

export interface FactoryGroup extends BaseEntity {
  name: string
  month: number
}

export interface FactoryGroupForm extends FactoryGroup {
  projectGroupOptions: TreeOptionVo[]
  projectOptions: OptionVo[]
  projectUidList: string[]
  projectGroupUid: string
}

export interface FactoryGroupQuery extends PageQuery {
  createStartTime: number
  createEndTime: number
  name: string
}

export interface FactoryGroupQueryData {}

export interface FactoryGroupVo extends FactoryGroup {}
