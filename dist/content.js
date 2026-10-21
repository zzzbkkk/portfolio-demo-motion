window.PORTFOLIO_DATA = {
  email: '联系入口（演示）', demo: true,
  imageSizes: {
    'portrait-demo': [1086, 1448], 'ip-black': [1802, 1080], 'ip-white': [1546, 1080], 'ip-lin': [1080, 1443], 'ip-yaba': [1080, 1132], 'ip-fufu': [2400, 1608], 'ip-bag': [1080, 1080], 'ip-magnet': [1080, 1440],
    'nuo-cover': [1697, 2400], 'nuo-detail': [1697, 2400], 'nuo-mask': [1698, 2400],
    'flowers-cover': [1697, 2400], 'flowers-opening': [1697, 2400], 'flowers-tulip': [1697, 2400], 'flowers-lotus': [1697, 2400], 'flowers-green': [1697, 2400],
    'cafe-cover': [1800, 2400], 'cafe-contents': [1800, 2400], 'cafe-spread': [1800, 2400], 'cafe-baking': [1800, 2400], 'packaging-cover': [1800, 2400], 'packaging-detail': [1800, 2400],
    'aigc-radio': [2400, 1350], 'aigc-snow': [2400, 1350], 'city-poster': [1796, 2400], 'coconut': [1697, 2400], 'illustration': [1080, 1528], 'ui-mood': [480, 1041], 'storybook': [1366, 976],
    'poster-sea': [426, 596], 'poster-seventh': [426, 596], 'poster-no-image': [1049, 1333], 'poster-birds': [1697, 2400]
  },
  projects: [
    {
      id: 'book-posters', name: '书籍海报设计', category: '文字与版式实验', tags: ['editorial'], cover: 'poster-birds', color: '#f2f2f4',
      intro: '围绕《幻梦中涌动的海》《第七天》《无象之境》和《飞鸟集》，探索文字、色彩与图像的编排。四张画面使用不同的视觉语言，呈现书籍与展览主题的设计尝试。',
      note: '书籍海报 · 字体编排 · 视觉实验',
      gallery: [{ image: 'poster-sea', caption: '《幻梦中涌动的海》：蓝色文字、虚实变化与留白。' }, { image: 'poster-seventh', caption: '《第七天》：以黑红山峦衬托竖排书名。' }, { image: 'poster-no-image', caption: '《无象之境》：黑白影像与文字的重叠编排。' }, { image: 'poster-birds', caption: '《飞鸟集》：以飞鸟的轨迹串联金色与黑色画面。' }]
    },
    {
      id: 'fuzhou-ip', name: '福州城市 IP', category: 'IP 形象与文创应用', tags: ['illustration', 'brand'], cover: 'ip-lin', color: '#eee9e2', featured: true,
      intro: '以福州的历史人物、民俗形象与城市寓意为线索，尝试把地域文化转化为亲切、有记忆点的卡通角色。',
      note: '角色形象 · 系列设计 · 应用效果示意',
      gallery: [
        { image: 'ip-black', caption: '黑无常：保留高帽与深色服饰，以圆润比例拉近角色距离。' },
        { image: 'ip-white', caption: '白无常：简化线条、夸张表情，与黑无常形成配套形象。' },
        { image: 'ip-lin', caption: '林则徐：从官帽、胡须与传统服饰中提取人物特征。' },
        { image: 'ip-yaba', caption: '牙霸：绿色头饰与俏皮表情，为系列增添生活气息。' },
        { image: 'ip-fufu', caption: 'FuFu：借“福”的谐音，以蝙蝠形象传递祝福。' },
        { image: 'ip-bag', caption: '帆布袋应用效果示意，AI 辅助生成。' },
        { image: 'ip-magnet', caption: '冰箱贴应用效果示意，AI 辅助生成。' }
      ]
    },
    {
      id: 'nuo', name: '中国傩文化', category: '信息可视化设计', tags: ['editorial', 'brand'], cover: 'nuo-cover', color: '#d9b4c7', featured: true,
      intro: '以傩面具为视觉中心，将文化背景、面具形态与相关知识组织为分层信息。通过环形构图、地图、图标与线描，探索传统文化的阅读秩序。',
      note: '文化主题 · 图形语言 · 信息层级',
      gallery: [{ image: 'nuo-mask', caption: '傩面具主视觉。' }, { image: 'nuo-cover', caption: '以面具为中心组织文化信息。' }, { image: 'nuo-detail', caption: '文化介绍、分布与制作程序的分区编排。' }]
    },
    {
      id: 'flowers', name: '花影录', category: '书籍装帧设计', tags: ['editorial'], cover: 'flowers-cover', color: '#d3d4c9', featured: true,
      intro: '以花卉形态、植物细节与光影变化为线索，在整页图像、局部特写和文字之间安排阅读节奏。用低饱和自然色与留白连接封面、书脊和内页。',
      note: '课程作品 · 花卉主题 · 编辑设计',
      gallery: [{ image: 'flowers-cover', caption: '《花影录》封面。' }, { image: 'flowers-opening', caption: '开篇的图像与文字层级。' }, { image: 'flowers-tulip', caption: '以细部观察构成安静的阅读页面。' }, { image: 'flowers-lotus', caption: '花卉特写与文字的对照。' }, { image: 'flowers-green', caption: '章节页中的绿色与留白。' }]
    },
    {
      id: 'cafe', name: 'café sweeet', category: '烘焙杂志设计', tags: ['editorial'], cover: 'cafe-cover', color: '#e8c39f', featured: true,
      intro: '围绕烘焙食品与咖啡文化，使用奶油色、焦糖色与黑色组织画面。从封面、目录到内页，尝试兼顾食物的感官吸引力与杂志阅读的连贯性。',
      note: '杂志封面 · 目录 · 图文编排',
      gallery: [{ image: 'cafe-cover', caption: '杂志封面。' }, { image: 'cafe-contents', caption: '目录与栏目层级。' }, { image: 'cafe-spread', caption: '摄影与文字的版面关系。' }, { image: 'cafe-baking', caption: '烘焙主题内页。' }]
    },
    {
      id: 'packaging', name: '紫色纹样包装', category: '系列包装设计', tags: ['brand'], cover: 'packaging-cover', color: '#ccc0df', featured: true,
      intro: '以紫色作为系列识别色，将传统装饰纹样与色彩运用于礼盒、软管和瓶罐。通过统一图形语言连接不同产品，在系列感中保留单品差异。',
      note: '系列视觉 · 图形延展 · 包装效果示意',
      gallery: [{ image: 'packaging-cover', caption: '包装系列视觉效果。' }, { image: 'packaging-detail', caption: '不同产品形态上的图形延展。' }]
    },
    {
      id: 'radio', name: '猫狗电台', category: 'AIGC 内容探索', tags: ['aigc', 'illustration'], cover: 'aigc-radio', color: '#c7d9df', featured: true,
      intro: '将拟人化猫狗搭档放入电台访谈场景，通过角色服饰、表情与环境变化延展内容，同时探索系列画面中角色特征的一致性。',
      note: 'AIGC · 角色设定 · 场景延展',
      gallery: [{ image: 'aigc-radio', caption: '猫狗搭档与电台场景，AIGC 画面。' }, { image: 'aigc-snow', caption: '同一角色组合在不同环境中的表达，AIGC 画面。' }]
    },
    {
      id: 'city-poster', name: '福州新年城市海报', category: 'AIGC 海报', tags: ['brand', 'aigc'], cover: 'city-poster', color: '#e4a38c',
      intro: '将福州城市建筑与街区印象组织为微缩立体场景，以暖红色呼应元旦氛围，通过建筑层次呈现城市的地域辨识度。', note: '城市主题 · AIGC 视觉',
      gallery: [{ image: 'city-poster', caption: '福州元旦主题城市海报，AIGC 画面。' }]
    },
    {
      id: 'coconut', name: '椰壳新生', category: '信息可视化设计', tags: ['editorial'], cover: 'coconut', color: '#ddcdb5',
      intro: '以椰壳再利用为主题，借助接近材料与纸张的自然色调、流程图示和产品图形，组织从废弃物到再生应用的信息线索。', note: '材料主题 · 流程表达 · 信息设计',
      gallery: [{ image: 'coconut', caption: '椰壳再生主题的信息可视化。' }]
    },
    {
      id: 'forest', name: '森林里的小聚会', category: '场景插画', tags: ['illustration'], cover: 'illustration', color: '#e4d39f',
      intro: '用柔和暖色、植物和卡通动物组织户外聚会场景，尝试在角色动作与画面细节中营造轻松的叙事氛围。', note: '动物角色 · 场景插画',
      gallery: [{ image: 'illustration', caption: '森林动物聚会场景。' }]
    },
    {
      id: 'mood', name: '小熊情绪记录', category: 'UI 界面设计', tags: ['illustration'], cover: 'ui-mood', color: '#d9e1ef',
      intro: '以小熊表情作为情绪表达的媒介，围绕心情选择、日历与日记组织界面，用柔和色彩探索亲切的记录体验。', note: '界面视觉 · 情绪表达',
      gallery: [{ image: 'ui-mood', caption: '情绪记录界面设计，保持原有手机画面比例。' }]
    },
    {
      id: 'storybook', name: '芬宝儿童 IP 绘本', category: 'AIGC 绘本视觉', tags: ['aigc', 'illustration'], cover: 'storybook', color: '#d2e2c5',
      intro: '围绕华文学习与成长话题，用圆润角色、柔和色彩和连续画面探索儿童绘本的叙事方式。', note: '儿童 IP · AIGC 视觉 · 双语绘本',
      gallery: [{ image: 'storybook', caption: '绘本页面总览，AIGC 辅助视觉设计。' }]
    }
  ]
};
