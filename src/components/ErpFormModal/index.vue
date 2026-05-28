<script lang="ts" setup>
import { computed, useSlots } from "vue"

type ErpFormModalSize = "sm" | "md" | "lg" | "xl" | "xxl"

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    size?: ErpFormModalSize
    loading?: boolean
    maskClosable?: boolean
  }>(),
  {
    size: "md",
    loading: false,
    maskClosable: true
  }
)

const emit = defineEmits<{
  "update:show": [value: boolean]
}>()

const slots = useSlots()

const showModel = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value)
})

const modalClass = computed(() => ["ErpFormModal", `ErpFormModal--${props.size}`])
</script>

<template>
  <n-modal
    v-model:show="showModel"
    preset="card"
    :title="title"
    :mask-closable="maskClosable"
    :class="modalClass"
  >
    <div class="ErpFormModal__shell">
      <div class="ErpFormModal__body">
        <n-spin :show="loading">
          <slot />
        </n-spin>
      </div>
      <div v-if="slots.footer" class="ErpFormModal__footer">
        <slot name="footer" />
      </div>
    </div>
  </n-modal>
</template>
