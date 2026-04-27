<script lang="ts" setup>
import { computed } from "vue"
import { type RouteRecordRaw } from "vue-router"
import SidebarItemLink from "./SidebarItemLink.vue"
import { isExternal } from "@/utils/validate"
import path from "path-browserify"

interface Props {
  item: RouteRecordRaw
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  basePath: ""
})

/** 显示的子菜单 */
const showingChildren = computed(() => {
  return props.item.children?.filter((child) => !child.meta?.hidden) ?? []
})

/** 解析路径 */
const resolvePath = (routePath: string) => {
  switch (true) {
    case isExternal(routePath):
      return routePath
    case isExternal(props.basePath):
      return props.basePath
    default:
      return path.resolve(props.basePath, routePath)
  }
}
</script>

<template>
  <!-- 始终显示根菜单，直接作为链接 -->
  <SidebarItemLink v-if="props.item.meta" :to="resolvePath(props.item.path)">
    <el-menu-item :index="resolvePath(props.item.path)">
      <SvgIcon v-if="props.item.meta.svgIcon" :name="props.item.meta.svgIcon" />
      <component v-else-if="props.item.meta.elIcon" :is="props.item.meta.elIcon" class="el-icon" />
      <template v-if="props.item.meta.title" #title>
        {{ props.item.meta.title }}
      </template>
    </el-menu-item>
  </SidebarItemLink>

  <!-- 如果有子菜单，继续显示子菜单项 -->
</template>

<style lang="scss" scoped>
.svg-icon {
  min-width: 1em;
  margin-right: 12px;
  font-size: 18px;
}

.el-icon {
  width: 1em !important;
  margin-right: 12px !important;
  font-size: 18px;
}
</style>
