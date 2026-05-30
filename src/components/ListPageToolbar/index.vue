<script lang="ts" setup>
import MCard from "@/components/MCard/index.vue"
import { SEARCH_BAR_CONTROL_CLASS } from "@/config/ui"
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    /** 工具栏内容对齐方式 */
    justify?: "between" | "end" | "start"
  }>(),
  {
    justify: "between"
  }
)

const justifyClass = computed(() => {
  if (props.justify === "end") return "justify-end"
  if (props.justify === "start") return "justify-start"
  return "justify-between"
})
</script>

<template>
  <m-card
    padding="0"
    class="px-2 pt-2 flex items-center gap-2 list-page-toolbar"
    :class="[SEARCH_BAR_CONTROL_CLASS, justifyClass]"
  >
    <slot />
  </m-card>
</template>
