export enum FlowDefinitionApprovalTypeOptions {
  ALL = "all",
  OR = "or"
}

export enum FlowDefinitionApprovalModeOptions {
  USER = "user",
  DEPT = "dept",
  ROLE = "role",
  POST = "post",
  LEADER = "leader",
  LEADER_LEVEL = "leader_level",
  SELF_SELECT = "self_select"
}

export enum FlowDefinitionNotifyModeOptions {
  USER = "user",
  DEPT = "dept",
  ROLE = "role",
  POST = "post"
}

export enum FlowDefinitionNotifyTypeOptions {
  SYSTEM = "system",
  SMS = "sms",
  EMAIL = "email"
}

export enum FlowDefinitionNodeTypeOptions {
  APPROVE = "approve",
  NOTIFY = "notify",
  CONDITION = "condition"
}

export enum FlowDefinitionTypeOptions {
  REPAIR_FLOW = "repair_flow",
  PURCHASE_APPLY_FLOW = "purchase_apply_flow",
  PURCHASE_ORDER_FLOW = "purchase_order_flow",
  PRODUCTION_PLAN_FLOW = "production_plan_flow",
  PRODUCTION_PLAN_WAREHOUSE = "production_plan_warehouse",
  INVENTORY_REQUEST_FLOW = "inventory_request_flow"
}

export enum FlowTaskStatusEnum {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
  COPY = "copy"
}
