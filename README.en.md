# dsh-dialog-width

> **Version requirement**: requires **DSH v0.1.2-rc.1 or newer**.

A [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/) (DSH) web plugin that controls the conversation column width from the Settings panel.

## Features

- **Dialog width (default 748 px = DSH's stock column)** — in the Layout settings group, type a value (600–1600, step 20) or pick one of three presets (Default · 748 / Wide · 880 / Extra wide · 1024). The column width is applied to the message column, the composer card, and the stats line.
  - **Plugin width control (default on)** — a master toggle in the same Layout group. **On**: the plugin's input/presets drive the column and **hide DSH's native drag handles**. **Off**: DSH's native handles own the column, and the plugin's width input becomes a **read-only mirror** of whatever the native handles produce. In both states the user's last px is written to the shared `localStorage` slot, so **toggling back and forth never loses the width**.

- **Side margin** — blank width (px) on both sides of the conversation column. Visible when the sidebar opens and the column flex-shrinks. Minimum 32 px.

```yaml
dialog-width:
  dialogWidth: 880        # defaults to 748; 600–1600
  usePluginWidth: true    # defaults to true (plugin width control on); false uses DSH's native drag handles
  sideMargin: 50          # defaults to 50; minimum 32. Side margin (px) on both sides of the column
```

Settings entry: **Settings → Dialog width**.

## Install

```bash
# from npm (recommended, prebuilt)
npx -y @deepseek-ai/dsh plugin --profile web add dsh-dialog-width

# from GitHub (source; runs the self-contained prepare build)
npx -y @deepseek-ai/dsh plugin --profile web add github:zhj9709/dsh-dialog-width
```

The package spec after `add` is forwarded to pnpm verbatim, so versions can be
pinned — `@version` for the npm package, `#tag` for the GitHub source:

```bash
npx -y @deepseek-ai/dsh plugin --profile web add dsh-dialog-width@0.0.1                    # pin the npm version
npx -y @deepseek-ai/dsh plugin --profile web add github:zhj9709/dsh-dialog-width#v0.0.1     # pin a git tag
```

Restart DSH web once after installing (bundle plugins are scanned at process start).

## Development

```bash
pnpm install
pnpm build          # tsc (server) + tsc (client) + bundle lib/client.js
pnpm typecheck
```

Load against a running DSH with an overlay, or install as a bundle:

```bash
npx -y @deepseek-ai/dsh web --patch ./cordis.patch.yml   # dev overlay
npx -y @deepseek-ai/dsh plugin --profile web add .        # bundle install from this checkout
```

## How it works

- **Server** (`src/index.ts`) registers the `dialog-width` settings namespace and mounts a same-origin route (`/_dsh/dialog-width/settings`).
- **Browser** (`src/client/index.tsx`) reads/writes that route, renders the Settings section, and applies the column width live via a runtime `<style>` element.
- **Width control styles** (`src/client/conversation-width.ts`) hides DSH's native drag handles, sets the CSS variable `--dsh-dialog-width-chat-width`, and persists to `localStorage['dsh.conversation.contentWidth']` when plugin width control is on.

## License

MIT
