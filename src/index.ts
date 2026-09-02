/**
 * dsh-dialog-width — server half.
 *
 * Registers the `dialog-width` settings namespace so users can control the
 * conversation column width either from the Settings panel or by editing the
 * settings document directly (settings.yaml `dialog-width:` section). All
 * rendering work happens in the browser bundle (`src/client`), which reads
 * and writes this namespace through the same-origin route mounted here —
 * the Web settings RPC only exposes a fixed allowlist of namespaces since
 * rc.6, so a custom route is the supported way for a plugin to own a
 * configuration page.
 * @module dsh-dialog-width
 */

import type { Context } from '@deepseek-ai/cordis'
import {
  DIALOG_WIDTH_SETTINGS_NAMESPACE,
  Config,
} from './config.ts'
import { DialogWidthWebBackend, installDialogWidthWeb } from './web.ts'

export const name = 'dsh-dialog-width'

/** Required services: the settings seam is the whole server-side surface. */
export const inject = ['settings', 'web']

export function apply(ctx: Context): void {
  ctx.settings.register(DIALOG_WIDTH_SETTINGS_NAMESPACE, Config, {
    applies: 'live',
  })

  // The browser Settings panel talks to the namespace through this same-origin
  // route (the Web settings RPC only exposes a fixed allowlist since rc.6).
  installDialogWidthWeb(ctx, new DialogWidthWebBackend(ctx))

  ctx.logger.info('[dsh-dialog-width] settings namespace registered and Web routes mounted')
}
