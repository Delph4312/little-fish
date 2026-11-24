/**
 * 图片素材统一入口。
 * 使用 import.meta.env.BASE_URL 拼接，兼容本地根路径与 Gitee Pages 子路径部署。
 */
const img = (name) => `${import.meta.env.BASE_URL}images/${name}`

export const images = {
  desktopBg: img('desktop-bg.webp'),
  lockscreenBg: img('lockscreen-bg.webp'),
  avatar: {
    xieyao: img('xieyao-avatar.webp'),
    sister: img('sister-avatar.webp'),
    dad: img('dad-avatar.webp'),
    mom: img('mom-avatar.webp'),
    teacher: img('teacher-avatar.webp'),
    whale: img('whale-avatar.webp')
  },
  moments: {
    coffee: img('moments-coffee.webp'),
    potato: img('moments-potato.webp'),
    home: img('moments-home.webp'),
    seawall: img('moments-seawall.webp')
  },
  news: {
    shop: img('news-shop.webp'),
    job: img('news-job.webp'),
    wage: img('news-wage.webp'),
    star: img('news-star.webp'),
    rights: img('news-rights.webp'),
    fall: img('news-fall.webp'),
    crash: img('news-crash.webp'),
    crashIllustration: img('crash-illustration.webp')
  },
  forum: {
    banner: img('forum-banner.webp'),
    logo: img('forum-logo.png')
  }
}
