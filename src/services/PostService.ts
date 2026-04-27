import request from "@/utils/request"
import { PostDataVo, PostForm, PostTreeQuery } from "@/model/post"
import { TreeOptionVo, UpdateDragSortForm } from "src/model"
import { postApi } from "@/services/api"

export const PostService = {
  async select(data: PostTreeQuery): Promise<PostDataVo> {
    try {
      const res = await request({
        url: postApi.select.url,
        method: "POST",
        data
      })
      return res.data
    } catch (err) {
      console.error("Error loading tree:", err)
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<PostForm> {
    const url = uid ? postApi.form.url + `/${uid}` : postApi.form.url
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
  async addOrUpdate(data: PostForm): Promise<void> {
    const url = data.uid ? postApi.update.url : postApi.add.url
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
        url: postApi.delete.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async treeOptions(): Promise<TreeOptionVo[]> {
    try {
      const res = await request({
        url: postApi.treeOptions.url,
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
        url: postApi.updateSort.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getTreeByDeptUid(uid: string): Promise<TreeOptionVo[]> {
    try {
      const res = await request({
        url: postApi.getTreeByDeptUid.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
