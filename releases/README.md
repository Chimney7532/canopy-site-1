# Canopy 版本与回退

## 第一版

- 源码备份：`canopy-v1.zip`。这是开始第二版前的完整源码，不含依赖和本地数据库。
- Git 标记：`canopy-v1`。
- 源码提交：`2b62c09d7894a5ea3d762945c5f6ae09911f9f78`。
- Sites 项目：`appgprj_6adc466c24a88191a8f238e820a9b126`。
- 线上保存版本：`appgprj_6adc466c24a88191a8f238e820a9b126~appgver_7ac236df368c8191b20e5f0be80316cd`。

需要回退时，直接告诉 Codex「把 Canopy 退回第一版」。使用上面的线上保存版本重新部署，即可恢复第一版画面，不需要新建网站，也不会删除数据库中的成员申请和社区数据。

需要独立查看第一版源码时，把压缩包解压到另一个目录，再按其中 README 启动。不要覆盖正在修改的目录。

## 第二版的文件位置

- `site/index.html`：页面入口。
- `public/assets/styles`：样式；本轮视觉优化集中在 `refinements.css`。
- `public/assets/scripts`：页面、交互和动效；`site.js` 是导航入口。
- `public/assets/images`：海报、成员照片和现场照片。
- `public/assets/fonts`：字体及授权。
- `server/public-people.mjs`：13 位成员资料。
- `server/event-handoff-data.mjs`：活动内容。
- `docs`：项目说明；`releases`：版本备份。

第二版不改变第一版的成员、活动、项目、文案和导航入口。开发工具生成的缓存放在忽略目录内；手工维护的文件统一使用短横线命名。
