import request from "@/utils/request"
import { LoginData, LoginVo } from "@/model/auth"
import { removeToken, setToken } from "@/utils/cache/cookies"
import { mqttUtil } from "@/utils/mqttUtil"
import { resetRouter } from "@/router"
import { useAppStore } from "@/store/modules/app"
import { usePermissionStore } from "@/store/modules/permission"
import { useUserStore } from "@/store/modules/user"
import { authApi } from "@/services/api"
import { useGatewayTreeStore } from "@/store/modules/gateway"
import { useProjectTreeStore } from "@/store/modules/project"
import { useNotifyStoreHook } from "@/store/modules/notify"
import { websocketUtil } from "@/utils/websocket"

export const LoginService = {
  async login(data: LoginData): Promise<LoginVo> {
    try {
      const res = await request({
        url: authApi.login.url,
        method: "POST",
        data
      })
      const loginInfo = res?.data as LoginVo | undefined
      const accessToken = loginInfo?.accessToken?.trim()
      if (!accessToken) {
        return Promise.reject(new Error("未获取到有效的登录凭证"))
      }
      setToken(accessToken)
      return loginInfo
    } catch (err) {
      return Promise.reject(err)
    }
  },

  async logout(): Promise<void> {
    try {
      await request({
        url: authApi.logout.url,
        method: "POST"
      })

      // ✅ 在这里再获取 store（关键！！）
      const appStore = useAppStore()
      const permissionStore = usePermissionStore()
      const userStore = useUserStore()
      const gatewayTreeStore = useGatewayTreeStore()
      const projectTreeStore = useProjectTreeStore()
      const notifyStore = useNotifyStoreHook()

      appStore.cleanRouterCache()
      permissionStore.cleanRoutes()
      userStore.clean()
      gatewayTreeStore.clean()
      projectTreeStore.clean()
      notifyStore.clear()

      removeToken()
      resetRouter()
      websocketUtil.disconnect(false)
      mqttUtil.destroyConnection()
    } catch (err) {
      return Promise.reject(err)
    }
  },

  async captcha(): Promise<string> {
    try {
      const res = await request({
        url: authApi.captcha.url,
        method: "POST"
      })
      return res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },

  resetToken() {
    websocketUtil.disconnect(false)
    useNotifyStoreHook().clear()
    removeToken()
  }
}
