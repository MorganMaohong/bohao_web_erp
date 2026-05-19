export const apiPrefix = {
  user: "/user",
  role: "/role",
  project: "/project",
  post: "/post",
  permission: "/permission",
  menu: "/menu",
  gateway: "/gateway",
  gatewayGroup: "/gatewayGroup",
  file: "/file",
  dept: "/dept",
  comport: "/gateway/comport",
  variable: "/comport/variable",
  warnRecord: "/gateway/warnRecord",
  warn: "/gateway/warn",
  sysConfig: "/sysConfig",
  repairWorkOrderPermission: "/operations/repair/permission",
  repairWorkOrder: "/operations/repair/workOrder",
  repairWorkOrderSnap: "/operations/repair/workOrder/snap",
  inspectionDaily: "/operations/inspection/daily",
  factoryAppearance: "/operations/factoryAppearance",
  inspectionStation: "/operations/inspection/station",
  dashboard: "/dashboard",
  projectScreen: "/projectScreen",
  projectAnalysis: "/project/analysis",
  flowInstance: "/flowInstance",
  templateDictionary: "/template/dictionary",
  templateProduct: "/template/product",
  templateCustomer: "/template/customer",
  templateSupplier: "/template/supplier",
  templateItems: "/template/items",
  templateWarehouse: "/template/warehouse",
  templateUnit: "/template/unit",
  inventoryInbound: "/inventory/inbound",
  inventoryOutbound: "/inventory/outbound",
  inventoryOverview: "/inventory/overview",
  inventoryFlow: "/inventory/flow",
  inventoryCommon: "/inventory/common",
  inventoryMaterialRequest: "/inventory/material-request",
  inventoryTransferOrder: "/inventory/transfer",
  inventoryCheckOrder: "/inventory/check",
  purchaseApplyOrder: "/purchase/apply",
  purchaseOrder: "/purchase/order",
  purchasePrice: "/purchase/price",
  salesOrder: "/sales/order",
  productionBom: "/production/bom",
  productionProcessTemplate: "/production/process-template",
  productionPlan: "/production/plan",
  flowDefinition: "/flow/definition",
  flowEngine: "/flow/engine",
  flowTask: "/flow/task",
  taskCenter: "/task-center",
  message: "/message"
}

export const userApi = {
  select: { url: `${apiPrefix.user}/select`, permission: "sys:user:select" },
  userInfo: {
    url: `${apiPrefix.user}/userInfo`,
    permission: ""
  }, // updateStatus: { url: `${apiPrefix.user}/updateStatus`, permission: "sys:user:updateStatus" },
  // updateTodayWork: { url: `${apiPrefix.user}/updateTodayWork`, permission: "sys:user:updateTodayWork" },
  form: { url: `${apiPrefix.user}/form`, permission: "" },
  add: { url: `${apiPrefix.user}/add`, permission: "sys:user:edit" },
  update: { url: `${apiPrefix.user}/update`, permission: "sys:user:edit" },
  delete: { url: `${apiPrefix.user}/delete`, permission: "sys:user:delete" },
  options: { url: `${apiPrefix.user}/options`, permission: "" },
  permForm: { url: `${apiPrefix.user}/permForm`, permission: "" },
  updatePerm: { url: `${apiPrefix.user}/updatePerm`, permission: "sys:user:edit" },
  setRemoveMpAuth: { url: `${apiPrefix.user}/setRemoveMpAuth`, permission: "sys:user:edit" },
  profile: { url: `${apiPrefix.user}/profile`, permission: "" },
  updateProfile: { url: `${apiPrefix.user}/profile/update`, permission: "" },
  changePassword: { url: `${apiPrefix.user}/password/change`, permission: "" },
  applyPasswordReset: { url: `${apiPrefix.user}/password/forgot/apply`, permission: "" },
  adminResetPassword: { url: `${apiPrefix.user}/password/reset`, permission: "sys:user:edit" }
}

export const messageApi = {
  mine: { url: `${apiPrefix.message}/mine`, permission: "" },
  unreadCount: { url: `${apiPrefix.message}/unread-count`, permission: "" },
  markRead: { url: `${apiPrefix.message}/read`, permission: "" },
  markAllRead: { url: `${apiPrefix.message}/read-all`, permission: "" }
}

export const roleApi = {
  options: { url: `${apiPrefix.role}/options`, permission: "" },
  select: { url: `${apiPrefix.role}/select`, permission: "sys:role:select" },
  update: { url: `${apiPrefix.role}/update`, permission: "sys:role:edit" },
  add: { url: `${apiPrefix.role}/add`, permission: "sys:role:edit" },
  delete: { url: `${apiPrefix.role}/delete`, permission: "sys:role:delete" },
  form: { url: `${apiPrefix.role}/form`, permission: "" },
  addGroup: { url: `${apiPrefix.role}/addGroup`, permission: "sys:role:editGroup" },
  updateGroup: { url: `${apiPrefix.role}/updateGroup`, permission: "sys:role:editGroup" },
  deleteGroup: { url: `${apiPrefix.role}/deleteGroup`, permission: "sys:role:deleteGroup" },
  groupForm: { url: `${apiPrefix.role}/groupForm`, permission: "" }
}

export const projectApi = {
  selectTree: {
    url: `${apiPrefix.project}/selectTree`,
    permission: ""
  }, // selectList: { url: `${apiPrefix.project}/selectList`, permission: "project:selectList" },
  displayMultiple: { url: `${apiPrefix.project}/displayMultiple`, permission: "project:monitorDraw:display" },
  select: { url: `${apiPrefix.project}/select`, permission: "project:select" },
  form: { url: `${apiPrefix.project}/form`, permission: "" },
  update: { url: `${apiPrefix.project}/update`, permission: "project:edit" },
  add: { url: `${apiPrefix.project}/add`, permission: "project:edit" },
  delete: { url: `${apiPrefix.project}/delete`, permission: "project:delete" },

  log: { url: `${apiPrefix.project}/log`, permission: "project:log" },
  deleteLog: { url: `${apiPrefix.project}/deleteLog`, permission: "project:deleteLog" },

  unBindGateway: { url: `${apiPrefix.project}/unBindGateway`, permission: "project:editGateway" },
  bindGateway: { url: `${apiPrefix.project}/bindGateway`, permission: "project:editGateway" },
  info: { url: `${apiPrefix.project}/info`, permission: "project:info" },
  gatewayInfo: { url: `${apiPrefix.project}/gatewayInfo`, permission: "project:info" },

  groupForm: { url: `${apiPrefix.project}/groupForm`, permission: "" },
  updateGroup: { url: `${apiPrefix.project}/updateGroup`, permission: "project:editGroup" },
  addGroup: { url: `${apiPrefix.project}/addGroup`, permission: "project:editGroup" },
  deleteGroup: { url: `${apiPrefix.project}/deleteGroup`, permission: "project:deleteGroup" }
}

export const postApi = {
  select: { url: `${apiPrefix.post}/select`, permission: "company:post:select" },
  form: { url: `${apiPrefix.post}/form`, permission: "" },
  update: { url: `${apiPrefix.post}/update`, permission: "company:post:edit" },
  updateSort: { url: `${apiPrefix.post}/updateSort`, permission: "company:post:edit" },
  getTreeByDeptUid: { url: `${apiPrefix.post}/getTreeByDeptUid`, permission: "" },
  add: { url: `${apiPrefix.post}/add`, permission: "company:post:edit" },
  delete: { url: `${apiPrefix.post}/delete`, permission: "company:post:delete" },
  treeOptions: { url: `${apiPrefix.post}/treeOptions`, permission: "" }
}

export const permissionApi = {
  options: { url: `${apiPrefix.permission}/options`, permission: "" },
  select: { url: `${apiPrefix.permission}/select`, permission: "sys:permission:select" },
  update: { url: `${apiPrefix.permission}/update`, permission: "sys:permission:edit" },
  add: { url: `${apiPrefix.permission}/add`, permission: "sys:permission:edit" },
  delete: { url: `${apiPrefix.permission}/delete`, permission: "sys:permission:delete" },
  form: { url: `${apiPrefix.permission}/form`, permission: "" },
  addGroup: { url: `${apiPrefix.permission}/addGroup`, permission: "sys:permission:editGroup" },
  updateGroup: { url: `${apiPrefix.permission}/updateGroup`, permission: "sys:permission:editGroup" },
  deleteGroup: { url: `${apiPrefix.permission}/deleteGroup`, permission: "sys:permission:deleteGroup" },
  groupForm: { url: `${apiPrefix.permission}/groupForm`, permission: "" }
}

export const menuApi = {
  select: { url: `${apiPrefix.menu}/select`, permission: "sys:menu:select" },
  update: { url: `${apiPrefix.menu}/update`, permission: "sys:menu:edit" },
  updateSort: { url: `${apiPrefix.menu}/updateSort`, permission: "sys:menu:edit" },
  add: { url: `${apiPrefix.menu}/add`, permission: "sys:menu:edit" },
  delete: { url: `${apiPrefix.menu}/delete`, permission: "sys:menu:delete" },
  form: { url: `${apiPrefix.menu}/form`, permission: "" }
}

export const gatewayApi = {
  selectList: { url: `${apiPrefix.gateway}/selectList`, permission: "" },
  select: { url: `${apiPrefix.gateway}/select`, permission: "gateway:select" },
  form: { url: `${apiPrefix.gateway}/form`, permission: "" },
  update: { url: `${apiPrefix.gateway}/update`, permission: "gateway:edit" },
  add: { url: `${apiPrefix.gateway}/add`, permission: "gateway:edit" },
  delete: { url: `${apiPrefix.gateway}/delete`, permission: "gateway:delete" },
  info: { url: `${apiPrefix.gateway}/info`, permission: "gateway:select" },
  status: { url: `${apiPrefix.gateway}/status`, permission: "" },

  recall: { url: `${apiPrefix.gateway}/recall`, permission: "gateway:recall" },
  reboot: { url: `${apiPrefix.gateway}/reboot`, permission: "gateway:restart" },
  restartFlows: { url: `${apiPrefix.gateway}/restartFlows`, permission: "gateway:restart" },
  setHeartbeatTime: { url: `${apiPrefix.gateway}/setHeartbeatTime`, permission: "gateway:setting" },
  setReportTime: { url: `${apiPrefix.gateway}/setReportTime`, permission: "gateway:setting" },

  syncGateway: { url: `${apiPrefix.gateway}/syncGateway`, permission: "gateway:sync" },
  changeSn: { url: `${apiPrefix.gateway}/changeSn`, permission: "gateway:edit" },
  unbindSn: { url: `${apiPrefix.gateway}/unbindSn`, permission: "gateway:edit" },
  options: { url: `${apiPrefix.gateway}/options`, permission: "" },
  selectVarByGatewayUid: { url: `${apiPrefix.gateway}/selectVarByGatewayUid`, permission: "" },
  log: { url: `${apiPrefix.gateway}/log`, permission: "gateway:log" },
  deleteLog: { url: `${apiPrefix.gateway}/deleteLog`, permission: "gateway:deleteLog" },

  groupForm: { url: `${apiPrefix.gateway}/groupForm`, permission: "" },
  updateGroup: { url: `${apiPrefix.gateway}/updateGroup`, permission: "gatewayGroup:editGroup" },
  addGroup: { url: `${apiPrefix.gateway}/addGroup`, permission: "gatewayGroup:editGroup" },
  deleteGroup: { url: `${apiPrefix.gateway}/deleteGroup`, permission: "gatewayGroup:deleteGroup" }
}

export const gatewayGroupApi = {
  form: { url: `${apiPrefix.gatewayGroup}/form`, permission: "" },
  update: { url: `${apiPrefix.gatewayGroup}/update`, permission: "gatewayGroup:update" },
  add: { url: `${apiPrefix.gatewayGroup}/add`, permission: "gatewayGroup:add" },
  delete: { url: `${apiPrefix.gatewayGroup}/delete`, permission: "gatewayGroup:delete:uid" }
}

export const fileApi = {
  uploadFile: { url: `${apiPrefix.file}/upload`, permission: "" },
  uploadTimeWatermark: { url: `${apiPrefix.file}/uploadTimeWatermark`, permission: "" }
}

export const deptApi = {
  select: { url: `${apiPrefix.dept}/select`, permission: "company:dept:select" },
  form: { url: `${apiPrefix.dept}/form`, permission: "" },
  update: { url: `${apiPrefix.dept}/update`, permission: "company:dept:edit" },
  updateSort: { url: `${apiPrefix.dept}/updateSort`, permission: "company:dept:edit" },
  add: { url: `${apiPrefix.dept}/add`, permission: "company:dept:edit" },
  delete: { url: `${apiPrefix.dept}/delete`, permission: "company:dept:delete" },
  selectDeptUser: { url: `${apiPrefix.dept}/selectDeptUser`, permission: "" },
  selectDeptPostUser: { url: `${apiPrefix.dept}/selectDeptPostUser`, permission: "" },
  treeOptions: { url: `${apiPrefix.dept}/treeOptions`, permission: "" }
}

export const comportApi = {
  select: { url: `${apiPrefix.comport}/select`, permission: "gateway:comport:select" },
  update: { url: `${apiPrefix.comport}/update`, permission: "gateway:comport:edit" },
  delete: { url: `${apiPrefix.comport}/delete`, permission: "gateway:comport:delete" },

  updateVarByComport: {
    url: `${apiPrefix.comport}/updateVarByComport`,
    permission: "gateway:comport:updateVarByComport"
  },
  updateVarByComportForm: {
    url: `${apiPrefix.comport}/updateVarByComportForm`
  }
}

export const authApi = {
  login: { url: "/login", permission: "" },
  logout: { url: "/logout", permission: "" },
  captcha: { url: "/captcha", permission: "" }
}

export const dashboardApi = {
  upload: { url: `${apiPrefix.dashboard}/upload`, permission: "sys:dashboard:upload" },
  form: { url: `${apiPrefix.dashboard}/form`, permission: "sys:dashboard:form" },
  getStatisticsData: { url: `${apiPrefix.dashboard}/getStatisticsData`, permission: "sys:dashboard:getStatisticsData" },
  getAnnouncementList: {
    url: `${apiPrefix.dashboard}/getAnnouncementList`,
    permission: "sys:dashboard:getAnnouncementList"
  },
  getActiveWarnData: { url: `${apiPrefix.dashboard}/getActiveWarnData`, permission: "sys:dashboard:getActiveWarnData" },
  getGatewayDistributionData: {
    url: `${apiPrefix.dashboard}/getGatewayDistributionData`,
    permission: "sys:dashboard:getGatewayDistributionData"
  },
  getCarouselData: {
    url: `${apiPrefix.dashboard}/getCarouselData`,
    permission: "sys:dashboard:getCarouselData"
  },
  getAnnouncementData: {
    url: `${apiPrefix.dashboard}/getAnnouncementData`,
    permission: "sys:dashboard:getAnnouncementData"
  },
  updateAnnouncement: {
    url: `${apiPrefix.dashboard}/updateAnnouncement`,
    permission: "sys:dashboard:updateAnnouncement"
  },
  addAnnouncement: {
    url: `${apiPrefix.dashboard}/addAnnouncement`,
    permission: "sys:dashboard:addAnnouncement"
  },
  getLineCharForm: {
    url: `${apiPrefix.dashboard}/getLineCharForm`,
    permission: "sys:dashboard:getLineCharForm"
  },
  getLineCharData: {
    url: `${apiPrefix.dashboard}/getLineCharData`,
    permission: "sys:dashboard:getLineCharData"
  }
}

export const variableApi = {
  updateVarByGroup: {
    url: `${apiPrefix.variable}/updateVarByGroup`,
    permission: "comport:variable:edit"
  },
  addGroup: { url: `${apiPrefix.variable}/addGroup`, permission: "comport:variable:editGroup" },
  deleteGroup: { url: `${apiPrefix.variable}/deleteGroup`, permission: "comport:variable:deleteGroup" },
  updateGroup: { url: `${apiPrefix.variable}/updateGroup`, permission: "comport:variable:editGroup" },
  selectGroup: { url: `${apiPrefix.variable}/selectGroup`, permission: "" },

  form: { url: `${apiPrefix.variable}/form`, permission: "" },
  add: { url: `${apiPrefix.variable}/add`, permission: "comport:variable:edit" },
  update: { url: `${apiPrefix.variable}/update`, permission: "comport:variable:edit" },
  delete: { url: `${apiPrefix.variable}/delete`, permission: "comport:variable:delete" },
  deletePatch: { url: `${apiPrefix.variable}/delete`, permission: "comport:variable:delete" },
  write: { url: `${apiPrefix.variable}/write`, permission: "comport:variable:write" },

  uploadVarExcel: {
    url: `${apiPrefix.variable}/uploadVarExcel`,
    permission: "comport:variable:file"
  },
  exportVarExcel: {
    url: `${apiPrefix.variable}/exportVarExcel`,
    permission: "comport:variable:file"
  },
  downloadTemplate: { url: `${apiPrefix.variable}/downloadTemplate`, permission: "comport:variable:file" },
  select: { url: `${apiPrefix.variable}/select`, permission: "comport:variable:select" },

  selectStore: { url: `${apiPrefix.variable}/selectStore`, permission: "comport:variable:selectStore" },
  updateStore: { url: `${apiPrefix.variable}/updateStore`, permission: "comport:variable:editStore" },
  selectVarCacheData: { url: `${apiPrefix.variable}/selectVarCacheData`, permission: "" },
  selectWxMini: { url: `${apiPrefix.variable}/selectWxMini`, permission: "comport:variable:select" },
  varInfo: { url: `${apiPrefix.variable}/varInfo`, permission: "comport:variable:select" },

  updateVarByComport: {
    url: `${apiPrefix.variable}/updateVarByComport`,
    permission: "comport:variable:edit"
  },
  updateVarByComportForm: {
    url: `${apiPrefix.variable}/updateVarByComportForm`
  }
}

export const warnRecordApi = {
  select: { url: `${apiPrefix.warnRecord}/select`, permission: "gateway:warnRecord:select" },
  delete: { url: `${apiPrefix.warnRecord}/delete`, permission: "gateway:warnRecord:delete:uid" },
  deletePatch: { url: `${apiPrefix.warnRecord}/delete`, permission: "gateway:warnRecord:delete:patch" },
  confirm: { url: `${apiPrefix.warnRecord}/confirm`, permission: "gateway:warnRecord:confirm" }
}

export const warnApi = {
  selectGroup: { url: `${apiPrefix.warn}/selectGroup`, permission: "" },
  form: { url: `${apiPrefix.warn}/form`, permission: "" },
  add: { url: `${apiPrefix.warn}/add`, permission: "gateway:warn:edit" },
  update: { url: `${apiPrefix.warn}/update`, permission: "gateway:warn:edit" },
  delete: { url: `${apiPrefix.warn}/delete`, permission: "gateway:warn:delete" },
  deletePatch: { url: `${apiPrefix.warn}/delete`, permission: "gateway:warn:delete" },
  select: { url: `${apiPrefix.warn}/select`, permission: "gateway:warn:select" },

  updateWarnByGroup: {
    url: `${apiPrefix.warn}/updateWarnByGroup`,
    permission: "gateway:warn:editGroup"
  },
  addGroup: { url: `${apiPrefix.warn}/addGroup`, permission: "gateway:warn:editGroup" },
  deleteGroup: { url: `${apiPrefix.warn}/deleteGroup`, permission: "gateway:warnGroup:deleteGroup" },
  updateGroup: { url: `${apiPrefix.warn}/updateGroup`, permission: "gateway:warnGroup:editGroup" }
}

export const sysConfigApi = {
  select: { url: `${apiPrefix.sysConfig}/select`, permission: "sys:sysConfig:select" },
  add: { url: `${apiPrefix.sysConfig}/add`, permission: "sys:sysConfig:add" },
  update: { url: `${apiPrefix.sysConfig}/update`, permission: "sys:sysConfig:update" },
  delete: { url: `${apiPrefix.sysConfig}/delete`, permission: "sys:sysConfig:delete:uid" },
  form: { url: `${apiPrefix.sysConfig}/form`, permission: "" }
}

export const repairWorkOrderPermissionApi = {
  add: { url: `${apiPrefix.repairWorkOrderPermission}/add`, permission: "operations:repair:permission:edit" },
  delete: { url: `${apiPrefix.repairWorkOrderPermission}/delete`, permission: "operations:repair:permission:delete" },
  update: { url: `${apiPrefix.repairWorkOrderPermission}/update`, permission: "operations:repair:permission:edit" },
  select: { url: `${apiPrefix.repairWorkOrderPermission}/select`, permission: "operations:repair:permission:select" },
  form: { url: `${apiPrefix.repairWorkOrderPermission}/form`, permission: "" },
  configProject: {
    url: `${apiPrefix.repairWorkOrderPermission}/configProject`,
    permission: "operations:repair:permission:configProject"
  }
  /*sponsorForm: { url: `${apiPrefix.repairWorkOrderPermission}/sponsorForm`, permission: "" },
  leaderForm: { url: `${apiPrefix.repairWorkOrderPermission}/leaderForm`, permission: "" },
  reviewForm: { url: `${apiPrefix.repairWorkOrderPermission}/reviewForm`, permission: "" },
  dispatchForm: { url: `${apiPrefix.repairWorkOrderPermission}/dispatchForm`, permission: "" },
  updateSponsor: {
    url: `${apiPrefix.repairWorkOrderPermission}/updateSponsor`,
    permission: "operations:repair:permission:updateSponsor"
  },
  updateDispatch: {
    url: `${apiPrefix.repairWorkOrderPermission}/updateDispatch`,
    permission: "operations:repair:permission:updateDispatch"
  },
  updateLeader: {
    url: `${apiPrefix.repairWorkOrderPermission}/updateLeader`,
    permission: "operations:repair:permission:updateLeader"
  },
  updateReview: {
    url: `${apiPrefix.repairWorkOrderPermission}/updateReview`,
    permission: "operations:repair:permission:updateReview"
  },
  templateForm: {
    url: `${apiPrefix.repairWorkOrderPermission}/templateForm`,
    permission: ""
  },
  form: {
    url: `${apiPrefix.repairWorkOrderPermission}/form`,
    permission: ""
  },
  addTemplate: {
    url: `${apiPrefix.repairWorkOrderPermission}/addTemplate`,
    permission: "operations:repair:permission:addTemplate"
  },
  updateTemplate: {
    url: `${apiPrefix.repairWorkOrderPermission}/updateTemplate`,
    permission: "operations:repair:permission:updateTemplate"
  },
  selectTemplate: {
    url: `${apiPrefix.repairWorkOrderPermission}/selectTemplate`,
    permission: "operations:repair:permission:selectTemplate"
  },
  deleteTemplate: {
    url: `${apiPrefix.repairWorkOrderPermission}/deleteTemplate`,
    permission: "operations:repair:permission:deleteTemplate:uid"
  },
  setPermForm: {
    url: `${apiPrefix.repairWorkOrderPermission}/setPermForm`,
    permission: ""
  },
  updateSetPerm: {
    url: `${apiPrefix.repairWorkOrderPermission}/updateSetPerm`,
    permission: "operations:repair:permission:updateSetPerm"
  },
  patchSetPermForm: {
    url: `${apiPrefix.repairWorkOrderPermission}/patchSetPermForm`,
    permission: ""
  },
  updatePatchSetPerm: {
    url: `${apiPrefix.repairWorkOrderPermission}/updatePatchSetPerm`,
    permission: "operations:repair:permission:updatePatchSetPerm"
  }*/
}

export const repairWorkOrderApi = {
  detail: { url: `${apiPrefix.repairWorkOrder}/detail`, permission: "operations:repair:workOrder:select" },
  add: { url: `${apiPrefix.repairWorkOrder}/add`, permission: "operations:repair:workOrder:edit" },
  delete: { url: `${apiPrefix.repairWorkOrder}/delete`, permission: "operations:repair:workOrder:delete" },
  select: { url: `${apiPrefix.repairWorkOrder}/select`, permission: "operations:repair:workOrder:select" },
  form: { url: `${apiPrefix.repairWorkOrder}/form`, permission: "" },
  selectLeaderOption: { url: `${apiPrefix.repairWorkOrder}/selectLeaderOption`, permission: "" },
  selectTransformOption: { url: `${apiPrefix.repairWorkOrder}/selectTransformOption`, permission: "" },
  selectReviewOption: { url: `${apiPrefix.repairWorkOrder}/selectReviewOption`, permission: "" },
  selectReviewTemplateOption: { url: `${apiPrefix.repairWorkOrder}/selectReviewTemplateOption`, permission: "" },
  selectReviewTemplateFlowList: { url: `${apiPrefix.repairWorkOrder}/selectReviewTemplateFlowList`, permission: "" }
  /*saveReviewTemplate: {
    url: `${apiPrefix.repairWorkOrder}/saveReviewTemplate`,
    permission: "operations:repair:workOrder:saveReviewTemplate"
  },
  updateReviewTemplate: {
    url: `${apiPrefix.repairWorkOrder}/updateReviewTemplate`,
    permission: "operations:repair:workOrder:updateReviewTemplate"
  },
  deleteReviewTemplate: {
    url: `${apiPrefix.repairWorkOrder}/deleteReviewTemplate`,
    permission: "operations:repair:workOrder:deleteReviewTemplate:reviewTmpUid"
  },
  deleteReviewTemplateFlow: {
    url: `${apiPrefix.repairWorkOrder}/deleteReviewTemplateFlow`,
    permission: "operations:repair:workOrder:deleteReviewTemplateFlow:reviewFlowUid"
  },
  updateReviewTemplateFlow: {
    url: `${apiPrefix.repairWorkOrder}/updateReviewTemplateFlow`,
    permission: "operations:repair:workOrder:updateReviewTemplateFlow"
  },
  addReviewTemplateFlow: {
    url: `${apiPrefix.repairWorkOrder}/addReviewTemplateFlow`,
    permission: "operations:repair:workOrder:addReviewTemplateFlow"
  },
  updateReviewFlowSort: {
    url: `${apiPrefix.repairWorkOrder}/updateReviewFlowSort`,
    permission: "operations:repair:workOrder:updateReviewFlowSort"
  }*/
}

export const repairWorkOrderSnapApi = {
  selectSnapCount: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectSnapCount`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectLeader: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectLeader`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectLeaderAndTransferAndRejectTake: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectLeaderAndTransferAndRejectTake`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectHandler: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectHandler`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectDispatch: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectDispatch`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectRejectTake: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectRejectTake`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectReview: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectReview`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectCompleteConfirm: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectCompleteConfirm`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectTransfer: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectTransfer`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectComplete: {
    url: `${apiPrefix.repairWorkOrderSnap}/selectComplete`,
    permission: "operations:repair:workOrder:snap:select"
  },
  selectLeaderDispatchOption: { url: `${apiPrefix.repairWorkOrderSnap}/selectLeaderDispatchOption`, permission: "" },
  leaderToDispatch: {
    url: `${apiPrefix.repairWorkOrderSnap}/leaderToDispatch`,
    permission: "operations:repair:workOrder:snap:process"
  },
  leaderToHandler: {
    url: `${apiPrefix.repairWorkOrderSnap}/leaderToHandler`,
    permission: "operations:repair:workOrder:snap:process"
  },
  leaderToTransfer: {
    url: `${apiPrefix.repairWorkOrderSnap}/leaderToTransfer`,
    permission: "operations:repair:workOrder:snap:process"
  },
  handler: {
    url: `${apiPrefix.repairWorkOrderSnap}/handler`,
    permission: "operations:repair:workOrder:snap:process"
  },
  handlerToReview: {
    url: `${apiPrefix.repairWorkOrderSnap}/handlerToReview`,
    permission: "operations:repair:workOrder:snap:process"
  },
  handlerToCompleteConfirm: {
    url: `${apiPrefix.repairWorkOrderSnap}/handlerToCompleteConfirm`,
    permission: "operations:repair:workOrder:snap:process"
  },
  completeConfirmToComplete: {
    url: `${apiPrefix.repairWorkOrderSnap}/completeConfirmToComplete`,
    permission: "operations:repair:workOrder:snap:process"
  },
  completeConfirmToHandler: {
    url: `${apiPrefix.repairWorkOrderSnap}/completeConfirmToHandler`,
    permission: "operations:repair:workOrder:snap:process"
  },
  waitTakeOrderToHandler: {
    url: `${apiPrefix.repairWorkOrderSnap}/waitTakeOrderToHandler`,
    permission: "operations:repair:workOrder:snap:process"
  },
  waitTakeOrderToReviewTake: {
    url: `${apiPrefix.repairWorkOrderSnap}/waitTakeOrderToReviewTake`,
    permission: "operations:repair:workOrder:snap:process"
  },
  rejectOrderReviewToLeader: {
    url: `${apiPrefix.repairWorkOrderSnap}/rejectOrderReviewToLeader`,
    permission: "operations:repair:workOrder:snap:process"
  },
  rejectOrderReviewToWaitTakeOrder: {
    url: `${apiPrefix.repairWorkOrderSnap}/rejectOrderReviewToWaitTakeOrder`,
    permission: "operations:repair:workOrder:snap:process"
  },
  waitTransferAgreeToLeader: {
    url: `${apiPrefix.repairWorkOrderSnap}/waitTransferAgreeToLeader`,
    permission: "operations:repair:workOrder:snap:process"
  },
  waitTransferRejectToLeader: {
    url: `${apiPrefix.repairWorkOrderSnap}/waitTransferRejectToLeader`,
    permission: "operations:repair:workOrder:snap:process"
  },
  waitReviewToSinglePass: {
    url: `${apiPrefix.repairWorkOrderSnap}/waitReviewToSinglePass`,
    permission: "operations:repair:workOrder:snap:process"
  },
  waitReviewToHandler: {
    url: `${apiPrefix.repairWorkOrderSnap}/waitReviewToHandler`,
    permission: "operations:repair:workOrder:snap:process"
  }
}

export const inspectionDailyApi = {
  select: { url: `${apiPrefix.inspectionDaily}/select`, permission: "operations:inspection:daily:select" },
  add: { url: `${apiPrefix.inspectionDaily}/add`, permission: "operations:inspection:daily:edit" },
  detail: { url: `${apiPrefix.inspectionDaily}/detail`, permission: "operations:inspection:daily:select" },
  update: { url: `${apiPrefix.inspectionDaily}/update`, permission: "operations:inspection:daily:edit" },
  delete: { url: `${apiPrefix.inspectionDaily}/delete`, permission: "operations:inspection:daily:delete" },
  form: { url: `${apiPrefix.inspectionDaily}/form`, permission: "" },
  checkImage: { url: `${apiPrefix.inspectionDaily}/checkImage`, permission: "" },
  addImage: { url: `${apiPrefix.inspectionDaily}/addImage`, permission: "operations:inspection:daily:editImage" },
  deleteImage: {
    url: `${apiPrefix.inspectionDaily}/deleteImage`,
    permission: "operations:inspection:daily:editImage"
  },
  selectImage: {
    url: `${apiPrefix.inspectionDaily}/selectImage`,
    permission: "operations:inspection:daily:selectImage"
  }
}

export const factoryAppearanceApi = {
  selectGroup: {
    url: `${apiPrefix.factoryAppearance}/selectGroup`,
    permission: ""
  },
  addGroup: {
    url: `${apiPrefix.factoryAppearance}/addGroup`,
    permission: "operations:factoryAppearance:editGroup"
  },
  updateGroup: {
    url: `${apiPrefix.factoryAppearance}/updateGroup`,
    permission: "operations:factoryAppearance:editGroup"
  },
  deleteGroup: {
    url: `${apiPrefix.factoryAppearance}/deleteGroup`,
    permission: "operations:factoryAppearance:deleteGroup"
  },
  formGroup: {
    url: `${apiPrefix.factoryAppearance}/formGroup`,
    permission: ""
  },

  select: {
    url: `${apiPrefix.factoryAppearance}/select`,
    permission: ""
  },
  add: {
    url: `${apiPrefix.factoryAppearance}/add`,
    permission: "operations:factoryAppearance:edit"
  },
  detail: {
    url: `${apiPrefix.factoryAppearance}/detail`,
    permission: "operations:factoryAppearance:select"
  },
  update: {
    url: `${apiPrefix.factoryAppearance}/update`,
    permission: "operations:factoryAppearance:edit"
  },
  delete: {
    url: `${apiPrefix.factoryAppearance}/delete`,
    permission: "operations:factoryAppearance:delete"
  },
  form: {
    url: `${apiPrefix.factoryAppearance}/form`,
    permission: ""
  },
  getProjectListByGroupUid: {
    url: `${apiPrefix.factoryAppearance}/getProjectListByGroupUid`,
    permission: ""
  },
  output: {
    url: `${apiPrefix.factoryAppearance}/output`,
    permission: "operations:factoryAppearance:output"
  }
}

export const inspectionStationApi = {
  select: { url: `${apiPrefix.inspectionStation}/select`, permission: "operations:inspection:station:select" },
  add: { url: `${apiPrefix.inspectionStation}/add`, permission: "operations:inspection:station:edit" },
  update: { url: `${apiPrefix.inspectionStation}/update`, permission: "operations:inspection:station:edit" },
  detail: { url: `${apiPrefix.inspectionStation}/detail`, permission: "operations:inspection:station:select" },
  delete: { url: `${apiPrefix.inspectionStation}/delete`, permission: "operations:inspection:station:delete" },
  form: { url: `${apiPrefix.inspectionStation}/form`, permission: "" },
  checkImage: { url: `${apiPrefix.inspectionStation}/checkImage`, permission: "" },
  addImage: { url: `${apiPrefix.inspectionStation}/addImage`, permission: "operations:inspection:station:editImage" },
  deleteImage: {
    url: `${apiPrefix.inspectionStation}/deleteImage`,
    permission: "operations:inspection:station:editImage"
  },
  selectImage: {
    url: `${apiPrefix.inspectionStation}/selectImage`,
    permission: "operations:inspection:station:selectImage"
  }
}
export const projectScreenApi = {
  projectScreenForm: {
    url: `${apiPrefix.projectScreen}/projectScreenForm`,
    permission: ""
  },
  addProjectScreen: {
    url: `${apiPrefix.projectScreen}/addProjectScreen`,
    permission: ""
  },
  updateProjectScreen: {
    url: `${apiPrefix.projectScreen}/updateProjectScreen`,
    permission: ""
  },
  projectScreenDetail: {
    url: `${apiPrefix.projectScreen}/projectScreenDetail`,
    permission: ""
  },
  deleteProjectScreen: {
    url: `${apiPrefix.projectScreen}/deleteProjectScreen`,
    permission: ""
  },
  selectProjectScreen: {
    url: `${apiPrefix.projectScreen}/selectProjectScreen`,
    permission: ""
  },
  addProjectScreenOperation: {
    url: `${apiPrefix.projectScreen}/addProjectScreenOperation`,
    permission: ""
  },
  updateProjectScreenOperation: {
    url: `${apiPrefix.projectScreen}/updateProjectScreenOperation`,
    permission: ""
  },
  deleteProjectScreenOperation: {
    url: `${apiPrefix.projectScreen}/deleteProjectScreenOperation`,
    permission: ""
  },
  projectScreenOperationForm: {
    url: `${apiPrefix.projectScreen}/projectScreenOperationForm`,
    permission: ""
  },
  projectScreenOperationGroupForm: {
    url: `${apiPrefix.projectScreen}/projectScreenOperationGroupForm`,
    permission: ""
  },
  selectUserOverview: {
    url: `${apiPrefix.projectScreen}/selectUserOverview`,
    permission: ""
  },
  getUserTodayWork: {
    url: `${apiPrefix.projectScreen}/getUserTodayWork`,
    permission: ""
  },
  updateUserTodayWork: {
    url: `${apiPrefix.projectScreen}/updateUserTodayWork`,
    permission: ""
  },
  patchUpdateUserTodayWork: {
    url: `${apiPrefix.projectScreen}/patchUpdateUserTodayWork`,
    permission: ""
  },
  uploadImageForm: {
    url: `${apiPrefix.projectScreen}/uploadImageForm`,
    permission: ""
  },
  updateImage: {
    url: `${apiPrefix.projectScreen}/updateImage`,
    permission: ""
  },
  patchUpdateStatus: {
    url: `${apiPrefix.projectScreen}/patchUpdateStatus`,
    permission: ""
  },
  patchUpdateTodayWork: {
    url: `${apiPrefix.projectScreen}/patchUpdateTodayWork`,
    permission: ""
  }
}

export const projectAnalysisApi = {
  getTestDimensionData: {
    url: `${apiPrefix.projectAnalysis}/getTestDimensionData`,
    permission: ""
  },
  preview: { url: `${apiPrefix.projectAnalysis}/preview`, permission: "" },
  saveReport: { url: `${apiPrefix.projectAnalysis}/saveReport`, permission: "" },
  reportList: { url: `${apiPrefix.projectAnalysis}/reportList`, permission: "" },
  generalEchartDataAnalysis: { url: `${apiPrefix.projectAnalysis}generalEchartDataAnalysis`, permission: "" },
  tableBasicDataAnalysis: { url: `${apiPrefix.projectAnalysis}/tableBasicDataAnalysis`, permission: "" },
  reportUploadImage: { url: `${apiPrefix.projectAnalysis}/reportUploadImage`, permission: "" },
  getReportUploadImage: { url: `${apiPrefix.projectAnalysis}/getReportUploadImage`, permission: "" },
  deleteReportUploadImage: { url: `${apiPrefix.projectAnalysis}/deleteReportUploadImage`, permission: "" },
  getReportStore: { url: `${apiPrefix.projectAnalysis}/getReportStore`, permission: "" },
  getReportSettingData: { url: `${apiPrefix.projectAnalysis}/getReportSettingData`, permission: "" },
  reportStatus: { url: `${apiPrefix.projectAnalysis}/reportStatus`, permission: "" },
  deleteReport: { url: `${apiPrefix.projectAnalysis}/deleteReport`, permission: "" },
  addReport: { url: `${apiPrefix.projectAnalysis}/addReport`, permission: "" },
  selectAnalysis: { url: `${apiPrefix.projectAnalysis}/selectAnalysis`, permission: "" }
}

export const flowInstanceApi = {
  add: { url: `${apiPrefix.flowInstance}/add`, permission: "sys:flowInstance:edit" },
  select: { url: `${apiPrefix.flowInstance}/select`, permission: "sys:flowInstance:select" },
  form: { url: `${apiPrefix.flowInstance}/form`, permission: "" }
}

export const templateDictionaryApi = {
  add: { url: `${apiPrefix.templateDictionary}/add`, permission: "template:dictionary:edit" },
  update: { url: `${apiPrefix.templateDictionary}/update`, permission: "template:dictionary:edit" },
  delete: { url: `${apiPrefix.templateDictionary}/delete`, permission: "template:dictionary:delete" },
  select: { url: `${apiPrefix.templateDictionary}/select`, permission: "template:dictionary:select" },
  form: { url: `${apiPrefix.templateDictionary}/form`, permission: "" },
  updateSort: { url: `${apiPrefix.templateDictionary}/updateSort`, permission: "template:dictionary:edit" }
}

export const templateProductApi = {
  add: { url: `${apiPrefix.templateProduct}/add`, permission: "template:product:edit" },
  update: { url: `${apiPrefix.templateProduct}/update`, permission: "template:product:edit" },
  delete: { url: `${apiPrefix.templateProduct}/delete`, permission: "template:product:delete" },
  select: { url: `${apiPrefix.templateProduct}/select`, permission: "template:product:select" },
  form: { url: `${apiPrefix.templateProduct}/form`, permission: "" }
}

export const templateSupplierApi = {
  add: { url: `${apiPrefix.templateSupplier}/add`, permission: "template:supplier:edit" },
  update: { url: `${apiPrefix.templateSupplier}/update`, permission: "template:supplier:edit" },
  delete: { url: `${apiPrefix.templateSupplier}/delete`, permission: "template:supplier:delete" },
  select: { url: `${apiPrefix.templateSupplier}/select`, permission: "template:supplier:select" },
  form: { url: `${apiPrefix.templateSupplier}/form`, permission: "" }
}

export const templateCustomerApi = {
  add: { url: `${apiPrefix.templateCustomer}/add`, permission: "template:customer:edit" },
  update: { url: `${apiPrefix.templateCustomer}/update`, permission: "template:customer:edit" },
  delete: { url: `${apiPrefix.templateCustomer}/delete`, permission: "template:customer:delete" },
  select: { url: `${apiPrefix.templateCustomer}/select`, permission: "template:customer:select" },
  form: { url: `${apiPrefix.templateCustomer}/form`, permission: "" }
}

export const templateItemsApi = {
  add: { url: `${apiPrefix.templateItems}/add`, permission: "template:items:edit" },
  update: { url: `${apiPrefix.templateItems}/update`, permission: "template:items:edit" },
  delete: { url: `${apiPrefix.templateItems}/delete`, permission: "template:items:delete" },
  select: { url: `${apiPrefix.templateItems}/select`, permission: "template:items:select" },
  form: { url: `${apiPrefix.templateItems}/form`, permission: "" }
}

export const templateWarehouseApi = {
  add: { url: `${apiPrefix.templateWarehouse}/add`, permission: "template:warehouse:edit" },
  update: { url: `${apiPrefix.templateWarehouse}/update`, permission: "template:warehouse:edit" },
  delete: { url: `${apiPrefix.templateWarehouse}/delete`, permission: "template:warehouse:delete" },
  select: { url: `${apiPrefix.templateWarehouse}/select`, permission: "template:warehouse:select" },
  form: { url: `${apiPrefix.templateWarehouse}/form`, permission: "" }
}

export const templateUnitApi = {
  add: { url: `${apiPrefix.templateUnit}/add`, permission: "template:unit:edit" },
  update: { url: `${apiPrefix.templateUnit}/update`, permission: "template:unit:edit" },
  delete: { url: `${apiPrefix.templateUnit}/delete`, permission: "template:unit:delete" },
  select: { url: `${apiPrefix.templateUnit}/select`, permission: "template:unit:select" },
  form: { url: `${apiPrefix.templateUnit}/form`, permission: "" },
  options: { url: `${apiPrefix.templateUnit}/options`, permission: "" }
}

export const inventoryFlowApi = {
  select: { url: `${apiPrefix.inventoryFlow}/select`, permission: "inventory:flow:select" },
  detail: { url: `${apiPrefix.inventoryFlow}/detail`, permission: "inventory:flow:select" }
}

export const inventoryCommonApi = {
  usageTypeOptions: { url: `${apiPrefix.inventoryCommon}/usageTypeOptions`, permission: "" },
  bizTypeOptions: { url: `${apiPrefix.inventoryCommon}/bizTypeOptions`, permission: "" },
  bizObjectOptions: { url: `${apiPrefix.inventoryCommon}/bizObjectOptions`, permission: "" }
}

export const inventoryMaterialRequestApi = {
  add: { url: `${apiPrefix.inventoryMaterialRequest}/add`, permission: "inventory:materialRequest:edit" },
  update: { url: `${apiPrefix.inventoryMaterialRequest}/update`, permission: "inventory:materialRequest:edit" },
  deleteDetail: {
    url: `${apiPrefix.inventoryMaterialRequest}/deleteDetail`,
    permission: "inventory:materialRequest:edit"
  },
  delete: { url: `${apiPrefix.inventoryMaterialRequest}/delete`, permission: "inventory:materialRequest:delete" },
  select: { url: `${apiPrefix.inventoryMaterialRequest}/select`, permission: "inventory:materialRequest:select" },
  issueSelect: {
    url: `${apiPrefix.inventoryMaterialRequest}/issue-select`,
    permission: "inventory:materialRequestIssue:select"
  },
  issueDetail: {
    url: `${apiPrefix.inventoryMaterialRequest}/issue-detail`,
    permission: "inventory:materialRequestIssue:select"
  },
  issuePartial: {
    url: `${apiPrefix.inventoryMaterialRequest}/issue/partial`,
    permission: "inventory:materialRequestIssue:execute"
  },
  issueAll: {
    url: `${apiPrefix.inventoryMaterialRequest}/issue/all`,
    permission: "inventory:materialRequestIssue:execute"
  },
  unableIssue: {
    url: `${apiPrefix.inventoryMaterialRequest}/issue/unable`,
    permission: "inventory:materialRequestIssue:execute"
  },
  form: { url: `${apiPrefix.inventoryMaterialRequest}/form`, permission: "" },
  detail: { url: `${apiPrefix.inventoryMaterialRequest}/detail`, permission: "inventory:materialRequest:select" }
}

export const inventoryInboundApi = {
  add: { url: `${apiPrefix.inventoryInbound}/add`, permission: "inventory:inbound:edit" },
  update: { url: `${apiPrefix.inventoryInbound}/update`, permission: "inventory:inbound:edit" },
  complete: { url: `${apiPrefix.inventoryInbound}/complete`, permission: "inventory:inbound:edit" },
  deleteDetail: { url: `${apiPrefix.inventoryInbound}/deleteDetail`, permission: "inventory:inbound:edit" },
  delete: { url: `${apiPrefix.inventoryInbound}/delete`, permission: "inventory:inbound:delete" },
  cancel: { url: `${apiPrefix.inventoryInbound}/cancel`, permission: "inventory:inbound:edit" },
  select: { url: `${apiPrefix.inventoryInbound}/select`, permission: "inventory:inbound:select" },
  form: { url: `${apiPrefix.inventoryInbound}/form`, permission: "" },
  detail: { url: `${apiPrefix.inventoryInbound}/detail`, permission: "inventory:inbound:select" }
}

export const inventoryOutboundApi = {
  add: { url: `${apiPrefix.inventoryOutbound}/add`, permission: "inventory:outbound:edit" },
  update: { url: `${apiPrefix.inventoryOutbound}/update`, permission: "inventory:outbound:edit" },
  complete: { url: `${apiPrefix.inventoryOutbound}/complete`, permission: "inventory:outbound:edit" },
  deleteDetail: { url: `${apiPrefix.inventoryOutbound}/deleteDetail`, permission: "inventory:outbound:edit" },
  delete: { url: `${apiPrefix.inventoryOutbound}/delete`, permission: "inventory:outbound:delete" },
  cancel: { url: `${apiPrefix.inventoryOutbound}/cancel`, permission: "inventory:outbound:edit" },
  select: { url: `${apiPrefix.inventoryOutbound}/select`, permission: "inventory:outbound:select" },
  form: { url: `${apiPrefix.inventoryOutbound}/form`, permission: "" },
  detail: { url: `${apiPrefix.inventoryOutbound}/detail`, permission: "inventory:outbound:select" }
}

export const inventoryTransferOrderApi = {
  add: { url: `${apiPrefix.inventoryTransferOrder}/add`, permission: "inventory:transfer:edit" },
  update: { url: `${apiPrefix.inventoryTransferOrder}/update`, permission: "inventory:transfer:edit" },
  complete: { url: `${apiPrefix.inventoryTransferOrder}/complete`, permission: "inventory:transfer:edit" },
  deleteDetail: { url: `${apiPrefix.inventoryTransferOrder}/deleteDetail`, permission: "inventory:transfer:edit" },
  delete: { url: `${apiPrefix.inventoryTransferOrder}/delete`, permission: "inventory:transfer:delete" },
  cancel: { url: `${apiPrefix.inventoryTransferOrder}/cancel`, permission: "inventory:transfer:edit" },
  select: { url: `${apiPrefix.inventoryTransferOrder}/select`, permission: "inventory:transfer:select" },
  form: { url: `${apiPrefix.inventoryTransferOrder}/form`, permission: "" },
  detail: { url: `${apiPrefix.inventoryTransferOrder}/detail`, permission: "inventory:transfer:select" }
}

export const inventoryCheckOrderApi = {
  add: { url: `${apiPrefix.inventoryCheckOrder}/add`, permission: "inventory:check:edit" },
  update: { url: `${apiPrefix.inventoryCheckOrder}/update`, permission: "inventory:check:edit" },
  complete: { url: `${apiPrefix.inventoryCheckOrder}/complete`, permission: "inventory:check:edit" },
  deleteDetail: { url: `${apiPrefix.inventoryCheckOrder}/deleteDetail`, permission: "inventory:check:edit" },
  delete: { url: `${apiPrefix.inventoryCheckOrder}/delete`, permission: "inventory:check:delete" },
  cancel: { url: `${apiPrefix.inventoryCheckOrder}/cancel`, permission: "inventory:check:edit" },
  select: { url: `${apiPrefix.inventoryCheckOrder}/select`, permission: "inventory:check:select" },
  form: { url: `${apiPrefix.inventoryCheckOrder}/form`, permission: "" },
  detail: { url: `${apiPrefix.inventoryCheckOrder}/detail`, permission: "inventory:check:select" }
}

export const inventoryOverviewApi = {
  select: { url: `${apiPrefix.inventoryOverview}/select`, permission: "inventory:overview:select" },
  detail: { url: `${apiPrefix.inventoryOverview}/detail`, permission: "inventory:overview:select" }
}

export const purchaseApplyOrderApi = {
  add: { url: `${apiPrefix.purchaseApplyOrder}/add`, permission: "purchase:apply:edit" },
  update: { url: `${apiPrefix.purchaseApplyOrder}/update`, permission: "purchase:apply:edit" },
  createOrder: { url: `${apiPrefix.purchaseApplyOrder}/order/create`, permission: "purchase:apply:edit" },
  complete: { url: `${apiPrefix.purchaseApplyOrder}/complete`, permission: "purchase:apply:edit" },
  deleteDetail: { url: `${apiPrefix.purchaseApplyOrder}/deleteDetail`, permission: "purchase:apply:edit" },
  delete: { url: `${apiPrefix.purchaseApplyOrder}/delete`, permission: "purchase:apply:delete" },
  cancel: { url: `${apiPrefix.purchaseApplyOrder}/cancel`, permission: "purchase:apply:edit" },
  select: { url: `${apiPrefix.purchaseApplyOrder}/select`, permission: "purchase:apply:select" },
  form: { url: `${apiPrefix.purchaseApplyOrder}/form`, permission: "" },
  detail: { url: `${apiPrefix.purchaseApplyOrder}/detail`, permission: "purchase:apply:select" }
}

export const purchaserOrderApi = {
  select: { url: `${apiPrefix.purchaseOrder}/select`, permission: "purchase:order:select" },
  form: { url: `${apiPrefix.purchaseOrder}/form`, permission: "" },
  detail: { url: `${apiPrefix.purchaseOrder}/detail`, permission: "purchase:order:select" },
  confirm: { url: `${apiPrefix.purchaseOrder}/confirm`, permission: "purchase:order:edit" },
  inboundForm: { url: `${apiPrefix.purchaseOrder}/inbound/form`, permission: "purchase:order:select" },
  inbound: { url: `${apiPrefix.purchaseOrder}/inbound`, permission: "purchase:order:edit" },
  returnForm: { url: `${apiPrefix.purchaseOrder}/return/form`, permission: "purchase:order:select" },
  returns: { url: `${apiPrefix.purchaseOrder}/return`, permission: "purchase:order:edit" },
  close: { url: `${apiPrefix.purchaseOrder}/close`, permission: "purchase:order:edit" }
}

export const purchasePriceApi = {
  compare: { url: `${apiPrefix.purchasePrice}/compare`, permission: "purchase:order:select" },
  history: { url: `${apiPrefix.purchasePrice}/history`, permission: "purchase:order:select" }
}

export const salesOrderApi = {
  add: { url: `${apiPrefix.salesOrder}/add`, permission: "sales:order:edit" },
  update: { url: `${apiPrefix.salesOrder}/update`, permission: "sales:order:edit" },
  delete: { url: `${apiPrefix.salesOrder}/delete`, permission: "sales:order:delete" },
  select: { url: `${apiPrefix.salesOrder}/select`, permission: "sales:order:select" },
  form: { url: `${apiPrefix.salesOrder}/form`, permission: "" },
  detail: { url: `${apiPrefix.salesOrder}/detail`, permission: "sales:order:select" },
  confirm: { url: `${apiPrefix.salesOrder}/confirm`, permission: "sales:order:edit" },
  outboundForm: { url: `${apiPrefix.salesOrder}/outbound/form`, permission: "sales:order:select" },
  outbound: { url: `${apiPrefix.salesOrder}/outbound`, permission: "sales:order:edit" },
  close: { url: `${apiPrefix.salesOrder}/close`, permission: "sales:order:edit" },
  cancel: { url: `${apiPrefix.salesOrder}/cancel`, permission: "sales:order:edit" }
}

export const productionBomApi = {
  select: { url: `${apiPrefix.productionBom}/select`, permission: "production:bom:select" },
  form: { url: `${apiPrefix.productionBom}/form`, permission: "production:bom:select" },
  update: { url: `${apiPrefix.productionBom}/update`, permission: "production:bom:edit" }
}

export const productionProcessTemplateApi = {
  select: { url: `${apiPrefix.productionProcessTemplate}/select`, permission: "production:processTemplate:select" },
  form: { url: `${apiPrefix.productionProcessTemplate}/form`, permission: "production:processTemplate:select" },
  add: { url: `${apiPrefix.productionProcessTemplate}/add`, permission: "production:processTemplate:edit" },
  update: { url: `${apiPrefix.productionProcessTemplate}/update`, permission: "production:processTemplate:edit" },
  delete: { url: `${apiPrefix.productionProcessTemplate}/delete`, permission: "production:processTemplate:delete" },
  copy: { url: `${apiPrefix.productionProcessTemplate}/copy`, permission: "production:processTemplate:edit" }
}

export const productionPlanApi = {
  select: { url: `${apiPrefix.productionPlan}/select`, permission: "production:plan:select" },
  form: { url: `${apiPrefix.productionPlan}/form`, permission: "production:plan:select" },
  add: { url: `${apiPrefix.productionPlan}/add`, permission: "production:plan:edit" },
  update: { url: `${apiPrefix.productionPlan}/update`, permission: "production:plan:edit" },
  close: { url: `${apiPrefix.productionPlan}/close`, permission: "production:plan:edit" },
  delete: { url: `${apiPrefix.productionPlan}/delete`, permission: "production:plan:edit" },
  detail: { url: `${apiPrefix.productionPlan}/detail`, permission: "production:plan:select" },
  prepareForm: { url: `${apiPrefix.productionPlan}/prepare/form`, permission: "production:plan:edit" },
  prepareUpdate: { url: `${apiPrefix.productionPlan}/prepare/update`, permission: "production:plan:edit" },
  prepareConfirm: { url: `${apiPrefix.productionPlan}/prepare/confirm`, permission: "production:plan:edit" },
  issueForm: { url: `${apiPrefix.productionPlan}/issue/form`, permission: "production:plan:edit" },
  issue: { url: `${apiPrefix.productionPlan}/issue`, permission: "production:plan:edit" },
  issueConfirm: { url: `${apiPrefix.productionPlan}/issue/confirm`, permission: "production:plan:edit" },
  processForm: { url: `${apiPrefix.productionPlan}/process/form`, permission: "production:plan:edit" },
  processAdd: { url: `${apiPrefix.productionPlan}/process/add`, permission: "production:plan:edit" },
  processUpdate: { url: `${apiPrefix.productionPlan}/process/update`, permission: "production:plan:edit" },
  processDelete: { url: `${apiPrefix.productionPlan}/process/delete`, permission: "production:plan:edit" },
  processNodeComplete: { url: `${apiPrefix.productionPlan}/process/node/complete`, permission: "production:plan:edit" },
  processNodeRework: { url: `${apiPrefix.productionPlan}/process/node/rework`, permission: "production:plan:edit" },
  processConfirmComplete: {
    url: `${apiPrefix.productionPlan}/process/confirm-complete`,
    permission: "production:plan:edit"
  },
  finishInboundForm: { url: `${apiPrefix.productionPlan}/finish/inbound/form`, permission: "production:plan:edit" },
  finishInbound: { url: `${apiPrefix.productionPlan}/finish/inbound`, permission: "production:plan:edit" }
}

export const flowDefinitionApi = {
  schema: { url: `${apiPrefix.flowDefinition}/schema`, permission: "" }
}

export const flowEngineApi = {
  status: { url: `${apiPrefix.flowEngine}/status`, permission: "" },
  start: { url: `${apiPrefix.flowEngine}/start`, permission: "" },
  approve: { url: `${apiPrefix.flowEngine}/approve`, permission: "" },
  reject: { url: `${apiPrefix.flowEngine}/reject`, permission: "" },
  withdraw: { url: `${apiPrefix.flowEngine}/withdraw`, permission: "" }
}

export const FlowTaskApi = {
  pending: { url: `${apiPrefix.flowTask}/pending`, permission: "" },
  completed: { url: `${apiPrefix.flowTask}/completed`, permission: "" },
  copy: { url: `${apiPrefix.flowTask}/copy`, permission: "" },
  history: { url: `${apiPrefix.flowTask}/history`, permission: "" },
  detail: { url: `${apiPrefix.flowTask}/detail`, permission: "" }
}

export const TaskCenterApi = {
  pending: { url: `${apiPrefix.taskCenter}/pending`, permission: "" },
  completed: { url: `${apiPrefix.taskCenter}/completed`, permission: "" },
  copy: { url: `${apiPrefix.taskCenter}/copy`, permission: "" },
  detail: { url: `${apiPrefix.taskCenter}/detail`, permission: "" },
  submit: { url: `${apiPrefix.taskCenter}/submit`, permission: "" }
}
