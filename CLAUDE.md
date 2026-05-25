# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                  # Start dev server (port 3334, hot-reload)
pnpm build:prod           # Production build → bherp/
pnpm build:stage          # Staging build (with vue-tsc type check)
pnpm preview:prod         # Production build + preview
pnpm lint                 # ESLint + Prettier (auto-fix)
pnpm lint:eslint          # ESLint only
pnpm lint:prettier        # Prettier only
pnpm test                 # Run Vitest (tests/**/*.test.ts, jsdom env)
```

## Architecture

This is **博灏智慧ERP** (Bohao Smart ERP), a forked `v3-admin-vite` admin template. Vue 3 + TypeScript + Vite, with **both Element Plus and Naive UI** as UI frameworks (Naive UI wraps the app shell; Element Plus is used for per-page components).

### Routing (dynamic, permission-driven)

- `src/router/index.ts` — constant routes (login, 404, etc.); `dynamicRoutes` is empty at build time.
- `src/router/permission.ts` — beforeEach guard: checks token, fetches user info, calls `permissionStore.setRoutes(menuList)` which translates the backend menu tree into Vue Router routes.
- Route config in `src/config/route.ts`: `dynamic: true` means routes come from the backend. Each menu item maps to a component at `src/views/<component>/index.vue` via `import.meta.glob`.
- Token authentication via `x-token` header, with support for SSO-style URL token bootstrap (`bootstrapTokenFromUrl()` in `main.ts`).

### State management (Pinia)

- `src/store/modules/user.ts` — current user info, roles, permissions list.
- `src/store/modules/permission.ts` — dynamically generated routes, `setRoutes(menuList)` builds the route tree from backend menu data.
- `src/store/modules/app.ts` — sidebar state, device type, component size.
- `src/store/modules/settings.ts` — layout settings (theme, watermark, etc.).
- Other domain stores: `notify.ts`, `gateway.ts`, `project.ts`, `task.ts`, `tags-view.ts`, `flow.ts`, `repairWorkOrder.ts`.

### API layer

- `src/utils/request.ts` — Axios instance with interceptors: attaches `x-token`/`satoken` headers, handles blob downloads, code-based response handling (code 0 = success, -1 = error, 501 = token expired).
- `src/services/api/index.ts` — all API endpoint definitions (URL + permission key pairs), organized by domain (user, gateway, inventory, purchase, sales, production, etc.).
- `src/services/*.ts` — service functions per domain (e.g., `UserService.ts`, `GatewayService.ts`), each method calls the corresponding API via the request instance.

### Views (business modules)

- `src/views/login/` — login page
- `src/views/template/` — data templates (product, customer, supplier, warehouse, unit, items, dictionary)
- `src/views/inventory/` — inventory management (inbound, outbound, transfer, check, overview, flow, material request)
- `src/views/purchase/` — procurement (apply, order, inbound, return)
- `src/views/sales/` — sales orders
- `src/views/product/` — production (BOM, plan, process template)
- Additional routes (user/role/menu/permission/dept/post management, gateway monitoring, etc.) have Services but no view directories under `src/views/` — they are likely rendered via other modules or external micro-frontends.

### Layout

Only **Left mode** (sidebar on left) is active. Top and LeftTop modes are commented out in `src/layouts/index.vue`. The layout is in `src/layouts/LeftMode.vue`.

### Key integrations

- **MQTT** (`src/utils/mqttUtil.ts`) — connects to MQTT broker for real-time gateway data
- **WebSocket** (`src/utils/websocket.ts`) — for system notifications
- **ECharts + echarts-gl** — dashboards and data visualization
- **Vue Flow** (`@vue-flow/core`) — flow diagram editor
- **VXE Table** (`vxe-table`) — advanced data tables
- **AMap** (`@amap/amap-jsapi-loader`) — map display

### Styling

Three systems coexist: **SCSS** (`src/styles/`), **UnoCSS** (atomic CSS with `presetAttributify`), and **Tailwind CSS v4**. Naive UI theme overrides are set in `App.vue`. Dark mode toggles via `useTheme()` hook with a `dark` class on `<html>`.
