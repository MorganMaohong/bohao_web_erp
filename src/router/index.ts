import { createRouter, type RouteRecordRaw } from "vue-router"
import { history } from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/link",
    component: Layouts,
    name: "Link",
    redirect: "/link/page",
    meta: {
      title: "",
      svgIcon: "",
      hidden: true
    },
    children: [
      {
        path: "/link/page",
        component: () => import("@/views/link/index.vue"),
        name: "LinkPage",
        meta: {
          hidden: true
        }
      }
    ]
  },
  {
    path: "/other",
    component: Layouts,
    name: "Other",
    meta: {
      title: "其他",
      svgIcon: "",
      hidden: true
    },
    children: [
      {
        path: "/other/task",
        component: () => import("@/views/other/task/index.vue"),
        name: "OtherTask",
        meta: {
          title: "代办事项",
          hidden: true
        }
      },
      {
        path: "/other/notify",
        component: () => import("@/views/other/notify/index.vue"),
        name: "OtherNotify",
        meta: {
          title: "通知中心",
          hidden: true
        }
      },
      {
        path: "/other/profile",
        component: () => import("@/views/other/profile/index.vue"),
        name: "OtherProfile",
        meta: {
          title: "个人中心",
          hidden: true
        }
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = []
const router = createRouter({
  history,
  routes: routeSettings.dynamic ? constantRoutes : [...constantRoutes, ...dynamicRoutes]
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
