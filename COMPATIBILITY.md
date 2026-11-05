# 版本兼容表

每个发布版本对应的 DSH 客户端版本。安装前请对照本表；`index.json` 里的 `engines.dsh`
就是这张表，插件市场会据此标记兼容性。

| 部署包 | 皮肤 | 预设 | 语音插件 | 适配 DSH | 说明 |
|---|---|---|---|---|---|
| v1.3.0 | 3.0.0-full | 2.0.1 | 1.0.0 | **0.2.2-rc.1 及以上**（`^0.2.2-rc.1`） | 按新版 standard 重建预设；皮肤组件加了错误边界 |
| v1.2 | 2.3.0-splash | 1.x（旧） | 1.0.0 | 0.2.1 及更早 | 语音拆成常驻插件 |
| v1.1 | 1.1.x | 1.x（旧） | — | 0.2.1 及更早 | 皮肤 + 开屏 |
| v1.0 | 1.0.0 | 1.x（旧） | — | 0.2.1 及更早 | 首个完整包 |

## 为什么要按版本区分

DSH 0.2.2-rc.1 改了两处关键接口：

1. **客户端 slot 的 props**：`sidebar.brand.mark` 等 slot 不再提供 `useSession` / `useProjection`，
   旧皮肤组件会在切换会话时抛异常，导致整个界面失去响应。
2. **预设的插件清单**：预设必须基于该版本的官方 `standard.patch.yml` 生成，否则会话 resume 失败，
   表现为「会话失效」。

因此 v1.3 的皮肤把每个组件包进错误边界，预设按 0.2.2-rc.1 的 standard 重建。
旧版本包在新客户端上会出现上述问题，**请对应使用**。

## 安装后如何确认

```powershell
# 看自己装的 DSH 版本
Get-Content "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\app-update.yml" -ErrorAction SilentlyContinue
```

或在 DSH 里：设置 → 关于。
