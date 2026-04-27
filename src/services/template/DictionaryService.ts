import request from "@/utils/request"
import { templateDictionaryApi } from "@/services/api"
import { DictionaryForm, DictionaryQuery, DictionaryVo } from "@/model/template/dictionary"
import { UpdateDragSortForm } from "@/model"

export const DictionaryService = {
  async addOrUpdate(data: DictionaryForm): Promise<void> {
    try {
      const url = data.uid ? templateDictionaryApi.update.url : templateDictionaryApi.add.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    try {
      const url = templateDictionaryApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: DictionaryQuery): Promise<DictionaryVo[]> {
    try {
      const url = templateDictionaryApi.select.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid?: string): Promise<DictionaryForm> {
    try {
      const url = uid ? templateDictionaryApi.form.url + `/${uid}` : templateDictionaryApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateSort(data: UpdateDragSortForm): Promise<void> {
    try {
      const url = templateDictionaryApi.updateSort.url
      const res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
