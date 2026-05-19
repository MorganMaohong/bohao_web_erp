/// <reference types="vitest" />

import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
import path, { resolve } from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import svgLoader from "vite-svg-loader"
import UnoCSS from "unocss/vite"

const packageChunkGroups: Record<string, string[]> = {
  charts: ["echarts", "echarts-gl", "zrender"],
  mqtt: ["mqtt"],
  amap: ["@amap"]
}

function resolveChunkGroup(id: string) {
  const normalizedId = id.replace(/\\/g, "/")
  if (!normalizedId.includes("/node_modules/")) return undefined
  for (const [groupName, packages] of Object.entries(packageChunkGroups)) {
    if (
      packages.some((pkg) => {
        const pnpmPackageName = pkg.replace("/", "+")
        return (
          normalizedId.includes(`/node_modules/${pkg}/`) ||
          normalizedId.includes(`/node_modules/.pnpm/${pnpmPackageName}@`)
        )
      })
    ) {
      return `vendor-${groupName}`
    }
  }
  return "vendor-misc"
}

function resolveAssetFileNames(assetName?: string) {
  const normalizedName = assetName?.replace(/\\/g, "/") ?? ""
  const ext = path.extname(normalizedName).toLowerCase()
  if (ext === ".css") return "static/css/[name]-[hash][extname]"
  if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif", ".ico"].includes(ext)) {
    return "static/img/[name]-[hash][extname]"
  }
  if ([".woff", ".woff2", ".ttf", ".otf", ".eot"].includes(ext)) {
    return "static/fonts/[name]-[hash][extname]"
  }
  return "static/assets/[name]-[hash][extname]"
}
/** 配置项文档：https://cn.vitejs.dev/config */
export default ({ mode }: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(mode, process.cwd()) as unknown as ImportMetaEnv
  const { VITE_PUBLIC_PATH } = viteEnv
  return {
    /** 打包时根据实际情况修改 base */
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        "@": resolve(__dirname, "./src")
      }
    },
    server: {
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true, // host: "0.0.0.0"
      /** 端口号 */
      port: 3334,
      /** 是否自动打开浏览器 */
      open: true,
      /** 跨域设置允许 */
      cors: true,
      /** 端口被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        [viteEnv.VITE_BASE_API]: {
          target: viteEnv.VITE_BASE_URL,
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp("^" + viteEnv.VITE_BASE_API), "")
        }
      },
      /** 预热常用文件，提高初始页面加载速度 */
      warmup: {
        clientFiles: ["./src/layouts/**/*.vue"]
      }
    },
    build: {
      /** 单个 chunk 文件的大小超过 1024KB 时发出警告 */
      chunkSizeWarningLimit: 1024,
      /** 禁用 gzip 压缩大小报告 */
      reportCompressedSize: false,
      /** 打包后静态资源目录 */
      assetsDir: "static",
      outDir: "bherp",
      rollupOptions: {
        output: {
          manualChunks(id) {
            return resolveChunkGroup(id)
          },
          entryFileNames: "static/js/[name]-[hash].js",
          chunkFileNames: "static/js/[name]-[hash].js",
          assetFileNames: ({ name }) => resolveAssetFileNames(name)
        }
      }
    },
    /** 混淆器 */
    esbuild:
      mode === "development"
        ? undefined
        : {
            /** 打包时移除 console.log */
            pure: ["console.log"],
            /** 打包时移除 debugger */
            drop: ["debugger"],
            /** 打包时移除所有注释 */
            legalComments: "none"
          },
    /** Vite 插件 */
    plugins: [
      vue(),
      vueJsx(),
      /** 将 SVG 静态图转化为 Vue 组件 */
      svgLoader({ defaultImport: "url" }),
      /** SVG */
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
        symbolId: "icon-[dir]-[name]"
      }),
      /** UnoCSS */
      UnoCSS()
    ],
    /** Vitest 单元测试配置：https://cn.vitest.dev/config */
    test: {
      include: ["tests/**/*.test.ts"],
      environment: "jsdom"
    }
  }
}
