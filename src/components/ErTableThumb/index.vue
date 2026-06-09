<script lang="ts" setup>
withDefaults(
  defineProps<{
    src?: string | null
    size?: number
    emptyText?: string
  }>(),
  {
    size: 48,
    emptyText: "—"
  }
)
</script>

<template>
  <img
    v-if="src"
    :src="src"
    loading="lazy"
    decoding="async"
    class="erp-table-thumb"
    :style="{ width: `${size}px`, height: `${size}px` }"
    alt=""
  />
  <span v-else class="erp-table-thumb-empty">{{ emptyText }}</span>
</template>

<style lang="scss" scoped>
.erp-table-thumb {
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  object-fit: cover;
}

.erp-table-thumb-empty {
  color: var(--n-text-color-3);
  font-size: 13px;
}
</style>
