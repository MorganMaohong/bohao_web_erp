<script lang="ts" setup>
import { ref, watch, onMounted, reactive } from "vue"
import { RouteRecordRaw, useRouter } from "vue-router"
import { useAppStore } from "@/store/modules/app"

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
onMounted(() => {
  routerRef.value = findRouteByPath(appStore.currentRootRoute, router.getRoutes())
})
</script>

<template>
  <iframe :src="routerRef.meta.link" />
</template>

<style lang="scss" scoped></style>
