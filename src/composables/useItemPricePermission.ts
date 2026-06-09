import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useUserStore } from "@/store/modules/user"
import { templateItemsApi } from "@/services/api"
import { ItemPriceDto } from "@/model/itemPrice"

/** 物料价格查看权限码，与 templateItemsApi.price 保持一致 */
export const ITEM_PRICE_PERMISSION = templateItemsApi.price.permission

export function hasItemPricePermission(permissions: string[] = []) {
  return permissions.includes(ITEM_PRICE_PERMISSION)
}

/** 无价格权限时从提交数据中剔除价格字段，后端 write mask 为最终防线 */
export function omitItemPriceFields<T extends { price?: ItemPriceDto | null }>(form: T): T {
  const payload = { ...form }
  delete payload.price
  return payload
}

export function useItemPricePermission() {
  const userStore = useUserStore()
  const { permissions, userInfo } = storeToRefs(userStore)
  const canViewItemPrice = computed(() => {
    if (userInfo.value?.superAdmin) return true
    return hasItemPricePermission(permissions.value)
  })
  return { canViewItemPrice, itemPricePermission: ITEM_PRICE_PERMISSION }
}
