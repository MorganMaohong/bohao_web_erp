export enum ApiTypeDictionary {
  ADD = "add",
  DELETE = "delete",
  UPDATE = "update",
  SELECT = "select",
  LOGIN = "auth"
}

export enum BoolDictionary {
  TRUE = "true",
  FALSE = "false"
}

export enum ComportSourceStatusDictionary {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export enum ComportStatusDictionary {
  OPEN = "open",
  CLOSED = "closed"
}

export enum ConditionalRuleDictionary {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals"
}

export enum WarnTypeDictionary {
  VAR = "var",
  GATEWAY_STATUS = "gateway_status",
  COMPORT_STATUS = "comport_status"
}

export enum ContrastDictionary {
  CONST = "const",
  VAR = "var"
}

export enum DataAccuracyDictionary {
  ACCURATE = "accurate",
  INACCURATE = "inaccurate"
}

export enum GatewayStatusDictionary {
  ONLINE = "online",
  OFFLINE = "offline"
}

export enum ProjectStatusDictionary {
  ONLINE = "online",
  OFFLINE = "offline",
  UNUSUAL = "unusual",
  EMPTY = "empty"
}

export enum LinerOutTypeDictionary {
  TYPE_A = "type_a",
  TYPE_B = "type_b"
}

export enum MenuTypeDictionary {
  CATALOG = "catalog",
  PAGE = "page",
  BUTTON = "button",
  LINK = "link"
}

export enum PermissionTypeDictionary {
  MENU = "menu",
  API = "api",
  GATEWAY = "gateway",
  PROJECT = "project"
}

export enum PostStatusDictionary {
  PUBLISHED = "published",
  DRAFT = "draft"
}

export enum OrganizeType {
  DEPT = "dept",
  POST = "post",
  ROLE = "role",
  USER = "user"
}

export enum RepairEventDictionary {
  EVENT_A = "event_a",
  EVENT_B = "event_b"
}

export enum RepairProcessStatusDictionary {
  STARTED = "started",
  COMPLETED = "completed"
}

export enum RepairStatusDictionary {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  DONE = "done"
}

export enum SeverityTypeDictionary {
  NORMAL = "normal",
  IMPORTANT = "important",
  EXPRESS = "express"
}

export enum SexDictionary {
  MALE = "male",
  FEMALE = "female"
}

export enum TimeUnitDictionary {
  SECOND = "second",
  MINUTE = "minute",
  HOUR = "hour"
}

export enum VarRwTypeDictionary {
  ReadAndWrite = "ReadAndWrite",
  ReadOnly = "ReadOnly"
}

export enum VarStoreDictionary {
  NOT_STORE = "NotStore",
  PERIODIC_STORE = "PeriodicStore",
  TRANSFORM_STORE = "TransformStore",
  CONDITIONAL_STORE = "ConditionalStore"
}

export enum WarnConfirmRuleDictionary {
  MANUAL_CONFIRM = "manualConfirm",
  BEFORE_MANUAL_CONFIRM = "beforeManualConfirm",
  BEFORE_AUTO_CONFIRM = "beforeAutoConfirm"
}

export enum SponsorTypeDictionary {
  ALL = "all",
  SELECT = "select",
  ALL_NOT_CAN = "allNotCan"
}

export enum ReviewTypeDictionary {
  ARTIFICIAL = "artificial",
  AUTO_PASS = "auto_pass",
  AUTO_REJECT = "auto_reject"
}

export enum ReviewIsNullDictionary {
  AUTO_PASS = "auto",
  SELECT = "select"
}

export enum ReviewPeopleTypeDictionary {
  SELECT = "select",
  ROLE = "role"
}

export enum DictCodeEnum {
  COMPORT_SOURCE_STATUS = "ComportSourceStatus",
  MENU_TYPE = "MenuType",
  PERMISSION_TYPE = "PermissionType",
  SEX = "Sex",
  VAR_STORE = "VarStore",
  REPAIR_PROCESS_STATUS = "RepairProcessStatus",
  CONTRAST = "Contrast",
  WARN_CONFIRM_RULE = "WarnConfirmRule",
  GATEWAY_STATUS = "GatewayStatus",
  RECORD_RULE = "RecordRule",
  SEVERITY_TYPE = "SeverityType",
  BOOL = "Bool",
  LINER_OUT_TYPE = "LinerOutType",
  API_TYPE = "ApiType",
  TIME_UNIT = "TimeUnit",
  REPAIR_EVENT = "RepairEvent",
  REPAIR_STATUS = "RepairStatus",
  COMPORT_STATUS = "ComportStatus",
  POST_STATUS = "PostStatus",
  VAR_RW_TYPE = "VarRwType",
  CONDITIONAL_RULE = "ConditionalRule",
  SPONSOR_TYPE = "SponsorType",
  REVIEW_TYPE = "ReviewType",
  REVIEW_IS_NULL = "ReviewIsNull",
  REVIEW_PEOPLE_TYPE = "ReviewPeopleType"
}

export enum RepairWorkOrderStatusDictionary {
  WaitAccept = "wait_accept",
  Processing = "processing",
  WaitTakeOrder = "wait_take_order",
  WaitConfirmTransfer = "wait_confirm_transfer",
  WaitRejectReview = "wait_reject_review",
  WaitReview = "wait_review",
  WaitCompleteConfirm = "wait_complete_confirm",
  Complete = "complete"
}

export const RepairWorkOrderStatusLabels: Record<RepairWorkOrderStatusDictionary, string> = {
  [RepairWorkOrderStatusDictionary.WaitAccept]: "待受理",
  [RepairWorkOrderStatusDictionary.Processing]: "处理中",
  [RepairWorkOrderStatusDictionary.WaitTakeOrder]: "待接单",
  [RepairWorkOrderStatusDictionary.WaitConfirmTransfer]: "待转交确认",
  [RepairWorkOrderStatusDictionary.WaitRejectReview]: "待拒单审核",
  [RepairWorkOrderStatusDictionary.WaitReview]: "待审核",
  [RepairWorkOrderStatusDictionary.WaitCompleteConfirm]: "待确认",
  [RepairWorkOrderStatusDictionary.Complete]: "已完成"
}

export const RepairWorkOrderStatusColors: Record<RepairWorkOrderStatusDictionary, string> = {
  [RepairWorkOrderStatusDictionary.WaitAccept]: "#A0AEC0", // 灰色
  [RepairWorkOrderStatusDictionary.Processing]: "#3182CE", // 蓝色
  [RepairWorkOrderStatusDictionary.WaitTakeOrder]: "#ED8936", // 橙色
  [RepairWorkOrderStatusDictionary.WaitConfirmTransfer]: "#805AD5", // 紫色
  [RepairWorkOrderStatusDictionary.WaitRejectReview]: "#E53E3E", // 红色
  [RepairWorkOrderStatusDictionary.WaitReview]: "#ECC94B", // 黄色
  [RepairWorkOrderStatusDictionary.WaitCompleteConfirm]: "#ECC94B", // 黄色
  [RepairWorkOrderStatusDictionary.Complete]: "#38A169" // 绿色
}

export enum VarComportEnum {
  var_group = "var_group",
  comport_group = "comport_group"
}

export const NodeProtocol = {
  SIEMENS_S7: "SiemensS7",
  SIEMENS_PPI: "SiemensPPI",
  MODBUS: "Modbus"
}

export enum RecordRuleDictionary {
  NOT_VALUE = "notValue",
  UP_VALUE = "upValue",
  UP_VAR = "upVar"
}

export enum ProjectScreenTypeDictionary {
  EXPANSION_PROJECT = "expansion_project",
  OPERATION_PROJECT = "operation_project",
  REMEDIATION_PROJECT = "remediation_project",
  EMPTY_PROJECT = "empty_project"
}

export enum MenuVersionTypeDictionary {
  WEB = "web",
  MINE = "mine"
}

export enum MineMenuTypeDictionary {
  TAB = "tab",
  MENUS = "menus"
}

export enum MenuSystemTypeDictionary {
  DEF = "def",
  ERP = "erp"
}

export enum InventInOrderTypeDict {
  RETURN = "return",
  EXCHANGE = "exchange",
  REPORT_OVER = "report_over",
  PURCHASE_INBOUND = "purchase_inbound",
  BORROW = "BORROW",
  INITIAL = "initial",
  TRANSFER = "transfer",
  PRODUCTION_INBOUND = "production_inbound",
  OTHER = "other"
}

export enum InventInOrderStatusDict {
  CANCEL = "cancel",
  WAIT_COMPLETE = "wait_complete",
  COMPLETE = "complete"
}

export enum InventOutOrderStatusDict {
  CANCEL = "cancel",
  WAIT_COMPLETE = "wait_complete",
  COMPLETE = "complete"
}

export enum InventTransferOrderStatusDict {
  CANCEL = "cancel",
  WAIT_COMPLETE = "wait_complete",
  COMPLETE = "complete"
}

export enum InventCheckOrderStatusDict {
  CANCEL = "cancel",
  WAIT_COMPLETE = "wait_complete",
  COMPLETE = "complete"
}

export enum InventCheckOrderTypeDict {
  INITIAL = "initial",
  STOCK = "stock",
  FINAL_EXAM = "final_exam",
  OTHER = "other"
}

export enum FlowInstanceStatusDict {
  RUNNING = "running",
  WITHDRAWN = "withdrawn",
  REJECTED = "rejected",
  COMPLETED = "completed"
}

export enum MaterialRequestOrderStatusDict {
  DRAFT = "draft",
  WAIT_REVIEW = "wait_review",
  WAIT_ISSUE = "wait_issue",
  PART_ISSUED = "part_issued",
  ALL_ISSUED = "all_issued",
  REJECTED = "rejected",
  CLOSED = "closed",
  RUNNING = "running",
  COMPLETED = "completed"
}

export enum InventOutOrderTypeDict {
  MATERIAL_REQUEST = "material_request",
  SALES_OUTBOUND = "sales_outbound",
  PURCHASE_RETURN = "purchase_return",
  EXCHANGE = "exchange",
  REPORT_OVER = "report_loss",
  BORROW = "borrow",
  INITIAL = "initial",
  INVENTORY_LOSS = "inventory_loss",
  TRANSFER = "transfer",
  OTHER = "other"
}

export enum PurchaseOrderTypeDict {
  NORMAL = "normal",
  RESEND = "resend"
}

export enum PurchaseOrderStatusDict {
  WAIT_CONFIRM = "wait_confirm",
  WAIT_APPROVE = "wait_approve",
  APPROVED = "approved",
  REJECT = "reject",
  PART_IN = "part_in",
  ALL_IN = "all_in",
  PART_RETURN = "part_return",
  ALL_RETURN = "all_return",
  CLOSED = "closed"
}

export enum PurchaseReturnTypeDict {
  REFUND = "refund",
  RESEND = "resend"
}
