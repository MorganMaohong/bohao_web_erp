<script lang="ts" setup>
import { useSettingsStore } from "@/store/modules/settings"
import Footer from "./Footer/index.vue"
import { useMessage, useNotification } from "naive-ui"

// 将 message 挂载到 window 对象上
window["$message"] = useMessage()
window["$notification"] = useNotification()
const settingsStore = useSettingsStore()
</script>

<template>
  <section class="app-main">
    <div class="app-scrollbar">
      <router-view v-slot="{ Component, route }">
        <transition name="slide-fade" mode="out-in">
          <div :key="route.fullPath" class="router-page">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
      <!-- 页脚 -->
      <Footer v-if="settingsStore.showFooter" />
    </div>
    <!-- 返回顶部 -->
    <el-backtop />
    <!-- 返回顶部（固定 Header 情况下） -->
    <el-backtop target=".app-scrollbar" />
  </section>
</template>

<style lang="scss">
@import "@/styles/mixins.scss";

/* 占满侧栏右侧内容区高度，纵向滚动由 .app-scrollbar 统一承担 */
.app-main {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-scrollbar {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  @extend %scrollbar;

  .app-container-grow {
    flex-grow: 1;
  }
}

.router-page {
  min-height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 主内容区路由切换动画（需避免 App.vue 整壳 key 频繁变化） */
.slide-fade-enter-active {
  transition:
    opacity 0.32s ease,
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.24s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
