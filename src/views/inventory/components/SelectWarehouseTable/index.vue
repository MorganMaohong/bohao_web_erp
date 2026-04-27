<script setup lang="ts">
import { PropType } from "vue"
import { PageVo } from "@/model"
import { WarehouseVo } from "@/model/stock"
import { useAppStore } from "@/store/modules/app"

const appStore = useAppStore()

defineProps<{
  data: any
  loading: boolean
  value?: string | null
}>()

const emit = defineEmits(["update:value", "cellClick", "pageChange"])

const handleClick = (row: WarehouseVo) => {
  emit("cellClick", row)
}
</script>

<template>
  <l-card class="w-full h-full" border shadow rounded padding="0">
    <vxe-table
      :data="data.list"
      :loading="loading"
      border
      stripe
      :row-config="{ isHover: true }"
      :size="appStore.componentSize"
      @cell-click="({ row }) => handleClick(row)"
    >
      <vxe-column width="40" align="center">
        <template #default="{ row }">
          <n-radio :checked="row.uid === value" @click.stop />
        </template>
      </vxe-column>

      <vxe-column field="code" title="编号" align="center" width="20%" show-overflow="tooltip" />
      <vxe-column field="name" title="名称" align="center" width="30%" show-overflow="tooltip" />
      <vxe-column field="address" title="地址" align="center" width="50%" show-overflow="tooltip" />
    </vxe-table>

    <template #footer>
      <m-card class="w-full h-full flex items-center justify-end">
        <vxe-pager
          :size="size"
          v-model:currentPage="data.currentPage"
          v-model:pageSize="data.pageSize"
          :total="data.count"
          :layouts="[
            'Home',
            'PrevJump',
            'PrevPage',
            'Number',
            'NextPage',
            'NextJump',
            'End',
            'Sizes',
            'FullJump',
            'Total'
          ]"
          @page-change="emit('pageChange', $event)"
        />
      </m-card>
    </template>
  </l-card>
</template>
