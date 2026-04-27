<script lang="ts" setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import dayjs from "dayjs"
import { CheckmarkDone } from "@vicons/ionicons5"
import { BellFilled } from "@vicons/antd"
import { TrashCan } from "@vicons/carbon"
import { useNotifyStore } from "@/store/modules/notify"
import { websocketUtil } from "@/utils/websocket"

const notifyStore = useNotifyStore()
const router = useRouter()

const statusType = computed(() => {
  switch (notifyStore.connectionStatus) {
    case "connected":
      return "success"
    case "connecting":
      return "warning"
    default:
      return "default"
  }
})

function formatTime(time: string) {
  return time ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : "-"
}

function connect() {
  websocketUtil.connect()
  notifyStore.refresh()
}

function disconnect() {
  websocketUtil.disconnect()
}

function markAllRead() {
  notifyStore.markAllReadRemote()
}

function markRead(id: string) {
  notifyStore.markReadRemote(id)
}

function openNotify(item: any) {
  markRead(item.id)
  if (item.routePath) {
    router.push({ path: item.routePath })
  }
}

function refreshList() {
  notifyStore.refresh()
}
</script>

<template>
  <div class="notify-page">
    <div class="notify-page__header">
      <div>
        <div class="notify-page__title">通知中心</div>
        <div class="notify-page__subtitle">接收后端 websocket 推送消息，并在这里查看连接状态和历史通知。</div>
      </div>
      <div class="notify-page__actions">
        <n-tag :type="statusType" round>
          {{ notifyStore.connectionStatus }}
        </n-tag>
        <n-button type="primary" @click="connect">连接</n-button>
        <n-button @click="refreshList">刷新</n-button>
        <n-button @click="disconnect">关闭连接</n-button>
        <n-button tertiary @click="markAllRead">
          <template #icon>
            <n-icon>
              <CheckmarkDone />
            </n-icon>
          </template>
          全部已读
        </n-button>
        <n-button tertiary type="error" @click="notifyStore.clear">
          <template #icon>
            <n-icon>
              <TrashCan />
            </n-icon>
          </template>
          清空通知
        </n-button>
      </div>
    </div>

    <n-card class="notify-page__summary" :bordered="false">
      <div class="notify-page__summary-grid">
        <div class="notify-page__summary-item">
          <div class="notify-page__summary-label">未读通知</div>
          <div class="notify-page__summary-value">{{ notifyStore.unreadCount }}</div>
        </div>
        <div class="notify-page__summary-item">
          <div class="notify-page__summary-label">通知总数</div>
          <div class="notify-page__summary-value">{{ notifyStore.items.length }}</div>
        </div>
        <div class="notify-page__summary-item">
          <div class="notify-page__summary-label">最近连接时间</div>
          <div class="notify-page__summary-value notify-page__summary-value--time">
            {{ formatTime(notifyStore.lastConnectedAt) }}
          </div>
        </div>
      </div>
    </n-card>

    <n-empty v-if="!notifyStore.items.length" description="暂无通知消息" class="notify-page__empty">
      <template #icon>
        <n-icon size="40">
          <BellFilled />
        </n-icon>
      </template>
    </n-empty>

    <div v-else class="notify-page__list">
      <n-card
        v-for="item in notifyStore.items"
        :key="item.id"
        class="notify-page__item"
        :class="{ 'notify-page__item--unread': !item.read }"
        :bordered="false"
        hoverable
        @click="openNotify(item)"
      >
        <div class="notify-page__item-head">
          <div>
            <div class="notify-page__item-title">{{ item.title }}</div>
            <div class="notify-page__item-time">{{ formatTime(item.timestamp) }}</div>
          </div>
          <n-tag
            :type="
              item.level === 'error'
                ? 'error'
                : item.level === 'warning'
                  ? 'warning'
                  : item.level === 'success'
                    ? 'success'
                    : 'info'
            "
            round
          >
            {{ item.level }}
          </n-tag>
        </div>
        <div class="notify-page__item-content">{{ item.content }}</div>
        <div v-if="item.routePath" class="notify-page__item-link">点击进入相关页面</div>
      </n-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notify-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  overflow: auto;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f2f6fb 100%);
}

.notify-page__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.notify-page__title {
  font-size: 24px;
  font-weight: 700;
  color: #102a43;
}

.notify-page__subtitle {
  margin-top: 6px;
  color: #52606d;
}

.notify-page__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.notify-page__summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.notify-page__summary-item {
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
}

.notify-page__summary-label {
  color: #64748b;
  font-size: 13px;
}

.notify-page__summary-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.notify-page__summary-value--time {
  font-size: 16px;
}

.notify-page__empty {
  margin-top: 60px;
}

.notify-page__list {
  display: grid;
  gap: 12px;
}

.notify-page__item {
  border-radius: 16px;
  cursor: pointer;
}

.notify-page__item--unread {
  box-shadow: inset 4px 0 0 #2563eb;
}

.notify-page__item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.notify-page__item-title {
  font-size: 16px;
  font-weight: 600;
  color: #102a43;
}

.notify-page__item-time {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.notify-page__item-content {
  margin-top: 12px;
  line-height: 1.7;
  color: #334e68;
  white-space: pre-wrap;
  word-break: break-word;
}

.notify-page__item-link {
  margin-top: 10px;
  font-size: 12px;
  color: #2563eb;
}
</style>
