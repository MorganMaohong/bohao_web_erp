/** 设备类型 */
export enum DeviceEnum {
  Mobile,
  Desktop
}

/** 布局模式 */
export enum LayoutModeEnum {
  Left = "left",
  Top = "top",
  LeftTop = "left-top"
}

/** 侧边栏打开状态常量 */
export const SIDEBAR_OPENED = "opened"
/** 侧边栏关闭状态常量 */
export const SIDEBAR_CLOSED = "closed"

export type SidebarOpened = typeof SIDEBAR_OPENED
export type SidebarClosed = typeof SIDEBAR_CLOSED

export enum GatewayStatusEnum {
  ONLINE = "online",
  OFFLINE = "offline",
  UNBIND = "unbind"
}

export enum ProtocolSeriesEnum {
  SIEMENS_S7 = "SiemensS7",
  SIEMENS_PPI = "SiemensPPI",
  MODBUS = "Modbus"
}

export enum ComportStatusEnum {
  ONLINE = "online",
  OFFLINE = "offline"
}

export enum PermissionTypeEnum {
  MENU = "menu",
  API = "api",
  GATEWAY = "gateway",
  PROJECT = "project",
  STATION = "station"
}

export enum ComponentSizeEnum {
  small = "small",
  medium = "medium",
  large = "large"
}

export const pageSizes = [
  {
    label: "10 每页",
    value: 10
  },
  {
    label: "20 每页",
    value: 20
  },
  {
    label: "50 每页",
    value: 50
  },
  {
    label: "100 每页",
    value: 100
  },
  {
    label: "500 每页",
    value: 500
  }
]

export const InspectionConstants = {
  INSPECTION_PROJECT_CUSTOM: "inspection_project_custom"
}
