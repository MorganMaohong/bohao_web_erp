import request from "@/utils/request"
import { MenuDataVo, MenuForm, MenuQuery, MenuQueryForm } from "@/model/menu"
import { menuApi } from "@/services/api"
import { UpdateDragSortForm } from "src/model"

export const MenuService = {
  async select(data: MenuQuery): Promise<MenuDataVo> {
    try {
      const res = await request({
        url: menuApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<MenuForm> {
    try {
      const url = uid ? `${menuApi.form.url}/${uid}` : menuApi.form.url
      const res = await request({
        url,
        method: "POST"
      })

      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(data: MenuQueryForm): Promise<MenuForm> {
    try {
      const res = await request({
        url: menuApi.form.url,
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
      const url = `${menuApi.delete.url}/${uid}`
      const res = await request({
        url,
        method: "POST"
      })

      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: MenuForm): Promise<void> {
    try {
      const url = data.uid ? menuApi.update.url : menuApi.add.url
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
  async updateSort(data: UpdateDragSortForm): Promise<void> {
    try {
      const res = await request({
        url: menuApi.updateSort.url,
        method: "POST",
        data
      })

      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
