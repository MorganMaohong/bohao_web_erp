<template>
  <div class="relative inline-block">
    <!-- 插槽内容 -->
    <slot />

    <!-- 右上角关闭图标 -->
    <!--    <button
      class="absolute -top-2 -right-2 bg-white rounded-full border border-gray-300 shadow text-gray-600 hover:bg-gray-100"
      @click="$emit('close')"
      :style="{
        width: size + 'px',
        height: size + 'px',
        fontSize: size * 0.6 + 'px',
        lineHeight: size + 'px'
      }"
    >
      X
    </button>-->
    <n-icon class="absolute -top-0 -right-0 z-40" size="24" color="red" v-if="prop.show" @click="$emit('close')">
      <Close />
    </n-icon>
  </div>
</template>

<script setup>
import { Close } from "@vicons/carbon"

const prop = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
defineEmits(["close"])
</script>

<style scoped>
button {
  cursor: pointer;
  padding: 0;
  text-align: center;
}
</style>
