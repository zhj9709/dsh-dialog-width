/**
 * dsh-dialog-width — configuration.
 *
 * Owns the `dialog-width` settings namespace: a single toggle (plugin width
 * control) plus the dialog width input (px). Everything else is owned by the
 * host or other plugins.
 * @module dsh-dialog-width/config
 */

import z from '@deepseek-ai/schemastery'
import type Schema from '@deepseek-ai/schemastery'

/** Settings document namespace owned by this plugin. */
export const DIALOG_WIDTH_SETTINGS_NAMESPACE = 'dialog-width'

/** Raw user-facing configuration (partial inputs receive schema defaults). */
export interface DialogWidthConfig {
  /**
   * Conversation column width in px. The plugin's own width input / preset
   * row reads & writes this field when "plugin width control" is on (see
   * `usePluginWidth`); when off, the field still mirrors the user's chosen
   * px value to the shared storage slot so flipping the switch never loses
   * it. Clamped to [600, 1600] on read.
   */
  dialogWidth?: number
  /**
   * Whether the plugin's own column-width input owns the conversation width
   * axis. On (default): the plugin writes `--dsh-chat-user-width` directly
   * and hides the native 40 px hover handles. Off: the native drag handles
   * own the axis (clamp(680, col×0.64, 920)) and the plugin's width input
   * mirrors its value to the shared localStorage so flipping the switch back
   * on restores the same px.
   */
  usePluginWidth?: boolean
}

/** Dialog width in px. 600 is the chat-column minimum, 1600 the soft cap. */
export const MIN_DIALOG_WIDTH = 600
export const MAX_DIALOG_WIDTH = 1600
/** 748 matches the stock DSH column. */
export const DEFAULT_DIALOG_WIDTH = 748

/**
 * Plugin width control defaults to ON: existing settings documents never had
 * this field, so the default must match what users saw before the native
 * handles shipped — the plugin owning the column.
 */
export const DEFAULT_USE_PLUGIN_WIDTH = true

/**
 * localStorage slot the native WidthHandle reads/writes; kept here so a
 * future rename of the host key only needs touching one place. We mirror
 * the plugin's chosen px value here too so toggling plugin-width off
 * surfaces the user's last choice in the native handle.
 */
export const CONVERSATION_WIDTH_STORAGE_KEY = 'dsh.conversation.contentWidth'

/** Configuration schema with documented defaults. */
export const Config: Schema<DialogWidthConfig> = z.object({
  dialogWidth: z.number().min(MIN_DIALOG_WIDTH).max(MAX_DIALOG_WIDTH).default(DEFAULT_DIALOG_WIDTH),
  usePluginWidth: z.boolean().default(DEFAULT_USE_PLUGIN_WIDTH),
})

/** Configuration after static validation, with every default materialized. */
export interface ResolvedDialogWidthConfig {
  /** Dialog width in px (748 = the stock DSH column). */
  dialogWidth: number
  /** Whether the plugin's width control owns the column (vs. native handles). */
  usePluginWidth: boolean
}

/** Resolve a partial config into a fully defaulted value. */
export function resolveConfig(config: DialogWidthConfig = {}): ResolvedDialogWidthConfig {
  const dialogWidth = resolveDialogWidth(config.dialogWidth)
  const usePluginWidth = config.usePluginWidth ?? DEFAULT_USE_PLUGIN_WIDTH
  return { dialogWidth, usePluginWidth }
}

/** Normalize a dialog width value (legacy strings included) to px. */
export function resolveDialogWidth(value: number | undefined): number {
  if (typeof value === 'number') {
    return Math.min(MAX_DIALOG_WIDTH, Math.max(MIN_DIALOG_WIDTH, Math.round(value)))
  }
  return DEFAULT_DIALOG_WIDTH
}
