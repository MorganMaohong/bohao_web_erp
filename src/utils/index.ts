import dayjs from "dayjs"
import { removeConfigLayout } from "@/utils/cache/local-storage"
import { v4 as uuidv4 } from "uuid"
import { permission } from "vxe-pc-ui"
import { isPermission } from "@/directives/permission"

/** 格式化时间 */
export const formatDateTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format("YYYY-MM-DD HH:mm:ss") : "N/A"
}

export const getUUID = () => {
  return uuidv4()
}

export const resetRef = (value: any): any => {
  if (Array.isArray(value)) {
    // 如果是数组，返回一个清空的数组
    return []
  } else if (typeof value === "object" && value !== null) {
    // 如果是对象，返回一个新的对象，递归清空每个属性
    const newObj: Record<string, any> = {}
    Object.keys(value).forEach((key) => {
      newObj[key] = resetRef(value[key]) // 递归清空每个属性
    })
    return newObj
  } else if (typeof value === "string") {
    // 如果是字符串，返回空字符串
    return null
  } else if (typeof value === "number") {
    // 如果是数字，返回 0
    return 0
  } else if (typeof value === "boolean") {
    // 如果是布尔值，返回 false
    return false
  } else {
    // 如果是其他类型，返回 null
    return null
  }
}

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ""
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  removeConfigLayout()
  location.reload()
}
