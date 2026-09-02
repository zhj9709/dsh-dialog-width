# dsh-dialog-width

> **版本要求**：需要 **DSH v0.1.2-alpha.5 及以上**。

[DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/)（DSH）Web UI 插件：从设置面板控制对话列宽。

## 功能

- **对话框宽度（默认 748 px，即 DSH 原生列宽）**：在设置的「布局」区用数值输入（600–1600，步进 20）或三个预设（默认 · 748 / 稍宽 · 880 / 更宽 · 1024）调整对话列宽。列宽会同步到输入框卡片与统计条。
  - **插件宽度控制（默认开启）**：同一个「布局」区里有一个总开关。**开启时**，插件的数值/预设直接驱动列宽，并**隐藏 DSH 原生的拖拽手柄**；**关闭时**，DSH 原生手柄接管列宽，插件的数值输入改为**只读镜像**——实时显示原生手柄拖出来的值。无论开关状态，用户最后选择的 px 值都会写入共享的 `localStorage` 槽，所以**来回切换不会丢失宽度**。

所有修改**即时生效**，无需刷新。同一份配置也可以直接在设置文档里手改：

```yaml
dialog-width:
  dialogWidth: 880        # 默认 748；取值 600–1600
  usePluginWidth: true    # 默认 true（插件宽度控制开启）；false 则使用 DSH 原生拖拽手柄
```

设置入口：**设置 → 对话框宽度**。

## 安装

```bash
# 方式一：从 npm 安装（推荐，预构建产物）
npx -y @deepseek-ai/dsh plugin --profile web add dsh-dialog-width

# 方式二：从 GitHub 仓库安装（源码，会运行自包含的 prepare 构建）
npx -y @deepseek-ai/dsh plugin --profile web add github:zhj9709/dsh-dialog-width
```

`add` 后面的包说明会**原样转发给 pnpm**，因此可以指定版本——npm 包用 `@版本号`，GitHub 源码用 `#tag`：

```bash
npx -y @deepseek-ai/dsh plugin --profile web add dsh-dialog-width@0.0.1                    # 锁定 npm 版本
npx -y @deepseek-ai/dsh plugin --profile web add github:zhj9709/dsh-dialog-width#v0.0.1     # 锁定 git tag
```

安装完成后**重启一次 `dsh web`**（bundle 插件在进程启动时扫描）。

## 开发

```bash
pnpm install
pnpm build          # tsc（服务端）+ tsc（客户端）+ 打包 lib/client.js
pnpm typecheck
```

本地加载（覆盖层）或作为 bundle 安装：

```bash
npx -y @deepseek-ai/dsh web --patch ./cordis.patch.yml   # 开发覆盖层
npx -y @deepseek-ai/dsh plugin --profile web add .        # 从本目录作为 bundle 安装
```

## 工作原理

- **服务端**（`src/index.ts`）：注册 `dialog-width` 设置命名空间，并挂载同源路由 `/_dsh/dialog-width/settings`。
- **浏览器端**（`src/client/index.tsx`）：读写该路由、渲染设置页，并通过运行时 `<style>` 元素实时应用列宽样式。
- **宽度控制样式**（`src/client/conversation-width.ts`）：插件宽度控制开启时隐藏 DSH 原生拖拽手柄、设置 CSS 变量 `--dsh-dialog-width-chat-width`，并持久化到 `localStorage['dsh.conversation.contentWidth']`。

## 协议

MIT
