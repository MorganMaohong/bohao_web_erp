<script lang="ts" setup>
import { computed, defineProps, defineEmits, onMounted, ref, watch, nextTick } from "vue"
import { TabOption } from "@/components/Tabs/ts"

const props = defineProps<{
  value: string | number
  options: any[]
  labelField?: string
  valueField?: string
}>()

const emit = defineEmits<{
  (e: "update:value", value: string | number): void
}>()

const labelKey = props.labelField || "label"
const valueKey = props.valueField || "value"

const active = computed({
  get: () => props.value,
  set: (val) => emit("update:value", val)
})

// 处理下划线动画
const tabContainerRef = ref<HTMLElement | null>(null)
const activeBarStyle = ref({
  width: "0px",
  transform: "translateX(0px)"
})

// 更新下划线位置
const updateActiveBar = () => {
  nextTick(() => {
    const container = tabContainerRef.value
    if (!container) return
    const tabEls = container.querySelectorAll<HTMLElement>(".tab-item")
    const index = props.options.findIndex((item) => item[valueKey] === props.value)
    const target = tabEls[index]
    if (target) {
      activeBarStyle.value = {
        width: `${target.offsetWidth}px`,
        transform: `translateX(${target.offsetLeft}px)`
      }
    }
  })
}

// 初次加载 + 切换时更新动画位置
onMounted(updateActiveBar)
watch(() => props.value, updateActiveBar)
</script>

<template>
  <div class="tab-bar-scroll">
    <div class="tab-bar" ref="tabContainerRef">
      <div
        v-for="tab in options"
        :key="tab[valueKey]"
        :class="['tab-item', { active: tab[valueKey] === active }]"
        @click="active = tab[valueKey]"
      >
        {{ tab[labelKey] }}
      </div>
      <div class="active-bar" :style="activeBarStyle" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.tab-bar-scroll {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-bar {
  display: inline-flex;
  position: relative;
  border-bottom: 1px solid #ddd;
  min-width: 100%;
}

.tab-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: #666;
  white-space: nowrap;
  position: relative;

  &.active {
    color: #42b983;
    font-weight: bold;
  }

  &:hover {
    background: #f0f0f0;
  }
}

.active-bar {
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: #42b983;
  transition:
    transform 0.3s ease,
    width 0.3s ease;
}
</style>
