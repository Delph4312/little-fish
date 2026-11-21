/**
 * PC 端微信数据（文案-02电脑桌面.md）
 * 消息结构：{ t: 时间分隔标记 | undefined, from: 'me'|'other', type: text/image/transfer/file/screenshot, text }
 * 切换联系人时，messages 按数组顺序自上而下渲染，日期用 t 字段插入分隔条。
 */

export const wechatAccount = {
  nickname: '谢遥',
  wechatId: 'xieyao_0317',
  avatarText: '遥',
  passwordHint: '密码写在文件管理器的某个 txt 里'
}

// 左侧会话列表（顺序即微信里的排列）
// teacher（小岛老师/风前屿）初始不出现，玩家搜索微信号添加后才显示，由 game.teacherAdded 控制。
// unread 为该会话真实未读条数：姐姐最新2条、班群4条，点击会话后归零（由 game.wechatReadConvs 控制）。
export const conversationList = [
  { id: 'sister', name: '姐姐', avatarText: '晴', preview: '不要想不开，快回我消息。', time: '14:30', unread: 2 },
  { id: 'dad', name: '爸爸', avatarText: '爸', preview: '爸爸，妈妈，我好想你们……', time: '昨天', unread: 0 },
  { id: 'mom', name: '妈妈', avatarText: '妈', preview: '爸爸，妈妈，我好想你们……', time: '昨天', unread: 0 },
  { id: 'class', name: '高三（3）班群', avatarText: '班', preview: '谢遥看到回我。', time: '14:20', unread: 4 },
  { id: 'teacher', name: '小岛老师', avatarText: '屿', preview: '如果遇到卡住的地方，可以来问我。', time: '15:12', unread: 0, hidden: true },
  { id: 'filehelper', name: '文件传输助手', avatarText: '文', preview: '', time: '', unread: 0 }
]

export const conversations = {
  sister: {
    name: '姐姐',
    messages: [
      { t: '昨天 19:32' },
      { from: 'other', type: 'text', text: '小遥，今天模考怎么样？' },
      { from: 'me', type: 'text', text: '还行。' },
      { from: 'other', type: 'text', text: '姐这边面试有消息了，人家让我下周去试岗，差不多定了。' },
      { from: 'me', type: 'text', text: '真的？' },
      { from: 'other', type: 'text', text: '真的。你别操心我，专心学习。' },
      { from: 'me', type: 'text', text: '嗯。' },
      { from: 'other', type: 'text', text: '晚上想吃什么？姐给你做。' },
      { from: 'me', type: 'text', text: '不用，学校吃。' },
      { t: '今天 14:30' },
      { from: 'other', type: 'text', text: '遥遥，你怎么了？' },
      { from: 'other', type: 'text', text: '不要想不开，快回我消息。' }
    ]
  },

  dad: {
    name: '爸爸',
    messages: [
      { t: '2025年9月12日 18:40' },
      { from: 'other', type: 'text', text: '小遥，生活费打你卡上了，一千五，省着点花。' },
      { from: 'other', type: 'transfer', text: '[转账] 1500.00' },
      { from: 'me', type: 'text', text: '知道了爸。' },
      { from: 'other', type: 'text', text: '别老吃泡面，食堂有肉就买。' },
      { from: 'me', type: 'text', text: '嗯。' },
      { from: 'other', type: 'text', text: '你姐说她在那边挺好，你别惦记。' },
      { from: 'other', type: 'text', text: '对了，昨天整理你小时候的相册，看到你周岁那天拍的，2008年3月4号，一晃十八年了。体检表生日别再填错啊。' },
      { from: 'me', type: 'text', text: '爸，你跟我妈在外面注意身体。' },
      { from: 'other', type: 'text', text: '知道，你妈天天念叨你。' },
      { t: '2025年10月3日 20:15' },
      { from: 'other', type: 'text', text: '今天收工早，炒了个土豆丝。你妈嫌咸。' },
      { from: 'other', type: 'image', text: '[图片]', caption: '一盘土豆丝' },
      { from: 'me', type: 'text', text: '看着挺好吃。' },
      { from: 'other', type: 'text', text: '下次少放盐。' },
      { t: '昨天 23:47' },
      { from: 'me', type: 'text', text: '爸爸，妈妈，我好想你们……' }
    ]
  },

  mom: {
    name: '妈妈',
    messages: [
      { t: '2025年10月3日 19:58' },
      { from: 'other', type: 'text', text: '小遥，降温了，秋裤穿了没？' },
      { from: 'me', type: 'text', text: '穿了。' },
      { from: 'other', type: 'text', text: '别糊弄我。' },
      { from: 'me', type: 'text', text: '真穿了。' },
      { from: 'other', type: 'text', text: '你爸给你打钱了吧？不够跟妈说。' },
      { from: 'me', type: 'text', text: '够了。' },
      { from: 'other', type: 'text', text: '学习别太晚，眼睛要坏。' },
      { from: 'me', type: 'text', text: '知道了妈。' },
      { t: '昨天 23:49' },
      { from: 'me', type: 'text', text: '爸爸，妈妈，我好想你们……' }
    ]
  },

  class: {
    name: '高三（3）班群',
    messages: [
      { t: '今天 14:20' },
      { from: 'other', fromName: '班主任', type: 'text', text: '谢遥今天没来上课，有同学能联系到他吗？' },
      { from: 'other', fromName: '同学A', type: 'text', text: '不知道。' },
      { from: 'other', fromName: '同学B', type: 'text', text: '他最近老一个人。' },
      { from: 'other', fromName: '班主任', type: 'text', text: '谢遥看到回我。' }
    ]
  },

  teacher: {
    name: '小岛老师',
    messages: [
      { t: '今天 15:12' },
      { from: 'other', type: 'text', text: '你好。你说你们遇到了困难，能跟我详细说说吗？' },
      { from: 'me', type: 'text', text: '你好。我是用我朋友的弟弟的账号登录的。他昨天给我朋友发了奇怪的消息，然后就失踪了。' },
      { from: 'me', type: 'text', text: '我们找到了浅湾论坛，怀疑他被鲸鱼先生引导，准备杀死仇人后自杀。' },
      { from: 'other', type: 'screenshot', text: '[图片]', caption: '开篇谢遥发送给谢晴的微信消息截图' },
      { from: 'other', type: 'text', text: '你找到我，说明你已经看到论坛里那些东西了。' },
      { from: 'other', type: 'text', text: '鲸鱼先生不会帮自杀者做具体的决定和计划，所以你朋友的弟弟一定是自己完成的策划。' },
      { from: 'other', type: 'text', text: '你们要找出谢遥的计划，他可能在电脑或论坛里留下过痕迹。' },
      { from: 'other', type: 'text', text: '如果遇到卡住的地方，可以来问我。' }
    ]
  },

  filehelper: {
    name: '文件传输助手',
    messages: [
      { t: '今天 15:20' },
      { from: 'other', type: 'text', text: '新闻网账号：搁浅' },
      { from: 'other', type: 'text', text: '密码：gq7Kp2m' },
      { from: 'other', type: 'text', text: '（这是你自己记在这里的，别忘了。）' }
    ]
  }
}

// 朋友圈封面与动态
export const momentsCover = '海边防波堤，远处有灯塔。'

export const moments = [
  {
    user: '谢遥', avatarText: '遥', time: '今天 00:13',
    text: '最后一天。', visibility: '仅自己可见', images: []
  },
  {
    user: '谢晴', avatarText: '晴', time: '11月15日 21:08',
    text: '面完第四家，腿都站麻了。等通知。小遥今天模考，希望他别熬太晚。',
    images: ['便利店咖啡'],
    likes: [],
    comments: [
      { user: '谢遥', text: '姐，早点睡。' },
      { user: '谢晴', text: '回复 谢遥：你也是。' }
    ]
  },
  {
    user: '谢遥', avatarText: '遥', time: '11月14日 23:52',
    text: '海边的灯亮到很晚。', visibility: '仅自己可见', images: ['远处防波堤夜景']
  },
  {
    user: '妈妈', avatarText: '妈', time: '去年10月3日 20:02',
    text: '降温了，两个孩子记得穿厚点。小遥别老熬夜，晴晴在外面别舍不得吃饭。',
    images: ['一桌家常菜'], likes: ['谢遥', '谢晴']
  },
  {
    user: '爸爸', avatarText: '爸', time: '去年9月18日 18:36',
    text: '今天收工早，炒了个土豆丝，你妈嫌咸。下次少放盐。',
    images: ['一盘土豆丝'],
    comments: [
      { user: '妈妈', text: '咸了也吃完了。' },
      { user: '谢遥', text: '爸手艺见长。' }
    ]
  },
  {
    user: '谢晴', avatarText: '晴', time: '去年6月7日 22:41',
    text: '小遥高考一年倒计时，姐比他还紧张。',
    images: ['书桌和台灯'],
    comments: [
      { user: '谢遥', text: '姐，你别紧张。' },
      { user: '谢晴', text: '回复 谢遥：你才别紧张。' }
    ]
  }
]

// 添加联系人：小岛老师
export const contactApplication = {
  wechatName: '风前屿',
  wechatId: 'windbefore_island',
  remark: '小岛老师',
  message: '我的朋友遇到了困难，你可以帮我们吗？'
}

// 小岛老师卡关提示（按触发节点索引）
export const teacherHints = {
  beforeForum: [
    '论坛在浏览器书签栏里，登录后能看到。找到「浅湾论坛」点进去。',
    '别从搜索进，搜索页有假站。鲸鱼先生做过好几个镜像。'
  ],
  beforeAdmin: [
    '你现在看到的论坛只是给外面人看的。你需要进入"管理员模式"。',
    '鲸鱼先生不会把真话摆在明面上。隐藏帖子里才有他真正在做的事。'
  ],
  diaryPassword: [
    '日记用的不是一句话，是一串数字。想想他最不愿意忘记、又最想忘掉的那一天。',
    '你已经在微信里看过了。他爸爸提过一次，完整到年份。'
  ],
  stuck1: [
    '把他生日的八个数字连起来，横线去掉，就是密码。'
  ],
  stuck2: [
    '密码是 20080304 这种格式——年、月、日，八位。'
  ]
}

// 小岛老师提供扩展程序时的对话
export const pluginDialogue = [
  '我做了一个扩展程序。',
  '[文件]',
  '如果鲸鱼先生打算切断你和论坛的连接，它能帮你抢出一点时间，可能只有不到一分钟的时间。',
  '你要在这段时间里，把谢遥最后选的地址记下来。',
  '用你电脑上的便签，或者拿笔记。别只靠脑子。',
  '时间一到，论坛就会彻底断连，机会仅此一次，你要把握好。'
]

// 微信收藏夹：车祸报道已移至「浏览器→新闻网→微信登录后的账号收藏夹」，此处不再显示。
export const favorites = []

// 去掉「文件」页
export const wechatSidebar = ['聊天', '通讯录', '收藏', '朋友圈']
