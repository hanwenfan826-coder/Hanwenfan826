# 公开发布说明

当前网站已经具备公开发布所需的基础文件：

- `index.html`：网站首页
- `robots.txt`：搜索引擎抓取规则
- `sitemap.xml`：站点地图
- `.nojekyll`：GitHub Pages 静态站点兼容文件

## 推荐发布方式：GitHub Pages

1. 在 GitHub 创建一个公开仓库，例如 `short-video-director-agent`。
2. 把本目录里的所有文件上传到仓库根目录。
3. 打开仓库 `Settings -> Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择默认分支，目录选择 `/root`。
6. 保存后等待 GitHub 生成公开链接。
7. 把 `robots.txt` 和 `sitemap.xml` 中的 `https://YOUR_PUBLIC_DOMAIN` 替换成真实公开链接。

## 搜索引擎收录

网站公开后不等于立刻能搜到。建议：

- 在 Google Search Console 提交 `sitemap.xml`。
- 在百度搜索资源平台提交站点链接。
- 用固定公开域名长期运营，不频繁更换 URL。
- 增加外部链接、文章介绍或社媒分享，帮助搜索引擎发现页面。

## 当前阻塞

尝试通过妙搭发布时，平台返回 `Abnormal tenant status`，说明当前账号或租户暂时不能创建 HTML 应用。需要在平台侧恢复创建权限，或改用 GitHub Pages / Vercel / Cloudflare Pages 等公开静态托管。
