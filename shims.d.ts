// shims.d.ts
interface Window {
  $message: ReturnType<typeof useMessage>
}
