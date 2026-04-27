import router from "@/router"
import { useUserStore } from "@/store/modules/user"
import { usePermissionStore } from "@/store/modules/permission"
import { setRouteChange } from "@/hooks/useRouteListener"
import { useTitle } from "@/hooks/useTitle"
import { getToken } from "@/utils/cache/cookies"
import routeSettings from "@/config/route"
import isWhiteList from "@/config/white-list"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { LoginService } from "@/services/AuthService"

const { setTitle } = useTitle()
NProgress.configure({ showSpinner: false })
router.beforeEach(async (to, from, next) => {
  // debugger
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const token = getToken()

  if (!token) {
    return isWhiteList(to) ? next() : next("/login")
  }

  if (to.path === "/login") {
    try {
      await userStore.getUserInfo()
    } catch {
      LoginService.resetToken()
      return next()
    }
    const loggedIn = userStore.userInfo
    if (!loggedIn) {
      LoginService.resetToken()
      return next()
    }
    if (routeSettings.dynamic) {
      permissionStore.setRoutes(loggedIn.menuList)
    } else {
      permissionStore.setAllRoutes()
    }
    for (const route of permissionStore.routes) {
      router.addRoute(route)
    }
    const homePath = userStore.loginInfo?.sysHomePageRouter || permissionStore.rootPath || "/"
    const routeResolved = router.resolve(homePath)
    if (routeResolved.matched.length > 0) {
      return next({ path: homePath })
    }
    return next({ path: permissionStore.rootPath || "/" })
  }

  const shouldBootstrapRoutes = !userStore.userInfo
  if (shouldBootstrapRoutes) {
    try {
      await userStore.getUserInfo()
    } catch (err) {
      LoginService.resetToken()
      console.error("加载用户信息或添加路由失败：", err)
      return next("/login")
    }
    const user = userStore.userInfo
    if (!user) {
      LoginService.resetToken()
      return next("/login")
    }
    if (routeSettings.dynamic) {
      permissionStore.setRoutes(user.menuList)
    } else {
      permissionStore.setAllRoutes()
    }
    for (const route of permissionStore.routes) {
      router.addRoute(route)
    }
    return next(permissionStore.rootPath)
  }
  next()
})

router.afterEach((to) => {
  setRouteChange(to)
  setTitle(to.meta.title)
  NProgress.done()
})
