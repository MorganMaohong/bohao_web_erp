<script lang="ts" setup>
import { watch, ref, onMounted, computed } from "vue"
import { useRouter, RouteRecordRaw } from "vue-router"
import { storeToRefs } from "pinia"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { UserFilled } from "@element-plus/icons-vue"
import Hamburger from "../Hamburger/index.vue"
import Breadcrumb from "../Breadcrumb/index.vue"
import Sidebar from "../Sidebar/index.vue"
import Notify from "@/components/Notify/index.vue"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import Screenfull from "@/components/Screenfull/index.vue"
import SearchMenu from "@/components/SearchMenu/index.vue"
import { useDevice } from "@/hooks/useDevice"
import { useLayoutMode } from "@/hooks/useLayoutMode"
import SidebarItemChild from "../Sidebar/SidebarItemChild.vue"
import { LoginService } from "@/services/AuthService"

const { isMobile } = useDevice()
const { isTop } = useLayoutMode()
const router = useRouter()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const { showNotify, showThemeSwitch, showScreenfull, showSearchMenu } = storeToRefs(settingsStore)

/** 切换侧边栏 */
const toggleSidebar = () => {
  // debugger
  appStore.toggleSidebar(false)
}

/**
 * 根据路径递归查找路由
 * @param path 路径
 * @param routes 路由配置
 * @returns 找到的路由
 */
function findRouteByPath(path: string, routes: RouteRecordRaw[]): RouteRecordRaw | undefined {
  for (const route of routes) {
    // debugger
    // 检查 meta.hidden 为 true 的路由，跳过不处理

    // 如果当前路径匹配
    if (path === route.path) {
      return route
    }

    // 如果有子路由，则递归检查子路由
    if (route.children) {
      const matchedChild = findRouteByPath(path, route.children)
      if (matchedChild) {
        return matchedChild
      }
    }
  }
  return undefined
}

const matchedRoute = ref<RouteRecordRaw[]>()
const show = ref(true)
onMounted(() => {
  show.value = false
  debugger
  const nv = appStore.currentRootRoute
  const routes = findRouteByPath(nv, router.getRoutes())
  if (routes && routes.children) {
    // appStore.currentRoute = routes.redirect?.toString() || ""
    appStore.setCurrentRoute(routes.redirect?.toString() || "")
    matchedRoute.value = routes.children.filter((item) => !item.meta?.hidden)
    show.value = true
  }
})

watch(
  () => appStore.currentRootRoute, // 使用箭头函数来引用响应式变量
  (nv: string) => {
    if (nv) {
      show.value = false
      debugger
      console.log("active path :", nv)
      // console.log(router.getRoutes())

      // 获取当前路径对应的路由
      // const noHiddenRoutes = computed(() => permissionStore.routes.filter((item) => !item.meta?.hidden))
      const routes = findRouteByPath(nv, router.getRoutes())
      if (routes && routes.children) {
        // appStore.currentRoute = routes.redirect?.toString() || ""
        // appStore.setCurrentRoute(routes.redirect?.toString() || "")
        matchedRoute.value = routes.children.filter((item) => !item.meta?.hidden)
      }
      console.log("Matched Route:", matchedRoute.value)
      show.value = true
    }
  },
  { deep: true } // 如果 currentRootRoute 是对象或数组，考虑使用 deep: true
)

const onSelectMenu = (path: string) => {
  debugger
  appStore.setCurrentRoute(path)
}
</script>

<template>
  <div class="navigation-bar">
    <Hamburger
      v-if="!isTop || isMobile"
      :is-active="appStore.sidebar.opened"
      class="hamburger"
      @toggle-click="toggleSidebar"
    />
    <Breadcrumb v-if="!isTop || isMobile" class="breadcrumb" />
    <Sidebar v-if="isTop && !isMobile" class="sidebar" />

    <el-menu
      :default-active="appStore.currentRoute"
      mode="horizontal"
      :ellipsis="false"
      router
      @select="onSelectMenu"
      v-if="show"
    >
      <SidebarItemChild
        v-for="route in matchedRoute"
        :key="route.path"
        :item="route"
        :base-path="appStore.currentRootRoute"
      />
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-menu--horizontal .el-menu--popup-container) {
  ::v-deep(.el-menu--popup) {
    min-width: 100px !important;
    /* padding: 5px 5px; */
  }
}

.navigation-bar {
  height: var(--v3-navigationbar-height);
  overflow: hidden;
  color: var(--v3-navigationbar-text-color);
  display: flex;
  justify-content: space-between;

  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    cursor: pointer;
  }

  .breadcrumb {
    flex: 1;
    // 参考 Bootstrap 的响应式设计将宽度设置为 576
    @media screen and (max-width: 576px) {
      display: none;
    }
  }

  .sidebar {
    flex: 1;
    // 设置 min-width 是为了让 Sidebar 里的 el-menu 宽度自适应
    min-width: 0px;

    :deep(.el-menu) {
      background-color: transparent;
    }

    :deep(.el-sub-menu) {
      &.is-active {
        .el-sub-menu__title {
          color: var(--el-color-primary) !important;
        }
      }
    }
  }

  .right-menu {
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;

    .right-menu-item {
      padding: 0 10px;
      cursor: pointer;

      .right-menu-avatar {
        display: flex;
        align-items: center;

        .el-avatar {
          margin-right: 10px;
        }

        span {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
