<script lang="ts" setup>
import { computed, h, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { AddPhotoAlternateRound } from "@vicons/material"
import { NButton } from "naive-ui"
import { useAppStore } from "@/store/modules/app"
import LCard from "@/components/LCard/index.vue"
import MCard from "@/components/MCard/index.vue"
import FastUpload from "@/components/FastUpload/FastUpload.vue"
import FlowSchemaPreview from "@/components/FlowSchemaPreview/index.vue"
import { PageVo } from "@/model"
import { resetRef } from "@/utils"
import { formatDateTime } from "@/utils"
import {
  ProductionPlanBomItem,
  ProductionPlanCloseForm,
  ProductionPlanDetail,
  ProductionPlanFinishDetailItem,
  ProductionPlanFinishInboundForm,
  ProductionPlanForm,
  ProductionPlanIssueDetailItem,
  ProductionPlanIssueForm,
  ProductionPlanProcessForm,
  ProductionPlanProcessNodeCompleteForm,
  ProductionPlanProductItem,
  ProductionPlanQuery
} from "@/model/product"
import { ProductionPlanService } from "@/services/product/ProductionPlanService"
import { ItemsService } from "@/services/template/ItemsService"
import { ItemsVo } from "@/model/template/items"
import { WarehouseService } from "@/services/template/WarehouseService"
import { WarehouseQuery, WarehouseVo } from "@/model/stock"
import { FlowDefinitionTypeOptions } from "@/constants/flow"

const appStore = useAppStore()
const loading = ref(false)
const submitting = ref(false)
const query = ref<ProductionPlanQuery>({ currentPage: 1, pageSize: 50, key: "" })
const data = ref<PageVo<ProductionPlanDetail, void>>({})
const showEdit = ref(false)
const showDetail = ref(false)
const showPrepare = ref(false)
const showIssue = ref(false)
const showProcess = ref(false)
const showCompleteNode = ref(false)
const showInbound = ref(false)
const showClose = ref(false)
const currentPlanUid = ref("")
const formData = ref<ProductionPlanForm>({ imageList: [], docList: [], productList: [], productOptions: [], warehouseOptions: [] })
const detailData = ref<ProductionPlanDetail>({})
const prepareData = ref<ProductionPlanDetail>({})
const issueData = ref<ProductionPlanIssueForm>({ detailList: [], bomList: [] })
const processData = ref<ProductionPlanProcessForm>({ processList: [] })
const completeNodeForm = ref<ProductionPlanProcessNodeCompleteForm>({ imageList: [] })
const inboundData = ref<ProductionPlanFinishInboundForm>({ detailList: [], productList: [] })
const closeData = ref<ProductionPlanCloseForm>({})
const itemsData = ref<PageVo<ItemsVo, void>>({})
const componentData = ref<PageVo<ItemsVo, void>>({})
const warehouseData = ref<PageVo<WarehouseVo, void>>({})
const currentProcessUid = ref("")

const productOptions = computed(() =>
  (itemsData.value.list || []).map((item) => ({
    label: item.name,
    value: item.uid
  }))
)

const prepareProductOptions = computed(() =>
  (prepareData.value.productList || []).map((item) => ({
    label: formatItemLabel(item.name, item.spec),
    value: item.itemUid
  }))
)

const componentOptions = computed(() =>
  (componentData.value.list || []).map((item) => ({
    label: formatItemLabel(item.name, item.spec),
    value: item.uid
  }))
)

const warehouseOptions = computed(() =>
  (warehouseData.value.list || []).map((item) => ({
    label: item.name,
    value: item.uid
  }))
)

const planFormReadonly = computed(() => Boolean(currentPlanUid.value) && formData.value.canEditPlan === false)

const canConfirmIssue = computed(() =>
  (issueData.value.detailList || []).length > 0 &&
  (issueData.value.detailList || []).every((item) => Number(item.availableQuantity) <= 0)
)

const componentMap = computed<Record<string, ItemsVo>>(() =>
  Object.fromEntries((componentData.value.list || []).filter((item) => item.uid).map((item) => [item.uid as string, item]))
)

function loadBaseOptions() {
  return Promise.all([
    ItemsService.select({ currentPage: 1, pageSize: 500, itemBizType: "finished_product" }),
    ItemsService.select({ currentPage: 1, pageSize: 500, itemBizType: "component" }),
    WarehouseService.select({ currentPage: 1, pageSize: 500 } as WarehouseQuery)
  ]).then(([itemsRes, componentRes, warehouseRes]) => {
    itemsData.value = itemsRes
    componentData.value = componentRes
    warehouseData.value = warehouseRes
  })
}

function formatItemLabel(name?: string, spec?: string) {
  if (!name) return ""
  return spec ? `${name} / ${spec}` : name
}

function formatTimeText(time?: number) {
  return time ? formatDateTime(time) : "-"
}

function formatDurationText(start?: number, end?: number) {
  if (!start || !end || end <= start) return "-"
  const totalMinutes = Math.floor((end - start) / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  return parts.length ? parts.join("") : "0分钟"
}

function formatNodeDurationText(durationValue?: number, durationUnit?: string) {
  if (!durationValue || durationValue <= 0) return "-"
  if (durationUnit === "day") return `${durationValue}天`
  return `${durationValue}小时`
}

function select() {
  loading.value = true
  ProductionPlanService.select(query.value)
    .then((res) => {
      data.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function search() {
  query.value.currentPage = 1
  select()
}

function reset() {
  query.value = resetRef(query.value)
  query.value.currentPage = 1
  query.value.pageSize = 50
  select()
}

function openEdit(uid?: string) {
  currentPlanUid.value = uid || ""
  showEdit.value = true
  submitting.value = true
  Promise.all([ProductionPlanService.form(uid), loadBaseOptions()])
    .then(([res]) => {
      formData.value = {
        ...res,
        imageList: res.imageList || [],
        docList: res.docList || [],
        productList: res.productList || [],
        productOptions: productOptions.value,
        warehouseOptions: warehouseOptions.value
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

function openDetail(uid?: string) {
  if (!uid) return
  currentPlanUid.value = uid
  showDetail.value = true
  loading.value = true
  ProductionPlanService.detail(uid)
    .then((res) => {
      detailData.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

function addProduct() {
  formData.value.productList = formData.value.productList || []
  formData.value.productList.push({ quantity: 1 })
}

function removeProduct(index: number) {
  formData.value.productList?.splice(index, 1)
}

function handleProductChange(item: ProductionPlanProductItem) {
  const source = (itemsData.value.list || []).find((v) => v.uid === item.itemUid)
  item.name = source?.name
  item.image = source?.image
  item.unit = source?.unit
  item.unitName = source?.unitName
  item.type = source?.type
  item.typeName = source?.typeName
  item.spec = source?.spec
  item.material = source?.material
  item.itemBizType = source?.itemBizType
  item.itemBizTypeName = source?.itemBizTypeName
}

function pushImage(url: string) {
  formData.value.imageList = formData.value.imageList || []
  formData.value.imageList.push(url)
}

function pushDoc(url: string) {
  formData.value.docList = formData.value.docList || []
  formData.value.docList.push(url)
}

function submitPlan() {
  if (!formData.value.name) {
    window.$message?.error("请输入计划名称")
    return
  }
  if (!formData.value.startTime || !formData.value.planCompleteTime) {
    window.$message?.error("请选择计划时间")
    return
  }
  if (!formData.value.productList?.length) {
    window.$message?.error("请至少选择一个成品")
    return
  }
  for (const item of formData.value.productList) {
    if (!item.itemUid || !item.warehouseUid || !item.quantity || Number(item.quantity) <= 0) {
      window.$message?.error("请完整填写成品信息")
      return
    }
  }
  submitting.value = true
  ProductionPlanService.addOrUpdate(formData.value)
    .then(() => {
      showEdit.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function openPrepare(uid?: string) {
  if (!uid) return
  currentPlanUid.value = uid
  showPrepare.value = true
  submitting.value = true
  Promise.all([ProductionPlanService.prepareForm(uid), loadBaseOptions()])
    .then(([res]) => {
      prepareData.value = { ...res, bomList: res.bomList || [] }
    })
    .finally(() => {
      submitting.value = false
    })
}

function addPrepareBom() {
  const defaultProductUid = prepareData.value.productList?.[0]?.itemUid
  prepareData.value.bomList = prepareData.value.bomList || []
  const row: ProductionPlanBomItem = {
    uid: `tmp_${Date.now()}_${prepareData.value.bomList.length}`,
    productItemUid: defaultProductUid,
    perQuantity: 1
  }
  if (defaultProductUid) {
    fillPrepareProductMeta(row)
  }
  prepareData.value.bomList.push(row)
}

function removePrepareBom(index: number) {
  prepareData.value.bomList?.splice(index, 1)
}

function fillPrepareProductMeta(item: ProductionPlanBomItem) {
  const product = (prepareData.value.productList || []).find((v) => v.itemUid === item.productItemUid)
  item.productName = product?.name
  item.productImage = product?.image
  item.productType = product?.type
  item.productTypeName = product?.typeName
  item.productSpec = product?.spec
  item.productMaterial = product?.material
  item.productItemBizType = product?.itemBizType
  item.productItemBizTypeName = product?.itemBizTypeName
  item.requiredQuantity = (Number(product?.quantity || 0) * Number(item.perQuantity || 0)) || 0
}

function fillPrepareComponentMeta(item: ProductionPlanBomItem) {
  const component = componentMap.value[item.componentItemUid || ""]
  item.componentName = component?.name
  item.componentImage = component?.image
  item.componentType = component?.type
  item.componentTypeName = component?.typeName
  item.componentSpec = component?.spec
  item.componentMaterial = component?.material
  item.componentItemBizType = component?.itemBizType
  item.componentItemBizTypeName = component?.itemBizTypeName
  item.unit = component?.unit
  item.unitName = component?.unitName
}

function handlePrepareProductChange(item: ProductionPlanBomItem) {
  fillPrepareProductMeta(item)
}

function handlePrepareComponentChange(item: ProductionPlanBomItem) {
  fillPrepareComponentMeta(item)
}

function handlePreparePerQuantityChange(item: ProductionPlanBomItem) {
  fillPrepareProductMeta(item)
}

function savePrepare() {
  const bomList = prepareData.value.bomList || []
  if (!bomList.length) {
    window.$message?.error("请至少维护一条 BOM")
    return
  }
  for (const item of bomList) {
    if (!item.productItemUid || !item.componentItemUid || !item.perQuantity || Number(item.perQuantity) <= 0) {
      window.$message?.error("请完整填写备料 BOM 信息")
      return
    }
  }
  submitting.value = true
  ProductionPlanService.prepareUpdate(prepareData.value)
    .then(() => {
      showPrepare.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function confirmPrepare(uid?: string) {
  if (!uid) return
  submitting.value = true
  ProductionPlanService.prepareConfirm(uid)
    .then(() => {
      select()
      openDetail(uid)
    })
    .finally(() => {
      submitting.value = false
    })
}

function openIssue(uid?: string) {
  if (!uid) return
  currentPlanUid.value = uid
  showIssue.value = true
  submitting.value = true
  ProductionPlanService.issueForm(uid)
    .then((res) => {
      issueData.value = {
        ...res,
        detailList: (res.bomList || []).map((item) => ({
          bomUid: item.uid,
          componentItemUid: item.componentItemUid,
          componentName: item.componentName,
          componentImage: item.componentImage,
          componentSpec: item.componentSpec,
          componentMaterial: item.componentMaterial,
          componentTypeName: item.componentTypeName || item.componentItemBizTypeName,
          availableQuantity: item.availableQuantity,
          requiredQuantity: item.requiredQuantity,
          issuedQuantity: item.issuedQuantity,
          quantity: 0
        }))
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

function submitIssue() {
  const detailList = (issueData.value.detailList || []).filter((item) => Number(item.quantity) > 0)
  if (!detailList.length) {
    window.$message?.error("请至少填写一条领料数量")
    return
  }
  for (const item of detailList) {
    const max = Number(item.availableQuantity) || 0
    const qty = Number(item.quantity) || 0
    if (qty > max) {
      window.$message?.error(`【${item.componentName || "物料"}】领料数量超出剩余可领数量`)
      return
    }
  }
  issueData.value.detailList = detailList
  submitting.value = true
  ProductionPlanService.issue(issueData.value)
    .then(() => {
      showIssue.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function fillAllIssueQuantity() {
  issueData.value.detailList = (issueData.value.detailList || []).map((item) => ({
    ...item,
    quantity: Number(item.availableQuantity) || 0
  }))
}

function fillIssueRowQuantity(item: ProductionPlanIssueDetailItem) {
  item.quantity = Number(item.availableQuantity) || 0
}

function confirmIssue(uid?: string) {
  if (!uid) return
  submitting.value = true
  ProductionPlanService.issueConfirm(uid)
    .then(() => {
      select()
      openDetail(uid)
    })
    .finally(() => {
      submitting.value = false
    })
}

function openProcess(uid?: string, processItem?: ProductionPlanProcessForm) {
  if (!uid) return
  currentPlanUid.value = uid
  currentProcessUid.value = processItem?.uid || ""
  showProcess.value = true
  submitting.value = true
  Promise.all([ProductionPlanService.processForm(uid), ProductionPlanService.detail(uid)])
    .then(([res, detail]) => {
      const allocatedMap: Record<string, number> = {}
      ;(res.processList || []).forEach((item) => {
        if (!item.productItemUid) return
        if (processItem?.uid && item.uid === processItem.uid) return
        allocatedMap[item.productItemUid] = (allocatedMap[item.productItemUid] || 0) + Number(item.quantity || 0)
      })
      const remainingQuantityMap = Object.fromEntries(
        (detail.productList || []).map((item) => [
          item.itemUid || "",
          Math.max(Number(item.quantity || 0) - Number(allocatedMap[item.itemUid || ""] || 0), 0)
        ])
      )
      processData.value = {
        ...res,
        ...(processItem || {}),
        uid: processItem?.uid,
        remainingQuantityMap,
        processList: res.processList || [],
        productOptions: res.productOptions || [],
        templateOptions: res.templateOptions || []
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

function submitProcess(uid?: string) {
  const targetUid = uid || currentPlanUid.value
  if (!targetUid) return
  if (!processData.value.productItemUid || !processData.value.templateUid || !processData.value.quantity) {
    window.$message?.error("请完整填写工序信息")
    return
  }
  submitting.value = true
  const action = currentProcessUid.value
    ? ProductionPlanService.processUpdate(targetUid, processData.value)
    : ProductionPlanService.processAdd(targetUid, processData.value)
  action
    .then(() => {
      showProcess.value = false
      currentProcessUid.value = ""
      select()
      openDetail(targetUid)
    })
    .finally(() => {
      submitting.value = false
    })
}

function editProcessItem(uid: string, item: any) {
  currentProcessUid.value = item.uid || ""
  openProcess(uid, item)
}

function openCompleteNode(processUid?: string, nodeUid?: string) {
  if (!processUid || !nodeUid) return
  currentProcessUid.value = processUid
  completeNodeForm.value = { uid: nodeUid, imageList: [] }
  showCompleteNode.value = true
}

function pushCompleteImage(url: string) {
  completeNodeForm.value.imageList = completeNodeForm.value.imageList || []
  completeNodeForm.value.imageList.push(url)
}

function submitCompleteNode(uid?: string) {
  if (!uid || !completeNodeForm.value.uid) return
  submitting.value = true
  ProductionPlanService.processNodeComplete(uid, completeNodeForm.value)
    .then(() => {
      showCompleteNode.value = false
      openDetail(uid)
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function reworkNode(uid?: string, processUid?: string, nodeUid?: string) {
  if (!uid || !processUid || !nodeUid) return
  submitting.value = true
  ProductionPlanService.processNodeRework(uid, processUid, nodeUid)
    .then(() => {
      openDetail(uid)
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function confirmProcess(uid?: string) {
  if (!uid) return
  submitting.value = true
  ProductionPlanService.processConfirmComplete(uid)
    .then(() => {
      openDetail(uid)
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function deleteProcess(uid?: string, processUid?: string) {
  if (!uid || !processUid) return
  submitting.value = true
  ProductionPlanService.processDelete(uid, processUid)
    .then(() => {
      openDetail(uid)
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function openClose(uid?: string) {
  if (!uid) return
  closeData.value = { uid, closeReason: "" }
  showClose.value = true
}

function submitClose() {
  if (!closeData.value.uid) return
  if (!closeData.value.closeReason?.trim()) {
    window.$message?.error("请填写关闭原因")
    return
  }
  submitting.value = true
  ProductionPlanService.close({
    uid: closeData.value.uid,
    closeReason: closeData.value.closeReason.trim()
  })
    .then(() => {
      showClose.value = false
      showDetail.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function deletePlan(uid?: string) {
  if (!uid) return
  const execDelete = () => {
    submitting.value = true
    ProductionPlanService.delete(uid)
      .then(() => {
        showDetail.value = false
        showEdit.value = false
        select()
      })
      .finally(() => {
        submitting.value = false
      })
  }
  if (window.confirm("删除后将无法恢复。仅已关闭的计划允许删除，确定继续吗？")) {
    execDelete()
  }
}

function openInbound(uid?: string) {
  if (!uid) return
  currentPlanUid.value = uid
  showInbound.value = true
  submitting.value = true
  Promise.all([ProductionPlanService.finishInboundForm(uid), loadBaseOptions()])
    .then(([res]) => {
      inboundData.value = {
        ...res,
        detailList: (res.productList || []).map((item) => ({
          productItemUid: item.itemUid,
          productName: item.name,
          productImage: item.image,
          productSpec: item.spec,
          productMaterial: item.material,
          productTypeName: item.typeName || item.itemBizTypeName,
          planQuantity: item.quantity,
          inboundQuantity: item.inboundQuantity,
          availableInboundQuantity: Math.max(Number(item.quantity || 0) - Number(item.inboundQuantity || 0), 0),
          warehouseUid: item.warehouseUid,
          warehouseName: item.warehouseName,
          quantity: 0
        }))
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

function submitInbound() {
  const detailList = (inboundData.value.detailList || []).filter((item) => Number(item.quantity) > 0)
  if (!detailList.length) {
    window.$message?.error("请至少填写一条入库数量")
    return
  }
  for (const item of detailList) {
    const qty = Number(item.quantity) || 0
    const max = Number(item.availableInboundQuantity) || 0
    if (qty > max) {
      window.$message?.error(`【${item.productName || "成品"}】入库数量不能超过剩余可入库数量`)
      return
    }
  }
  inboundData.value.detailList = detailList
  submitting.value = true
  ProductionPlanService.finishInbound(inboundData.value)
    .then(() => {
      showInbound.value = false
      select()
    })
    .finally(() => {
      submitting.value = false
    })
}

function fillAllInboundQuantity() {
  inboundData.value.detailList = (inboundData.value.detailList || []).map((item) => ({
    ...item,
    quantity: Number(item.availableInboundQuantity) || 0
  }))
}

function fillInboundRowQuantity(item: ProductionPlanFinishDetailItem) {
  item.quantity = Number(item.availableInboundQuantity) || 0
}

function stageActionLabel(plan?: ProductionPlanDetail) {
  switch (plan?.currentStage) {
    case "prepare":
      return "进入备料"
    case "issue":
      return "进入领料"
    case "process":
      return "进入工序"
    case "inbound":
      return "进入入库"
    default:
      return ""
  }
}

function openCurrentStage(plan?: ProductionPlanDetail) {
  if (!plan?.uid) return
  switch (plan.currentStage) {
    case "prepare":
      openPrepare(plan.uid)
      break
    case "issue":
      openIssue(plan.uid)
      break
    case "process":
      openProcess(plan.uid)
      break
    case "inbound":
      openInbound(plan.uid)
      break
    default:
      break
  }
}

function stageCardType(item?: { completed?: boolean; current?: boolean }) {
  if (item?.completed) return "success"
  if (item?.current) return "warning"
  return "default"
}

const columns = [
  { title: "计划名称", key: "name" },
  { title: "审批状态", key: "statusName" },
  { title: "当前阶段", key: "currentStageName" },
  { title: "当前节点", key: "currentNodeName" },
  {
    title: "操作",
    key: "actions",
    render: (row: ProductionPlanDetail) =>
      h("div", { class: "flex gap-2 flex-wrap" }, [
        h(NButton, { size: "small", type: "primary", onClick: () => openDetail(row.uid) }, { default: () => "详情" }),
        row.canEditPlan ? h(NButton, { size: "small", onClick: () => openEdit(row.uid) }, { default: () => "编辑" }) : null,
        row.status === "completed" && !row.inboundCompleted
          ? h(NButton, { size: "small", type: "error", tertiary: true, onClick: () => openClose(row.uid) }, { default: () => "关闭" })
          : null,
        row.status === "closed"
          ? h(NButton, { size: "small", type: "error", onClick: () => deletePlan(row.uid) }, { default: () => "删除" })
          : null,
        row.currentStage && row.currentStage !== "approve"
          ? h(NButton, { size: "small", type: "warning", onClick: () => openCurrentStage(row) }, { default: () => stageActionLabel(row) })
          : null
      ])
  }
]

onMounted(() => {
  select()
  loadBaseOptions()
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <n-form label-placement="left" :size="appStore.componentSize" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="计划:">
                  <n-input v-model:value="query.key" clearable />
                </n-form-item>
              </n-gi>
              <n-gi span="3">
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button type="info" secondary strong @click="search">
                      <template #icon><n-icon><Search /></n-icon></template>
                      搜索
                    </n-button>
                    <n-button type="tertiary" secondary strong @click="reset">
                      <template #icon><n-icon><Reset /></n-icon></template>
                      重置
                    </n-button>
                    <n-button type="primary" @click="openEdit()">新增计划</n-button>
                  </div>
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-form>
        </m-card>
      </template>
      <template #default>
        <m-card class="h-full overflow-auto">
          <n-data-table :columns="columns" :data="data.list || []" :loading="loading" />
        </m-card>
      </template>
    </l-card>

    <n-modal v-model:show="showEdit" preset="card" title="生产计划" class="w-[1200px] max-w-[96vw]">
      <div class="space-y-4">
        <n-alert v-if="planFormReadonly" type="warning" show-icon>
          当前生产计划已进入审批完成后的执行阶段，不允许继续修改计划基础信息。如需处理错误，请先走关闭计划后再删除的业务流程。
        </n-alert>
        <n-grid :cols="2" x-gap="12">
          <n-gi>
            <n-form-item label="名称"><n-input v-model:value="formData.name" :disabled="planFormReadonly" /></n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="备注"><n-input v-model:value="formData.remark" :disabled="planFormReadonly" /></n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="开工时间"><n-date-picker v-model:value="formData.startTime" type="datetime" class="w-full" :disabled="planFormReadonly" /></n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="计划完成"><n-date-picker v-model:value="formData.planCompleteTime" type="datetime" class="w-full" :disabled="planFormReadonly" /></n-form-item>
          </n-gi>
        </n-grid>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="mb-2 text-sm text-gray-500">图片</div>
            <div class="flex gap-2 flex-wrap">
              <n-image v-for="(item, index) in formData.imageList || []" :key="index" :src="item" class="w-16 h-16" />
              <FastUpload v-if="!planFormReadonly" @before-upload="pushImage">
                <n-button tertiary>
                  <template #icon><n-icon><AddPhotoAlternateRound /></n-icon></template>
                  上传图片
                </n-button>
              </FastUpload>
            </div>
          </div>
          <div>
            <div class="mb-2 text-sm text-gray-500">文档</div>
            <div class="flex gap-2 flex-wrap">
              <n-tag v-for="(item, index) in formData.docList || []" :key="index">{{ item }}</n-tag>
              <FastUpload v-if="!planFormReadonly" upload-type="document" @before-upload="pushDoc">
                <n-button tertiary>上传文档</n-button>
              </FastUpload>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">成品列表</div>
          <n-button v-if="!planFormReadonly" type="primary" @click="addProduct">新增成品</n-button>
        </div>
        <n-table striped size="small">
          <thead>
            <tr>
              <th>成品</th>
              <th>仓库</th>
              <th>数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.productList || []" :key="index">
              <td><n-select v-model:value="item.itemUid" :options="productOptions" filterable :disabled="planFormReadonly" @update:value="handleProductChange(item)" /></td>
              <td><n-select v-model:value="item.warehouseUid" :options="warehouseOptions" :disabled="planFormReadonly" /></td>
              <td><n-input-number v-model:value="item.quantity" :min="0" class="w-full" :disabled="planFormReadonly" /></td>
              <td><n-button v-if="!planFormReadonly" type="error" tertiary @click="removeProduct(index)">删除</n-button></td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button v-if="!planFormReadonly" type="primary" :loading="submitting" @click="submitPlan">保存</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetail" preset="card" title="生产计划详情" class="w-[1400px] max-w-[98vw]">
      <div class="space-y-4">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="计划名称">{{ detailData.name || "-" }}</n-descriptions-item>
          <n-descriptions-item label="审批状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="当前阶段">{{ detailData.currentStageName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="当前节点">{{ detailData.currentNodeName || "-" }}</n-descriptions-item>
          <n-descriptions-item v-if="detailData.closeReason" label="关闭原因">{{ detailData.closeReason }}</n-descriptions-item>
        </n-descriptions>
        <div class="rounded-xl bg-slate-50 p-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="text-base font-semibold">内部执行阶段</div>
            <div class="flex gap-2">
              <n-button
                v-if="detailData.status === 'completed' && !detailData.inboundCompleted"
                type="error"
                tertiary
                size="small"
                @click="openClose(detailData.uid)"
              >
                关闭计划
              </n-button>
              <n-button v-if="detailData.status === 'closed'" type="error" size="small" @click="deletePlan(detailData.uid)">删除计划</n-button>
              <n-button
                v-if="detailData.currentStage && detailData.currentStage !== 'approve'"
                type="primary"
                size="medium"
                @click="openCurrentStage(detailData)"
              >
                {{ stageActionLabel(detailData) }}
              </n-button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 xl:grid-cols-6">
            <div
              v-for="item in detailData.stageList || []"
              :key="item.key"
              class="rounded-2xl border p-3 transition-all"
              :class="{
                'border-green-200 bg-green-50 shadow-sm': item.completed,
                'border-amber-300 bg-amber-50 ring-2 ring-amber-200': item.current,
                'border-slate-300 bg-slate-100 opacity-80': detailData.status === 'closed',
                'border-slate-200 bg-white opacity-70': !item.completed && !item.current && detailData.status !== 'closed'
              }"
            >
              <div class="mb-2 flex items-center justify-between">
                <n-tag :type="stageCardType(item)">{{ item.completed ? "已完成" : item.current ? "进行中" : "未开启" }}</n-tag>
              </div>
              <div class="text-base font-semibold">{{ item.name }}</div>
              <div class="mt-2 text-xs text-gray-500">
                {{ item.completed ? "该阶段已处理完成" : item.current ? "当前仅开放此阶段操作" : "需等待前置阶段完成后开启" }}
              </div>
            </div>
          </div>
        </div>
        <n-collapse v-if="detailData.flowSchema?.flowType === FlowDefinitionTypeOptions.PRODUCTION_PLAN_FLOW">
          <n-collapse-item title="审批流程参考" name="approve-flow">
            <FlowSchemaPreview :schema-data="detailData.flowSchema" />
          </n-collapse-item>
        </n-collapse>
        <div>
          <div class="mb-2 font-medium">备料</div>
          <n-table size="small" striped>
            <thead>
              <tr>
                <th>成品</th>
                <th>零件</th>
                <th>规格</th>
                <th>类型</th>
                <th>单件用量</th>
                <th>计划需求</th>
                <th>库存</th>
                <th>已领料</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detailData.bomList || []" :key="item.uid">
                <td>{{ item.productName }}</td>
                <td>{{ item.componentName }}</td>
                <td>{{ item.componentSpec || "-" }}</td>
                <td>{{ item.componentTypeName || item.componentItemBizTypeName || "-" }}</td>
                <td>{{ item.perQuantity }}</td>
                <td>{{ item.requiredQuantity }}</td>
                <td>{{ item.stockQuantity }}</td>
                <td>{{ item.issuedQuantity }}</td>
              </tr>
            </tbody>
          </n-table>
        </div>
        <div>
          <div class="mb-2 font-medium">工序</div>
          <div v-for="process in detailData.processList || []" :key="process.uid" class="mb-4 rounded border p-3">
            <div class="flex justify-between gap-4">
              <div class="space-y-2">
                <div class="font-medium">{{ process.productName }} / {{ process.templateName }} / 数量 {{ process.quantity }}</div>
                <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 xl:grid-cols-4">
                  <div>计划开始：{{ formatTimeText(process.planStartTime) }}</div>
                  <div>计划完成：{{ formatTimeText(process.planCompleteTime) }}</div>
                  <div>预计耗时：{{ formatDurationText(process.planStartTime, process.planCompleteTime) }}</div>
                  <div>备注：{{ process.remark || "-" }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <n-button v-if="detailData.currentStage === 'process'" size="small" @click="editProcessItem(detailData.uid!, process)">编辑</n-button>
                <n-button v-if="detailData.currentStage === 'process'" size="small" type="error" tertiary @click="deleteProcess(detailData.uid, process.uid)">删除</n-button>
                <n-button v-if="detailData.currentStage === 'process'" size="small" type="success" @click="confirmProcess(detailData.uid)">确认工序完成</n-button>
              </div>
            </div>
            <div class="mt-3 space-y-2">
              <div v-for="node in process.nodeList || []" :key="node.uid" class="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                <div class="space-y-1">
                  <div class="font-medium">{{ node.leaderName || "-" }}</div>
                  <div class="text-sm text-gray-700">内容：{{ node.name || "-" }}</div>
                  <div class="text-xs text-gray-500">预计耗时：{{ formatNodeDurationText(node.durationValue, node.durationUnit) }}</div>
                </div>
                <div class="flex gap-2">
                  <n-tag :type="node.completed ? 'success' : 'warning'">{{ node.completed ? "已完成" : "待处理" }}</n-tag>
                  <n-button v-if="detailData.currentStage === 'process'" size="small" type="primary" @click="openCompleteNode(process.uid, node.uid)">完工</n-button>
                  <n-button v-if="detailData.currentStage === 'process'" size="small" type="error" tertiary @click="reworkNode(detailData.uid, process.uid, node.uid)">返工</n-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>

    <n-modal v-model:show="showPrepare" preset="card" title="备料" class="w-[1200px] max-w-[96vw]">
      <div class="space-y-4">
        <div class="flex justify-end">
          <n-button type="primary" @click="addPrepareBom">新增BOM</n-button>
        </div>
        <n-table size="small" striped>
          <thead>
            <tr>
              <th>成品</th>
              <th>成品信息</th>
              <th>零件</th>
              <th>零件信息</th>
              <th>单件用量</th>
              <th>计划需求</th>
              <th>库存</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in prepareData.bomList || []" :key="item.uid || index">
              <td class="min-w-[220px]">
                <n-select
                  v-model:value="item.productItemUid"
                  :options="prepareProductOptions"
                  filterable
                  @update:value="handlePrepareProductChange(item)"
                />
              </td>
              <td class="min-w-[220px]">
                <div class="flex items-center gap-2">
                  <n-image v-if="item.productImage" :src="item.productImage" width="42" height="42" object-fit="cover" />
                  <div class="text-xs leading-5">
                    <div>{{ item.productName || "-" }}</div>
                    <div class="text-gray-500">{{ item.productSpec || "-" }}</div>
                    <div class="text-gray-500">{{ item.productTypeName || item.productItemBizTypeName || "-" }}</div>
                  </div>
                </div>
              </td>
              <td class="min-w-[220px]">
                <n-select
                  v-model:value="item.componentItemUid"
                  :options="componentOptions"
                  filterable
                  @update:value="handlePrepareComponentChange(item)"
                />
              </td>
              <td class="min-w-[260px]">
                <div class="flex items-center gap-2">
                  <n-image v-if="item.componentImage" :src="item.componentImage" width="42" height="42" object-fit="cover" />
                  <div class="text-xs leading-5">
                    <div>{{ item.componentName || "-" }}</div>
                    <div class="text-gray-500">规格：{{ item.componentSpec || "-" }}</div>
                    <div class="text-gray-500">类型：{{ item.componentTypeName || item.componentItemBizTypeName || "-" }}</div>
                    <div class="text-gray-500">材质：{{ item.componentMaterial || "-" }}</div>
                  </div>
                </div>
              </td>
              <td class="min-w-[120px]"><n-input-number v-model:value="item.perQuantity" :min="0" class="w-full" @update:value="handlePreparePerQuantityChange(item)" /></td>
              <td>{{ item.requiredQuantity || 0 }}</td>
              <td>{{ item.stockQuantity || 0 }}</td>
              <td><n-input v-model:value="item.remark" /></td>
              <td><n-button type="error" tertiary @click="removePrepareBom(index)">删除</n-button></td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showPrepare = false">关闭</n-button>
          <n-button :loading="submitting" @click="savePrepare">保存</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmPrepare(prepareData.uid)">确认备料</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showIssue" preset="card" title="领料" class="w-[1200px] max-w-[96vw]">
      <div class="mb-3 flex justify-end">
        <n-button type="primary" tertiary @click="fillAllIssueQuantity">全部领料</n-button>
      </div>
      <n-table size="small" striped>
        <thead>
          <tr>
            <th>零件</th>
            <th>详情</th>
            <th>仓库</th>
            <th>可领料</th>
            <th>计划需求</th>
            <th>已领料</th>
            <th>本次领料</th>
            <th>快捷</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in issueData.detailList || []" :key="index">
            <td>{{ item.componentName }}</td>
            <td class="min-w-[260px]">
              <div class="flex items-center gap-2">
                <n-image v-if="item.componentImage" :src="item.componentImage" width="42" height="42" object-fit="cover" />
                <div class="text-xs leading-5">
                  <div>规格：{{ item.componentSpec || "-" }}</div>
                  <div>材质：{{ item.componentMaterial || "-" }}</div>
                  <div>类型：{{ item.componentTypeName || "-" }}</div>
                </div>
              </div>
            </td>
            <td><n-select v-model:value="item.warehouseUid" :options="warehouseOptions" /></td>
            <td>{{ item.availableQuantity || 0 }}</td>
            <td>{{ item.requiredQuantity || 0 }}</td>
            <td>{{ item.issuedQuantity || 0 }}</td>
            <td><n-input-number v-model:value="item.quantity" :min="0" :max="Number(item.availableQuantity) || 0" class="w-full" /></td>
            <td><n-button size="small" tertiary @click="fillIssueRowQuantity(item)">全部</n-button></td>
          </tr>
        </tbody>
      </n-table>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showIssue = false">关闭</n-button>
          <n-button :loading="submitting" @click="submitIssue">保存领料</n-button>
          <n-button v-if="canConfirmIssue" type="primary" :loading="submitting" @click="confirmIssue(issueData.uid)">确认领料</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showProcess" preset="card" title="工序" class="w-[900px] max-w-[92vw]">
      <n-grid :cols="2" x-gap="12">
        <n-gi>
          <n-form-item label="成品">
            <n-select v-model:value="processData.productItemUid" :options="processData.productOptions || []" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="可生产数量">
            <n-input :value="String(processData.remainingQuantityMap?.[processData.productItemUid || ''] ?? '-')" disabled />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="模板">
            <n-select v-model:value="processData.templateUid" :options="processData.templateOptions || []" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="数量">
            <n-input-number
              v-model:value="processData.quantity"
              :min="0"
              :max="Number(processData.remainingQuantityMap?.[processData.productItemUid || ''] || 0)"
              class="w-full"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="备注">
            <n-input v-model:value="processData.remark" />
          </n-form-item>
        </n-gi>
      </n-grid>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showProcess = false">关闭</n-button>
          <n-button type="primary" :loading="submitting" @click="submitProcess(currentPlanUid)">保存</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showCompleteNode" preset="card" title="工序节点完工" class="w-[720px] max-w-[92vw]">
      <div class="space-y-4">
        <div class="flex gap-2 flex-wrap">
          <n-image v-for="(item, index) in completeNodeForm.imageList || []" :key="index" :src="item" class="w-20 h-20" />
          <FastUpload @before-upload="pushCompleteImage">
            <n-button tertiary>上传完工图片</n-button>
          </FastUpload>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showCompleteNode = false">关闭</n-button>
          <n-button type="primary" :loading="submitting" @click="submitCompleteNode(detailData.uid)">确认完工</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showInbound" preset="card" title="完工入库" class="w-[1100px] max-w-[96vw]">
      <div class="mb-3 flex justify-end">
        <n-button type="primary" tertiary @click="fillAllInboundQuantity">全部入库</n-button>
      </div>
      <n-table size="small" striped>
        <thead>
          <tr>
            <th>成品</th>
            <th>详情</th>
            <th>仓库</th>
            <th>生产数量</th>
            <th>已入库</th>
            <th>剩余可入库</th>
            <th>本次入库</th>
            <th>快捷</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in inboundData.detailList || []" :key="index">
            <td>{{ item.productName }}</td>
            <td class="min-w-[260px]">
              <div class="flex items-center gap-2">
                <n-image v-if="item.productImage" :src="item.productImage" width="42" height="42" object-fit="cover" />
                <div class="text-xs leading-5">
                  <div>规格：{{ item.productSpec || "-" }}</div>
                  <div>材质：{{ item.productMaterial || "-" }}</div>
                  <div>类型：{{ item.productTypeName || "-" }}</div>
                </div>
              </div>
            </td>
            <td><n-select v-model:value="item.warehouseUid" :options="warehouseOptions" /></td>
            <td>{{ item.planQuantity || 0 }}</td>
            <td>{{ item.inboundQuantity || 0 }}</td>
            <td>{{ item.availableInboundQuantity || 0 }}</td>
            <td><n-input-number v-model:value="item.quantity" :min="0" :max="Number(item.availableInboundQuantity) || 0" class="w-full" /></td>
            <td><n-button size="small" tertiary @click="fillInboundRowQuantity(item)">全部</n-button></td>
          </tr>
        </tbody>
      </n-table>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showInbound = false">关闭</n-button>
          <n-button type="primary" :loading="submitting" @click="submitInbound">确认入库</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showClose" preset="card" title="关闭生产计划" class="w-[560px] max-w-[92vw]">
      <div class="space-y-4">
        <n-alert type="warning" show-icon>
          关闭后将不允许继续执行该生产计划，且只有关闭后的计划才允许删除。
        </n-alert>
        <n-form-item label="关闭原因">
          <n-input v-model:value="closeData.closeReason" type="textarea" :rows="4" placeholder="请输入关闭原因，便于后续追踪" />
        </n-form-item>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showClose = false">取消</n-button>
          <n-button type="error" :loading="submitting" @click="submitClose">确认关闭</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
