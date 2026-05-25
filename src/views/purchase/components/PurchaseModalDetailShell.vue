<script lang="ts" setup>
defineProps<{
  loading?: boolean
}>()
</script>

<template>
  <n-spin :show="!!loading">
    <div class="TemplateModal__split" :class="{ 'TemplateModal__split--solo': !$slots.side }">
      <div class="TemplateModal__split-main TemplateModal__sections">
        <slot />
      </div>
      <div v-if="$slots.side" class="TemplateModal__split-side">
        <slot name="side" />
      </div>
    </div>
  </n-spin>
</template>
