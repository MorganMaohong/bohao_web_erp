export interface FlowDefinitionSchemaUserVo {
  uid?: string
  name?: string
  headImage?: string
  status?: string
  statusName?: string
  comment?: string
  highlight?: boolean
}

export interface FlowDefinitionSchemaNodeVo {
  nodeUid?: string
  nodeName?: string
  nodeType?: string
  nodeTypeLabel?: string
  nodeSort?: number
  approveType?: string
  approveTypeLabel?: string
  summary?: string
  comment?: string
  status?: string
  statusName?: string
  current?: boolean
  sourceLabels?: string[]
  users?: FlowDefinitionSchemaUserVo[]
}

export interface FlowDefinitionSchemaVo {
  definitionUid?: string
  flowType?: string
  flowTypeLabel?: string
  flowName?: string
  status?: string
  statusName?: string
  currentNodeUid?: string
  currentNodeName?: string
  nodes?: FlowDefinitionSchemaNodeVo[]
}
