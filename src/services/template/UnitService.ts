import { templateUnitApi } from "@/services/api"
import request from "@/utils/request"
import { PageVo, TreeOptionVo } from "@/model"
import { UnitForm, UnitQuery, UnitVo } from "@/model/template/unit"

export const UnitService = {
  async addOrUpdate(data: UnitForm): Promise<void> {
    try {
      const url = data.uid ? templateUnitApi.update.url : templateUnitApi.add.url
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
      const url = templateUnitApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: UnitQuery): Promise<PageVo<UnitVo, void>> {
    try {
      const res = await request({
        url: templateUnitApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid?: string): Promise<UnitForm> {
    try {
      const url = uid ? templateUnitApi.form.url + `/${uid}` : templateUnitApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async options(): Promise<TreeOptionVo[]> {
    try {
      const res = await request({
        url: templateUnitApi.options.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
