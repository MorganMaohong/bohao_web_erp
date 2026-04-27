<script lang="ts" setup>
import { RouteRecordRaw, RouterLink, useRouter } from "vue-router"
import { computed, h, onBeforeUnmount, ref, watch } from "vue"
import { useAppStore } from "@/store/modules/app"
import { AppMain } from "./components"

import { useUserStore } from "@/store/modules/user"
import { LoginService } from "@/services/AuthService"
import Breadcrumb from "@/layouts/components/Breadcrumb/index.vue"
import SvgIcon from "@/components/SvgIcon/index.vue"
import { usePermissionStore } from "@/store/modules/permission"
import { MenuOption } from "naive-ui"
import { Notification, Task } from "@vicons/carbon"
import { FullscreenExitOutlined, FullscreenOutlined } from "@vicons/antd"
import { IosRefresh } from "@vicons/ionicons4"
import { MenuTypeDictionary } from "@/constants/enum"
import { useNotifyStore } from "@/store/modules/notify"
import { useTaskStore } from "@/store/modules/task"
import { websocketUtil } from "@/utils/websocket"

const userStore = useUserStore()
const router = useRouter()
const appStore = useAppStore()
const notifyStore = useNotifyStore()
const taskStore = useTaskStore()
let taskTimer: ReturnType<typeof setInterval> | null = null

const permissionStore = usePermissionStore()
const noHiddenRoutes = computed(() => permissionStore.routes.filter((item) => !item.meta?.hidden))

const logout = async () => {
  await LoginService.logout()
  await router.replace("/login")
}

function renderIcon(iconName: string) {
  if (!iconName) return
  return () => h(SvgIcon, { name: iconName })
}

const menuTreeOptions = computed<MenuOption[]>(() => buildTopLevelMenu(noHiddenRoutes.value))
const expandedKeys = ref<string[]>([])

function buildSubMenu(children: RouteRecordRaw[]): MenuOption[] {
  return children
    .filter((item) => !item.meta?.hidden)
    .map((route) => {
      const subMenu = route.children ? buildSubMenu(route.children) : undefined
      return {
        label:
          subMenu && subMenu.length
            ? route.meta?.title
            : () => h(RouterLink, { to: { path: route.path } }, { default: () => route.meta?.title }),
        key: route.path,
        icon: renderIcon(route.meta?.svgIcon || ""),
        children: subMenu && subMenu.length ? subMenu : undefined
      }
    })
}

function findRouteByPath(path: string, routes: RouteRecordRaw[]): RouteRecordRaw | undefined {
  for (const route of routes) {
    if (path === route.path) return route
    if (route.children) {
      const matchedChild = findRouteByPath(path, route.children)
      if (matchedChild) return matchedChild
    }
  }
  return undefined
}

function buildTopLevelMenu(routes: RouteRecordRaw[]): MenuOption[] {
  return routes
    .filter((item) => !item.meta?.hidden)
    .map((route) => {
      const visibleChildren = route.children?.filter((c) => !c.meta?.hidden) ?? []
      const subMenu = visibleChildren.length ? buildSubMenu(route.children!) : undefined
      return {
        label:
          subMenu && subMenu.length
            ? route.meta?.title
            : () => h(RouterLink, { to: { path: route.path } }, { default: () => route.meta?.title }),
        key: route.path,
        icon: renderIcon(route.meta?.svgIcon || ""),
        children: subMenu && subMenu.length ? subMenu : undefined
      }
    })
}

function menuSubtreeHasPath(targetPath: string, nodes: MenuOption[]): boolean {
  for (const n of nodes) {
    const k = String(n.key)
    if (targetPath === k) return true
    if (n.children?.length && menuSubtreeHasPath(targetPath, n.children)) return true
  }
  return false
}

function computeExpandedKeys(targetPath: string, items: MenuOption[]): string[] {
  const keys: string[] = []

  function walk(nodes: MenuOption[]): void {
    for (const node of nodes) {
      if (!node.children?.length) continue
      const k = String(node.key)
      if (menuSubtreeHasPath(targetPath, node.children)) {
        keys.push(k)
        walk(node.children)
      }
    }
  }

  walk(items)
  return keys
}

function findTopLevelRoute(path: string): string {
  const visible = noHiddenRoutes.value.filter((r) => !r.meta?.hidden)
  const sorted = [...visible].sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0))
  for (const route of sorted) {
    const p = route.path || ""
    if (!p) continue
    if (path === p || (p !== "/" && path.startsWith(p + "/"))) return p
    if (p === "/" && path !== "/login" && path !== "/403" && path !== "/404") return p
  }
  return visible[0]?.path ?? ""
}

function syncMenuFromRoute(path: string) {
  appStore.setCurrentRoute(path)
  appStore.setCurrentRootRoute(findTopLevelRoute(path))
  expandedKeys.value = computeExpandedKeys(path, menuTreeOptions.value)
}

function onSiderMenuUpdate(key: string) {
  router.push(key)
}

function onUpdateExpandedKeys(keys: string[]) {
  expandedKeys.value = keys
}

function enterTask() {
  router.push({ path: "/other/task" })
}

function enterNotify() {
  router.push({ path: "/other/notify" })
}

function enterProfile() {
  router.push({ path: "/other/profile" })
}

function reconnectNotify() {
  websocketUtil.connect()
}

watch(
  () => router.currentRoute.value.path,
  (path) => {
    syncMenuFromRoute(path)
  },
  { immediate: true }
)

watch(menuTreeOptions, () => {
  syncMenuFromRoute(router.currentRoute.value.path)
})

watch(
  () => userStore.userInfo?.uid,
  (uid) => {
    if (uid) {
      websocketUtil.connect()
      notifyStore.refresh()
      taskStore.refreshPendingCount()
      if (taskTimer) clearInterval(taskTimer)
      taskTimer = setInterval(() => {
        taskStore.refreshPendingCount()
      }, 60000)
      return
    }
    websocketUtil.disconnect(false)
    taskStore.clear()
    if (taskTimer) {
      clearInterval(taskTimer)
      taskTimer = null
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  websocketUtil.disconnect(false)
  if (taskTimer) {
    clearInterval(taskTimer)
    taskTimer = null
  }
})

const enterFit = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    appStore.fullScreenStatus = true
  } else {
    document.exitFullscreen()
    appStore.fullScreenStatus = false
  }
  appStore.refreshAppMain()
}

watch(
  () => appStore.currentRootRoute,
  (newRoute, oldRoute) => {
    const routes = findRouteByPath(newRoute, router.getRoutes())
    if (!routes || routes.meta.type !== MenuTypeDictionary.LINK) return
    if (routes.meta.linkType) {
      router.push({ path: "/link", params: routes.meta })
    } else {
      window.open(routes?.meta.link)
      appStore.setCurrentRootRoute(oldRoute)
      router.push({ path: oldRoute })
    }
  }
)

watch(
  () => appStore.collapsed,
  () => {
    appStore.refreshAppMain()
  },
  { deep: true }
)
</script>

<template>
  <n-layout class="erp-main-layout h-full min-h-0 flex flex-col flex-1 overflow-hidden">
    <n-layout-header bordered class="erp-layout-topbar h-14 flex items-center justify-between px-5 flex-shrink-0">
      <div class="erp-layout-brand">
        <span class="erp-layout-brand__dot" aria-hidden="true" />
        <span class="erp-layout-brand__text">安康博灏环保</span>
      </div>
      <div class="flex items-center gap-6">
        <n-popover trigger="hover">
          <template #trigger>
            <n-icon size="20" class="cursor-pointer" @click="appStore.refreshAppMain(false)">
              <IosRefresh />
            </n-icon>
          </template>
          <span>刷新页面</span>
        </n-popover>
        <n-popover trigger="hover">
          <template #trigger>
            <n-icon size="20" class="cursor-pointer" @click="enterFit">
              <FullscreenExitOutlined v-if="appStore.fullScreenStatus" />
              <FullscreenOutlined v-else />
            </n-icon>
          </template>
          <span>全屏</span>
        </n-popover>
        <n-popover trigger="hover">
          <template #trigger>
            <n-badge :value="taskStore.pendingCount" :max="99" :show-zero="false">
              <n-icon size="20" class="cursor-pointer" @click="enterTask">
                <Task />
              </n-icon>
            </n-badge>
          </template>
          <span>代办事项：{{ taskStore.pendingCount }}</span>
        </n-popover>
        <n-popover trigger="hover">
          <template #trigger>
            <n-badge :value="notifyStore.unreadCount" :max="99" :show-zero="false">
              <n-icon size="20" class="cursor-pointer" @click="enterNotify">
                <Notification />
              </n-icon>
            </n-badge>
          </template>
          <div class="flex flex-col gap-1 text-xs">
            <span>通知</span>
            <span>连接状态：{{ notifyStore.connectionStatus }}</span>
            <n-button text type="primary" @click.stop="reconnectNotify">重新连接</n-button>
          </div>
        </n-popover>
        <n-popover trigger="click">
          <template #trigger>
            <n-avatar size="small" :src="userStore.userInfo.headImage" class="cursor-pointer" />
          </template>
          <template #header>
            <n-text strong depth="1"> {{ userStore.userInfo.name }}</n-text>
          </template>
          <div class="flex flex-col gap-2">
            <n-button text @click="enterProfile">个人中心</n-button>
            <n-button text @click="logout">退出登录</n-button>
          </div>
        </n-popover>
      </div>
    </n-layout-header>

    <n-layout has-sider class="flex-1 min-h-0 overflow-hidden flex">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="72"
        :width="180"
        show-trigger
        :collapsed="appStore.collapsed"
        :native-scrollbar="false"
        @collapse="appStore.collapsed = true"
        @expand="appStore.collapsed = false"
        class="main-layout-sider erp-layout-sider"
      >
        <n-menu
          accordion
          :value="appStore.currentRoute"
          :collapsed="appStore.collapsed"
          :collapsed-width="72"
          :root-indent="14"
          :indent="42"
          icon-size="20"
          :collapsed-icon-size="22"
          :options="menuTreeOptions"
          :expanded-keys="expandedKeys"
          class="erp-sider-menu erp-sider-menu--tree"
          animated
          @update:value="onSiderMenuUpdate"
          @update:expanded-keys="onUpdateExpandedKeys"
        />
      </n-layout-sider>

      <n-layout class="flex-1 min-h-0 flex flex-col overflow-hidden">
        <n-layout-header bordered class="erp-layout-subheader min-h-12 w-full px-5 py-2 flex items-center">
          <Breadcrumb />
        </n-layout-header>

        <n-layout-content
          class="flex-1 min-h-0 overflow-hidden erp-layout-content flex flex-col"
          :native-scrollbar="false"
        >
          <div class="erp-main-fill">
            <AppMain :key="appStore.appMainKey" />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<style lang="scss" scoped>
.erp-layout-topbar {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 24px rgba(15, 23, 42, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;

  :deep(.n-icon) {
    color: rgba(248, 250, 252, 0.9);
  }
}

.erp-layout-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.erp-layout-brand__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
}

.erp-layout-brand__text {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.erp-layout-subheader {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: var(--erp-layout-header-shadow, 0 1px 0 rgba(15, 23, 42, 0.06));
}

.erp-layout-content {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 55%, #eef2f6 100%);
}

.main-layout-sider {
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  :deep(.n-layout-sider-scroll-container) {
    background-color: #10204e !important;
  }

  :deep(.n-layout-sider-border) {
    border-color: rgba(255, 255, 255, 0.08) !important;
  }
}

.main-layout-sider .erp-sider-menu {
  :deep(.n-menu-item-content) {
    font-size: 13.5px;
    padding-top: 3px !important;
    padding-bottom: 3px !important;
    padding-right: 8px !important;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }
}

@import "@/styles/mixins.scss";

$transition-time: 0.35s;

.sidebar-container {
  background-color: var(--v3-sidebar-menu-bg-color);
  transition: width $transition-time;
  width: var(--v3-sidebar-width) !important;
  overflow: hidden;
  border-right: var(--v3-sidebar-border-right);
}

.main-container {
  height: calc(100vh - var(--v3-navigationbar-height));
  transition: $transition-time;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  top: 45px;
  width: calc(100% - var(--v3-sidebar-width));
  transition: width $transition-time;
}

.layout-header {
  background-color: var(--v3-header-bg-color);
  box-shadow: var(--v3-header-box-shadow);
  border-bottom: var(--v3-header-border-bottom);
}

.hasTagsView {
  .fixed-header + .app-main {
    padding-top: var(--v3-header-height);
  }
}

.hideSidebar {
  .sidebar-container {
    width: var(--v3-sidebar-hide-width) !important;
  }

  .fixed-header {
    width: calc(100% - var(--v3-sidebar-hide-width));
  }
}

.mobile {
  .sidebar-container {
    transition: transform $transition-time;
    width: var(--v3-sidebar-width) !important;
  }

  .main-container {
    margin-left: 0px;
  }

  .fixed-header {
    width: 100%;
  }

  &.openSidebar {
    position: fixed;
    top: 0;
  }

  &.hideSidebar {
    .sidebar-container {
      pointer-events: none;
      transition-duration: 0.3s;
      transform: translate3d(calc(0px - var(--v3-sidebar-width)), 0, 0);
    }
  }
}

.withoutAnimation {
  .sidebar-container,
  .main-container {
    transition: none;
  }
}
</style>
