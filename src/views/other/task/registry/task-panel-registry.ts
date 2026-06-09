import type { Component } from "vue"
import { FlowDefinitionTypeOptions } from "@/constants/flow"
import type { FlowTaskSubmitForm, TaskCenterDetail } from "@/model/flow"
import InventoryRequestFlowPanel from "@/views/other/task/panels/flow/InventoryRequestFlowPanel.vue"
import RepairFlowPanel from "@/views/other/task/panels/flow/RepairFlowPanel.vue"
import ProductionPlanFlowPanel from "@/views/other/task/panels/flow/ProductionPlanFlowPanel.vue"
import ProductionPlanWarehouseFlowPanel from "@/views/other/task/panels/flow/ProductionPlanWarehouseFlowPanel.vue"
import PurchaseApplyFlowPanel from "@/views/other/task/panels/flow/PurchaseApplyFlowPanel.vue"
import PurchaseOrderFlowPanel from "@/views/other/task/panels/flow/PurchaseOrderFlowPanel.vue"

export interface FlowTaskPanelProps {
  detail: TaskCenterDetail
  loading?: boolean
}

export interface FlowTaskPanelAdapter {
  component: Component
  validate?: (detail: TaskCenterDetail, form: FlowTaskSubmitForm) => boolean
  buildPayload?: (detail: TaskCenterDetail) => Partial<FlowTaskSubmitForm>
}

const FLOW_PANEL_REGISTRY: Partial<Record<FlowDefinitionTypeOptions, FlowTaskPanelAdapter>> = {
  [FlowDefinitionTypeOptions.PURCHASE_ORDER_FLOW]: {
    component: PurchaseOrderFlowPanel
  },
  [FlowDefinitionTypeOptions.INVENTORY_REQUEST_FLOW]: {
    component: InventoryRequestFlowPanel
  },
  [FlowDefinitionTypeOptions.PURCHASE_APPLY_FLOW]: {
    component: PurchaseApplyFlowPanel
  },
  [FlowDefinitionTypeOptions.PRODUCTION_PLAN_FLOW]: {
    component: ProductionPlanFlowPanel
  },
  [FlowDefinitionTypeOptions.PRODUCTION_PLAN_WAREHOUSE]: {
    component: ProductionPlanWarehouseFlowPanel
  },
  [FlowDefinitionTypeOptions.REPAIR_FLOW]: {
    component: RepairFlowPanel
  }
}

export function resolveFlowPanel(flowType?: string): FlowTaskPanelAdapter | undefined {
  if (!flowType) return undefined
  return FLOW_PANEL_REGISTRY[flowType as FlowDefinitionTypeOptions]
}

export function isFlowPanelRegistered(flowType?: string): boolean {
  return Boolean(resolveFlowPanel(flowType))
}

export function listRegisteredFlowTypes(): string[] {
  return Object.keys(FLOW_PANEL_REGISTRY)
}
