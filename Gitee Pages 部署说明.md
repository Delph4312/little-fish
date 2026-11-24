# 《小鱼》Gitee Pages 部署说明

## 一、当前状态（已完成）

- 项目已移动到：`D:\project\LittleFish`
- Git 仓库已初始化，main 分支为源码，已推送到 `https://gitee.com/Ringo4312/little-fish`
- 已创建 `gh-pages` 分支，内容是构建好的纯静态站点（`index.html` + `assets/` + `images/` + `files/`），并已推送到 Gitee
- 已启用 hash 路由 + 相对资源路径（`base: './'`），适合 Gitee Pages 子路径部署

## 二、需要你手动完成的一步：开启 Gitee Pages

Gitee Pages 服务**必须在网页端手动开通**（要求账号实名认证，API 无法代开）。步骤：

1. 打开并登录：https://gitee.com/Ringo4312/little-fish
2. 顶部菜单进入：**服务 → Gitee Pages**
3. 部署分支选择：**gh-pages**
4. 部署目录：**根目录 `/`**（默认即可）
5. 点击「启动」/「更新」，等待部署完成
6. 部署成功后，Gitee 会给出访问链接，形如：

   ```
   https://ringo4312.gitee.io/little-fish/
   ```

   这个链接任何人都可以打开游玩。

> 注意：Gitee Pages 免费版首次部署需实名认证，且每次代码更新后需要回到该页面点一次「更新」才能同步最新内容。

## 三、以后改代码后如何更新线上版本

1. 在 `D:\project\LittleFish` 改代码、测试
2. 构建并发布静态站到 gh-pages 分支：

   ```bash
   cd /d/project/LittleFish
   npm run build
   # 把 dist 内容推到 gh-pages 分支（可用部署脚本，见下）
   ```

3. 到 Gitee Pages 页面点「更新」

（如需，我可以在项目里加一个一键部署脚本 `deploy.bat`，自动完成 build + 推送 gh-pages。）

## 四、密钥速查（沿用之前）

| 项目 | 值 |
| --- | --- |
| 锁屏 | xieqing |
| 微信 | 614739 |
| 生日 / 日记密码 | 2008-03-04 / 20080304 |
| 地图坐标 | 32.9216, 118.4837 |
| 计划密码 | 542490 |
| 新闻网 | 搁浅 / gq7Kp2m |
| 论坛 | 遥遥云梦泽 / 251123 |
| 管理员模式 | sq9Wx3 |
