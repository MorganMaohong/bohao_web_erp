<script lang="ts" setup>
import { useLayoutMode } from "@/hooks/useLayoutMode"
import logo from "@/assets/favicon.ico"
// import logoText1 from "@/assets/layouts/logo-text-1.png?url"
// import logoText2 from "@/assets/layouts/logo-text-2.png?url"

interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: true
})

const { isLeft, isTop } = useLayoutMode()
</script>

<template>
  <div class="layout-logo-container" :class="{ collapse: props.collapse, 'layout-mode-top': isTop }">
    <transition name="layout-logo-fade">
      <router-link v-if="props.collapse" key="collapse" to="/">
        <img :src="logo" class="layout-logo" />
      </router-link>
      <router-link v-else key="expand" to="/">
        <img :src="!isLeft ? logo : logo" class="layout-logo-text" />
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.layout-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: center;
  overflow: hidden;
  .layout-logo {
    display: none;
  }
  .layout-logo-text {
    height: 100%;
    vertical-align: middle;
  }
}

// .layout-mode-top {
//   height: 30px;
//   line-height: 30px;
// }

.collapse {
  .layout-logo {
    // width: 100%;
    // height: 32px;
    vertical-align: middle;
    display: inline-block;
  }
  .layout-logo-text {
    display: none;
  }
}
</style>
