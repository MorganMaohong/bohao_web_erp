import { reactive, ref, watch } from "vue"
import { defineStore } from "pinia"
import { getSidebarStatus, setSidebarStatus } from "@/utils/cache/local-storage"
import { DeviceEnum, SIDEBAR_OPENED, SIDEBAR_CLOSED, ComponentSizeEnum } from "@/constants/app-key"
import { SEARCH_BAR_SIZE } from "@/config/ui"
import store from "@/store"

interface Sidebar {
  opened: boolean
  withoutAnimation: boolean
}

/** 设置侧边栏状态本地缓存 */
function handleSidebarStatus(opened: boolean) {
  // debugger
  opened ? setSidebarStatus(SIDEBAR_OPENED) : setSidebarStatus(SIDEBAR_CLOSED)
}

export const useAppStore = defineStore("app", () => {
  /** 侧边栏状态 */
  const sidebar: Sidebar = reactive({
    opened: getSidebarStatus() !== SIDEBAR_CLOSED,
    withoutAnimation: false
  })
  const currentRootRoute = ref("")
  const currentRoute = ref("")
  const getComponentSize = () => {
    const componentSize = localStorage.getItem("app.componentSize")
    if (!componentSize || !Object.values(ComponentSizeEnum).includes(componentSize as ComponentSizeEnum)) {
      return ComponentSizeEnum.small // 默认返回 'small'
    }
    return String(componentSize) // 如果是有效的枚举值，直接返回
  }

  const componentSize = ref<string>(ComponentSizeEnum.small)
  const fullScreenStatus = ref(false)

  const componentSizeOptions = [
    { label: "小型", value: "small" },
    { label: "中型", value: "medium" },
    { label: "大型", value: "large" }
  ]

  const setComponentSize = (size: string) => {
    componentSize.value = size
    localStorage.setItem("app.componentSize", componentSize.value || ComponentSizeEnum.small)
  }

  const setCurrentRootRoute = (path: string) => {
    currentRootRoute.value = path
  }

  const setCurrentRoute = (path: string) => {
    currentRoute.value = path
  }

  const cleanRouterCache = () => {
    currentRootRoute.value = ""
    currentRoute.value = ""
  }

  const appMainKey = ref(0)

  const refreshAppMain = (delay = true) => {
    // 每次刷新时更新 key 的值，强制重新加载 AppMain 组件
    setTimeout(
      () => {
        appMainKey.value++
      },
      delay ? 200 : 0
    )
  }

  /** 设备类型 */
  const device = ref<DeviceEnum>(DeviceEnum.Desktop)
  const collapsed = ref(false)
  const inverted = ref(true)
  /** 监听侧边栏 opened 状态 */
  watch(
    () => sidebar.opened,
    (opened) => handleSidebarStatus(opened)
  )

  /** 切换侧边栏 */
  const toggleSidebar = (withoutAnimation: boolean) => {
    // debugger
    sidebar.opened = !sidebar.opened
    sidebar.withoutAnimation = withoutAnimation
  }
  /** 关闭侧边栏 */
  const closeSidebar = (withoutAnimation: boolean) => {
    sidebar.opened = false
    sidebar.withoutAnimation = withoutAnimation
  }
  /** 切换设备类型 */
  const toggleDevice = (value: DeviceEnum) => {
    device.value = value
  }

  return {
    device,
    sidebar,
    toggleSidebar,
    closeSidebar,
    toggleDevice,
    currentRootRoute,
    currentRoute,
    setCurrentRootRoute,
    setCurrentRoute,
    cleanRouterCache,
    collapsed,
    inverted,
    componentSizeOptions,
    componentSize,
    setComponentSize,
    appMainKey,
    refreshAppMain,
    fullScreenStatus,
    /** 列表搜索栏及下方工具栏按钮尺寸，源配置见 @/config/ui SEARCH_BAR_SIZE */
    searchBarSize: SEARCH_BAR_SIZE
  }
})

/** 在 setup 外使用 */
export function useAppStoreHook() {
  return useAppStore(store)
}
