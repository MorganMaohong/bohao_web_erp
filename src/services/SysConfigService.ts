import request from "@/utils/request"
import { SysConfigForm, SysConfigQuery, SysConfigQueryData, SysConfigVo } from "@/model/sysconfig"
import { PageVo } from "src/model"
import { sysConfigApi } from "@/services/api"

export const SysConfigService = {
  async select(data: SysConfigQuery): Promise<PageVo<SysConfigVo, SysConfigQueryData>> {
    try {
      const res = await request({
        url: sysConfigApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<SysConfigForm> {
    try {
      const url = uid ? `${sysConfigApi.form.url}/${uid}` : sysConfigApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: SysConfigForm): Promise<void> {
    try {
      const url = data.uid ? sysConfigApi.update.url : sysConfigApi.add.url
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
