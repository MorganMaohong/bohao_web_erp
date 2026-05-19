import { getToken } from "@/utils/cache/cookies"

const TOKEN_QUERY_KEY = "accessToken"

function isSafeSystemHost(url: URL) {
  const currentHost = window.location.hostname
  return url.origin === window.location.origin || url.hostname === currentHost || url.hostname.endsWith(".bohao.wang")
}

export function appendAccessTokenToUrl(rawUrl?: string) {
  if (!rawUrl) return ""
  const token = getToken()
  if (!token) return rawUrl

  try {
    const isAbsolute = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    const url = isAbsolute ? new URL(rawUrl) : new URL(rawUrl, window.location.origin)

    if (!isSafeSystemHost(url)) {
      return rawUrl
    }

    if (!url.searchParams.get(TOKEN_QUERY_KEY)) {
      url.searchParams.set(TOKEN_QUERY_KEY, token)
    }

    return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`
  } catch {
    return rawUrl
  }
}

export function openSystemUrl(rawUrl?: string, target = "_blank") {
  const nextUrl = appendAccessTokenToUrl(rawUrl)
  if (!nextUrl) return
  window.open(nextUrl, target, "noopener,noreferrer")
}
