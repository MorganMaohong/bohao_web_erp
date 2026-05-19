<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { RouteRecordRaw, useRouter } from "vue-router"
import { useAppStore } from "@/store/modules/app"
import { appendAccessTokenToUrl } from "@/utils/system-link"

const router = useRouter()

const appStore = useAppStore()

function findRouteByPath(path: string, routes: RouteRecordRaw[]): RouteRecordRaw | undefined {
  for (const route of routes) {
    if (path === route.path) {
      return route
    }

    if (route.children) {
      const matchedChild = findRouteByPath(path, route.children)
      if (matchedChild) {
        return matchedChild
      }
    }
  }
  return undefined
}

const routerRef = ref<RouteRecordRaw>({ meta: { link: "" } })
const iframeSrc = ref("")
onMounted(() => {
  routerRef.value = findRouteByPath(appStore.currentRootRoute, router.getRoutes())
  iframeSrc.value = appendAccessTokenToUrl(String(routerRef.value?.meta?.link || ""))
})
</script>

<template>
  <iframe :src="iframeSrc" />
</template>

<style lang="scss" scoped></style>
