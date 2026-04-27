<script lang="ts" setup>
import { ref, watch, onMounted, reactive, computed } from "vue"
import { useUserStore } from "@/store/modules/user"

const props = defineProps({
  permission: {
    type: String,
    required: true
  }
})
const userStore = useUserStore()
const permissions = userStore.permissions
const hasPermission = computed(() => permissions.includes(props.permission))
</script>

<template>
  <slot v-if="hasPermission" name="success" />
  <div class="w-full h-full flex justify-center items-center" v-else>
    <slot name="fail" />
  </div>
</template>

<style lang="scss" scoped></style>
