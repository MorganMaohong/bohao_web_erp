import request from "@/utils/request"
import { Department, DeptForm, DeptPostUserVo, DeptTreePostUserVo } from "@/model/dept"
import { TreeOptionVo, UpdateDragSortForm } from "src/model"
import { deptApi } from "@/services/api"

export const DeptService = {
  async select(): Promise<Department[]> {
    try {
      const res = await request({
        url: deptApi.select.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<DeptForm> {
    const url = uid ? deptApi.form.url + `/${uid}` : deptApi.form.url
    try {
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: DeptForm): Promise<void> {
    const url = data.uid ? deptApi.update.url : deptApi.add.url
    try {
      await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    try {
      await request({
        url: deptApi.delete.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectDeptUser(): Promise<DeptPostUserVo[]> {
    try {
      const res = await request({
        url: deptApi.selectDeptUser.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectDeptPostUser(): Promise<DeptTreePostUserVo[]> {
    try {
      const res = await request({
        url: deptApi.selectDeptPostUser.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async treeOptions(): Promise<TreeOptionVo[]> {
    try {
      const res = await request({
        url: deptApi.treeOptions.url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateSort(data: UpdateDragSortForm): Promise<void> {
    try {
      const res = await request({
        url: deptApi.updateSort.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
