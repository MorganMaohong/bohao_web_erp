<script lang="ts" setup>
import { ref, defineProps, defineEmits, onMounted } from "vue"
import { UploadFileInfo } from "naive-ui"
import { FileService } from "@/services/FileService"
import { apiPrefix, fileApi } from "@/services/api"

// 定义上传类型
type UploadType = "image" | "document"

// 定义 Props
const props = defineProps({
  uploadType: {
    type: String as () => UploadType,
    default: "image" // 默认是图片上传
  },
  maxSize: {
    type: Number,
    default: 10 // 最大文件大小（单位 MB）
  },
  uploadUrl: {
    type: String,
    default: fileApi.uploadFile.url
  }
})

const emit = defineEmits(["before-upload"])

// 允许的文件格式
const FileFormats = {
  image: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "webp", "svg", "eps"],
  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"]
}
onMounted(() => {
  console.log(props.uploadUrl)
})

// 处理文件上传前校验
function handleBeforeUpload(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  const file = options.file.file
  if (!file) return false

  // 获取对应类型的允许格式
  const allowedFormats = FileFormats[props.uploadType] || []

  // 校验文件
  const validate = validateFile(file, props.maxSize, allowedFormats)
  if (!validate.type) {
    window.$message.error(validate.msg)
    return false
  }

  // 上传
  const uploadData = new FormData()
  uploadData.append("file", file)
  FileService.uploadFile(props.uploadUrl, uploadData).then((url) => {
    emit("before-upload", url)
  })
  return false
}

// 文件校验
function validateFile(file: File, maxSizeMB: number, allowedFormats: string[]): { msg: string; type: boolean } {
  const maxSize = maxSizeMB * 1024 * 1024
  const fileExt = file.name.split(".").pop()?.toLowerCase()

  if (!fileExt || !allowedFormats.includes(fileExt)) {
    return { msg: `仅支持 ${allowedFormats.join(", ")} 格式`, type: false }
  }
  if (file.size > maxSize) {
    return { msg: `文件大小不能超过 ${maxSizeMB}MB`, type: false }
  }
  return { msg: "", type: true }
}
</script>

<template>
  <n-upload @before-upload="handleBeforeUpload">
    <slot />
  </n-upload>
</template>

<style lang="scss" scoped>
.n-upload {
  width: auto;
}
</style>
