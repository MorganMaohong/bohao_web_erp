import request from "@/utils/request"
import { templateItemDictApi } from "@/services/api"
import {
  ItemCodeBuildForm,
  ItemDictForm,
  ItemDictPickerVo,
  ItemDictQuery,
  ItemDictVo
} from "@/model/template/item-dict"
import { UpdateDragSortForm } from "@/model"

export const ItemDictService = {
  async addOrUpdate(data: ItemDictForm): Promise<void> {
    const url = data.uid ? templateItemDictApi.update.url : templateItemDictApi.add.url
    const res = await request({ url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async delete(uid: string): Promise<void> {
    const res = await request({ url: `${templateItemDictApi.delete.url}/${uid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async select(data: ItemDictQuery): Promise<ItemDictVo[]> {
    const res = await request({ url: templateItemDictApi.select.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async form(uid?: string): Promise<ItemDictForm> {
    const url = uid ? `${templateItemDictApi.form.url}/${uid}` : templateItemDictApi.form.url
    const res = await request({ url, method: "POST" })
    return Promise.resolve(res.data)
  },
  async updateSort(data: UpdateDragSortForm): Promise<void> {
    const res = await request({ url: templateItemDictApi.updateSort.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async picker(categoryUid: string): Promise<ItemDictPickerVo> {
    const res = await request({ url: `${templateItemDictApi.picker.url}/${categoryUid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async treePicker(categoryUid: string): Promise<ItemDictPickerVo> {
    const res = await request({ url: `${templateItemDictApi.treePicker.url}/${categoryUid}`, method: "POST" })
    return Promise.resolve(res.data)
  },
  async buildCode(data: ItemCodeBuildForm): Promise<string> {
    const res = await request({ url: templateItemDictApi.buildCode.url, method: "POST", data })
    return Promise.resolve(res.data)
  },
  async syncItemCodes(): Promise<void> {
    const res = await request({ url: templateItemDictApi.syncItemCodes.url, method: "POST" })
    return Promise.resolve(res.data)
  }
}
