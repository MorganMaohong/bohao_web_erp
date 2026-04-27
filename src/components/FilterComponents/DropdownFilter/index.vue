<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue"
import CommonFilterWrapper from "@/components/FilterComponents/CommonFilterWrapper/index.vue"
import { FilterAltFilled } from "@vicons/material"
import { NIcon } from "naive-ui"

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: [String, Array], default: null },
  options: { type: Array, required: true },
  keyField: { type: String, required: false, default: "value" },
  labelField: { type: String, required: false, default: "label" },
  multiple: { type: Boolean, required: false, default: false }
})
const emit = defineEmits(["update:modelValue"])
const value = ref(props.modelValue)
// 监听 modelValue 变化并更新 value
watch(
  () => props.modelValue,
  (newValue) => {
    value.value = newValue
  }
)
</script>

<template>
  <div class="flex justify-center gap-0.5 cursor-pointer">
    <div>{{ label }}</div>
    <n-dropdown
      trigger="hover"
      :key-field="keyField"
      :label-field="labelField"
      class="max-w-[14rem]"
      :options="options"
      v-model:value="value"
      multiple
      @select="
        (v: string) => {
          value = v
          emit('update:modelValue', v)
        }
      "
    >
      <n-icon size="20">
        <FilterAltFilled />
      </n-icon>
    </n-dropdown>
  </div>
</template>
