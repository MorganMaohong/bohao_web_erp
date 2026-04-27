<template>
  <div class="border rounded overflow-hidden w-full">
    <!-- 表头 -->
    <table class="w-full text-left border-collapse">
      <thead class="bg-gray-100 text-sm">
        <tr>
          <th v-for="(header, index) in headers" :key="index" class="p-2">{{ header }}</th>
        </tr>
      </thead>
    </table>

    <!-- 滚动区域 -->
    <div
      class="relative overflow-hidden"
      :style="{ height: `${visibleRows * rowHeight}px` }"
      @mouseenter="pause"
      @mouseleave="resume"
    >
      <div
        ref="scrollList"
        :class="{ 'transition-transform duration-700': enableTransition }"
        :style="{ transform: `translateY(-${scrollIndex * rowHeight}px)` }"
      >
        <table class="w-full text-left border-collapse">
          <tbody>
            <tr
              v-for="(item, index) in fullData"
              :key="index"
              class="text-sm even:bg-gray-50"
              :style="{ height: `${rowHeight}px` }"
            >
              <td v-for="(field, fIndex) in rowFields" :key="fIndex" class="p-2">
                <n-popover>
                  <template #trigger>
                    {{ item[field] }}
                  </template>
                  <span>
                    {{ item[field] }}
                  </span>
                </n-popover>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue"

const props = defineProps({
  /** 表头显示名称 */
  headers: {
    type: Array,
    required: true
  },
  /** 表格每行对应字段名 */
  rowFields: {
    type: Array,
    required: true
  },
  /** 数据列表 */
  data: {
    type: Array,
    required: true
  },
  /** 显示几行 */
  visibleRows: {
    type: Number,
    default: 4
  },
  /** 行高（px） */
  rowHeight: {
    type: Number,
    default: 40
  },
  /** 滚动间隔时间（ms） */
  interval: {
    type: Number,
    default: 2500
  }
})
const scrollIndex = ref(0)
const enableTransition = ref(true)
let timer = null

/** 是否需要滚动（数据条数大于可见行数） */
const shouldScroll = computed(() => props.data.length > props.visibleRows)

/** 滚动数据翻倍（仅当需要滚动时） */
const fullData = computed(() => {
  return shouldScroll.value ? [...props.data, ...props.data] : props.data
})

const startScroll = () => {
  if (!shouldScroll.value) return

  timer = setInterval(() => {
    scrollIndex.value++
    if (scrollIndex.value === props.data.length) {
      setTimeout(() => {
        enableTransition.value = false
        scrollIndex.value = 0
      }, 700)
      setTimeout(() => {
        enableTransition.value = true
      }, 750)
    }
  }, props.interval)
}

const pause = () => {
  if (timer) clearInterval(timer)
}
const resume = () => {
  pause()
  startScroll()
}

watch(
  () => props.data,
  () => {
    scrollIndex.value = 0
    pause()
    startScroll()
  }
)

onMounted(startScroll)
onUnmounted(pause)
</script>

<style scoped>
table {
  table-layout: fixed;
}

th,
td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
