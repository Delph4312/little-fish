# 《小鱼》GitHub Pages 部署说明

> 优点：无需实名认证，入口固定，更新自动生效。项目当前配置（`base: './'` + hash 路由）已适配，无需改代码。

## 一、创建 GitHub 仓库

1. 登录 GitHub，点右上角 `+` → `New repository`。
2. 仓库名填 `little-fish`（换成别的名字也可以，只是访问地址会变）。
3. 选择 **Public**，不要勾选 `Add a README file` / `.gitignore` / `license`（保持空仓库，避免首次推送冲突）。
4. 创建完成，复制仓库地址，形如：
   `https://github.com/Delph4312/little-fish.git`

## 二、本地推送（在 D:\project\LittleFish 执行）

下面的命令已经填好你的用户名 `Delph4312`，直接复制执行即可（github 远程我已帮你配好，第 1 步可跳过）：

```bash
cd D:/project/LittleFish

# 1. 添加 GitHub 远程仓库（如果已添加过就跳过这一步）
git remote add github https://github.com/Delph4312/little-fish.git

# 2. 推送源码 main 分支（备份用）
git push github main

# 3. 构建并推送静态站点到 gh-pages 分支
GITHUB_REPO=https://github.com/Delph4312/little-fish.git bash deploy.sh
```

> 如果之前加过 github 远程但地址不对，用：
> `git remote set-url github https://github.com/Delph4312/little-fish.git`

## 三、开启 Pages

1. 打开 GitHub 仓库页面，点 **Settings**。
2. 左侧找到 **Pages**。
3. `Build and deployment` 中：
   - Source 选 **Deploy from a branch**
   - Branch 选 **gh-pages**，目录选 **/(root)**
4. 点 **Save**。等 1–2 分钟。

## 四、访问地址

```
https://Delph4312.github.io/little-fish/
```

## 五、以后更新内容

改完代码后，按顺序执行：

```bash
cd D:/project/LittleFish
git add -A
git commit -m "更新内容"
git push github main
GITHUB_REPO=https://github.com/Delph4312/little-fish.git bash deploy.sh
```

GitHub Pages 会自动读取 `gh-pages` 分支的新提交，不需要像 Gitee 那样手动点“更新”。

## 常见问题

- **404**：确认仓库是 Public、分支选了 `gh-pages`、且等待部署完成（Pages 页面会显示绿底提示）。
- **样式或图片加载失败**：项目已用相对路径 `base: './'`，正常不会出现；如出现请检查 `dist/images/` 是否完整。
- **push 要输入密码**：GitHub 已不支持账号密码，需要用 Personal Access Token（在 GitHub → Settings → Developer settings → Personal access tokens 生成），或用 GitHub Desktop 登录。
- **想同时保留 Gitee**：部署命令加一个变量即可：
  `GITHUB_REPO=... GITEE_REPO=https://gitee.com/Ringo4312/little-fish.git bash deploy.sh`
