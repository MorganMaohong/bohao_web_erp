import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type RouteRecordRaw } from "vue-router"
import { constantRoutes, dynamicRoutes } from "@/router"
import { flatMultiLevelRoutes } from "@/router/helper"
import routeSettings from "@/config/route"
import { Menu, MenuTreeVo } from "@/model/menu"
import { MenuTypeDictionary } from "@/constants/enum"

const modules = import.meta.glob("@/views/**/*.vue")
const Layouts = () => import("@/layouts/index.vue")

function buildTreeFromFlatList(flatList: Menu[]): MenuTreeVo[] {
  const map = new Map<string, MenuTreeVo>()
  const tree: MenuTreeVo[] = []

  flatList.forEach((item) => {
    map.set(item.uid, { ...item, children: [] })
  })

  flatList.forEach((item) => {
    const parent = map.get(item.parentUid || "")
    const current = map.get(item.uid)
    if (parent && parent.uid !== item.uid) {
      parent.children = parent.children || []
      parent.children.push(current!)
    } else {
      tree.push(current!)
    }
  })

  return tree
}

export function generateRoutes(menuList: MenuTreeVo[]): RouteRecordRaw[] {
  const tree = buildTreeFromFlatList(menuList)

  const deepConvert = (menus: MenuTreeVo[]): RouteRecordRaw[] => {
    // debugger
    return menus.map((item) => {
      const route: RouteRecordRaw = {
        path: item.path,
        name: item.name,
        meta: { title: item.title, svgIcon: item.icon, link: item.link, type: item.type, linkType: item.linkType },
        redirect: item.redirect,
        children: item.children ? deepConvert(item.children) : undefined
      }
      if (item.type === MenuTypeDictionary.LINK) {
        route.path = "/" + item.uid
        route.name = item.uid
        if (item.linkType) {
          route.component = Layouts
        } else {
          route.component = Layouts
        }
      } else {
        // 处理 component
        if (item.component === "Layout") {
          route.component = Layouts
        } else if (item.component) {
          // debugger
          console.log(item.component)
          const viewPath = `/src/views${item.component}/index.vue`
          const matched = modules[viewPath]
          route.component = matched ? matched : () => import("@/views/error-page/404.vue")
        }
      }
      return route
    })
  }

  return deepConvert(tree)
}

export const usePermissionStore = defineStore("permission", () => {
  /** 可访问的路由 */
  const routes = ref<RouteRecordRaw[]>([])
  const isRoutesAdded = ref(false)
  const rootPath = ref("")

  /** 根据角色生成可访问的 Routes（可访问的路由 = 常驻路由 + 有访问权限的动态路由） */
  const setRoutes = (menuList: Menu[]) => {
    const generatedRoutes = generateRoutes(menuList)
    routes.value = [...constantRoutes, ...generatedRoutes]

    // rootPath 目标应该是“第一个可进入的菜单页面”
    // 不能简单取第一个非 hidden 路由，因为常驻路由/动态容器路由里经常会存在 path === "/"。
    const findFirstEnterablePath = (items: RouteRecordRaw[]): string | undefined => {
      for (const item of items) {
        // 优先进入子路由（通常容器路由只是 redirect/布局）
        if (item.children?.length) {
          const found = findFirstEnterablePath(item.children)
          if (found) return found
        }

        // 某些容器路由可能没有 children，但带 redirect；优先使用 redirect 目标
        if (typeof item.redirect === "string" && item.redirect && item.redirect !== "/" && !item.meta?.hidden) return item.redirect

        const p = item.path
        if (p && p !== "/" && !item.meta?.hidden) return p
      }
      return undefined
    }

    const rootFromGenerated = findFirstEnterablePath(generatedRoutes)
    if (rootFromGenerated) {
      rootPath.value = rootFromGenerated
      return
    }

    // 兜底：从所有非 hidden 路由里找一个非 "/" 的路径
    const noHiddenRoutes = routes.value.filter((item) => !item.meta?.hidden && item.path && item.path !== "/")
    rootPath.value = noHiddenRoutes[0]?.path || ""
  }

  /** 所有路由 = 所有常驻路由 + 所有动态路由 */
  const setAllRoutes = () => {
    routes.value = [...constantRoutes, ...dynamicRoutes]
  }

  const cleanRoutes = () => {
    routes.value = []
  }

  return { rootPath, routes, setRoutes, setAllRoutes, cleanRoutes, isRoutesAdded }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
