import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { useTagsViewStore } from "./tags-view"
import { useSettingsStore } from "./settings"
import { getToken } from "@/utils/cache/cookies"
import { UserInfoVo } from "@/model/user"
import { UserService } from "@/services/UserService"
import { LoginVo } from "@/model/auth"

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfoVo>(undefined)
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const username = ref<string>("")
  const loginInfo = ref<LoginVo>(undefined)

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  const getUserInfo = async () => {
    await UserService.userInfo().then((res) => {
      userInfo.value = res
      roles.value = userInfo.value.roleList
      permissions.value = userInfo.value.permissionList
    })
  }

  const clean = () => {
    userInfo.value = undefined
    token.value = ""
    roles.value = []
    permissions.value = []
    username.value = ""
  }

  return { token, roles, permissions, username, userInfo, loginInfo, getUserInfo, clean }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
