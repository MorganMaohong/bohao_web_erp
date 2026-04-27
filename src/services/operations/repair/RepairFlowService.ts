import request from "@/utils/request"

import {
  ProjectDispatchForm,
  ProjectOrderFlowsForm,
  ProjectReviewForm,
  ProjectReviewTypeForm,
  ProjectSponsorForm
} from "@/model/project"

const prefix = "/operations/repair/flow"

const api = {
  setSponsorSource: `${prefix}/setSponsorSource`,
  getSponsorSource: `${prefix}/getSponsorSource`,
  setDispatchSource: `${prefix}/setDispatchSource`,
  getDispatchSource: `${prefix}/getDispatchSource`,
  getSponsorType: `${prefix}/getSponsorType`,
  setSponsorType: `${prefix}/setSponsorType`,
  getDispatchType: `${prefix}/getDispatchType`,
  setDispatchType: `${prefix}/setDispatchType`,
  setReviewType: `${prefix}/setReviewType`,
  getReviewType: `${prefix}/getReviewType`,
  setReviewSource: `${prefix}/setReviewSource`,
  getReviewSource: `${prefix}/getReviewSource`,
  setLeaderSource: `${prefix}/setLeaderSource`,
  getLeaderSource: `${prefix}/getLeaderSource`,
  getOrderFlow: `${prefix}/getOrderFlow`,
  setOrderFlow: `${prefix}/setOrderFlow`,
  getReviewIsNullSource: `${prefix}/getReviewIsNullSource`,
  setReviewIsNullSource: `${prefix}/setReviewIsNullSource`,
  setTransfereeLeaderSource: `${prefix}/setTransfereeLeaderSource`,
  getTransfereeLeaderSource: `${prefix}/getTransfereeLeaderSource`,
  getTransfereeDispatchSource: `${prefix}/getTransfereeDispatchSource`,
  setTransfereeDispatchSource: `${prefix}/setTransfereeDispatchSource`
}

export const RepairFlowService = {
  async getSponsorSource(projectUid: string): Promise<ProjectSponsorForm> {
    try {
      const res = await request({
        url: api.getSponsorSource + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setSponsorSource(data: ProjectSponsorForm): Promise<void> {
    try {
      await request({
        url: api.setSponsorSource,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getLeaderSource(projectUid: string): Promise<string[]> {
    try {
      const res = await request({
        url: api.getLeaderSource + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setLeaderSource(projectUid: string, data: string[]): Promise<void> {
    try {
      await request({
        url: api.setLeaderSource + `/${projectUid}`,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getTransfereeLeaderSource(projectUid: string): Promise<string[]> {
    try {
      const res = await request({
        url: api.getTransfereeLeaderSource + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setTransfereeLeaderSource(projectUid: string, data: string[]): Promise<void> {
    try {
      await request({
        url: api.setTransfereeLeaderSource + `/${projectUid}`,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getDispatchSource(projectUid: string): Promise<ProjectDispatchForm> {
    try {
      const res = await request({
        url: api.getDispatchSource + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setDispatchSource(data: ProjectDispatchForm): Promise<void> {
    try {
      await request({
        url: api.setDispatchSource,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getTransfereeDispatchSource(projectUid: string): Promise<ProjectDispatchForm> {
    try {
      const res = await request({
        url: api.getTransfereeDispatchSource + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setTransfereeDispatchSource(data: ProjectDispatchForm): Promise<void> {
    try {
      await request({
        url: api.setTransfereeDispatchSource,
        method: "POST",
        data
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getDispatchType(projectUid: string): Promise<string> {
    try {
      const res = await request({
        url: api.getDispatchType + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getSponsorType(projectUid: string): Promise<string> {
    try {
      const res = await request({
        url: api.getSponsorType + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setSponsorType(projectUid: string, type: string): Promise<void> {
    try {
      await request({
        url: api.setSponsorType + `/${projectUid}/${type}`,
        method: "POST"
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setDispatchType(projectUid: string, type: string): Promise<void> {
    try {
      await request({
        url: api.setDispatchType + `/${projectUid}/${type}`,
        method: "POST"
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getOrderFlow(data: ProjectOrderFlowsForm): Promise<ProjectOrderFlowsForm> {
    try {
      const res = await request({
        url: api.getOrderFlow,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setOrderFlow(data: ProjectOrderFlowsForm): Promise<void> {
    try {
      const res = await request({
        url: api.setOrderFlow,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setReviewType(data: ProjectReviewTypeForm): Promise<void> {
    try {
      const res = await request({
        url: api.setReviewType,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getReviewType(projectUid: string, nodeId: string): Promise<ProjectReviewTypeForm> {
    try {
      const res = await request({
        url: api.getReviewType + `/${projectUid}/${nodeId}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setReviewSource(projectUid: string, data: string[]): Promise<void> {
    try {
      const res = await request({
        url: api.setReviewSource + `/${projectUid}`,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  } /*,
  async setReviewSource(data: ProjectReviewForm): Promise<void> {
    try {
      const res = await request({
        url: api.setReviewSource,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },*/ /*  async getReviewSource(projectUid: string, nodeId: string): Promise<ProjectReviewForm> {
    try {
      const res = await request({
        url: api.getReviewSource + `/${projectUid}/${nodeId}`,
        method: "POST"
      })
      return Promise.resolve(res.data)

    } catch (err) {
      return Promise.reject(err)
    }
  },*/,
  async getReviewSource(projectUid: string): Promise<string[]> {
    try {
      const res = await request({
        url: api.getReviewSource + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setReviewIsNullSource(data: ProjectReviewForm): Promise<void> {
    try {
      const res = await request({
        url: api.setReviewIsNullSource,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async getReviewIsNullSource(projectUid: string, nodeId: string): Promise<ProjectReviewForm> {
    try {
      const res = await request({
        url: api.getReviewIsNullSource + `/${projectUid}/${nodeId}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
