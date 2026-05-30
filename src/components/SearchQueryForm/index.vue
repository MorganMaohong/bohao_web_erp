<script lang="ts" setup>
import { SEARCH_BAR_CONTROL_CLASS, SEARCH_BAR_SIZE } from "@/config/ui"
import type { FormInst } from "naive-ui"
import { computed, ref, useAttrs } from "vue"

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const formRef = ref<FormInst | null>(null)

const bindAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const formClass = computed(() => {
  const extra = attrs.class
  const base = ["NaiveForm", SEARCH_BAR_CONTROL_CLASS]
  if (!extra) return base
  return Array.isArray(extra) ? [...base, ...extra] : [...base, extra]
})

defineExpose({
  validate: (...args: Parameters<NonNullable<FormInst["validate"]>>) => formRef.value?.validate(...args),
  restoreValidation: () => formRef.value?.restoreValidation()
})
</script>

<template>
  <n-form ref="formRef" v-bind="bindAttrs" :class="formClass" :size="SEARCH_BAR_SIZE">
    <slot />
  </n-form>
</template>
