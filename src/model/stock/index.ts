import { BaseEntityLd, PageQuery } from "@/model"

export interface Warehouse extends BaseEntityLd {
  code?: string
  name?: string
  address?: string
  area?: string
  remark?: string
}

export interface WarehouseForm extends Warehouse {}

export interface WarehouseQuery extends PageQuery {
  key?: string
}

export interface WarehouseVo extends Warehouse {}
