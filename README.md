# Canopy

Canopy 社区网站。第二版保留第一版的 13 位成员、5 个活动、两个项目及原有文案和导航，优化排版、成员照片展示、自然滚动与动效。

## 本地运行

使用 Node.js 22.13 或更新版本。

1. 安装依赖：`npm run install:ci`
2. 初始化本地数据库：`node scripts/setup-local-db.mjs`
3. 启动预览：`npm run dev`
4. 打开终端显示的地址，通常是 http://127.0.0.1:5173/。

## 文件位置

| 文件夹 | 内容 |
| --- | --- |
| `site` | 公共网站的 HTML 入口 |
| `public/assets/styles` | 样式，视觉调整主要在 refinements.css |
| `public/assets/scripts` | 导航、交互和动效，入口为 site.js |
| `public/assets/images` | 海报、成员照片和现场照片 |
| `public/assets/fonts` | 字体和授权文件 |
| `server` | 公共成员与活动资料、社区接口 |
| `app`、`components`、`hooks` | 账户和管理界面 |
| `db`、`drizzle` | 数据模型与迁移 |
| `build`、`lib`、`scripts` | 构建、共享代码与维护工具 |
| `tests` | 自动检查 |
| `docs` | 设计、使用和数据说明 |
| `releases` | 第一版备份和回退说明 |

没有照片的成员使用姓名缩写。公开名单不会创建登录账户。Room 保留 Coming soon 页面。

## 版本与回退

第一版完整源码在 `releases/canopy-v1.zip`，Git 标记为 `canopy-v1`。线上也保留第一版的已保存版本。直接告诉 Codex「把 Canopy 退回第一版」，即可按 `releases/README.md` 中的版本记录回退。

本地数据库、依赖、构建产物和临时文件分别放在隐藏的缓存目录中，不混入版本备份。

## 维护与检查

- 类型检查：`npx tsc --noEmit`
- 自动检查：`node --test tests/*.test.mjs`
- 构建：`npm run build`
- 数据模型调整后生成迁移：`npm run db:generate`。生成器在忽略目录中适配工具要求，维护的文件统一使用短横线命名。

Sites 预览版保持仅拥有者可见，配置在 `.openai/hosting.json`。原 GitHub/Vercel 网站使用 `vercel.json` 与 `npm run build:vercel`，共用同一套页面、素材与动效。部署与申请表单存储说明见 `docs/deployment.md`。密钥和本地数据库不进入 Git。Sites 管理员设置参见 `docs/start-here.md`。
