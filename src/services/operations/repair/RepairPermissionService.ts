import request from "@/utils/request"
import { RepairPermTemplate, RepairPermTmpForm, RepairPermTmpQuery } from "@/model/operations/repair/permission"
import { repairWorkOrderPermissionApi } from "@/services/api"
import { PageVo } from "@/model"

export const RepairPermissionService = {
  async addOrderUpdate(data: RepairPermTmpForm): Promise<void> {
    const url = data.uid ? repairWorkOrderPermissionApi.update.url : repairWorkOrderPermissionApi.add.url
    try {
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
  async configProject(data: RepairPermTmpForm): Promise<void> {
    const url = repairWorkOrderPermissionApi.configProject.url
    try {
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
    const url = repairWorkOrderPermissionApi.delete.url + `/${uid}`
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
  async form(uid: string): Promise<RepairPermTmpForm> {
    const url = uid ? repairWorkOrderPermissionApi.form.url + `/${uid}` : repairWorkOrderPermissionApi.form.url
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
  async select(data: RepairPermTmpQuery): Promise<PageVo<RepairPermTemplate, void>> {
    const url = repairWorkOrderPermissionApi.select.url
    try {
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
  /*async leaderForm(projectUid: string): Promise<RepairPermissionLeaderForm> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.leaderForm.url + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async reviewForm(projectUid: string): Promise<RepairPermissionReviewForm> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.reviewForm.url + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async dispatchForm(projectUid: string): Promise<RepairPermissionDispatchForm> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.dispatchForm.url + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateDispatch(data: RepairPermissionDispatchForm): Promise<void> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.updateDispatch.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateLeader(data: RepairPermissionLeaderForm): Promise<void> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.updateLeader.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateReview(data: RepairPermissionReviewForm): Promise<void> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.updateReview.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async templateForm(uid: string): Promise<RepairTemplatePermissionForm> {
    try {
      const url = uid
        ? repairWorkOrderPermissionApi.templateForm.url + `/${uid}`
        : repairWorkOrderPermissionApi.templateForm.url
      let res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<RepairTemplatePermissionForm> {
    try {
      const url = uid ? repairWorkOrderPermissionApi.form.url + `/${uid}` : repairWorkOrderPermissionApi.form.url
      let res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdateTemplate(data: RepairTemplatePermissionForm): Promise<void> {
    try {
      const url = data.uid
        ? repairWorkOrderPermissionApi.updateTemplate.url
        : repairWorkOrderPermissionApi.addTemplate.url
      let res = await request({
        url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectTemplate(data: RepairPermTemplateQuery): Promise<RepairPermTemplate[]> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.selectTemplate.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteTemplate(uid: string): Promise<void> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.deleteTemplate.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setPermForm(uid: string): Promise<RepairSetPermForm> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.setPermForm.url + `/${uid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateSetPerm(data: RepairSetPermForm): Promise<void> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.updateSetPerm.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async patchSetPermForm(): Promise<RepairPatchSetPermForm> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.patchSetPermForm.url,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updatePatchSetPerm(data: RepairPatchSetPermForm): Promise<void> {
    try {
      let res = await request({
        url: repairWorkOrderPermissionApi.updatePatchSetPerm.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  }*/
}
