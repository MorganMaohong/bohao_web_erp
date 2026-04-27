<template>
  <div class="timeline">
    <div v-for="node in nodes" :key="node.uid" class="node">
      <div class="content">
        <div class="flex items-center justify-between">
          <div class="title flex items-center">
            {{ node.nodeName }}
          </div>
          <div v-if="node.nodeType === 'FLOW_NODE_APPROVE'">
            <n-button type="info" @click="addNext">新增审批</n-button>
          </div>
        </div>

        <!-- 审批节点 -->
        <template v-if="node.nodeType === 'FLOW_NODE_APPROVE'">
          <n-tree
            class="mt-2"
            :data="data"
            key-field="uid"
            label-field="name"
            :render-suffix="renderSuffix"
            default-expand-all
            :block-node="false"
            block-line
            show-line
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from "vue"
import { NButton, NIcon, NSpace } from "naive-ui"
import { AddOutline, TrashOutline } from "@vicons/ionicons5"
import { FlowInstanceApproveForm } from "@/model/flow/index.js"

const data = ref<FlowInstanceApproveForm[]>([])

const props = defineProps({
  list: Array
})

defineExpose({
  data
})

// 初始化审批 children
const nodes = reactive(
  props.list.map((n) => ({
    ...n,
    children: n.nodeType === "FLOW_NODE_APPROVE" ? [] : null
  }))
)

function renderSuffix({ option }) {
  return h(
    NSpace,
    { size: 4 },
    {
      default: () => [
        // 新增
        h(
          NButton,
          {
            size: "tiny",
            quaternary: true,
            circle: true,
            onClick: () => addNode(option)
          },
          {
            icon: () =>
              h(NIcon, null, {
                default: () => h(AddOutline)
              })
          }
        ),

        // 删除
        h(
          NButton,
          {
            size: "tiny",
            quaternary: true,
            circle: true,
            type: "error",
            onClick: () => removeNode(option)
          },
          {
            icon: () =>
              h(NIcon, null, {
                default: () => h(TrashOutline)
              })
          }
        )
      ]
    }
  )
}

function getApproveLevel(tree, uid, level = 0) {
  for (const node of tree) {
    if (node.uid === uid) return level

    if (node.children?.length) {
      const found = getApproveLevel(node.children, uid, level + 1)
      if (found !== -1) return found
    }
  }

  return -1
}

function removeNode(target) {
  removeFromTree(data.value, target.uid)
  reIndex(data.value)
}

function removeFromTree(list, uid) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i]

    if (item.uid === uid) {
      list.splice(i, 1)
      return true
    }

    if (item.children?.length) {
      const removed = removeFromTree(item.children, uid)
      if (removed) return true
    }
  }

  return false
}

function addNode(node) {
  node.children ??= []

  const index = node.children.length + 1

  const path = node.path ? `${node.path}-${index}` : `${index}`

  node.children.push({
    uid: crypto.randomUUID(),
    path,
    parentUid: node.uid,
    name: `审批-${path}`,
    children: []
  })
  reIndex(data.value)
}

function reIndex(list, parentPath = "") {
  list.forEach((item, idx) => {
    const path = parentPath ? `${parentPath}-${idx + 1}` : `${idx + 1}`

    item.path = path
    item.name = `审批-${path}`

    if (item.children?.length) {
      reIndex(item.children, path)
    }
  })
}

function addNext() {
  const index = data.value.length + 1

  const path = `${index}`

  data.value.push({
    uid: crypto.randomUUID(),
    path,
    parentUid: "",
    name: `审批-${path}`,
    children: []
  })
  reIndex(data.value)
}
</script>

<style scoped>
.timeline {
}

.node {
  display: flex;
  position: relative;
  margin-bottom: 20px;
}

.dot {
  width: 14px;
  height: 14px;
  background: #409eff;
  border-radius: 50%;
  margin-right: 12px;
}

.content {
  background: #f7f8fa;
  padding: 10px 14px;
  border-radius: 6px;
  width: 100%;
}

.title {
  font-weight: 600;
  margin-bottom: 6px;
}
</style>
