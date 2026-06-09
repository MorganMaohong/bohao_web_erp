import { PageVo } from "@/model"
import { InventoryQueryData, InventoryVo } from "@/model/inventory"
import { ItemsQueryData, ItemsVo } from "@/model/template/items"
import { ItemPickerScenario } from "@/constants/item-picker"
import { templateItemPickerApi } from "@/services/api"
import request from "@/utils/request"

export interface ItemPickerQuery {
  scenario: ItemPickerScenario
  currentPage?: number
  pageSize?: number
  key?: string
  code?: string
  type?: string
  itemBizType?: string
  spec1Uid?: string
  spec2Uid?: string
  brandUid?: string
  warehouseUid?: string
  warehouseUidList?: string[]
}

export type ItemPickerVo = ItemsVo | InventoryVo
export type ItemPickerQueryData = ItemsQueryData | InventoryQueryData

function normalizeQuery(query: ItemPickerQuery): ItemPickerQuery {
  const payload: ItemPickerQuery = {
    scenario: query.scenario,
    currentPage: query.currentPage,
    pageSize: query.pageSize,
    key: query.key,
    code: query.code,
    type: query.type,
    itemBizType: query.itemBizType,
    spec1Uid: query.spec1Uid,
    spec2Uid: query.spec2Uid,
    brandUid: query.brandUid,
    warehouseUid: query.warehouseUid,
    warehouseUidList: query.warehouseUidList
  }
  ;(
    ["key", "code", "type", "itemBizType", "spec1Uid", "spec2Uid", "brandUid", "warehouseUid"] as const
  ).forEach((field) => {
    const value = payload[field]
    if (value === "" || value === null) {
      payload[field] = undefined
    }
  })
  if (!payload.warehouseUidList?.length) {
    payload.warehouseUidList = undefined
  }
  return payload
}

export const ItemPickerService = {
  async select(query: ItemPickerQuery): Promise<PageVo<ItemPickerVo, ItemPickerQueryData>> {
    const res = await request({
      url: templateItemPickerApi.select.url,
      method: "POST",
      data: normalizeQuery(query)
    })
    return res.data
  }
}
