#!/usr/bin/env bash
# 一键部署《小鱼》静态站点：构建 dist → 推送到 gh-pages 分支
# 默认推送到 GitHub Pages，可选同时备份到 Gitee Pages
#
# 用法一（仅 GitHub）：
#   GITHUB_REPO=https://github.com/<你的用户名>/little-fish.git bash deploy.sh
# 用法二（GitHub + Gitee 双备份）：
#   GITHUB_REPO=https://github.com/<你的用户名>/little-fish.git \
#   GITEE_REPO=https://gitee.com/Ringo4312/little-fish.git bash deploy.sh
set -e

NODE_BIN="C:/Users/Lenovo/.workbuddy/binaries/node/versions/22.22.2-6"

if [ -z "$GITHUB_REPO" ]; then
  echo "错误：请先设置 GITHUB_REPO 环境变量，例如："
  echo "  GITHUB_REPO=https://github.com/你的用户名/little-fish.git bash deploy.sh"
  exit 1
fi

echo "==> 1/4 构建生产版本"
"$NODE_BIN/npm.cmd" run build

echo "==> 2/4 准备静态站点"
TMP="../.littlefish-pages"
rm -rf "$TMP"
mkdir -p "$TMP"
cp -r dist/. "$TMP/"
cd "$TMP"

echo "==> 3/4 初始化并提交"
git init -q
git add -A
git -c user.name="LittleFish Deploy" -c user.email="deploy@littlefish.local" commit -qm "deploy: 更新静态站点 $(date +%Y-%m-%d\ %H:%M)"
git branch -M gh-pages

echo "==> 4/4 推送到 GitHub gh-pages 分支"
git push -f "$GITHUB_REPO" gh-pages

if [ -n "$GITEE_REPO" ]; then
  echo "==> 额外推送到 Gitee gh-pages 分支"
  git push -f "$GITEE_REPO" gh-pages
fi

cd ..
rm -rf "$TMP"

echo "完成！请到 GitHub 仓库 → Settings → Pages 确认来源为 gh-pages / root，首次部署约 1-2 分钟。"
