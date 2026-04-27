import { BaseEntityLd, PageQuery } from "src/model"

export interface SysConfig extends BaseEntityLd {
  /** 配置唯一编码，例如：home.page.url */
  configKey: string

  /** 配置值（字符串） */
  configValue: string

  /** 类型，例如 string、boolean、number、json 等 */
  valueType: string

  /** 配置说明 */
  description: string

  /** 是否启用 */
  enabled: boolean

  /** 是否为系统内置（不可删除） */
  builtIn: boolean
}

export interface SysConfigVo extends SysConfig {}

export interface SysConfigQuery extends PageQuery {}

export interface SysConfigForm extends SysConfig {}

export interface SysConfigQueryData {}
