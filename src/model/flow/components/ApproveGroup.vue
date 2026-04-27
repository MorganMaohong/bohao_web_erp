<template>
  <div class="flow">
    <div v-for="(node, index) in nodes" :key="node.uid" class="node">
      <!-- 左侧时间线 -->
      <div class="line">
        <span class="dot" />
        <span v-if="index !== nodes.length - 1" class="bar" />
      </div>

      <!-- 节点卡片 -->
      <div class="card">
        <div class="title">
          {{ node.nodeName }}
        </div>

        <div class="actions">
          <!-- 只有第一个允许新增 -->
          <button v-if="index === 0" @click="addNext(index)">+ 添加审批</button>

          <button v-else class="danger" @click="remove(index)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue"

const nodes = reactive([
  {
    uid: crypto.randomUUID(),
    nodeName: "审批节点"
  }
])

function addNext(index) {
  nodes.splice(index + 1, 0, {
    uid: crypto.randomUUID(),
    nodeName: "新增审批"
  })
}

function remove(index) {
  nodes.splice(index, 1)
}
</script>

<style scoped>
.flow {
  padding: 20px;
}

.node {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.line {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  background: #409eff;
  border-radius: 50%;
}

.bar {
  width: 2px;
  flex: 1;
  background: #ddd;
}

.card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 500;
}

.actions button {
  background: #409eff;
  border: none;
  color: white;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
}

.actions .danger {
  background: #f56c6c;
}
</style>
