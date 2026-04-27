<script setup lang="ts">
import { ref } from "vue"
import { NPopover, NIcon } from "naive-ui"
import { FilterAltFilled } from "@vicons/material"

defineProps({
  label: { type: String, required: true } // 表头名称
})

const showFilter = ref(false)
</script>

<template>
  <div class="flex justify-center gap-0.5">
    <div>{{ label }}</div>
    <div class="cursor-pointer">
      <n-popover trigger="click" placement="bottom-start" v-model:show="showFilter" :show-arrow="false">
        <template #trigger>
          <n-icon size="20" @click="showFilter = !showFilter">
            <FilterAltFilled />
          </n-icon>
        </template>

        <slot :closeFilter="() => (showFilter = false)" />
      </n-popover>
    </div>
  </div>
</template>
