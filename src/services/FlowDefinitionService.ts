import { flowDefinitionApi } from "@/services/api"
import request from "@/utils/request"
import { FlowDefinitionSchemaVo } from "@/model/flow/schema"

export const FlowDefinitionService = {
  async schema(flowType: string): Promise<FlowDefinitionSchemaVo> {
    try {
      const res = await request({
        url: `${flowDefinitionApi.schema.url}/${flowType}`,
        method: "POST"
      })
      return Promise.resolve(res.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
