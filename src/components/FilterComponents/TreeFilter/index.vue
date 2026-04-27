<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue"
import CommonFilterWrapper from "@/components/FilterComponents/CommonFilterWrapper/index.vue"

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: [String, Array], default: null },
  options: { type: Array, required: true },
  checkable: { type: Boolean, default: false },
  defaultExpandAll: { type: Boolean, default: false },
  keyField: { type: String, required: false, default: "value" },
  labelField: { type: String, required: false, default: "label" },
  maxHeight: { type: Number, required: false, default: 200 }
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
  <CommonFilterWrapper :label="label">
    <template #default="{ closeFilter }">
      <n-scrollbar :style="{ maxHeight: `${maxHeight}px` }">
        <n-tree
          :key-field="keyField"
          :label-field="labelField"
          :data="options"
          check-on-click
          checkable
          block-line
          block-node
          :default-expand-all="defaultExpandAll"
          :checked-keys="value"
          @update-checked-keys="
            (v: string[]) => {
              emit('update:modelValue', v)
            }
          "
        />
      </n-scrollbar>
    </template>
  </CommonFilterWrapper>
</template>
