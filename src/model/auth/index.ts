export interface LoginData {
  username: string
  password: string
  dPassword: string
  captcha: string
  check?: boolean
  isEncrypted: boolean
}

export interface LoginVo {
  accessToken: string
  wxMpAuthUrl: string
  sysHomePageRouter: string
  erpHomePageRouter: string
}
