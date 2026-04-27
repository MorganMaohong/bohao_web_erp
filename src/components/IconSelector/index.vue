<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue"
import { NPopover, NInput, NScrollbar, NGrid, NGridItem, NEmpty } from "naive-ui"
import SvgIcon from "@/components/SvgIcon/index.vue"
import MCard from "@/components/MCard/index.vue" // 请根据实际路径调整

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
})
const emit = defineEmits(["update:modelValue"])

const fontIconSearch = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const fontIconWidth = ref(0)
const inputRef = ref(null)
const popoverVisible = ref(false)
const list = ref<string[]>([])

// 获取图标列表
const getIconList = (): string[] => {
  const svgModules = import.meta.glob("@/icons/svg/*.svg")
  return Object.keys(svgModules).map((file) => {
    const fileName = file.split("/").pop()
    return fileName?.replace(".svg", "") || ""
  })
}

const onClearFontIcon = () => {
  emit("update:modelValue", "") // 清空用 emit
}

const onColClick = (iconName: string) => {
  emit("update:modelValue", iconName)
  popoverVisible.value = false
}

onMounted(() => {
  list.value = getIconList()
  nextTick(() => {
    if (inputRef.value) {
      fontIconWidth.value = inputRef.value.$el.offsetWidth
    }
  })
})
</script>

<template>
  <div class="icon-selector" style="width: 100%; height: 100%">
    <n-popover
      placement="bottom"
      trigger="hover"
      :show="popoverVisible"
      @update:show="popoverVisible = $event"
      :style="{ width: fontIconWidth + 'px' }"
    >
      <template #trigger>
        <n-input-group>
          <n-input-group-label>
            <SvgIcon :name="fontIconSearch" />
          </n-input-group-label>
          <n-input
            v-model:value="fontIconSearch"
            placeholder="请选择icon"
            clearable
            @clear="onClearFontIcon"
            ref="inputRef"
            @focus="popoverVisible = true"
            style="width: 100%"
          />
        </n-input-group>
      </template>
      <n-scrollbar style="max-height: 200px">
        <n-grid :cols="12" :x-gap="10" :y-gap="10">
          <n-grid-item
            v-for="(icon, index) in list"
            :key="index"
            @click="onColClick(icon)"
            style="text-align: center; cursor: pointer"
            class="m-1"
          >
            <m-card shadow border rounded :class="{ 'icon-selector-active': fontIconSearch === icon }">
              <SvgIcon :name="icon" />
            </m-card>
          </n-grid-item>
        </n-grid>
        <n-empty v-if="list.length === 0" description="无数据" />
      </n-scrollbar>
    </n-popover>
  </div>
</template>

<style scoped lang="scss">
.icon-selector-active {
  background-color: #36ad6a;
}
</style>
