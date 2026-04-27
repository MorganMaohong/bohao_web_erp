import request from "@/utils/request"
import { fileApi } from "@/services/api"

export const FileService = {
  async uploadFile(url: string, data: FormData): Promise<string> {
    try {
      const res = await request({
        url,
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" }
      })

      return Promise.resolve(res.data)
    } catch (err) {
      console.error("File upload error:", err)
      return Promise.reject(err)
    }
  },
  async uploadTimeWatermark(data: FormData): Promise<string> {
    try {
      const res = await request({
        url: fileApi.uploadTimeWatermark.url,
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" }
      })

      return Promise.resolve(res.data)
    } catch (err) {
      console.error("File upload error:", err)
      return Promise.reject(err)
    }
  }
}
