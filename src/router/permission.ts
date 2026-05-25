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

function isValidToken(token?: string | null) {
  return Boolean(token && token.trim() && token !== "undefined" && token !== "null")
}

function resolveHomePath(homePaths: Array<string | undefined>, fallbackPath: string) {
  const candidates = [...homePaths, fallbackPath, "/"].filter((item): item is string => Boolean(item))

  for (const path of candidates) {
    const routeResolved = router.resolve(path)
    const hasNon404Match = routeResolved.matched.some((route) => route.name !== "404")
    if (hasNon404Match) {
      return path
    }
  }

  return fallbackPath || "/"
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const token = getToken()
  const hasToken = isValidToken(token)

  if (!hasToken) {
    LoginService.resetToken()
    userStore.clean()
    return isWhiteList(to) ? next() : next("/login")
  }

  if (to.path === "/login") {
    try {
      await userStore.getUserInfo()
    } catch {
      LoginService.resetToken()
      userStore.clean()
      return next()
    }
    const loggedIn = userStore.userInfo
    if (!loggedIn) {
      LoginService.resetToken()
      userStore.clean()
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
    const homePath = resolveHomePath(
      [userStore.loginInfo?.erpHomePageRouter, permissionStore.rootPath || "/", userStore.loginInfo?.sysHomePageRouter],
      permissionStore.rootPath || "/"
    )
    return next({ path: homePath })
  }

  const shouldBootstrapRoutes = !userStore.userInfo
  if (shouldBootstrapRoutes) {
    try {
      await userStore.getUserInfo()
    } catch (err) {
      LoginService.resetToken()
      userStore.clean()
      console.error("加载用户信息或添加路由失败：", err)
      return next("/login")
    }
    const user = userStore.userInfo
    if (!user) {
      LoginService.resetToken()
      userStore.clean()
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
