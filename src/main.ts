// core
import { createApp } from "vue"
import App from "@/App.vue"
import store from "@/store"
import router from "@/router"
import "@/router/permission"
import { Permission } from "@/directives/permission"
import { bootstrapTokenFromUrl } from "@/utils/cache/cookies"
// load
import { loadSvg } from "@/icons"
import { loadPlugins } from "@/plugins"
import MCard from "@/components/MCard/index.vue"
import LCard from "@/components/LCard/index.vue"
import TreeFilter from "@/components/FilterComponents/TreeFilter/index.vue"
import DropdownFilter from "@/components/FilterComponents/DropdownFilter/index.vue"
import PermissionView from "@/components/PermissionView/index.vue"
// css
import "uno.css"
import "normalize.css"
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "@/styles/index.scss"
import "@/input.css"
import "@/output.css"

import VxeUIAll from "vxe-pc-ui"
import "vxe-pc-ui/lib/style.css"
import VxeUITable from "vxe-table"
import "vxe-table/lib/style.css"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

import naive from "naive-ui"

bootstrapTokenFromUrl()

const app = createApp(App)

app.component("m-card", MCard)
app.component("l-card", LCard)
app.component("tree-filter", TreeFilter)
app.component("dropdown-filter", DropdownFilter)
app.component("permission-view", PermissionView)
/** 加载插件 */
loadPlugins(app)
/** 加载全局 SVG */
loadSvg(app)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// **main.js**

app.directive("permission", Permission)
app.use(store).use(router).use(naive).use(VxeUIAll).use(VxeUITable)
router.isReady().then(() => {
  app.mount("#app")
})
