import request from "@/utils/request"
import {
  RepairWorkOrderCompleteConfirmVo,
  RepairWorkOrderCompleteVo,
  RepairWorkOrderDispatch,
  RepairWorkOrderDispatchVo,
  RepairWorkOrderHandler,
  RepairWorkOrderHandlerVo,
  RepairWorkOrderLeaderAndTransferAndRejectTakeVo,
  RepairWorkOrderLeaderVo,
  RepairWorkOrderRejectTakeVo,
  RepairWorkOrderReviewVo,
  RepairWorkOrderSnapCount,
  RepairWorkOrderSnapQuery,
  RepairWorkOrderSnapQueryData,
  RepairWorkOrderTransfer,
  RepairWorkOrderTransferVo
} from "@/model/operations/repair/workOrder/snap"
import { OptionVo, PageVo } from "src/model"
import { repairWorkOrderSnapApi } from "@/services/api"

export const RepairWorkOrderSnapService = {
  async selectSnapCount(): Promise<RepairWorkOrderSnapCount> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectSnapCount.url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectLeader(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderLeaderVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectLeader.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectLeaderAndTransferAndRejectTake(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderLeaderAndTransferAndRejectTakeVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({
        url: repairWorkOrderSnapApi.selectLeaderAndTransferAndRejectTake.url,
        method: "POST",
        data
      })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectHandler(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderHandlerVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectHandler.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },

  async selectDispatch(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderDispatchVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectDispatch.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },

  async selectRejectTake(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderRejectTakeVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectRejectTake.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },

  async selectReview(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderReviewVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectReview.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },

  async selectCompleteConfirm(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderCompleteConfirmVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectCompleteConfirm.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },

  async selectTransfer(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderTransferVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectTransfer.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectComplete(
    data: RepairWorkOrderSnapQuery
  ): Promise<PageVo<RepairWorkOrderCompleteVo, RepairWorkOrderSnapQueryData>> {
    try {
      const res = await request({ url: repairWorkOrderSnapApi.selectComplete.url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectLeaderDispatchOption(leaderUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderSnapApi.selectLeaderDispatchOption.url + `/${leaderUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async selectProjectLeaderDispatchOption(projectUid: string, leaderUid: string): Promise<OptionVo[]> {
    try {
      const url = repairWorkOrderSnapApi.selectLeaderDispatchOption.url + `/${projectUid}/${leaderUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async leaderToDispatch(snapUid: string, data: RepairWorkOrderDispatch): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.leaderToDispatch.url + `/${snapUid}`
      const res = await request({ url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async leaderToHandler(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.leaderToHandler.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async leaderToTransfer(snapUid: string, data: RepairWorkOrderTransfer): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.leaderToTransfer.url + `/${snapUid}`
      const res = await request({ url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async handler(snapUid: string, data: RepairWorkOrderHandler): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.handler.url + `/${snapUid}`
      const res = await request({ url, method: "POST", data })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async handlerToReview(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.handlerToReview.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async handlerToCompleteConfirm(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.handlerToCompleteConfirm.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async completeConfirmToComplete(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.completeConfirmToComplete.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async completeConfirmToHandler(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.completeConfirmToHandler.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async waitTakeOrderToHandler(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.waitTakeOrderToHandler.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async waitTakeOrderToReviewTake(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.waitTakeOrderToReviewTake.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async rejectOrderReviewToLeader(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.rejectOrderReviewToLeader.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async rejectOrderReviewToWaitTakeOrder(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.rejectOrderReviewToWaitTakeOrder.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async waitTransferAgreeToLeader(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.waitTransferAgreeToLeader.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async waitTransferRejectToLeader(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.waitTransferRejectToLeader.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async waitReviewToSinglePass(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.waitReviewToSinglePass.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  },
  async waitReviewToHandler(snapUid: string): Promise<void> {
    try {
      const url = repairWorkOrderSnapApi.waitReviewToHandler.url + `/${snapUid}`
      const res = await request({ url, method: "POST" })
      return res.data
    } catch (err) {
      return await Promise.reject(err)
    }
  }
}
