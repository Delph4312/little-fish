import { defineStore } from 'pinia'

/**
 * 全局解密进度 + 谜题答案配置
 *
 * 数字类答案为随机生成填入（2026-11-21），线索已埋进微信/相册。
 * 纯文案类（finalPlace 等）待小岛老师后续补写，当前保持占位放行。
 * 所有谜题校验都读这里，改答案不用动组件。
 */
export const ANSWERS = {
  lockScreen: 'xieqing',       // 锁屏密码：姐姐名字拼音
  wechat: '614739',            // 微信密码：藏在文件管理器的 txt 里
  birth: '2008-03-04',         // 谢遥生日：埋在微信姐姐对话里，是日记密码线索
  diary: '20080304',           // 日记密码：生日去掉横线
  mapCoord: '32.9216, 118.4837', // 地图坐标：相册"海边防波堤（原图）"的 EXIF
  planCode: '542490',          // 日记最后一篇的密码，解锁复仇与自杀计划
  finalPlace: 'TODO_PLACE',    // 弟弟最终地点：纯文本，待补写；当前占位放行
  newsUsername: '搁浅',        // 新闻网账号用户名
  newsPassword: 'gq7Kp2m',     // 新闻网账号密码（字母数字，≤10位），见文件传输助手消息
  adminPassword: 'sq9Wx3'      // 论坛管理员模式密码
}

export const useGameStore = defineStore('game', {
  state: () => ({
    // 解锁/发现标记
    unlocked: false,
    wechatLoggedIn: false,
    wechatReadConvs: [],     // 已读会话 id（红点在打开后消失）
    teacherAdded: false,     // 是否已搜索并添加风前屿（小岛老师）
    newsLoggedIn: false,     // 新闻网账号登录（用户名 搁浅）
    forumLoggedIn: false,    // 浅湾论坛登录
    forumMsgsOpen: true,     // 论坛右侧私信面板展开/收起
    forumVisited: false,
    adminMode: false,
    diaryUnlocked: false,
    planUnlocked: false,
    pluginGot: false,       // 小岛老师是否已发放插件文件
    pluginInstalled: false,
    pluginUsed: false,
    mapSolved: false,
    // 倒计时结果
    countdown: {
      active: false,
      remaining: 0,
      total: 0,
      success: false,
      finished: false
    },
    // 玩家在倒计时里手动记录的地点文本
    recordedPlace: '',
    // 鲸鱼先生干扰已触发的次数（避免重复骚扰）
    whaleTriggers: [],
    // 当前结局
    ending: null,
    // 玩家在论坛里发的帖与评论（登录后可用）
    userPosts: [],
    userComments: {}, // { [postId]: [{ user, text, time }] }
    likedPosts: [],   // 已点赞的帖子 id
    // 收集到的线索 id
    clues: []
  }),

  getters: {
    hasClue: (s) => (id) => s.clues.includes(id)
  },

  actions: {
    unlock() {
      this.unlocked = true
    },
    addClue(id) {
      if (!this.clues.includes(id)) this.clues.push(id)
    },
    markConvRead(id) {
      if (!this.wechatReadConvs.includes(id)) this.wechatReadConvs.push(id)
    },
    toggleAdmin() {
      this.adminMode = true
    },
    markWhaleTriggered(key) {
      if (!this.whaleTriggers.includes(key)) this.whaleTriggers.push(key)
    },
    startCountdown(seconds = 50) {
      this.countdown.active = true
      this.countdown.remaining = seconds
      this.countdown.total = seconds
      this.countdown.success = false
      this.countdown.finished = false
    },
    finishCountdown(success) {
      this.countdown.active = false
      this.countdown.finished = true
      this.countdown.success = success
    },
    setEnding(type) {
      this.ending = type
    },
    reset() {
      this.$reset()
    }
  }
})
