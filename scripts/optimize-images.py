"""
按用途缩放并压缩 public/images 素材。
- 头像：最长边 400，输出 WebP（logo 保留 PNG）
- 朋友圈/新闻配图：最长边 1280，输出 WebP
- 背景/Banner：最长边 1600，输出 WebP
原图备份到 public/images/_original/，不删除。
"""
from pathlib import Path
from PIL import Image

SRC = Path(r"D:\project\LittleFish\public\images")
BACKUP = SRC / "_original"
BACKUP.mkdir(parents=True, exist_ok=True)

# 头像类：小尺寸
AVATARS = {
    "xieyao-avatar.png", "sister-avatar.png", "dad-avatar.png",
    "mom-avatar.png", "teacher-avatar.png", "whale-avatar.png",
}
# 需要保留透明 PNG 的标志
KEEP_PNG = {"forum-logo.png"}
# 背景 / Banner 类，较大尺寸
BIG = {"desktop-bg.png", "lockscreen-bg.png", "forum-banner.png"}

def classify(name: str) -> str:
    if name in KEEP_PNG:
        return "logo"
    if name in AVATARS:
        return "avatar"
    if name in BIG:
        return "big"
    return "content"

def max_size(kind: str) -> int:
    return {"avatar": 400, "content": 1280, "big": 1600, "logo": 512}[kind]

processed = []
for img_path in SRC.glob("*.png"):
    kind = classify(img_path.name)
    size_cap = max_size(kind)
    im = Image.open(img_path)
    # 等比缩放，不放大
    w, h = im.size
    scale = min(1.0, size_cap / max(w, h))
    if scale < 1.0:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    # 备份原图（仅首次）
    backup_file = BACKUP / img_path.name
    if not backup_file.exists():
        img_path.replace(backup_file)
    else:
        img_path.unlink()

    if kind == "logo":
        out = SRC / img_path.name.replace(".png", ".png")
        im.save(out, "PNG", optimize=True)
        processed.append((out.name, kind, out.stat().st_size))
    else:
        out = SRC / img_path.name.replace(".png", ".webp")
        im.save(out, "WEBP", quality=80, method=6)
        processed.append((out.name, kind, out.stat().st_size))

for name, kind, size in sorted(processed):
    print(f"{kind:8} {size/1024:7.1f} KB  {name}")
