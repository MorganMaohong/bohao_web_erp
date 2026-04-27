import request from "@/utils/request"
import { projectScreenApi } from "@/services/api"
import {
  ProjectScreenForm,
  ProjectScreenOperationForm,
  ProjectScreenQuery,
  ProjectScreenQueryData,
  ProjectScreenVo,
  UploadImageForm,
  UserOverviewData,
  UserOverviewQuery
} from "@/model/project-screen"
import { PageVo } from "@/model"

export const ProjectScreenService = {
  async selectProjectScreen(data: ProjectScreenQuery): Promise<PageVo<ProjectScreenVo, ProjectScreenQueryData>> {
    try {
      const url = projectScreenApi.selectProjectScreen.url
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
  async addOrUpdateProjectScreen(data: ProjectScreenForm): Promise<void> {
    try {
      const url = data.uid ? projectScreenApi.updateProjectScreen.url : projectScreenApi.addProjectScreen.url
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
  async projectScreenForm(uid: string): Promise<ProjectScreenForm> {
    try {
      const url = uid ? projectScreenApi.projectScreenForm.url + `/${uid}` : projectScreenApi.projectScreenForm.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async projectScreenDetail(uid: string): Promise<void> {
    try {
      const url = projectScreenApi.projectScreenDetail.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteProjectScreen(uid: string): Promise<void> {
    try {
      const url = projectScreenApi.deleteProjectScreen.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addProjectScreenOperation(
    data: ProjectScreenOperationForm,
    projectScreenUid: string,
    groupUid: string
  ): Promise<void> {
    try {
      const url = groupUid
        ? projectScreenApi.addProjectScreenOperation.url + `/${projectScreenUid}/${groupUid}`
        : projectScreenApi.addProjectScreenOperation.url + `/${projectScreenUid}`
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
  async updateProjectScreenOperation(data: ProjectScreenOperationForm): Promise<void> {
    try {
      const url = projectScreenApi.updateProjectScreenOperation.url
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
  async deleteProjectScreenOperation(uid: string): Promise<void> {
    try {
      const url = projectScreenApi.deleteProjectScreenOperation.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async projectScreenOperationGroupForm(uid: string): Promise<ProjectScreenOperationForm> {
    try {
      const url = uid
        ? projectScreenApi.projectScreenOperationGroupForm.url + `/${uid}`
        : projectScreenApi.projectScreenOperationGroupForm.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async projectScreenOperationForm(groupUid: string, uid: string): Promise<ProjectScreenOperationForm> {
    try {
      const url = uid
        ? projectScreenApi.projectScreenOperationForm.url + `/${groupUid}/${uid}`
        : projectScreenApi.projectScreenOperationForm.url + `/${groupUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectUserOverview(data: UserOverviewQuery): Promise<UserOverviewData> {
    try {
      const url = projectScreenApi.selectUserOverview.url
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
  async getUserTodayWork(uid: string): Promise<string> {
    try {
      const url = projectScreenApi.getUserTodayWork.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async uploadImageForm(uid?: string): Promise<UploadImageForm> {
    try {
      const url = uid ? projectScreenApi.uploadImageForm.url + `/${uid}` : projectScreenApi.uploadImageForm.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateImage(data: UploadImageForm): Promise<UploadImageForm> {
    try {
      const res = await request({
        url: projectScreenApi.updateImage.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async patchUpdateStatus(data: any): Promise<void> {
    try {
      const res = await request({
        url: projectScreenApi.patchUpdateStatus.url,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async patchUpdateTodayWork(data: any): Promise<void> {
    try {
      const res = await request({
        url: projectScreenApi.patchUpdateTodayWork.url,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
