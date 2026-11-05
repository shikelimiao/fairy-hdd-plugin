# 版本兼容表

每个发布版本对应的 DSH 客户端版本。`index.json` 里的 `engines.dsh` 就是这张表，
插件市场会据此标注兼容性（不兼容的版本安装按钮会变灰）。

| 部署包 | 皮肤 | 预设 | 语音插件 | 适配 DSH | 说明 |
|---|---|---|---|---|---|
| **v1.3.0** | `dsh-fairy-skin@3.0.0` | `dsh-fairy-preset@2.0.1` | `dsh-fairy-voice@1.0.0` | **0.2.2-rc.1 及以上**（`^0.2.2-rc.1`） | 按新版 standard 重建预设；皮肤组件加错误边界；开屏恢复 |
| v1.2 | 2.3.0-splash | 1.x（旧） | 1.0.0 | 0.2.1 及更早 | 语音拆成常驻插件 |
| v1.1 | 1.1.x | 1.x（旧） | — | 0.2.1 及更早 | 皮肤 + 开屏 |
| v1.0 | 1.0.0 | 1.x（旧） | — | 0.2.1 及更早 | 首个完整包 |

> 语音插件对 DSH 版本不敏感（`engines.dsh: >=0.2.0`），皮肤和预设才需要严格匹配。

## 为什么皮肤/预设要按版本区分

DSH 0.2.2-rc.1 改了两处关键接口：

1. **客户端 slot 的 props**：`sidebar.brand.mark` 等 slot 不再提供 `useSession` / `useProjection`，
   旧皮肤组件会在切换会话时抛异常，导致整个界面失去响应。
2. **预设的插件清单**：预设必须基于该版本的官方 `standard.patch.yml` 生成，否则会话 resume 失败，
   表现为「会话失效」。

因此 v1.3 的皮肤把每个组件包进错误边界，预设按 0.2.2-rc.1 的 standard 重建。
旧版本包在新客户端上会出现上述问题，**请对应使用**。

## 各版本的发布物

| 版本 | npm | GitHub Release 部署包 |
|---|---|---|
| v1.3.0 | 三个 bundle | `Fairy-Complete-v1.3.zip`（283 MB，含语音权重与开屏视频） |
| v1.2 | — | 仅 GitHub |
| v1.1 | — | 仅 GitHub |

## 发版时必须同步的五处

`release.ps1` 会一次性处理：

1. `packages/*/package.json` 的 version
2. `index.json` 的版本与 `engines.dsh`
3. npm 上的包
4. GitHub 仓库提交
5. GitHub Release 与部署包上传

外加本文件的表格 —— 新增版本时记得补一行。