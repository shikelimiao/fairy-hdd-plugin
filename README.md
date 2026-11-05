# Fairy H.D.D. · DSH 插件集

绝区零 Fairy 风格的 DSH 皮肤、人设预设与常驻语音插件。
Zenless Zone Zero Fairy style skin, persona preset and resident voice plugin for DeepSeek Harness.

> 不是米哈游官方作品，纯个人二创；FFairy 角色版权归 miHoYo 所有，本仓库只包含自制的界面代码与人设文本。

---

## 一、通过插件市场安装（推荐）

1. 打开 DSH → **插件** → **发现** → **添加索引源**
2. 填入下面这个地址（jsDelivr CDN，国内可直连）：

```
https://cdn.jsdelivr.net/gh/<你的账号>/fairy-hdd-plugin@main/index.json
```

3. 在列表里选择 **Fairy 皮肤** / **Fairy 人设预设** / **Fairy 语音朗读** 逐个安装

> 「发现」标签页需要先在插件页启用实验性插件 **自定义插件索引**。

## 二、安装完整部署包（含语音权重与开屏动画）

插件市场只装代码。完整的语音（GPT-SoVITS 权重 230 MB）与开屏视频（70 MB）在 Release 里：

1. 到 [Releases](../../releases) 下载 `Fairy-Complete-v1.3.zip`
2. 解压到任意目录，运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 -Root D:\Fairy
```

3. 完全退出 DSH 再打开，新会话里选择「Fairy 模式」

安装器会：复制文件 → 把占位路径改写成本机路径 → 选择语音引擎（SAPI 兜底 / GPT-SoVITS）→ 注册三个 bundle → 注册计划任务。

## 三、仓库结构

```
packages/
├─ skin/          @local/dsh-fairy-skin    皮肤（CSS + 开屏 + 组件）
├─ preset/        @local/dsh-fairy-preset  Fairy 模式预设（33 行插件清单）
└─ voice/         @local/dsh-fairy-voice   常驻语音插件
index.json        插件市场索引（format 1）
install.ps1       完整部署器（含语音引擎）
cleanup.ps1       卸载器
```

## 四、版本与兼容性

| 组件 | 版本 | 说明 |
|---|---|---|
| 皮肤 | 3.0.0-full | 需 DSH ≥ 0.2.2-rc.1（新 slot API） |
| 预设 | 2.0.1 | 按 DSH 0.2.2-rc.1 的 standard 预设重建 |
| 语音插件 | 1.0.0 | 需要本地 9880 语音服务，没有则静音 |

## 五、常见问题

- **打开旧会话提示「会话失效」**：预设与客户端版本不匹配。用本仓库 `packages/preset` 重新安装即可。
- **开屏不播放**：完整包才有开屏资源；只装市场里的皮肤只有界面。
- **没有声音**：语音插件需要本机 GPT-SoVITS 服务（`install.ps1` 会帮你装或先用系统语音兜底）。

## 六、许可

代码 MIT。角色名、人设文本、素材仅用于个人学习与二创，不得商用。
