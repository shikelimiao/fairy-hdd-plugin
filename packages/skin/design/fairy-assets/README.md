# FAIRY Ⅲ 动态徽记 · 独立版

**它不是图片，也不是视频**——是一个 SVG 矢量，复制 **20 份**，每份只露出一条横带，
每 3.6 秒所有带子在同一帧各自横向错位一次。所以看起来「撕裂」而不是「波浪」。

打开 `fairy-mascot.html` 就能看（双击即可，不需要服务器、不需要装任何东西）。

---

## 一、文件

| 文件 | 用途 |
|---|---|
| `fairy-mascot.html` | **自包含演示页**：矢量、CSS、构建脚本都在里面，可单独传播 |
| `fairy-mascot.svg` | 纯矢量原件（3,038 字符，`viewBox="-1 -1 162 162"`） |
| `fairy-mascot.css` | 动画样式（从皮肤里原样抽出） |

## 二、三层结构

```
[data-hdd-mascot]            容器
└─ [data-hdd-mascot-stage]   正方形舞台（aspect-ratio: 1/1）
   ├─ ::before               光环：border + blur + 呼吸
   ├─ [data-hdd-mascot-bloom] 柔光晕
   └─ [data-hdd-mascot-mark]  徽记本体
      ├─ band 1   ← 完整 SVG，clip-path 只露第 1 条横带
      ├─ band 2
      └─ … 共 20 条
```

每条带子的写法：

```js
band.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;   // 只露自己那一条
band.style.setProperty('--hdd-shift', SHIFTS[index]);    // 自己的位移量
band.innerHTML = VECTOR;                                  // 同一份矢量
```

静止时 20 条带拼回完整徽记；故障时**同一帧**各自平移，因为每条的位移量不同，
所以边缘呈阶梯状——这就是「切割感」的来源。

## 三、三段动画

| 动画 | 位置 | 参数 |
|---|---|---|
| **撕裂** | `[data-hdd-mascot-band]` | 周期 **3.6s**；`0–96%` 静止，`96.2%` 跳、`97.4%` 回弹、`98.4%` 归位 → **故障只占约 86ms** |
| **光环呼吸** | `[data-hdd-mascot-stage]::before` | `inset: -14%`、`border: 5px`、`filter: blur(3px)`、`scale 1.08 → 1.42`、周期 3.4s |
| **四角旋转 / 眼环呼吸** | SVG 内部 `<g id="hddFairyCorners">` 等 | 四角每 3s 转 90°（方对称为 12s 一圈）；四层眼环 1.5s 一轮、相位错开 0/47/94/188ms |

## 四、可调参数

| 参数 | 现值 | 改它的效果 |
|---|---|---|
| `MASCOT_BANDS` | **20** | 条数越多切割越细（原片帧里是 20 条） |
| `MASCOT_SHIFTS` | `[0,-12,6,-7,14,-4,9,-14,3,-9,11,-6,5,-11,8,-3,13,-8,4,-15]` | 每条的像素位移；**混合正负与大小**才像损坏，等距会像波浪 |
| 周期 | `3.6s` | 撕裂出现频率 |
| 故障时长 | ≈ **2.4%** 周期 | 越短越像一帧闪断 |
| 光环 | `inset -14%` / `5px` / `blur(3px)` | 越粗越糊越像呼吸 |
| `--hdd-ink` / 渐变 | `#4053f0 → #3045dc → #3d50c8` | 徽记主色 |

## 五、三个必须知道的坑

1. **`border-radius: 50%` 不一定是圆**——这个前端环境默认圆角形状是**超椭圆**，
   圆形元素必须**成对写** `corner-shape: round;` + `border-radius: 50%;`，否则是圆角方形。
2. **别写死宽高**——`width: 260px; height: 260px` 在会被压窄的容器里会变成矩形。
   用 `width: min(260px, 100%); aspect-ratio: 1 / 1; height: auto;`。
3. **`getBoundingClientRect()` 包含变换**——若要做「飞向某处」的动画，缩放基准要用
   `offsetWidth`（布局宽），否则元素被缩到 86% 后再量，算出的缩放会偏大 16%。

## 六、怎么嵌到自己的项目

**要最省事**：直接抄 `fairy-mascot.html`，它没有外部依赖。

**要嵌进现有页面**：
1. 把 `fairy-mascot.css` 的内容放进样式表；
2. 把 HTML 里 `buildMascot()` 那几行 JS 拷过去（就是 20 次循环 + `clip-path`）；
3. 调 `buildMascot(你的容器)`。

**只要静态图**：直接用 `fairy-mascot.svg`，加 `width/height` 即可。

## 七、许可

- 代码与动画参数：随意使用、修改、再分发。
- 徽记为照《绝区零》HDD 系统徽记**重绘的同人矢量**，角色与美术版权归 **miHoYo／HoYoverse**；
  本项目与米哈游无关联，**请勿用于商业用途**。
