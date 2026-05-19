import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { FlowDefinitionSchemaVo } from "@/model/flow/schema"

export interface ProductionBomItemVo extends BaseEntityLd {
  componentItemUid?: string
  name?: string
  image?: string
  type?: string
  typeName?: string
  unit?: string
  unitName?: string
  spec?: string
  material?: string
  quantity?: number
  remark?: string
  totalQuantity?: number
  availableQuantity?: number
}

export interface ProductionBomForm {
  productItemUid?: string
  productName?: string
  detailList?: ProductionBomItemVo[]
  componentOptions?: OptionVo[]
}

export interface ProductionBomProductVo extends BaseEntityLd {
  name?: string
  image?: string
  typeName?: string
  unitName?: string
  bomCount?: number
}

export interface ProductionBomQuery extends PageQuery {
  key?: string
}

export interface ProductionProcessTemplateNodeVo extends BaseEntityLd {
  name?: string
  leaderUid?: string
  leaderName?: string
  durationValue?: number
  durationUnit?: string
  durationUnitName?: string
  startRule?: string
  startRuleName?: string
  sort?: number
  remark?: string
}

export interface ProductionProcessTemplateForm extends BaseEntityLd {
  name?: string
  category?: string
  remark?: string
  categoryOptions?: OptionVo[]
  leaderOptions?: OptionVo[]
  durationUnitOptions?: OptionVo[]
  startRuleOptions?: OptionVo[]
  nodeList?: ProductionProcessTemplateNodeVo[]
}

export interface ProductionProcessTemplateVo extends BaseEntityLd {
  name?: string
  category?: string
  remark?: string
  nodeCount?: number
}

export interface ProductionProcessTemplateQuery extends PageQuery {
  key?: string
}

export interface ProductionPlanProductItem {
  itemUid?: string
  name?: string
  image?: string
  warehouseUid?: string
  warehouseName?: string
  unit?: string
  unitName?: string
  type?: string
  typeName?: string
  spec?: string
  material?: string
  itemBizType?: string
  itemBizTypeName?: string
  stockQuantity?: number
  quantity?: number
  inboundQuantity?: number
}

export interface ProductionPlanBomItem {
  uid?: string
  productItemUid?: string
  productName?: string
  productImage?: string
  productType?: string
  productTypeName?: string
  productSpec?: string
  productMaterial?: string
  productItemBizType?: string
  productItemBizTypeName?: string
  componentItemUid?: string
  componentName?: string
  componentImage?: string
  componentType?: string
  componentTypeName?: string
  componentSpec?: string
  componentMaterial?: string
  componentItemBizType?: string
  componentItemBizTypeName?: string
  unit?: string
  unitName?: string
  perQuantity?: number
  requiredQuantity?: number
  stockQuantity?: number
  availableQuantity?: number
  issuedQuantity?: number
  remark?: string
}

export interface ProductionPlanProcessNodeItem {
  uid?: string
  name?: string
  leaderUid?: string
  leaderName?: string
  durationValue?: number
  durationUnit?: string
  startRule?: string
  sort?: number
  remark?: string
  completed?: boolean
  actualCompleteTime?: number
  reworkTime?: number
  imageList?: string[]
}

export interface ProductionPlanProcessItem {
  uid?: string
  productItemUid?: string
  productName?: string
  templateUid?: string
  templateName?: string
  quantity?: number
  remark?: string
  nodeCompleted?: boolean
  completed?: boolean
  planStartTime?: number
  planCompleteTime?: number
  actualCompleteTime?: number
  nodeList?: ProductionPlanProcessNodeItem[]
}

export interface ProductionPlanIssueDetailItem {
  bomUid?: string
  componentItemUid?: string
  componentName?: string
  componentImage?: string
  componentSpec?: string
  componentMaterial?: string
  componentTypeName?: string
  stockQuantity?: number
  availableQuantity?: number
  requiredQuantity?: number
  issuedQuantity?: number
  warehouseUid?: string
  warehouseName?: string
  quantity?: number
  remark?: string
}

export interface ProductionPlanIssueOrderItem {
  uid?: string
  issueTime?: number
  remark?: string
  detailList?: ProductionPlanIssueDetailItem[]
}

export interface ProductionPlanFinishDetailItem {
  productItemUid?: string
  productName?: string
  productImage?: string
  productSpec?: string
  productMaterial?: string
  productTypeName?: string
  planQuantity?: number
  inboundQuantity?: number
  availableInboundQuantity?: number
  warehouseUid?: string
  warehouseName?: string
  quantity?: number
  remark?: string
}

export interface ProductionPlanFinishOrderItem {
  uid?: string
  inboundTime?: number
  remark?: string
  detailList?: ProductionPlanFinishDetailItem[]
}

export interface ProductionPlanStageVo {
  key?: string
  name?: string
  completed?: boolean
  current?: boolean
}

export interface ProductionPlan extends BaseEntityLd {
  name?: string
  startTime?: number
  planCompleteTime?: number
  images?: string
  docs?: string
  remark?: string
  closeReason?: string
  flowInstanceUid?: string
  status?: string
  currentNodeUid?: string
  materialPrepared?: boolean
  materialIssued?: boolean
  processCompleted?: boolean
  finished?: boolean
  inboundCompleted?: boolean
}

export interface ProductionPlanForm extends ProductionPlan {
  imageList?: string[]
  docList?: string[]
  productList?: ProductionPlanProductItem[]
  productOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
  canEditPlan?: boolean
}

export interface ProductionPlanDetail extends ProductionPlanForm {
  statusName?: string
  currentNodeName?: string
  currentStage?: string
  currentStageName?: string
  bomList?: ProductionPlanBomItem[]
  processList?: ProductionPlanProcessItem[]
  issueOrderList?: ProductionPlanIssueOrderItem[]
  finishOrderList?: ProductionPlanFinishOrderItem[]
  stageList?: ProductionPlanStageVo[]
  flowSchema?: FlowDefinitionSchemaVo
}

export interface ProductionPlanQuery extends PageQuery {
  key?: string
  status?: string
}

export interface ProductionPlanIssueForm {
  uid?: string
  issueTime?: number
  remark?: string
  warehouseOptions?: OptionVo[]
  bomList?: ProductionPlanBomItem[]
  detailList?: ProductionPlanIssueDetailItem[]
}

export interface ProductionPlanProcessForm {
  uid?: string
  productItemUid?: string
  templateUid?: string
  quantity?: number
  remark?: string
  remainingQuantityMap?: Record<string, number>
  productOptions?: OptionVo[]
  templateOptions?: OptionVo[]
  processList?: ProductionPlanProcessItem[]
}

export interface ProductionPlanProcessNodeCompleteForm {
  uid?: string
  imageList?: string[]
}

export interface ProductionPlanFinishInboundForm {
  uid?: string
  inboundTime?: number
  remark?: string
  warehouseOptions?: OptionVo[]
  productList?: ProductionPlanProductItem[]
  detailList?: ProductionPlanFinishDetailItem[]
}

export interface ProductionPlanCloseForm {
  uid?: string
  closeReason?: string
}
