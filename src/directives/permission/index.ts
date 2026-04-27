import { type Directive } from "vue"
import { useUserStore } from "@/store/modules/user"

export const Permission: Directive = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { roles, permissions } = userStore
    const value = binding.value
    if (value && Array.isArray(permissions)) {
      const hasPermission = permissions.includes(value)
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      console.warn("v-permission 指令需要传入权限码")
    }
  }
}

export const isPermission = (value: string) => {
  const { roles, permissions } = useUserStoreHook()
  if (value && Array.isArray(permissions)) {
    return permissions.includes(value)
  } else {
    console.warn("v-permission 指令需要传入权限码")
    return false
  }
}

export const hasPermission = (permission: string, fn?: () => void): boolean => {
  const { permissions } = useUserStoreHook()

  const ok = permission && Array.isArray(permissions) ? permissions.includes(permission) : false

  if (!permission) {
    console.warn("hasPermission 需要传入权限码")
  }

  // 如果传了函数，且有权限，就执行
  if (ok && typeof fn === "function") {
    fn()
  }

  return ok
}
