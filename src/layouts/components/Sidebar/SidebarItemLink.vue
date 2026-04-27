<script lang="ts" setup>
import { isExternal } from "@/utils/validate"
import { onMounted } from "vue"

interface Props {
  to: string
}
onMounted(() => {
  console.log("sidebarItemLink->", props)
})
const props = defineProps<Props>()
</script>

<template>
  <a v-if="isExternal(props.to)" :href="props.to" target="_blank" rel="noopener">
    <slot />
  </a>
  <router-link v-else :to="props.to">
    <slot />
  </router-link>
</template>
