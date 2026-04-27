<script lang="ts" setup>
import { useTheme } from "@/hooks/useTheme"
import { computed, onMounted } from "vue"
// import { ElNotification } from "element-plus"
// 将 Element Plus 的语言设置为中文
import { useRoute } from "vue-router"
import { darkTheme, dateZhCN, GlobalThemeOverrides, NConfigProvider, zhCN } from "naive-ui"
// 仅区分「登录等全屏页」与「带 Layout 的业务壳」，避免每次切换子路由都整页重挂载（否则内容区 transition 无效）
const route = useRoute()
const routerViewKey = computed(() => {
  const p = route.path
  if (p === "/login" || p === "/403" || p === "/404") return p
  return "layout-shell"
})
// 主题覆盖
const naiveTheme = computed(() => {
  const activeThemeName = useTheme().activeThemeName.value
  if (activeThemeName === "dark") {
    return darkTheme
  } else {
    return null
  }
})
// 组件覆盖（与 variables.css / naive-ui-global.scss 统一圆角与间距）
const themeOverrides: GlobalThemeOverrides = {
  common: {
    borderRadius: "8px",
    fontSize: "14px",
    fontSizeMedium: "14px",
    heightMedium: "36px"
  },
  Card: {
    borderRadius: "12px"
  },
  Modal: {
    borderRadius: "14px"
  },
  Input: {
    borderRadius: "8px",
    heightMedium: "36px",
    paddingMedium: "0 12px"
  },
  Button: {
    borderRadiusMedium: "8px",
    heightMedium: "36px",
    paddingMedium: "0 18px"
  },
  Form: {
    labelTextColor: "rgba(15, 23, 42, 0.75)",
    labelFontWeight: "500",
    labelFontSizeLeftSmall: "13px",
    labelFontSizeTopSmall: "13px",
    labelHeightMedium: "34px",
    feedbackHeightSmall: "0px",
    feedbackHeightMedium: "14px",
    feedbackHeightLarge: "0px",
    blankHeight: "18px"
  }
}
const { initTheme } = useTheme()
onMounted(() => {
  // window.addEventListener("resize", test)
})

/** 初始化主题 */
initTheme()
</script>

<template>
  <n-config-provider
    class="app-config-provider"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider class="app-provider-chain">
      <n-notification-provider class="app-provider-chain">
        <n-dialog-provider class="app-provider-chain">
          <div class="app-view-shell">
            <router-view :key="routerViewKey" />
          </div>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-config-provider {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.app-provider-chain {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-view-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
