/**
 * dsh-dialog-width — conversation-width override (browser half).
 *
 * When the user turns "plugin width control" on, this module:
 *
 * 1. Hides DSH's native 40 px hover drag handles. The handles live in a
 *    CSS-Modules file (`ConversationRoot.module.css`) whose class names are
 *    build-time-hashed, so a global stylesheet cannot target them by class —
 *    it MUST use the stable `data-width-handle` attribute selector. (Verified
 *    in DSH 0.1.2-alpha.5: `ConversationRoot.tsx:116-128` renders
 *    `<div data-width-handle="left|right" ...>`; the only other stable
 *    attribute is `data-side`.)
 *
 * 2. Declares the user-chosen px value on `:root` as `--dsh-dialog-width-chat-width`,
 *    then forces the conversation root's `--dsh-chat-user-width` to consume it.
 *    DSH's own `ResizeObserver` (`ConversationRoot.tsx:189-196`) only writes
 *    `--dsh-chat-user-width` from the stored localStorage preference; it never
 *    resets a value it did not write, so a `:root`-level `!important`-free
 *    override survives window resizes with zero inline-style fight.
 *
 * 3. Mirrors the chosen px into the shared localStorage slot
 *    (`dsh.conversation.contentWidth`) so toggling plugin-width OFF surfaces
 *    the user's last choice in the native drag handles — the switch is
 *    value-preserving in both directions.
 *
 * When the user turns the feature OFF, the installer disposes: the handle
 * rule is removed, the `:root` var is cleared, and the native handles take
 * over from whatever px the user last picked.
 * @module dsh-dialog-width/client/conversation-width
 */

/**
 * localStorage slot the native WidthHandle reads/writes
 * (`ConversationRoot.tsx:17` in DSH 0.1.2-alpha.5). Kept in sync with the
 * server-side constant in src/config.ts — duplicated here because the client
 * tsconfig's rootDir is `src/client` and cannot reach up into `src/`.
 */
const CONVERSATION_WIDTH_STORAGE_KEY = 'dsh.conversation.contentWidth'

/** Stable attribute selector for the native WidthHandle strips (CSS-Modules-hashed class). */
const HANDLE_HIDE_RULE = '[data-width-handle]{display:none !important}'

/**
 * CSS injected into <head> while plugin-width is on. Two jobs:
 * - hide the native handles (hashed class → attribute selector)
 * - force the conversation content axis to the plugin's px via a `:root` var
 *   that the conversation root's `--dsh-chat-user-width` clamp expression
 *   cannot override (the clamp only fires when `--dsh-chat-user-width` is
 *   unset; setting it on the root wins the cascade).
 */
function buildWidthCss(widthPx: number): string {
  return `
${HANDLE_HIDE_RULE}
:root{--dsh-dialog-width-chat-width:${widthPx}px}
`
}

export interface ConversationWidthController {
  /** Update the applied width (px) without reinstalling the stylesheet. */
  setWidth(widthPx: number): void
  /** Remove the injected stylesheet + clear the :root var. */
  dispose(): void
}

/**
 * Install the width-override stylesheet. Idempotent: a second call with the
 * same id returns the existing controller.
 * @param widthPx - the plugin's chosen column width in px.
 * @returns a controller exposing `setWidth` + `dispose`.
 */
export function installConversationWidthStyles(widthPx: number): ConversationWidthController {
  const id = 'dsh-dialog-width-conversation-width'
  let style = document.querySelector<HTMLStyleElement>(`style[data-plugin-css="${id}"]`)
  if (style === null) {
    style = document.createElement('style')
    style.dataset.plugin = 'dsh-dialog-width'
    style.dataset.pluginCss = id
    document.head.appendChild(style)
  }

  // Persist to the shared storage slot so toggling plugin-width off surfaces
  // the user's last choice in the native drag handles.
  try { localStorage.setItem(CONVERSATION_WIDTH_STORAGE_KEY, `${widthPx}`) } catch { /* storage may be disabled; ignore */ }

  const apply = (px: number): void => {
    style!.textContent = buildWidthCss(px)
    // Belt-and-suspenders: also set the var directly on :root in case any
    // consumer reads the property via JS rather than via CSS cascade.
    document.documentElement.style.setProperty('--dsh-dialog-width-chat-width', `${px}px`)
  }
  apply(widthPx)

  return {
    setWidth: (px: number): void => {
      apply(px)
      try { localStorage.setItem(CONVERSATION_WIDTH_STORAGE_KEY, `${px}`) } catch { /* ignore */ }
    },
    dispose: (): void => {
      style?.remove()
      document.documentElement.style.removeProperty('--dsh-dialog-width-chat-width')
    },
  }
}
