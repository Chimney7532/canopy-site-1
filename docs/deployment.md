# GitHub 与 Vercel

## 已有项目

- 仓库：https://github.com/Chimney7532/canopy-site-1
- Vercel：https://vercel.com/chimney7532s-projects/canopy-site-1
- 正式域名：https://iscanopy.com（www.iscanopy.com 沿用原项目配置）。
- 正式分支：main；迁移预览分支：codex/vercel-update。
- 迁移前原站提交：fcdc1af2d1f30a7e88d9a5c23bf9bdef14e9fdcd。
- 回退标记：canopy-before-vercel-20261025；第一版压缩备份继续保留在 releases。
- GitHub 同时保留迁移前源码分支 codex/before-vercel-20261025。

## 构建与发布

Vercel 读取根目录 vercel.json，执行 npm ci 和 npm run build:vercel。构建脚本输出 .vercel/output：页面直接来自 site/index.html，资源直接来自 public，不重新设计或重写动效。Cloudflare 与 ChatGPT 专属账户、管理接口不会被打包到 Vercel 的公开网站。

公开成员与活动共用 server/public-people.mjs、server/event-handoff-data.mjs。当前包含 13 位成员、5 个活动、两个项目和原有文章；Room 继续显示 Coming soon。Vercel 的公开资料从 Git 构建，后续修改并提交到 main 后自动更新。Sites 数据库中后续单独编辑的内容不会自动同步到 Vercel；迁移前需要核对。

先推送预览分支，检查部署结果和真实表单存储，再合并到 main。原有域名继续由同一个 Vercel 项目管理。

## 申请表单

加入申请与 Connect 名片保留原表单与动效。Vercel 接口校验输入和同站来源后，将完整申请保存到私有 Vercel Blob。存储访问方式必须为 Private，并连接项目的 Production 与 Preview 环境；项目获得 BLOB_STORE_ID，使用 Vercel 自动提供的短期 OIDC 身份访问存储。无需创建持久读写令牌；仍兼容已有的服务端 BLOB_READ_WRITE_TOKEN。凭据不写进仓库、页面或浏览器。

申请可以由项目拥有者在 Vercel Storage 内查看。公开 API 不提供申请列表、账户注册或管理员初始化。保存成功后才返回成功回执；未配置私有存储时返回可重试错误，保留浏览器草稿，不假装已提交。

项目已连接 Private 存储 canopy-introductions，Production 与 Preview 使用同一个项目连接。预览部署已用一条标明 Deployment verification only 的虚拟名片验证完整保存和成功回执；该测试记录保留在申请目录内，便于辨认。

原 Sites 数据库和已有申请不移动、不删除。Vercel 站点开始接收的新申请独立存储。

## 核对与回退

本地检查：node --test tests/*.test.mjs、npx tsc --noEmit、npm run build:vercel。浏览器检查成员墙、海报详情、页面切换、移动端与表单。

上线后保留 Vercel 历史部署。需要恢复迁移前网站时，在 Vercel 选中迁移前成功部署执行回退；也可从 canopy-before-vercel-20261025 创建恢复提交。不要强制覆盖或删除历史。
