# 使用与维护

## 当前网站

https://canopy-chimney-edition-one.breezygoby1025.chatgpt.site/

当前第二版使用同一个网址，保持仅你可见。第一版回退资料见 ../releases/README.md。

## 启动

依次运行 `npm run install:ci`、`node scripts/setup-local-db.mjs`、`npm run dev`。数据库初始化可以重复运行，不会删除已有内容。

## 修改内容

- 成员：server/public-people.mjs。
- 活动：server/event-handoff-data.mjs。线上活动初始化后以数据库中保存的内容为准。
- 首页和导航：public/assets/scripts/site.js。
- 项目详情：public/assets/scripts/project-pages.js。
- 排版与视觉：public/assets/styles/refinements.css。
- 图片：public/assets/images。

## 管理员

账户与管理界面保留在 app 和 components 中。先注册自己的账户，再访问 /setup，使用当前环境配置的 CANOPY_SETUP_KEY 完成管理员设置。已有管理员时请直接登录。

生产密钥由 Sites 管理，不放在源码中。本地设置使用忽略的 .dev.vars。仅创建账户不会自动成为管理员。

## 目录与命名

维护的文件使用短横线命名，不使用下划线。开发工具必需的下划线文件只在 node_modules、dist、.tmp 等忽略目录中生成。旧迁移在第一版备份中原样保留；当前基线可在已有数据库上安全重复执行。
