const BASE_Z_INDEX = 3000
const Z_INDEX_STEP = 100

let nextZIndex = BASE_Z_INDEX - Z_INDEX_STEP

/** 打开 FormModal 时分配层级（单调递增，避免嵌套弹窗关闭顺序导致层级冲突） */
export function acquireFormModalZIndex(explicit?: number): number {
  if (typeof explicit === "number") return explicit
  nextZIndex += Z_INDEX_STEP
  return nextZIndex
}

/** 关闭 FormModal（计数仅用于显式 z-index 时跳过） */
export function releaseFormModalZIndex(_explicit?: number): void {
  // 保持单调递增，不按关闭顺序回退
}
