import request from "@/utils/request"
import { OptionVo, PageVo } from "src/model"
import {
  UserForm,
  UserInfoVo,
  UserPasswordChangeForm,
  UserPasswordIssueVo,
  UserPasswordResetApplyForm,
  UserPermForm,
  UserProfileForm,
  UserQuery,
  UserQueryData,
  UserVo
} from "@/model/user"
import { userApi } from "@/services/api"
import { MenuSystemTypeDictionary, MenuVersionTypeDictionary } from "@/constants/enum"

// 用户服务封装
export const UserService = {
  async select(data: UserQuery): Promise<PageVo<UserVo, UserQueryData>> {
    try {
      const res = await request({
        url: userApi.select.url,
        method: "POST",
        data
      })
      return res.data as PageVo<UserVo, UserQueryData>
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async userInfo(): Promise<UserInfoVo> {
    try {
      const url = userApi.userInfo.url + `/${MenuVersionTypeDictionary.WEB}/${MenuSystemTypeDictionary.ERP}`
      const res = await request({
        url,
        method: "POST"
      })
      return Promise.resolve(res.data as UserInfoVo)
    } catch (err) {
      return Promise.reject(err)
    }
  } /*async updateStatus(uid: string, status: string): Promise<void> {
    try {
      let res = await request({
        url: userApi.updateStatus.url + `/${uid}/${status}`,
        method: "POST"
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updateTodayWork(uid: string, todayWork: string): Promise<void> {
    try {
      let res = await request({
        url: userApi.updateTodayWork.url + `/${uid}/${todayWork}`,
        method: "POST"
      })
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },*/,
  async form(uid: string): Promise<UserForm> {
    const url = uid ? userApi.form.url + `/${uid}` : userApi.form.url
    try {
      const res = await request({
        url: url,
        method: "POST"
      })
      return res.data as UserForm
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async addOrUpdate(data: UserForm): Promise<void> {
    const url = data.uid ? userApi.update.url : userApi.add.url
    try {
      const res = await request({
        url: url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async delete(uid: string): Promise<void> {
    const url = userApi.delete.url + `/${uid}`
    try {
      const res = await request({
        url: url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async deleteds(data: string[]): Promise<void> {
    const url = userApi.delete.url
    try {
      const res = await request({
        url: url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async options(): Promise<OptionVo[]> {
    try {
      const res = await request({
        url: userApi.options.url,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async permForm(uid: string): Promise<UserPermForm> {
    try {
      const res = await request({
        url: userApi.permForm.url + `/${uid}`,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async updatePerm(data: UserPermForm): Promise<void> {
    try {
      const res = await request({
        url: userApi.updatePerm.url,
        method: "POST",
        data
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async setRemoveMpAuth(uid: string): Promise<void> {
    try {
      const res = await request({
        url: userApi.setRemoveMpAuth.url + `/${uid}`,
        method: "POST"
      })
      return await res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  async profile(): Promise<UserProfileForm> {
    const res = await request({
      url: userApi.profile.url,
      method: "POST"
    })
    return res.data as UserProfileForm
  },
  async updateProfile(data: UserProfileForm): Promise<void> {
    await request({
      url: userApi.updateProfile.url,
      method: "POST",
      data
    })
  },
  async changePassword(data: UserPasswordChangeForm): Promise<void> {
    await request({
      url: userApi.changePassword.url,
      method: "POST",
      data
    })
  },
  async applyPasswordReset(data: UserPasswordResetApplyForm): Promise<void> {
    await request({
      url: userApi.applyPasswordReset.url,
      method: "POST",
      data
    })
  },
  async adminResetPassword(uid: string): Promise<UserPasswordIssueVo> {
    const res = await request({
      url: `${userApi.adminResetPassword.url}/${uid}`,
      method: "POST"
    })
    return res.data as UserPasswordIssueVo
  }
}
