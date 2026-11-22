/**
 * 图片素材统一入口。
 * 使用 import.meta.env.BASE_URL 拼接，兼容本地根路径与 Gitee Pages 子路径部署。
 */
const img = (name) => `${import.meta.env.BASE_URL}images/${name}`

export const images = {
  desktopBg: img('desktop-bg.png'),
  lockscreenBg: img('lockscreen-bg.png'),
  avatar: {
    xieyao: img('xieyao-avatar.png'),
    sister: img('sister-avatar.png'),
    dad: img('dad-avatar.png'),
    mom: img('mom-avatar.png'),
    teacher: img('teacher-avatar.png'),
    whale: img('whale-avatar.png')
  },
  moments: {
    coffee: img('moments-coffee.png'),
    potato: img('moments-potato.png'),
    home: img('moments-home.png'),
    seawall: img('moments-seawall.png')
  },
  news: {
    shop: img('news-shop.png'),
    job: img('news-job.png'),
    wage: img('news-wage.png'),
    star: img('news-star.png'),
    rights: img('news-rights.png'),
    fall: img('news-fall.png'),
    crash: img('news-crash.png'),
    crashIllustration: img('crash-illustration.png')
  },
  forum: {
    banner: img('forum-banner.png'),
    logo: img('forum-logo.png')
  }
}
