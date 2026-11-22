/**
 * 小红书网页端模拟数据
 * 参考小红书网页端界面：左侧导航、顶部搜索、笔记瀑布流、笔记详情、评论与互动。
 */

export const xhsNav = ['发现', '发布', '通知', '我']

// 送别诗笔记正文（含加粗片段），结构：{ type: 'text'|'quote'|'bold'|'list', text }
export const poemNote = {
  id: 'xhs-poem',
  author: '语文课代表小周',
  avatar: '周',
  title: '冷门到全网几乎没人提的送别诗，最后五个字把我读沉默了',
  blocks: [
    { type: 'text', text: '今天翻《全唐诗》翻到一首，作者苏颋，可能很多人不熟，但他是初盛唐之交的"燕许大手笔"之一，和张说齐名，官至宰相。这首《饯郢州李使君》是他送别一位姓李的使君时写的。' },
    { type: 'text', text: '全诗不长，但越读越冷。' },
    { type: 'bold', text: '《饯郢州李使君》' },
    { type: 'text', text: '唐·苏颋' },
    { type: 'text', text: '楚有章华台，遥遥云梦泽。' },
    { type: 'text', text: '复闻拥符传，及是收图籍。' },
    { type: 'text', text: '佳政在离人，能声寄侯伯。' },
    { type: 'text', text: '离怀朔风起，试望秋阴积。' },
    { type: 'text', text: '中路凄以寒，群山霭将夕。' },
    { type: 'text', text: '伤心聊把袂，怊怅麒麟客。' },
    { type: 'bold', text: '先说我个人最被打动的一句：' },
    { type: 'quote', text: '“遥遥云梦泽。”' },
    { type: 'text', text: '云梦泽是古代楚地的大泽，浩渺无边。章华台是楚国的离宫。诗人开篇不写送别，先写一座台、一片泽，远远地隔在那里。' },
    { type: 'text', text: '“遥遥”两个字，既是地理上的远，也是心理上的远——你还没走，我已经觉得你离我很远了。' },
    { type: 'text', text: '然后是最后一句：' },
    { type: 'quote', text: '“怊怅麒麟客。”' },
    { type: 'text', text: '麒麟客，指才华出众的人。诗人说，我惆怅地望着你这位麒麟一般的客人离去。整首诗前面都在写政绩、写秋景、写寒风，到最后才把最深的那句不舍放出来：你那么好，可你还是要走。' },
    { type: 'bold', text: '我的理解：' },
    { type: 'text', text: '这首诗表面是送别，底下藏着一层很轻的惋惜。李使君是有才华的人，有"佳政"，有"能声"，可偏偏要在这秋风起的时候离开。诗人没有大声挽留，只是站在暮色里的群山中，拉着袖子，看着一个很好的人越走越远。' },
    { type: 'bold', text: '适合谁读：' },
    { type: 'list', text: '喜欢冷门唐诗的人' },
    { type: 'list', text: '最近在送别什么人的人' },
    { type: 'list', text: '或者，只是觉得"遥遥"这两个字很好听的人' },
    { type: 'text', text: '#唐诗 #送别诗 #苏颋 #遥遥云梦泽 #诗词分享 #每日一首' }
  ],
  stats: { likes: 247, favs: 89, comments: 12, shares: 6 },
  liked: false,
  faved: false,
  comments: [
    { id: 1, user: '不想起床', avatar: '起', text: '最后一句真的绝了。"麒麟客"三个字比什么夸人的词都重。', likes: 42, liked: false },
    { id: 2, user: '看到我叫我去做项目', avatar: '看', text: '第一次见有人推这首，收藏了。', likes: 18, liked: false },
    { id: 3, user: '语文课代表小周', avatar: '周', isAuthor: true, replyTo: '橘子汽水', text: '我也是偶然翻到的，读完坐了很久。', likes: 31, liked: false }
  ]
}

// 其他笔记（瀑布流），同样可点赞评论
export const otherNotes = [
  {
    id: 'xhs-1', author: '海边的晚风', avatar: '海',
    title: '这座小城的秋天，值得为它停下脚步 🍂',
    cover: 'linear-gradient(135deg,#c9a27e,#6e9aa8)',
    blocks: [{ type: 'text', text: '在海边待了三年，还是会被傍晚的颜色打动。分享几个我最爱去的地方，人少，安静，适合发呆。' }],
    stats: { likes: 1204, favs: 388, comments: 56, shares: 23 }, liked: false, faved: false,
    comments: [
      { id: 1, user: '橘子汽水', avatar: '橘', text: '请问具体在哪呀？', likes: 12, liked: false },
      { id: 2, user: '慢半拍', avatar: '慢', text: '好治愈，收藏了。', likes: 8, liked: false }
    ]
  },
  {
    id: 'xhs-2', author: '今天也要好好吃饭', avatar: '饭',
    title: '一个人也要好好吃饭｜十分钟搞定的晚餐',
    cover: 'linear-gradient(135deg,#e8c49d,#b25a5a)',
    blocks: [{ type: 'text', text: '累了一天，不想折腾。分享一个我常做的快手晚餐，简单但很满足。' }],
    stats: { likes: 892, favs: 210, comments: 34, shares: 11 }, liked: false, faved: false,
    comments: [
      { id: 1, user: '厨房新手', avatar: '厨', text: '跟着做了一次，成功了！', likes: 15, liked: false }
    ]
  },
  {
    id: 'xhs-3', author: '夜读手记', avatar: '读',
    title: '那些藏在课本外的诗句，读到人会突然安静',
    cover: 'linear-gradient(135deg,#7c9aa8,#2f5d70)',
    blocks: [{ type: 'text', text: '整理了一些不在课本里、却让我记了很久的句子。' }],
    stats: { likes: 3341, favs: 1204, comments: 128, shares: 67 }, liked: false, faved: false,
    comments: [
      { id: 1, user: '诗盲', avatar: '诗', text: '收藏了慢慢看。', likes: 44, liked: false }
    ]
  },
  {
    id: 'xhs-4', author: '慢跑的猫', avatar: '猫',
    title: '凌晨五点的海边，我好像拥有了整个世界',
    cover: 'linear-gradient(135deg,#6e9aa8,#1b3a4b)',
    blocks: [{ type: 'text', text: '失眠的第 N 天，索性出门跑步。天还没亮，海边只有我和潮水。' }],
    stats: { likes: 567, favs: 143, comments: 21, shares: 9 }, liked: false, faved: false,
    comments: []
  }
]
