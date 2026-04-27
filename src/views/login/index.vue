<template>
  <div class="login-page">
    <div class="login-page__bg" aria-hidden="true">
      <div class="login-page__orb login-page__orb--1" />
      <div class="login-page__orb login-page__orb--2" />
      <div class="login-page__grid" />
    </div>

    <!-- 单卡片对称双栏：大屏 1:1，小屏上下堆叠 -->
    <div class="login-page__shell">
      <div class="login-page__unified">
        <aside class="login-page__col login-page__col--brand">
          <div class="login-page__logo-wrap">
            <img src="@/assets/favicon.ico" alt="" class="login-page__logo" width="48" height="48" />
          </div>
          <h1 class="login-page__title">博灏智控云智慧 ERP</h1>
          <p class="login-page__subtitle">企业资源计划 · 数据驱动运营</p>
          <ul class="login-page__bullets">
            <li>多模块一体化管理</li>
            <li>实时数据与流程协同</li>
            <li>安全可靠的权限体系</li>
          </ul>
          <div class="login-page__brand-art">
            <img src="@/assets/loginright.png" alt="" class="login-page__illustration" />
          </div>
        </aside>

        <main class="login-page__col login-page__col--form">
          <div class="login-page__form-head">
            <h2 class="login-page__form-title">欢迎登录</h2>
            <p class="login-page__form-desc">请输入账号信息以进入系统</p>
          </div>

          <n-form
            :model="userForm"
            :show-label="false"
            size="large"
            class="login-page__form"
            @keydown.enter.prevent="onClickLogin"
          >
            <n-form-item path="username">
              <n-input
                v-model:value="userForm.username"
                placeholder="用户名"
                :input-props="{ autocomplete: 'username' }"
                clearable
              >
                <template #prefix>
                  <n-icon :component="UserIcon" class="login-page__input-icon" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password">
              <n-input
                v-model:value="userForm.password"
                type="password"
                show-password-on="click"
                placeholder="密码"
                :input-props="{ autocomplete: 'current-password' }"
                @keydown.enter.prevent="onClickLogin"
              >
                <template #prefix>
                  <n-icon :component="LockedIcon" class="login-page__input-icon" />
                </template>
              </n-input>
            </n-form-item>

            <div class="login-page__row">
              <n-checkbox v-model:checked="userForm.check">30 天内免登录</n-checkbox>
              <n-button text type="primary" tag="a" class="login-page__link" @click.prevent> 忘记密码？</n-button>
            </div>

            <n-button
              type="primary"
              block
              size="large"
              class="login-page__submit"
              :loading="loggingIn"
              :disabled="loggingIn"
              @click="onClickLogin"
            >
              登录
            </n-button>
          </n-form>
        </main>
      </div>

      <p class="login-page__footer-note">© {{ year }} 博灏智控 · 内部系统请勿外泄</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { LoginService } from "@/services/AuthService"
import { LoginData } from "@/model/auth"
import { useUserStore } from "@/store/modules/user"
import { usePermissionStore } from "@/store/modules/permission"
import routeSettings from "@/config/route"
import { Locked, User } from "@vicons/carbon"

const UserIcon = User
const LockedIcon = Locked

const router = useRouter()
const loggingIn = ref(false)
const year = computed(() => new Date().getFullYear())

const userForm = ref<LoginData>({
  captcha: "",
  check: false,
  password: "",
  username: "",
  dPassword: "",
  isEncrypted: false
})

async function onClickLogin() {
  if (loggingIn.value) return
  loggingIn.value = true
  try {
    const res = await LoginService.login(userForm.value)
    /*const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    userStore.loginInfo = res

    await userStore.getUserInfo()
    if (routeSettings.dynamic) {
      permissionStore.setRoutes(userStore.userInfo.menuList)
    } else {
      permissionStore.setAllRoutes()
    }
    for (const route of permissionStore.routes) {
      router.addRoute(route)
    }

    const homePath = res.sysHomePageRouter || permissionStore.rootPath || "/"
    await router.push({ path: homePath })*/
    await router.push("/")
  } catch (err) {
    console.error("登录失败：", err)
  } finally {
    loggingIn.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  flex: 1;
  min-height: 0;
  min-height: 100dvh;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 40px);
  overflow-x: hidden;
  background: #0f172a;
}

.login-page__bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(145deg, #0c1222 0%, #1e1b4b 42%, #312e81 100%);
  pointer-events: none;
}

.login-page__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
}

.login-page__orb--1 {
  width: min(55vw, 520px);
  height: min(55vw, 520px);
  background: #6366f1;
  top: -12%;
  right: -8%;
}

.login-page__orb--2 {
  width: min(45vw, 400px);
  height: min(45vw, 400px);
  background: #22d3ee;
  bottom: -10%;
  left: -5%;
  opacity: 0.25;
}

.login-page__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%);
}

.login-page__shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 920px;
}

/* 对称主卡片：两列等宽等高 */
.login-page__unified {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  min-height: min(520px, calc(100dvh - 120px));
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.08);

  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    min-height: 480px;
  }
}

.login-page__col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px);
}

.login-page__col--brand {
  background: linear-gradient(165deg, #1e1b4b 0%, #312e81 48%, #4338ca 100%);
  color: #f8fafc;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  @media (min-width: 880px) {
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
  }
}

.login-page__col--form {
  background: #fff;
}

.login-page__logo-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.login-page__logo {
  display: block;
}

.login-page__title {
  margin: 0;
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.login-page__subtitle {
  margin: 10px 0 0;
  font-size: 0.9rem;
  color: rgba(248, 250, 252, 0.78);
  line-height: 1.5;
}

.login-page__bullets {
  margin: 22px 0 0;
  padding-left: 1.1rem;
  font-size: 0.8125rem;
  color: rgba(248, 250, 252, 0.82);
  line-height: 1.8;
}

.login-page__brand-art {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: center;
}

.login-page__illustration {
  max-width: 85%;
  max-height: 140px;
  object-fit: contain;
  opacity: 0.95;
}

.login-page__form-head {
  margin-bottom: 8px;
}

.login-page__form-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.login-page__form-desc {
  margin: 8px 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.login-page__form {
  margin-top: 12px;
}

.login-page__form :deep(.n-form-item) {
  margin-bottom: 18px;
}

.login-page__form :deep(.n-input) {
  --n-border-radius: 12px !important;
  --n-height: 48px !important;
}

.login-page__form :deep(.n-input__input-el) {
  font-size: 15px;
}

.login-page__input-icon {
  font-size: 18px;
  opacity: 0.55;
  color: #64748b;
}

.login-page__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
  font-size: 13px;
}

.login-page__link {
  font-size: 13px;
}

.login-page__submit {
  height: 48px !important;
  border-radius: 12px !important;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.04em;
}

.login-page__footer-note {
  margin: 20px 8px 0;
  text-align: center;
  font-size: 12px;
  color: rgba(248, 250, 252, 0.45);
}
</style>
