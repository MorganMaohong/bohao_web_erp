<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useMessage } from "naive-ui"
import { CameraOutline, LockClosedOutline, PersonCircleOutline, ShieldCheckmarkOutline } from "@vicons/ionicons5"
import { useAppStore } from "@/store/modules/app"
import { useUserStore } from "@/store/modules/user"
import { UserService } from "@/services/UserService"
import { UserPasswordChangeForm, UserPasswordResetApplyForm, UserProfileForm } from "@/model/user"
import FastUpload from "@/components/FastUpload/FastUpload.vue"

const appStore = useAppStore()
const userStore = useUserStore()
const message = useMessage()
const componentSize = computed(() => appStore.componentSize as any)
const profileForm = ref<UserProfileForm>({})
const passwordForm = ref<UserPasswordChangeForm>({})
const resetForm = ref<UserPasswordResetApplyForm>({})
const loading = ref(false)

const sexOptions = [
  { label: "男", value: "man" },
  { label: "女", value: "woman" }
]

const displayName = computed(() => profileForm.value.name || userStore.userInfo?.name || "未设置姓名")
const displayPhone = computed(() => profileForm.value.phone || "未设置手机号")
const displaySex = computed(() => sexOptions.find((item) => item.value === profileForm.value.sex)?.label || "未设置")
const username = computed(() => userStore.userInfo?.username || "-")
const isSuperAdmin = computed(() => Boolean((userStore.userInfo as any)?.superAdmin))
const roleNames = computed(() => {
  const roleList = userStore.userInfo?.roleList || []
  return (
    roleList
      .map((item: any) => (typeof item === "string" ? item : item?.name))
      .filter(Boolean)
      .join(" / ") || "未分配角色"
  )
})
const deptLabel = computed(() => (userStore.userInfo as any)?.deptLabel || "未设置部门")
const postLabel = computed(() => (userStore.userInfo as any)?.postLabel || "未设置职位")
const jobName = computed(() => (userStore.userInfo as any)?.jobName || "未设置岗位")

async function loadProfile() {
  profileForm.value = await UserService.profile()
}

async function saveProfile() {
  loading.value = true
  try {
    await UserService.updateProfile(profileForm.value)
    await userStore.getUserInfo()
    message.success("个人资料已更新")
  } finally {
    loading.value = false
  }
}

async function submitPasswordChange() {
  loading.value = true
  try {
    await UserService.changePassword(passwordForm.value)
    passwordForm.value = {}
    message.success("密码修改成功")
  } finally {
    loading.value = false
  }
}

async function submitResetApply() {
  loading.value = true
  try {
    await UserService.applyPasswordReset(resetForm.value)
    resetForm.value = {}
    message.success("已提交密码重置申请")
  } finally {
    loading.value = false
  }
}

function pushAvatar(url: string) {
  profileForm.value.headImage = url
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="profile-page overflow-auto">
    <div class="profile-page__hero">
      <div>
        <div class="profile-page__eyebrow">User Center</div>
        <h1 class="profile-page__title">个人中心</h1>
        <p class="profile-page__subtitle">
          在这里维护你的基础资料、登录密码与账号安全设置。资料改动会立即同步到当前系统会话。
        </p>
      </div>
      <n-tag round type="info" size="large">账号安全已接入统一任务与消息体系</n-tag>
    </div>

    <div class="profile-layout">
      <n-card class="profile-side" :bordered="false">
        <!--        <div class="profile-side__cover" />-->
        <div class="profile-side__main">
          <FastUpload @before-upload="pushAvatar">
            <div class="profile-side__avatar-wrap" :class="{ 'profile-side__avatar-wrap--disabled': isSuperAdmin }">
              <n-avatar
                v-if="profileForm.headImage"
                :src="profileForm.headImage"
                :size="104"
                round
                class="profile-side__avatar"
              />
              <div v-else class="profile-side__avatar profile-side__avatar--empty">
                {{ displayName.slice(0, 1) }}
              </div>
              <div class="profile-side__avatar-action">
                <n-icon size="16">
                  <CameraOutline />
                </n-icon>
                <span>更换头像</span>
              </div>
            </div>
          </FastUpload>

          <div class="profile-side__name">{{ displayName }}</div>
          <div class="profile-side__meta">@{{ username }}</div>
          <div class="profile-side__role">{{ roleNames }}</div>

          <div class="profile-side__stats">
            <div class="profile-side__stat">
              <span class="profile-side__stat-label">手机号</span>
              <strong>{{ displayPhone }}</strong>
            </div>
            <div class="profile-side__stat">
              <span class="profile-side__stat-label">性别</span>
              <strong>{{ displaySex }}</strong>
            </div>

            <div class="profile-side__stat">
              <span class="profile-side__stat-label">部门</span>
              <strong>{{ deptLabel }}</strong>
            </div>

            <div class="profile-side__stat">
              <span class="profile-side__stat-label">职位</span>
              <strong>{{ postLabel }}</strong>
            </div>

            <div class="profile-side__stat">
              <span class="profile-side__stat-label">岗位</span>
              <strong>{{ jobName }}</strong>
            </div>
          </div>

          <n-alert type="info" :show-icon="false" class="profile-side__tip">
            头像、姓名、性别、手机号可直接维护。涉及密码的操作会进入更严格的安全校验。
          </n-alert>
          <n-alert v-if="isSuperAdmin" type="warning" class="profile-side__tip">
            当前账号为超级管理员。个人中心仅支持查看，资料、密码和重置申请操作已禁用。
          </n-alert>
        </div>
      </n-card>

      <div class="profile-main">
        <n-card class="profile-section" :bordered="false">
          <template #header>
            <div class="profile-section__header">
              <div class="profile-section__icon profile-section__icon--blue">
                <n-icon size="18">
                  <PersonCircleOutline />
                </n-icon>
              </div>
              <div>
                <div class="profile-section__title">基础资料</div>
                <div class="profile-section__desc">更新后会立即同步到头像区和当前登录信息。</div>
              </div>
            </div>
          </template>

          <n-form label-placement="top" require-mark-placement="right-hanging" class="profile-form">
            <div class="profile-form__grid">
              <n-form-item label="姓名">
                <n-input v-model:value="profileForm.name" placeholder="请输入姓名" :disabled="isSuperAdmin" />
              </n-form-item>
              <n-form-item label="性别">
                <n-select
                  v-model:value="profileForm.sex"
                  :options="sexOptions"
                  placeholder="请选择性别"
                  :disabled="isSuperAdmin"
                />
              </n-form-item>
              <n-form-item label="手机号">
                <n-input v-model:value="profileForm.phone" placeholder="请输入手机号" :disabled="isSuperAdmin" />
              </n-form-item>
              <n-form-item label="登录账号">
                <n-input :value="username" disabled />
              </n-form-item>
            </div>
            <div class="profile-section__actions">
              <n-button type="primary" :loading="loading" :disabled="isSuperAdmin" @click="saveProfile"
                >保存资料</n-button
              >
            </div>
          </n-form>
        </n-card>

        <n-card class="profile-section" :bordered="false">
          <template #header>
            <div class="profile-section__header">
              <div class="profile-section__icon profile-section__icon--green">
                <n-icon size="18">
                  <LockClosedOutline />
                </n-icon>
              </div>
              <div>
                <div class="profile-section__title">修改密码</div>
                <div class="profile-section__desc">请输入原密码后设置新密码，修改成功后下次登录将使用新密码。</div>
              </div>
            </div>
          </template>

          <n-form label-placement="top" require-mark-placement="right-hanging" class="profile-form">
            <div class="profile-form__grid">
              <n-form-item label="原密码">
                <n-input
                  v-model:value="passwordForm.oldPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="请输入原密码"
                  :disabled="isSuperAdmin"
                />
              </n-form-item>
              <n-form-item label="新密码">
                <n-input
                  v-model:value="passwordForm.newPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="请输入新密码"
                  :disabled="isSuperAdmin"
                />
              </n-form-item>
              <n-form-item label="确认新密码">
                <n-input
                  v-model:value="passwordForm.confirmPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="请再次输入新密码"
                  :disabled="isSuperAdmin"
                />
              </n-form-item>
            </div>
            <div class="profile-section__actions">
              <n-button type="primary" :loading="loading" :disabled="isSuperAdmin" @click="submitPasswordChange"
                >修改密码</n-button
              >
            </div>
          </n-form>
        </n-card>

        <n-card class="profile-section" :bordered="false">
          <template #header>
            <div class="profile-section__header">
              <div class="profile-section__icon profile-section__icon--amber">
                <n-icon size="18">
                  <ShieldCheckmarkOutline />
                </n-icon>
              </div>
              <div>
                <div class="profile-section__title">忘记密码申请</div>
                <div class="profile-section__desc">
                  如果当前无法自行修改密码，可以提交申请给管理员。申请会进入任务中心审批，并通过消息通知处理结果。
                </div>
              </div>
            </div>
          </template>

          <n-form label-placement="top" :size="componentSize" class="profile-form">
            <n-form-item label="申请原因">
              <n-input
                v-model:value="resetForm.reason"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 6 }"
                placeholder="请说明需要管理员协助重置密码的原因，例如：长期未登录、密码遗忘、设备切换导致无法找回等"
                :disabled="isSuperAdmin"
              />
            </n-form-item>
            <div class="profile-section__actions">
              <n-button tertiary type="warning" :loading="loading" :disabled="isSuperAdmin" @click="submitResetApply"
                >提交申请</n-button
              >
            </div>
          </n-form>
        </n-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: radial-gradient(circle at top left, rgba(14, 116, 144, 0.14), transparent 26%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.12), transparent 22%),
    linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%);
  overflow: auto;
}

.profile-page__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 4px;
  flex-wrap: wrap;
}

.profile-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #0f766e;
}

.profile-page__title {
  margin: 10px 0 8px;
  font-size: 34px;
  line-height: 1.1;
  font-weight: 800;
  color: #102a43;
}

.profile-page__subtitle {
  max-width: 760px;
  margin: 0;
  color: #52606d;
  line-height: 1.8;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.profile-side {
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.profile-side__cover {
  height: 112px;
  background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%);
}

.profile-side__main {
  position: relative;
  //margin-top: -52px;
  padding: 0 22px 24px;
}

.profile-side__avatar-wrap {
  position: relative;
  width: fit-content;
  cursor: pointer;
}

.profile-side__avatar-wrap--disabled {
  cursor: not-allowed;
  opacity: 0.7;
  pointer-events: none;
}

.profile-side__avatar {
  border: 5px solid #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
  background: #fff;
}

.profile-side__avatar--empty {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%);
}

.profile-side__avatar-action {
  position: absolute;
  right: -6px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(8px);
}

.profile-side__name {
  margin-top: 18px;
  font-size: 24px;
  font-weight: 800;
  color: #102a43;
}

.profile-side__meta {
  margin-top: 6px;
  color: #486581;
}

.profile-side__role {
  margin-top: 10px;
  color: #0f766e;
  font-weight: 600;
  line-height: 1.6;
}

.profile-side__stats {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.profile-side__stat {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.profile-side__stat-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #64748b;
}

.profile-side__tip {
  margin-top: 18px;
  border-radius: 16px;
  background: #f0f9ff;
}

.profile-main {
  display: grid;
  gap: 18px;
}

.profile-section {
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.profile-section__header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-section__icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.profile-section__icon--blue {
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
}

.profile-section__icon--green {
  background: linear-gradient(135deg, #059669 0%, #0f766e 100%);
}

.profile-section__icon--amber {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
}

.profile-section__title {
  font-size: 18px;
  font-weight: 700;
  color: #102a43;
}

.profile-section__desc {
  margin-top: 4px;
  color: #64748b;
  line-height: 1.6;
}

.profile-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.profile-section__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 960px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-form__grid {
    grid-template-columns: 1fr;
  }

  .profile-page {
    padding: 16px;
  }

  .profile-page__title {
    font-size: 28px;
  }
}
</style>
