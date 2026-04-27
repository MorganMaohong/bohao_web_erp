import { BaseEntityLd, OptionVo, PageQuery } from "@/model"
import { Warehouse } from "@/model/stock"
import { ItemsBase } from "@/model/template/items"

export interface MaterialRequestOrder extends BaseEntityLd {
  code?: string
  applyTime?: number | string
  expectTime?: number | string
  warehouseUid?: string
  usageType?: string
  bizType?: string
  bizUid?: string
  bizName?: string
  status?: string
  remark?: string
}

export interface MaterialRequestOrderDetail extends ItemsBase {
  orderUid?: string
  itemUid?: string
  quantity?: number
  issuedQuantity?: number
  outOrderDetailUid?: string
}

export interface MaterialRequestOrderDetailVo extends MaterialRequestOrderDetail {
  typeName?: string
  unitName?: string
  totalQuantity?: number
  availableQuantity?: number
  issueQuantity?: number | string
}

export interface MaterialRequestIssueSubmitItem {
  detailUid?: string
  quantity?: number
}

export interface MaterialRequestIssueForm {
  uid?: string
  comment?: string
  detailList?: MaterialRequestIssueSubmitItem[]
}

export interface MaterialRequestOrderForm extends MaterialRequestOrder {
  warehouse?: Warehouse
  detailList?: MaterialRequestOrderDetailVo[]
  usageTypeOptions?: OptionVo[]
  bizTypeOptions?: OptionVo[]
  bizObjectOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
}

export interface MaterialRequestOrderVo extends MaterialRequestOrder {
  statusName?: string
  currentNodeName?: string
  usageTypeName?: string
  bizTypeName?: string
  warehouseName?: string
  applyTimeName?: string
  expectTimeName?: string
  totalQuantity?: number
}

export interface MaterialRequestDetail extends MaterialRequestOrder {
  statusName?: string
  currentNodeName?: string
  usageTypeName?: string
  bizTypeName?: string
  warehouseName?: string
  applyTimeName?: string
  expectTimeName?: string
  flowSchema?: Record<string, any>
  detailList?: MaterialRequestOrderDetailVo[]
  totalQuantity?: number
}

export interface MaterialRequestOrderQuery extends PageQuery {
  key?: string
  status?: string
  warehouseUid?: string
  usageType?: string
  bizType?: string
}

export interface MaterialRequestOrderQueryData {
  statusOptions?: OptionVo[]
  usageTypeOptions?: OptionVo[]
  bizTypeOptions?: OptionVo[]
  warehouseOptions?: OptionVo[]
}
