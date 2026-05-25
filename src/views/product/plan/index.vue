<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { Reset, Search } from "@vicons/carbon"
import { AddPhotoAlternateRound } from "@vicons/material"
import { VxeTableInstance, VxeToolbarInstance } from "vxe-table"
import { VxePagerEvents } from "vxe-pc-ui"
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
const componentSize = computed(() => appStore.componentSize as "small" | "medium" | "large")
const TableCardRef = ref()
const TableCardMaxHeight = ref(0)
const VxeTableRef = ref<VxeTableInstance>()
const VxeToolbarRef = ref<VxeToolbarInstance>()
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
const inboundPlanMeta = ref({
  inboundStatus: "",
  inboundStatusName: "",
  inboundCompleted: false
})

const inboundFormReadonly = computed(() => inboundPlanMeta.value.inboundStatus === "approving" || inboundPlanMeta.value.inboundCompleted)

const inboundCanSubmit = computed(() => {
  if (inboundFormReadonly.value) return false
  return (inboundData.value.detailList || []).some((item) => Number(item.availableInboundQuantity) > 0)
})
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

const issuePlanMeta = ref({
  issueStatus: "",
  issueStatusName: "",
  materialRequestCode: "",
  materialIssued: false
})

const canSubmitIssueRequest = computed(() => {
  if (issuePlanMeta.value.materialIssued) return false
  const status = issuePlanMeta.value.issueStatus || "none"
  return status === "none" || status === "rejected"
})

const issueFormReadonly = computed(() => {
  const status = issuePlanMeta.value.issueStatus || "none"
  return status === "approving" || status === "wait_issue" || status === "part_issued"
})

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

function getCardProps() {
  TableCardMaxHeight.value = TableCardRef.value?.$el?.clientHeight
    ? TableCardRef.value.$el.clientHeight - 20
    : 520
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

function safeNumber(value?: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function getIssueRowMax(item: ProductionPlanIssueDetailItem) {
  const remaining = Math.max(safeNumber(item.availableQuantity), 0)
  if (item.stockQuantity === undefined || item.stockQuantity === null) return remaining
  return Math.min(remaining, Math.max(safeNumber(item.stockQuantity), 0))
}

function applyIssueForm(res: ProductionPlanIssueForm) {
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
      stockQuantity: item.stockQuantity,
      availableQuantity: item.availableQuantity,
      requiredQuantity: item.requiredQuantity,
      issuedQuantity: item.issuedQuantity,
      quantity: 0
    }))
  }
}

function refreshOpenDetail(uid?: string) {
  select()
  if (showDetail.value && uid) {
    openDetail(uid)
  }
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

function pageChange(event: VxePagerEvents) {
  query.value.currentPage = event.currentPage
  query.value.pageSize = event.pageSize
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
  Promise.all([ProductionPlanService.issueForm(uid), ProductionPlanService.detail(uid)])
    .then(([res, detail]) => {
      applyIssueForm(res)
      issuePlanMeta.value = {
        issueStatus: detail.issueStatus || "none",
        issueStatusName: detail.issueStatusName || "",
        materialRequestCode: detail.materialRequestCode || "",
        materialIssued: Boolean(detail.materialIssued)
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

function submitIssue() {
  if (!canSubmitIssueRequest.value) {
    window.$message?.warning("当前存在进行中的领料申请，请等待审批或前往领料出库处理")
    return
  }
  const detailList = (issueData.value.detailList || []).filter((item) => Number(item.quantity) > 0)
  if (!detailList.length) {
    window.$message?.error("请至少填写一条领料数量")
    return
  }
  const warehouseSet = new Set<string>()
  for (const item of detailList) {
    const max = getIssueRowMax(item)
    const qty = Number(item.quantity) || 0
    if (!item.warehouseUid) {
      window.$message?.error(`请选择【${item.componentName || "物料"}】领料仓库`)
      return
    }
    warehouseSet.add(item.warehouseUid)
    if (warehouseSet.size > 1) {
      window.$message?.error("生产计划领料仅支持单一仓库，请统一领料仓库后提交")
      return
    }
    if (qty > max) {
      window.$message?.error(`【${item.componentName || "物料"}】领料数量超出剩余可领或可用库存数量`)
      return
    }
  }
  const uid = issueData.value.uid
  submitting.value = true
  ProductionPlanService.issue({ ...issueData.value, detailList })
    .then(() => {
      window.$message?.success("领料申请已提交")
      showIssue.value = false
      refreshOpenDetail(uid)
    })
    .finally(() => {
      submitting.value = false
    })
}

function fillAllIssueQuantity() {
  issueData.value.detailList = (issueData.value.detailList || []).map((item) => ({
    ...item,
    quantity: getIssueRowMax(item)
  }))
}

function fillIssueRowQuantity(item: ProductionPlanIssueDetailItem) {
  item.quantity = getIssueRowMax(item)
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
  Promise.all([ProductionPlanService.finishInboundForm(uid), ProductionPlanService.detail(uid), loadBaseOptions()])
    .then(([res, detail]) => {
      inboundPlanMeta.value = {
        inboundStatus: detail.inboundStatus || "none",
        inboundStatusName: detail.inboundStatusName || "",
        inboundCompleted: Boolean(detail.inboundCompleted)
      }
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
  const hasAvailable = (inboundData.value.detailList || []).some((item) => Number(item.availableInboundQuantity) > 0)
  if (!hasAvailable) {
    window.$message?.warning("当前没有可入库数量，如需继续入库请确认计划产量与已入库数量")
    return
  }
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
      window.$message?.success("生产入库申请已提交")
      showInbound.value = false
      refreshOpenDetail(inboundData.value.uid)
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

function canOpenInbound(plan?: ProductionPlanDetail) {
  if (!plan || plan.inboundCompleted) return false
  if (plan.inboundStatus === "approving") return false
  return (plan.productList || []).some(
    (item) => Math.max(Number(item.quantity || 0) - Number(item.inboundQuantity || 0), 0) > 0
  )
}

function canOpenCurrentStage(plan?: ProductionPlanDetail) {
  if (!plan?.currentStage || plan.currentStage === "approve") return false
  if (plan.currentStage === "inbound") return canOpenInbound(plan)
  return true
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
      if (plan?.inboundStatus === "approving") return "入库审批中"
      if (!canOpenInbound(plan)) return ""
      return "进入入库"
    default:
      return ""
  }
}

function openCurrentStage(plan?: ProductionPlanDetail) {
  if (!plan?.uid) return
  if (plan.currentStage === "inbound" && !canOpenInbound(plan)) {
    if (plan.inboundStatus === "approving") {
      window.$message?.warning("生产入库审批进行中，请等待审批完成")
    } else if (plan.inboundCompleted) {
      window.$message?.success("生产入库已全部完成")
    } else {
      window.$message?.warning("当前没有可入库数量")
    }
    return
  }
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

onMounted(() => {
  select()
  loadBaseOptions()
  getCardProps()
  const $table = VxeTableRef.value
  const $toolbar = VxeToolbarRef.value
  if ($table && $toolbar) {
    $table.connect($toolbar)
  }
})
</script>

<template>
  <div class="LayoutContainer">
    <l-card class="w-full h-full" border shadow rounded padding="0">
      <template #header>
        <m-card>
          <n-form label-placement="left" :size="componentSize" class="NaiveForm">
            <n-grid :cols="4" x-gap="12" y-gap="12">
              <n-gi>
                <n-form-item label="计划:">
                  <n-input v-model:value="query.key" clearable />
                </n-form-item>
              </n-gi>
              <n-gi span="3">
                <n-form-item>
                  <div class="flex gap-2">
                    <n-button :size="componentSize" type="info" secondary strong @click="search">
                      <template #icon><n-icon><Search /></n-icon></template>
                      搜索
                    </n-button>
                    <n-button :size="componentSize" type="tertiary" secondary strong @click="reset">
                      <template #icon><n-icon><Reset /></n-icon></template>
                      重置
                    </n-button>
                  </div>
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-form>
        </m-card>
      </template>
      <template #default>
        <m-card class="w-full h-full flex flex-col" padding="0">
          <m-card padding="0" class="px-2 pt-2 flex items-center justify-between">
            <n-button type="primary" :size="componentSize" @click="openEdit()">新增计划</n-button>
            <vxe-toolbar ref="VxeToolbarRef" custom />
          </m-card>
          <m-card ref="TableCardRef" class="flex-1">
            <vxe-table
              ref="VxeTableRef"
              :column-config="{ resizable: true }"
              :data="data.list || []"
              border
              stripe
              :loading="loading"
              :row-config="{ isHover: true }"
              :height="TableCardMaxHeight"
              :size="componentSize"
            >
              <vxe-column field="name" title="计划名称" show-overflow="tooltip" align="center" min-width="180" />
              <vxe-column field="statusName" title="审批状态" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="currentStageName" title="当前阶段" show-overflow="tooltip" align="center" width="120" />
              <vxe-column field="currentNodeName" title="当前进度" show-overflow="tooltip" align="center" min-width="140" />
              <vxe-column fixed="right" title="操作" align="center" width="320">
                <template #default="{ row }">
                  <n-flex justify="center" :wrap="false">
                    <n-button type="primary" text @click="openDetail(row.uid)">详情</n-button>
                    <n-button v-if="row.canEditPlan" text @click="openEdit(row.uid)">编辑</n-button>
                    <n-button
                      v-if="row.status === 'completed' && !row.inboundCompleted"
                      type="error"
                      text
                      @click="openClose(row.uid)"
                    >
                      关闭
                    </n-button>
                    <n-button v-if="row.status === 'closed'" type="error" text @click="deletePlan(row.uid)">删除</n-button>
                    <n-button
                      v-if="canOpenCurrentStage(row)"
                      type="warning"
                      text
                      @click="openCurrentStage(row)"
                    >
                      {{ stageActionLabel(row) }}
                    </n-button>
                  </n-flex>
                </template>
              </vxe-column>
            </vxe-table>
          </m-card>
        </m-card>
      </template>
      <template #footer>
        <m-card class="w-full h-full flex items-center justify-end">
          <vxe-pager
            :size="componentSize"
            v-model:currentPage="data.currentPage"
            v-model:pageSize="data.pageSize"
            :total="data.count || 0"
            :layouts="['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total']"
            @page-change="pageChange"
          />
        </m-card>
      </template>
    </l-card>

    <n-modal v-model:show="showEdit" preset="card" title="生产计划" class="TemplateModal TemplateModal--xl">
      <n-form class="TemplateForm">
        <n-grid cols="2" x-gap="16" y-gap="0">
          <n-gi v-if="planFormReadonly" span="2">
            <n-alert type="warning" show-icon>
              当前生产计划已进入审批完成后的执行阶段，不允许继续修改计划基础信息。如需处理错误，请先走关闭计划后再删除的业务流程。
            </n-alert>
          </n-gi>
          <n-gi span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">基本信息</div>
            </div>
          </n-gi>
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
          <n-gi span="2">
            <div class="TemplateForm-section">
              <div class="TemplateForm-section__title">附件资料</div>
            </div>
          </n-gi>
          <n-gi>
            <n-form-item label="图片">
              <div class="flex gap-2 flex-wrap">
                <n-image v-for="(item, index) in formData.imageList || []" :key="index" :src="item" class="w-16 h-16" />
                <FastUpload v-if="!planFormReadonly" @before-upload="pushImage">
                  <n-button tertiary>
                    <template #icon><n-icon><AddPhotoAlternateRound /></n-icon></template>
                    上传图片
                  </n-button>
                </FastUpload>
              </div>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="文档">
              <div class="flex gap-2 flex-wrap">
                <n-tag v-for="(item, index) in formData.docList || []" :key="index">{{ item }}</n-tag>
                <FastUpload v-if="!planFormReadonly" upload-type="document" @before-upload="pushDoc">
                  <n-button tertiary>上传文档</n-button>
                </FastUpload>
              </div>
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <div class="TemplateForm-section TemplateForm-section__head">
              <div class="TemplateForm-section__title">成品列表</div>
              <n-button v-if="!planFormReadonly" :size="componentSize" type="primary" @click="addProduct">新增成品</n-button>
            </div>
          </n-gi>
          <n-gi span="2">
            <n-table striped :size="componentSize" class="plan-edit-table">
              <colgroup>
                <col class="edit-col-product" />
                <col class="edit-col-warehouse" />
                <col class="edit-col-quantity" />
                <col class="edit-col-action" />
              </colgroup>
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
                  <td>
                    <n-select
                      v-model:value="item.itemUid"
                      :options="productOptions"
                      filterable
                      :consistent-menu-width="false"
                      :disabled="planFormReadonly"
                      @update:value="handleProductChange(item)"
                    />
                  </td>
                  <td>
                    <n-select
                      v-model:value="item.warehouseUid"
                      :options="warehouseOptions"
                      :consistent-menu-width="false"
                      :disabled="planFormReadonly"
                    />
                  </td>
                  <td><n-input-number v-model:value="item.quantity" :min="0.000001" class="w-full" :disabled="planFormReadonly" /></td>
                  <td><n-button v-if="!planFormReadonly" :size="componentSize" type="error" tertiary @click="removeProduct(index)">删除</n-button></td>
                </tr>
              </tbody>
            </n-table>
          </n-gi>
          <n-gi span="2">
            <div class="TemplateForm-actions">
              <n-flex justify="end">
                <n-button @click="showEdit = false">取消</n-button>
                <n-button v-if="!planFormReadonly" type="primary" :loading="submitting" @click="submitPlan">保存</n-button>
              </n-flex>
            </div>
          </n-gi>
        </n-grid>
      </n-form>
    </n-modal>

    <n-modal v-model:show="showDetail" preset="card" title="生产计划详情" class="w-[1400px] max-w-[98vw]">
      <div class="space-y-4">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="计划名称">{{ detailData.name || "-" }}</n-descriptions-item>
          <n-descriptions-item label="审批状态">{{ detailData.statusName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="当前阶段">{{ detailData.currentStageName || "-" }}</n-descriptions-item>
          <n-descriptions-item label="当前节点">{{ detailData.currentNodeName || "-" }}</n-descriptions-item>
          <n-descriptions-item v-if="detailData.inboundStatusName" label="入库状态">{{ detailData.inboundStatusName }}</n-descriptions-item>
          <n-descriptions-item v-if="detailData.inboundCompleted" label="入库完成">是</n-descriptions-item>
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
                :size="componentSize"
                @click="openClose(detailData.uid)"
              >
                关闭计划
              </n-button>
              <n-button v-if="detailData.status === 'closed'" type="error" :size="componentSize" @click="deletePlan(detailData.uid)">删除计划</n-button>
              <n-button
                v-if="canOpenCurrentStage(detailData)"
                type="primary"
                :size="componentSize"
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
          <n-table :size="componentSize" striped>
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
                <n-button v-if="detailData.currentStage === 'process'" :size="componentSize" @click="editProcessItem(detailData.uid!, process)">编辑</n-button>
                <n-button v-if="detailData.currentStage === 'process'" :size="componentSize" type="error" tertiary @click="deleteProcess(detailData.uid, process.uid)">删除</n-button>
                <n-button v-if="detailData.currentStage === 'process'" :size="componentSize" type="success" @click="confirmProcess(detailData.uid)">确认工序完成</n-button>
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
                  <n-button v-if="detailData.currentStage === 'process'" :size="componentSize" type="primary" @click="openCompleteNode(process.uid, node.uid)">完工</n-button>
                  <n-button v-if="detailData.currentStage === 'process'" :size="componentSize" type="error" tertiary @click="reworkNode(detailData.uid, process.uid, node.uid)">返工</n-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>

    <n-modal v-model:show="showPrepare" preset="card" title="备料" class="w-[1200px] max-w-[96vw] prepare-modal">
      <div class="space-y-4">
        <div class="flex justify-end">
          <n-button :size="componentSize" type="primary" @click="addPrepareBom">新增BOM</n-button>
        </div>
        <div class="modal-table-scroll">
          <n-table :size="componentSize" striped class="plan-modal-table prepare-modal-table">
            <colgroup>
              <col class="col-product" />
              <col class="col-product-info" />
              <col class="col-component" />
              <col class="col-component-info" />
              <col class="col-number" />
              <col class="col-metric" />
              <col class="col-metric" />
              <col class="col-remark" />
              <col class="col-action" />
            </colgroup>
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
                <td>
                  <n-select
                    v-model:value="item.productItemUid"
                    :options="prepareProductOptions"
                    filterable
                    class="compact-select"
                    @update:value="handlePrepareProductChange(item)"
                  />
                </td>
                <td>
                  <div class="info-cell">
                    <n-image v-if="item.productImage" :src="item.productImage" width="42" height="42" object-fit="cover" />
                    <div class="text-xs leading-5 min-w-0">
                      <div class="truncate">{{ item.productName || "-" }}</div>
                      <div class="text-gray-500 truncate">{{ item.productSpec || "-" }}</div>
                      <div class="text-gray-500 truncate">{{ item.productTypeName || item.productItemBizTypeName || "-" }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <n-select
                    v-model:value="item.componentItemUid"
                    :options="componentOptions"
                    filterable
                    class="compact-select"
                    @update:value="handlePrepareComponentChange(item)"
                  />
                </td>
                <td>
                  <div class="info-cell">
                    <n-image v-if="item.componentImage" :src="item.componentImage" width="42" height="42" object-fit="cover" />
                    <div class="text-xs leading-5 min-w-0">
                      <div class="truncate">{{ item.componentName || "-" }}</div>
                      <div class="text-gray-500 truncate">规格：{{ item.componentSpec || "-" }}</div>
                      <div class="text-gray-500 truncate">类型：{{ item.componentTypeName || item.componentItemBizTypeName || "-" }}</div>
                      <div class="text-gray-500 truncate">材质：{{ item.componentMaterial || "-" }}</div>
                    </div>
                  </div>
                </td>
                <td><n-input-number v-model:value="item.perQuantity" :min="0.000001" class="w-full compact-number" @update:value="handlePreparePerQuantityChange(item)" /></td>
                <td class="text-center whitespace-nowrap">{{ item.requiredQuantity || 0 }}</td>
                <td class="text-center whitespace-nowrap">{{ item.stockQuantity || 0 }}</td>
                <td><n-input v-model:value="item.remark" class="compact-input" /></td>
                <td class="text-center"><n-button :size="componentSize" type="error" tertiary @click="removePrepareBom(index)">删除</n-button></td>
              </tr>
            </tbody>
          </n-table>
        </div>
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
      <n-alert
        v-if="issuePlanMeta.issueStatusName"
        class="mb-3"
        :type="issuePlanMeta.materialIssued ? 'success' : issuePlanMeta.issueStatus === 'rejected' ? 'error' : 'info'"
        show-icon
      >
        领料状态：{{ issuePlanMeta.issueStatusName }}
        <template v-if="issuePlanMeta.materialRequestCode">（申请单：{{ issuePlanMeta.materialRequestCode }}）</template>
      </n-alert>
      <div class="mb-3 flex justify-end">
        <n-button :size="componentSize" type="primary" tertiary :disabled="issueFormReadonly" @click="fillAllIssueQuantity">全部领料</n-button>
      </div>
      <div class="modal-table-scroll">
        <n-table :size="componentSize" striped class="plan-modal-table">
          <colgroup>
            <col class="col-component-name" />
            <col class="col-component-info" />
            <col class="col-warehouse" />
            <col class="col-metric" />
            <col class="col-metric" />
            <col class="col-metric" />
            <col class="col-metric" />
            <col class="col-number" />
            <col class="col-short-action" />
          </colgroup>
          <thead>
            <tr>
              <th>零件</th>
              <th>详情</th>
              <th>仓库</th>
              <th>可领料</th>
              <th>总库存</th>
              <th>计划需求</th>
              <th>已领料</th>
              <th>本次领料</th>
              <th>快捷</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in issueData.detailList || []" :key="index">
              <td class="truncate">{{ item.componentName }}</td>
              <td>
                <div class="info-cell">
                  <n-image v-if="item.componentImage" :src="item.componentImage" width="42" height="42" object-fit="cover" />
                  <div class="text-xs leading-5 min-w-0">
                    <div class="text-gray-500 truncate">规格：{{ item.componentSpec || "-" }}</div>
                    <div class="text-gray-500 truncate">材质：{{ item.componentMaterial || "-" }}</div>
                    <div class="text-gray-500 truncate">类型：{{ item.componentTypeName || "-" }}</div>
                  </div>
                </div>
              </td>
              <td><n-select v-model:value="item.warehouseUid" :options="warehouseOptions" :disabled="issueFormReadonly" class="compact-select" /></td>
              <td class="text-center whitespace-nowrap">{{ item.availableQuantity || 0 }}</td>
              <td class="text-center whitespace-nowrap">{{ item.stockQuantity ?? "-" }}</td>
              <td class="text-center whitespace-nowrap">{{ item.requiredQuantity || 0 }}</td>
              <td class="text-center whitespace-nowrap">{{ item.issuedQuantity || 0 }}</td>
              <td><n-input-number v-model:value="item.quantity" :min="0" :max="getIssueRowMax(item)" :disabled="issueFormReadonly" class="w-full compact-number" /></td>
              <td class="text-center"><n-button :size="componentSize" tertiary :disabled="issueFormReadonly" @click="fillIssueRowQuantity(item)">全部</n-button></td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showIssue = false">关闭</n-button>
          <n-button v-if="canSubmitIssueRequest" type="primary" :loading="submitting" @click="submitIssue">提交领料申请</n-button>
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
              :min="0.000001"
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
      <n-alert
        v-if="inboundPlanMeta.inboundStatusName"
        class="mb-3"
        :type="inboundPlanMeta.inboundCompleted ? 'success' : inboundPlanMeta.inboundStatus === 'approving' ? 'info' : 'warning'"
        show-icon
      >
        入库状态：{{ inboundPlanMeta.inboundStatusName }}
        <template v-if="inboundPlanMeta.inboundCompleted">（已全部入库完成）</template>
      </n-alert>
      <div class="mb-3 flex justify-end">
        <n-button
          :size="componentSize"
          type="primary"
          tertiary
          :disabled="inboundFormReadonly || !inboundCanSubmit"
          @click="fillAllInboundQuantity"
        >
          全部入库
        </n-button>
      </div>
      <div class="modal-table-scroll">
        <n-table :size="componentSize" striped class="plan-modal-table">
          <colgroup>
            <col class="col-component-name" />
            <col class="col-component-info" />
            <col class="col-warehouse" />
            <col class="col-metric" />
            <col class="col-metric" />
            <col class="col-metric" />
            <col class="col-number" />
            <col class="col-short-action" />
          </colgroup>
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
              <td class="truncate">{{ item.productName }}</td>
              <td>
                <div class="info-cell">
                  <n-image v-if="item.productImage" :src="item.productImage" width="42" height="42" object-fit="cover" />
                  <div class="text-xs leading-5 min-w-0">
                    <div class="text-gray-500 truncate">规格：{{ item.productSpec || "-" }}</div>
                    <div class="text-gray-500 truncate">材质：{{ item.productMaterial || "-" }}</div>
                    <div class="text-gray-500 truncate">类型：{{ item.productTypeName || "-" }}</div>
                  </div>
                </div>
              </td>
              <td><n-select v-model:value="item.warehouseUid" :options="warehouseOptions" class="compact-select" /></td>
              <td class="text-center whitespace-nowrap">{{ item.planQuantity || 0 }}</td>
              <td class="text-center whitespace-nowrap">{{ item.inboundQuantity || 0 }}</td>
              <td class="text-center whitespace-nowrap">{{ item.availableInboundQuantity || 0 }}</td>
              <td>
                <n-input-number
                  v-model:value="item.quantity"
                  :min="0"
                  :max="Number(item.availableInboundQuantity) || 0"
                  :disabled="inboundFormReadonly"
                  class="w-full compact-number"
                />
              </td>
              <td class="text-center">
                <n-button :size="componentSize" tertiary :disabled="inboundFormReadonly" @click="fillInboundRowQuantity(item)">全部</n-button>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showInbound = false">关闭</n-button>
          <n-button v-if="inboundCanSubmit" type="primary" :loading="submitting" @click="submitInbound">提交入库申请</n-button>
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

<style scoped>
.modal-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.plan-edit-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.plan-edit-table :deep(th),
.plan-edit-table :deep(td) {
  vertical-align: middle;
}

.plan-modal-table {
  min-width: 100%;
}

.plan-modal-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.plan-modal-table :deep(th),
.plan-modal-table :deep(td) {
  padding: 12px 10px;
  vertical-align: middle;
}

.plan-modal-table :deep(th) {
  white-space: nowrap;
}

.info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.compact-select,
.compact-input,
.compact-number {
  width: 100%;
}

.compact-select :deep(.n-base-selection),
.compact-input :deep(.n-input__border),
.compact-input :deep(.n-input__state-border),
.compact-number :deep(.n-input-wrapper) {
  min-height: 38px;
}

.compact-select :deep(.n-base-selection-label) {
  min-height: 38px;
  padding-right: 28px;
}

.compact-select :deep(.n-base-selection-input),
.compact-select :deep(.n-base-selection-placeholder),
.compact-select :deep(.n-base-selection__render-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-number :deep(.n-input__input-el),
.compact-input :deep(.n-input__input-el) {
  height: 38px;
}

.col-product,
.col-component {
  width: 18%;
}

.col-product-info {
  width: 18%;
}

.col-component-info {
  width: 22%;
}

.col-number {
  width: 10%;
}

.col-metric {
  width: 7%;
}

.col-remark {
  width: 14%;
}

.col-action {
  width: 8%;
}

.col-component-name {
  width: 12%;
}

.col-warehouse {
  width: 14%;
}

.col-short-action {
  width: 8%;
}

.edit-col-product {
  width: 38%;
}

.edit-col-warehouse {
  width: 28%;
}

.edit-col-quantity {
  width: 18%;
}

.edit-col-action {
  width: 16%;
}
</style>
