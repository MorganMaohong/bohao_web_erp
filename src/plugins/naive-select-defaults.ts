import { NSelect, NTreeSelect } from "naive-ui"
import type { App, Component, HTMLAttributes } from "vue"
import { defineComponent, h, mergeProps } from "vue"

export const NAIVE_SELECT_TO = "body"
export const NAIVE_SELECT_MENU_PROPS = { style: { maxHeight: "280px" } }

function mergeMenuProps(menuProps: unknown) {
  const user = (menuProps ?? {}) as Record<string, unknown>
  const userStyle = (user.style ?? {}) as HTMLAttributes["style"]
  return {
    ...NAIVE_SELECT_MENU_PROPS,
    ...user,
    style: {
      ...NAIVE_SELECT_MENU_PROPS.style,
      ...(typeof userStyle === "object" && userStyle ? userStyle : {})
    }
  }
}

function createSelectWrapper(Inner: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const menuProps = attrs.menuProps ?? attrs["menu-props"]
        return h(Inner, mergeProps({ to: NAIVE_SELECT_TO, menuProps: mergeMenuProps(menuProps) }, attrs), slots)
      }
    }
  })
}

/** 全局 n-select / n-tree-select 默认挂 body，并限制下拉菜单高度 */
export function loadNaiveSelectDefaults(app: App) {
  app.component("NSelect", createSelectWrapper(NSelect, "NSelect"))
  app.component("NTreeSelect", createSelectWrapper(NTreeSelect, "NTreeSelect"))
}
