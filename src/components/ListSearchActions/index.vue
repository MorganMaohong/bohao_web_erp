<script lang="ts" setup>
import { ChevronDown, ChevronUp, Reset } from "@vicons/carbon"

withDefaults(
  defineProps<{
    showAdvancedFilter?: boolean
    advancedFilterCount?: number
    /** 是否展示「更多」按钮；字段不超过三行时可关闭 */
    showMore?: boolean
  }>(),
  {
    showAdvancedFilter: false,
    advancedFilterCount: 0,
    showMore: false
  }
)

const emit = defineEmits<{
  reset: []
  "toggle-advanced": []
}>()
</script>

<template>
  <div class="list-search-actions">
    <n-button type="info" secondary @click="emit('reset')">
      <template #icon>
        <n-icon :component="Reset" />
      </template>
      重置
    </n-button>
    <n-badge
      v-if="showMore"
      :value="advancedFilterCount"
      :show="advancedFilterCount > 0 && !showAdvancedFilter"
      type="info"
    >
      <n-button secondary @click="emit('toggle-advanced')">
        <template #icon>
          <n-icon :component="showAdvancedFilter ? ChevronUp : ChevronDown" />
        </template>
        {{ showAdvancedFilter ? "收起" : "更多" }}
      </n-button>
    </n-badge>
  </div>
</template>

<style scoped>
.list-search-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
