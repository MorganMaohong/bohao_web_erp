import request from "@/utils/request"
import { ProjectForm, ProjectGroupForm, ProjectQuery, ProjectVo } from "@/model/project"
import { PageVo } from "src/model"
import { BindGatewayForm, ProjectGatewayInfos } from "@/model/gateway"
import { projectApi } from "@/services/api"
import { SysLogQuery, SysLogVo } from "@/model/syslog"

export const ProjectGroupService = {
  async form(uid: string): Promise<ProjectGroupForm> {
    try {
      const url = uid ? projectApi.form.url + `/${uid}` : projectApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: ProjectGroupForm): Promise<void> {
    try {
      const url = data.uid ? projectApi.update.url : projectApi.add.url
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
      const url = projectApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
export const ProjectService = {
  async selectTree(data: ProjectQuery): Promise<any> {
    try {
      const res = await request({
        url: projectApi.selectTree.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectMultiple(groupUid: string): Promise<string[]> {
    try {
      const res = await request({
        url: projectApi.displayMultiple.url + `/${groupUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  } /*async selectList(data: ProjectListQuery): Promise<PageVo<ProjectListVo, ProjectListQueryData>> {
    try {
      let res = await request({
        url: projectApi.selectList.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },*/,
  async select(data: ProjectQuery): Promise<ProjectVo> {
    try {
      const res = await request({
        url: projectApi.select.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async form(uid: string): Promise<ProjectForm> {
    try {
      const url = uid ? projectApi.form.url + `/${uid}` : projectApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: ProjectForm): Promise<void> {
    try {
      const url = data.uid ? projectApi.update.url : projectApi.add.url
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
      const url = projectApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async unBindGateway(uid: string): Promise<void> {
    try {
      const url = projectApi.unBindGateway.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async bindGateway(data: BindGatewayForm): Promise<void> {
    try {
      const url = projectApi.bindGateway.url
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
  async gatewayInfo(projectUid: string): Promise<ProjectGatewayInfos> {
    try {
      const res = await request({
        url: projectApi.gatewayInfo.url + `/${projectUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async log(data: SysLogQuery): Promise<PageVo<SysLogVo, void>> {
    try {
      const res = await request({
        url: projectApi.log.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteLog(data: string[]): Promise<void> {
    try {
      const res = await request({
        url: projectApi.deleteLog.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
