import request from "@/utils/request"
import { ProjectForm } from "@/model/project"
import {
  BindGatewayForm,
  GatewayForm,
  GatewayGroupForm,
  GatewayInfo,
  GatewayPageVo,
  GatewayQuery
} from "@/model/gateway"
import { gatewayApi, gatewayGroupApi } from "@/services/api"
import { ProjectVarQuery, ProjectVarQueryData, VarVo } from "@/model/var"
import { PageVo } from "@/model"
import { SysLogQuery, SysLogVo } from "@/model/syslog"

export const GatewayService = {
  async info(gatewayUid: string): Promise<GatewayInfo> {
    try {
      const res = await request({
        url: gatewayApi.info.url + `/${gatewayUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async status(gatewayUid: string): Promise<string> {
    try {
      const res = await request({
        url: gatewayApi.status.url + `/${gatewayUid}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async select(data: GatewayQuery): Promise<GatewayPageVo> {
    try {
      const res = await request({
        url: gatewayApi.select.url,
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
      const url = uid ? gatewayApi.form.url + `/${uid}` : gatewayApi.form.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: GatewayForm): Promise<void> {
    try {
      const url = data.uid ? gatewayApi.update.url : gatewayApi.add.url
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
      const url = gatewayApi.delete.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async restart(uid: string): Promise<void> {
    try {
      const url = gatewayApi.reboot.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async restartLte(uid: string): Promise<void> {
    try {
      const url = gatewayApi.recall.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async restartFlow(uid: string): Promise<void> {
    try {
      const url = gatewayApi.restartFlows.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setHeartbeatTime(uid: string, value: number): Promise<void> {
    try {
      const url = gatewayApi.setHeartbeatTime.url + `/${uid}/${value}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setReportTime(uid: string, value: number): Promise<void> {
    try {
      const url = gatewayApi.setReportTime.url + `/${uid}/${value}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async syncGateway(uid: string): Promise<void> {
    try {
      const url = gatewayApi.syncGateway.url + `/${uid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async options(): Promise<BindGatewayForm> {
    try {
      const url = gatewayApi.options.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async changeSn(gatewayUid: string, sn?: string, oldSn?: string): Promise<void> {
    try {
      const oldSn2 = oldSn ? oldSn : sn
      const url = sn
        ? gatewayApi.changeSn.url + `/${gatewayUid}/${sn}/${oldSn2}`
        : gatewayApi.unbindSn.url + `/${gatewayUid}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async selectVarByGatewayUid(data: ProjectVarQuery, projectUid: string): Promise<PageVo<VarVo, ProjectVarQueryData>> {
    try {
      const res = await request({
        url: gatewayApi.selectVarByGatewayUid.url + `/${projectUid}`,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async log(data: SysLogQuery): Promise<PageVo<SysLogVo, void>> {
    try {
      const res = await request({
        url: gatewayApi.log.url,
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
        url: gatewayApi.deleteLog.url,
        method: "POST",
        data
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
export const GatewayGroupService = {
  async form(uid: string): Promise<GatewayGroupForm> {
    try {
      const url = uid ? gatewayApi.groupForm.url + `/${uid}` : gatewayGroupApi.groupForm.url
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: GatewayGroupForm): Promise<void> {
    try {
      const url = data.uid ? gatewayApi.updateGroup.url : gatewayApi.addGroup.url
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
      const url = gatewayApi.deleteGroup.url + `/${uid}`
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
