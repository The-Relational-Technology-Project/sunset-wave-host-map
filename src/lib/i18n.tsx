import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ordinal } from "./blocks";

export type Lang = "en" | "zh" | "yue" | "es";
export const LANGS: { code: Lang; label: string; html: string }[] = [
  { code: "en", label: "English", html: "en" },
  { code: "zh", label: "普通话", html: "zh-Hans" },
  { code: "yue", label: "廣東話", html: "zh-Hant-HK" },
  { code: "es", label: "Español", html: "es" },
];

const en = {
  nav: { host: "Host on your block", lang: "Language" },
  hero: {
    brand: "The Sunset Wave", the: "The", sunset: "Sunset", wave: "Wave",
    kicker: "The Inaugural Wave",
    date: "Saturday, March 20th 2027",
    tagline: "400 blocks. One afternoon. Hosted by the neighbors.",
    cta: "Host on your block",
    map: "See the map",
    count: "{n} neighbors have raised a hand",
    alt: "Painted row houses of the Sunset stepping down to the dunes and the ocean, pelicans overhead",
  },
  invite: {
    title: "Gatherings on every block. On the same day.",
    p1: "We're envisioning a day where Sunset neighbors come together. Folding tables and lawn chairs and outstretched hands. Good will in action on every street.",
    p2: "It's a chance to finally meet your neighbors, and for them to meet each other.",
    p3: "You host on your block. We support you with a hosting kit and opportunities to meet fellow hosts.",
    photoAlt: "The Sunset from above, rows of houses running to the ocean",
  },
  map: {
    title: "Find your block",
    sub: "Gatherings across the Sunset, from Lincoln to south of Sloat. A wave means a neighbor has raised their hand.",
    open: "Open block",
    claimed: "Someone's hosting",
    other: "Host a gathering",
    otherSub: "In someone's driveway, in a parklet, or on the corner. Tell us your stretch so we know you're in!",
    loading: "Loading the neighborhood…",
    unavailable: "The map couldn't load.",
    retry: "Try again",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset map",
    ocean: "Pacific Ocean",
    park: "Golden Gate Park",
    greatHwy: "Great Hwy",
    laPlaya: "La Playa",
    hint: "Pinch or scroll to zoom. Drag to move.",
    blankNote: "Blank spaces are parks and reservoirs!",
    southSloat: "South of Sloat",
    openTitle: "This block is open",
    openSub: "Be the one who says yes. Co-hosts welcome.",
    take: "Host on this block",
    claimedTitle: "{names} raised a hand here",
    claimedSub: "Want to help, bring something, or just say hi? Send the host a note. Two hosts on a block is a feature, not a conflict.",
    sendNote: "Send a note to the host",
    cohost: "I'd like to co-host",
  },
  easy: {
    title: "Hosting looks like this",
    sub: "A little invitation. A little color. A place to come together.",
    steps: [
      { t: "The invitation", b: "A small flyer on a familiar street. Something good is happening here." },
      { t: "A little sidewalk color", b: "Chalk-covered hands, bright colors, and kids making the street their own." },
      { t: "A place to gather", b: "A homemade sign. An open garage. Room for one more chair." },
      { t: "Neighbors, at last", b: "Folding chairs, shared snacks, and conversations that keep going." },
    ],
    ideasTitle: "Make it yours",
    ideas: ["Card games in the garage", "Potluck out front", "Coffee + donuts", "Chalk art and music", "Tea on the steps", "Kids' bike parade", "You decide!"],
  },
  gets: {
    title: "HOST WITH SUPPORT",
    sub: "Say yes and you're part of a 400-person host network, facilitated by the Sunset Social Club.",
    items: [
      { t: "A party for hosts", w: "4 to 6 weeks before", b: "Meet the other hosts first. Food, a short walkthrough, and the hosts on your avenue." },
      { t: "Host network", w: "From signup to the day", b: "A group thread by avenue, plus experienced block party hosts as friendly mentors." },
      { t: "Planning help", w: "Whenever you ask", b: "A one-page gathering recipe, a 20-minute call or walk-and-talk, help with permits if you want a street closure (most won't)." },
      { t: "Flyers by local artists", w: "6 weeks out", b: "Sunset artists design a flyer kit, remixed with your stretch and time, in English and Chinese. Print copies at Sunset Variety." },
      { t: "A little money if you need it", w: "No questions asked", b: "About $100 for anyone who says they need it, paid in advance. Hosts with more to give can fund another block." },
      { t: "Day-of support", w: "March 20", b: "Supply drops (tables, chalk, name tags), a roving volunteer crew, a shared photo stream, and a closing gathering for hosts." },
    ],
  },
  goals: {
    title: "The count",
    items: [
      { n: "100", l: "hosts by the end of January" },
      { n: "250", l: "hosts by the host party" },
      { n: "400", l: "blocks by March 20" },
    ],
    note: "Even 150 gatherings on one day would be the largest neighbor event the Sunset has ever had.",
    annual: "This is the first one. We'd like it to become a tradition: every spring, the Sunset waves.",
  },
  faq: {
    title: "Questions",
    items: [
      { q: "What do I actually have to do?", a: "Pick a spot on your block, invite your neighbors, and show up on March 20 with whatever you need to carry out your plan. We're suggesting 11:00 am - 1:00 pm, but it's up to you! How long you host, how much you plan, and what you serve is completely flexible." },
      { q: "Do I need a permit?", a: "Most gatherings on a sidewalk, front steps or garage don't. If you want to close the street, we'll help you with the permit." },
      { q: "Someone already took my block. Now what?", a: "Wonderful. Send them a note and co-host, or host anywhere nearby: around the corner, a courtyard, your own driveway. Choose \"Host on your block\" and tell us your stretch. You don't need to know anyone there." },
      { q: "Is there any financial support for hosting?", a: "Let us know you could use support when you sign up. We will provide support where possible!" },
      { q: "Can I help financially support another block?", a: "Yes. Check \"I can give a little\" on the form. The Sunset Social Club routes it, and nobody is named on either side." },
      { q: "What if it rains or is foggy?", a: "It's the Sunset. Garages, porches and a pot of something warm work great. We'll share a rainy-day plan with hosts." },
      { q: "Is this a one-time thing?", a: "This is the inaugural Wave. We hope it becomes an annual neighborhood tradition." },
      { q: "Who's behind this?", a: "The Sunset Wave is organized by the Sunset Social Club, a neighborhood club run by people who live in the Sunset." },
    ],
  },
  host: {
    title: "Host on your block",
    sub: "Under a minute. The date is set and the block is yours.",
    name: "Your name",
    contact: "Email or phone",
    stretch: "Your stretch",
    stretchPh: "e.g. 44th Ave between Judah and Kirkham",
    stretchHint: "Feel free to edit and give us a better idea of where you'll host.",
    moneyNote: "You can update your answer later!",
    cohosts: "Co-hosts (optional)",
    addCohost: "Add a co-host",
    cohostName: "Co-host name",
    cohostContact: "Their email or phone (optional)",
    remove: "Remove",
    microgrant: "If it becomes available, I could use extra funds to help cover expenses.",
    give: "I can give a little to help another block",
    sheltered: "The place I'm hosting is sheltered from rain.",
    submit: "Raise my hand",
    sending: "Sending…",
    okTitle: "You're on the map!",
    okBody: "Thank you for raising your hand. We'll be in touch soon about the host party and next steps.",
    close: "Close",
    errName: "Please add your name.",
    errContact: "Please add an email or phone number.",
    errStretch: "Tell us which stretch.",
    errGeneric: "Something went wrong. Please try again.",
  },
  note: {
    title: "Send a note to the host",
    sub: "We'll pass it along. The host's contact info stays private.",
    name: "Your name",
    contact: "Email or phone",
    message: "Your note",
    messagePh: "Hi! I live on this block and could bring chairs…",
    submit: "Send note",
    okTitle: "Note sent",
    okBody: "We'll pass it along to the host. Thanks for being a good neighbor.",
    errMessage: "Please write a short note.",
  },
  footer: {
    supported: "The Sunset Wave is supported by the Sunset Social Club as a way for more of us to meet our neighbors, and a moment for us to come together as a neighborhood.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    made: "Made in the Sunset, San Francisco.",
    back: "Back to the Wave",
  },
  pages: {
    privacyTitle: "Privacy",
    privacy: [
      "We don't sell or share your data.",
      "We don't use tracking cookies.",
      "If you offer to host or send a note to a host, we'll only use your contact info for that: reaching you about the Wave, or passing your note along.",
      "Only a host's first name appears on the map. Contact details are never shown publicly.",
      "You can ask us to delete your information at any time.",
      "This site is intended for people 14 and older.",
    ],
    termsTitle: "Terms of Use",
    terms: [
      "Please use this site with care and respect.",
      "You are responsible for your own actions when hosting or joining gatherings.",
      "We don't endorse user-submitted content.",
      "We accept no liability for what happens in and around gatherings.",
      "This site is operated in CA, USA and any disputes are subject to its laws.",
      "We may update these terms if needed, but we'll keep them simple and human.",
    ],
    careTitle: "Community care",
    care: "Things don't always go perfectly. If a misunderstanding or conflict comes up, Sunset Social Club stewards are happy to help neighbors talk it through and find repair.",
    contactTitle: "Say hello",
    contactBody: "Questions, ideas, want to help? Write to us at",
    questions: "Questions? Reach us at",
  },
};

export type Dict = typeof en;

const zh: Dict = {
  nav: { host: "在你的街区主持聚会", lang: "语言" },
  hero: {
    brand: "The Sunset Wave", the: "The", sunset: "Sunset", wave: "Wave",
    kicker: "首届 The Sunset Wave",
    date: "2027 年 3 月 20 日 星期六",
    tagline: "400 个街区。同一个下午。由邻居们主持。",
    cta: "在你的街区主持聚会",
    map: "查看地图",
    count: "已有 {n} 位邻居举手",
    alt: "日落区彩色的排屋一路延伸到沙丘和大海，鹈鹕从头顶飞过",
  },
  invite: {
    title: "每个街区都有聚会。就在同一天。",
    p1: "我们想象着这样一天：日落区的邻居们聚在一起。折叠桌、草坪椅，还有伸出来打招呼的手。每条街上，善意都化为行动。",
    p2: "这是一个终于认识邻居、也让他们彼此认识的机会。",
    p3: "你在自己的街区主持聚会。我们提供主持人工具包，还有机会认识其他主持人。",
    photoAlt: "从空中俯瞰日落区，一排排房屋延伸到海边",
  },
  map: {
    title: "找到你的街区",
    sub: "聚会遍布日落区，从 Lincoln 到 Sloat 以南的社区。挥手图标表示已经有邻居举手了。",
    open: "空着的街区",
    claimed: "已有人主持",
    other: "举办邻里聚会",
    otherSub: "你的街区、院子或街角。告诉我们你的路段 — 欢迎你加入。",
    loading: "正在加载社区地图…",
    unavailable: "地图未能加载。",
    retry: "重试",
    zoomIn: "放大",
    zoomOut: "缩小",
    reset: "重置地图",
    ocean: "太平洋",
    park: "金门公园",
    greatHwy: "Great Hwy",
    laPlaya: "La Playa",
    hint: "双指或滚轮缩放，拖动移动。",
    blankNote: "空白处是公园和水库！",
    southSloat: "Sloat 以南",
    openTitle: "这个街区还空着",
    openSub: "做那个说“好”的人吧。欢迎共同主持。",
    take: "主持这个街区",
    claimedTitle: "{names} 已在这里举手",
    claimedSub: "想帮忙、带点东西，或者只是打个招呼？给主持人留言吧。一个街区有两位主持人是好事，不是冲突。",
    sendNote: "给主持人留言",
    cohost: "我想共同主持",
  },
  easy: {
    title: "主持聚会就是这么简单",
    sub: "一点邀请，一点色彩，一个相聚的地方。",
    steps: [
      { t: "一份邀请", b: "熟悉的街上，一张小小的传单。这里将有好事发生。" },
      { t: "人行道上的色彩", b: "沾满粉笔的小手、鲜艳的颜色，孩子们让街道充满生气。" },
      { t: "相聚的地方", b: "一块手写牌子，一间敞开的车库，再多一把椅子的位置。" },
      { t: "终于认识你", b: "折叠椅、分享的小吃，还有聊不完的话。" },
    ],
    ideasTitle: "用你的方式",
    ideas: ["车库里打牌", "门前百家宴", "咖啡加甜甜圈", "粉笔画和音乐", "台阶上喝茶", "小朋友单车巡游", "你来决定！"],
  },
  gets: {
    title: "你不是一个人",
    sub: "说“好”，你就加入了一个由日落社交俱乐部组织的 400 人主持人网络。",
    items: [
      { t: "主持人派对", w: "活动前 4 到 6 周", b: "先认识其他主持人。有吃的、简短的流程介绍，还能见到同一条大道的主持人。" },
      { t: "主持人网络", w: "从报名到当天", b: "按大道分组的群聊，还有有经验的街区派对主持人做你的友好导师。" },
      { t: "策划帮助", w: "随时可问", b: "一页纸的聚会指南、20 分钟的电话或散步聊天；如果想封街，我们帮你申请许可（大多数不需要）。" },
      { t: "本地艺术家设计的传单", w: "提前 6 周", b: "日落区艺术家设计传单套件，填上你的地点和时间，中英双语。可在 Sunset Variety 领取打印版。" },
      { t: "需要的话，一点经费", w: "无需理由", b: "只要你说需要，就有约 100 美元，提前发放。有余力的主持人可以资助另一个街区。" },
      { t: "当天支持", w: "3 月 20 日", b: "物资配送（桌子、粉笔、名牌）、流动志愿者队伍、共享相册，以及晚上的主持人收尾聚会。" },
    ],
  },
  goals: {
    title: "我们的目标",
    items: [
      { n: "100", l: "位主持人，1 月底前" },
      { n: "250", l: "位主持人，主持人派对前" },
      { n: "400", l: "个街区，3 月 20 日" },
    ],
    note: "哪怕同一天只有 150 场聚会，也会是日落区有史以来最大的邻里活动。",
    annual: "这是第一届。我们希望它成为传统：每年春天，日落区一起挥手。",
  },
  faq: {
    title: "常见问题",
    items: [
      { q: "我具体要做什么？", a: "在你的街区选个地方，邀请邻居，3 月 20 日带上你需要的东西到场就行。我们建议上午 11:00 到下午 1:00，但由你决定！主持多久、准备多少、提供什么，完全灵活。" },
      { q: "需要许可吗？", a: "在人行道、门前台阶或车库的聚会大多不需要。如果你想封街，我们会帮你申请。" },
      { q: "我的街区已经有人认领了，怎么办？", a: "太好了！给他们留言一起主持，或者在附近任何地方主持：拐角处、庭院、你自家车道都可以。点“在你的街区主持聚会”告诉我们你的路段，不需要认识那里的人。" },
      { q: "主持聚会有资金支持吗？", a: "报名时告诉我们你需要支持。我们会尽可能提供帮助！" },
      { q: "我能在经费上支持其他街区吗？", a: "可以。在表格里勾选“我可以出一点力帮助其他街区”。由日落社交俱乐部转交，双方都不具名。" },
      { q: "下雨或起雾怎么办？", a: "这里是日落区嘛。车库、门廊加一锅热乎的东西就很好。我们会和主持人分享雨天方案。" },
      { q: "这是一次性的吗？", a: "这是首届 Wave。我们希望它成为每年一次的社区传统。" },
      { q: "谁在组织？", a: "The Sunset Wave 由日落社交俱乐部组织，这是一个由日落区居民运营的邻里俱乐部。" },
    ],
  },
  host: {
    title: "在你的街区主持聚会",
    sub: "不到一分钟。日期已定，街区归你。",
    name: "你的名字",
    contact: "电子邮件或电话",
    stretch: "你的路段",
    stretchPh: "例如：44 街，Judah 与 Kirkham 之间",
    stretchHint: "欢迎修改，让我们更清楚你会在哪里举办。",
    moneyNote: "你之后可以随时更改答案！",
    cohosts: "共同主持人（可选）",
    addCohost: "添加共同主持人",
    cohostName: "共同主持人姓名",
    cohostContact: "对方的电子邮件或电话（可选）",
    remove: "移除",
    microgrant: "如果有资金，我希望得到一些额外经费来支付开销。",
    give: "我可以出一点力帮助其他街区",
    sheltered: "我主持的地方可以避雨。",
    submit: "我举手",
    sending: "发送中…",
    okTitle: "你已经在地图上了！",
    okBody: "谢谢你举手。我们很快会联系你，告诉你主持人派对和下一步安排。",
    close: "关闭",
    errName: "请填写你的名字。",
    errContact: "请填写电子邮件或电话。",
    errStretch: "请告诉我们是哪个路段。",
    errGeneric: "出了点问题，请再试一次。",
  },
  note: {
    title: "给主持人留言",
    sub: "我们会帮你转达。主持人的联系方式保密。",
    name: "你的名字",
    contact: "电子邮件或电话",
    message: "你的留言",
    messagePh: "你好！我住在这个街区，可以带几把椅子……",
    submit: "发送留言",
    okTitle: "留言已发送",
    okBody: "我们会转达给主持人。谢谢你做个好邻居。",
    errMessage: "请写一句简短的留言。",
  },
  footer: {
    supported: "The Sunset Wave 由日落社交俱乐部支持，让更多人认识自己的邻居，也让整个社区有机会聚在一起。",
    privacy: "隐私",
    terms: "条款",
    contact: "联系我们",
    made: "诞生于旧金山日落区。",
    back: "返回 The Sunset Wave",
  },
  pages: {
    privacyTitle: "隐私",
    privacy: [
      "我们不出售或分享你的数据。",
      "我们不使用追踪 Cookie。",
      "如果你报名主持或给主持人留言，我们只会把你的联系方式用于这些用途：就 Wave 联系你，或转达你的留言。",
      "地图上只显示主持人的名字（不含姓）。联系方式从不公开显示。",
      "你可以随时要求我们删除你的信息。",
      "本网站面向 14 岁及以上人士。",
    ],
    termsTitle: "使用条款",
    terms: [
      "请以关心与尊重的态度使用本网站。",
      "主持或参加聚会时，你需为自己的行为负责。",
      "我们不为用户提交的内容背书。",
      "对于聚会内外发生的事情，我们不承担责任。",
      "本网站在美国加州运营，任何争议均适用当地法律。",
      "如有需要，我们可能会更新这些条款，但会保持简单易懂。",
    ],
    careTitle: "社区关怀",
    care: "事情并不总是完美。如果出现误解或冲突，日落社交俱乐部的管理员乐意帮助邻居沟通并修复关系。",
    contactTitle: "打个招呼",
    contactBody: "有问题、想法，或想帮忙？写信给我们：",
    questions: "有疑问？请联系",
  },
};

const yue: Dict = {
  nav: { host: "喺你嘅街區主持聚會", lang: "語言" },
  hero: {
    brand: "The Sunset Wave", the: "The", sunset: "Sunset", wave: "Wave",
    kicker: "首屆 The Sunset Wave",
    date: "2027 年 3 月 20 日 星期六",
    tagline: "400 個街區。同一個下晝。由街坊主持。",
    cta: "喺你嘅街區主持聚會",
    map: "睇地圖",
    count: "已經有 {n} 位街坊舉咗手",
    alt: "日落區色彩繽紛嘅排屋一路伸延到沙丘同大海，鵜鶘喺頭頂飛過",
  },
  invite: {
    title: "每個街區都有聚會。就喺同一日。",
    p1: "我哋想像有一日，日落區嘅街坊聚埋一齊。摺枱、草地櫈，同伸出嚟打招呼嘅手。每條街都有善意化成行動。",
    p2: "呢個係終於識吓你嘅街坊、亦俾佢哋互相認識嘅機會。",
    p3: "你喺自己嘅街區主持聚會。我哋提供主持人工具包，仲有機會識其他主持人。",
    photoAlt: "由高空望落日落區，一行行屋伸延到海邊",
  },
  map: {
    title: "搵你嘅街區",
    sub: "聚會遍布日落區，由 Lincoln 到 Sloat 以南嘅社區。揮手圖案代表已經有街坊舉咗手。",
    open: "未有人嘅街區",
    claimed: "已經有人主持",
    other: "搞個街坊聚會",
    otherSub: "你嘅街區、天井或者街角。話俾我哋知你嘅路段 — 歡迎你加入。",
    loading: "載入緊街區地圖…",
    unavailable: "地圖載入唔到。",
    retry: "再試一次",
    zoomIn: "放大",
    zoomOut: "縮細",
    reset: "重設地圖",
    ocean: "太平洋",
    park: "金門公園",
    greatHwy: "Great Hwy",
    laPlaya: "La Playa",
    hint: "用兩隻手指或者碌輪縮放，拖動移動。",
    blankNote: "空白位係公園同水塘！",
    southSloat: "Sloat 以南",
    openTitle: "呢個街區仲未有人",
    openSub: "做嗰個話「好」嘅人啦。歡迎一齊主持。",
    take: "主持呢個街區",
    claimedTitle: "{names} 喺度舉咗手",
    claimedSub: "想幫手、帶啲嘢，或者淨係想打個招呼？留個口訊俾主持人啦。一個街區有兩個主持人係好事，唔係撞咗。",
    sendNote: "留口訊俾主持人",
    cohost: "我想一齊主持",
  },
  easy: {
    title: "主持就係咁簡單",
    sub: "一個邀請、一啲色彩、一個聚埋嘅地方。",
    steps: [
      { t: "一個邀請", b: "熟悉嘅街上一張小小嘅傳單。呢度就快有好嘢發生。" },
      { t: "行人路上嘅色彩", b: "沾滿粉筆嘅手、鮮艷嘅顏色，細路令條街熱鬧起嚟。" },
      { t: "聚埋嘅地方", b: "一塊手寫牌、打開嘅車房，仲放得落多張櫈。" },
      { t: "終於識到你", b: "摺櫈、分享嘅小食，同傾唔完嘅偈。" },
    ],
    ideasTitle: "用你嘅方式",
    ideas: ["車房打牌", "門口百家宴", "咖啡加冬甩", "粉筆畫同音樂", "樓梯飲茶", "細路單車巡遊", "你話事！"],
  },
  gets: {
    title: "你唔會孤軍作戰",
    sub: "話「好」，你就加入咗一個由日落社交俱樂部組織嘅 400 人主持人網絡。",
    items: [
      { t: "主持人派對", w: "活動前 4 至 6 星期", b: "先識吓其他主持人。有嘢食、簡短講解，仲可以見到同一條大道嘅主持人。" },
      { t: "主持人網絡", w: "由報名到當日", b: "按大道分組嘅群組，仲有有經驗嘅街區派對主持人做你嘅導師。" },
      { t: "策劃幫手", w: "隨時問", b: "一頁紙嘅聚會貼士、20 分鐘電話或者行街傾偈；想封街嘅話我哋幫你申請許可（大部分都唔使）。" },
      { t: "本地藝術家設計嘅傳單", w: "提前 6 星期", b: "日落區藝術家設計傳單套裝，填上你嘅地點同時間，中英雙語。可以去 Sunset Variety 攞印好嘅。" },
      { t: "有需要就有少少經費", w: "唔使解釋", b: "只要你話需要，就有大約 100 美元，預先俾你。有能力嘅主持人可以資助另一個街區。" },
      { t: "當日支援", w: "3 月 20 日", b: "物資派送（枱、粉筆、名牌）、流動義工隊、共享相簿，同埋晚上嘅主持人收尾聚會。" },
    ],
  },
  goals: {
    title: "我哋嘅目標",
    items: [
      { n: "100", l: "位主持人，1 月底之前" },
      { n: "250", l: "位主持人，主持人派對之前" },
      { n: "400", l: "個街區，3 月 20 日" },
    ],
    note: "就算同一日只有 150 個聚會，都會係日落區有史以來最大嘅街坊活動。",
    annual: "呢個係第一屆。我哋希望佢變成傳統：每年春天，日落區一齊揮手。",
  },
  faq: {
    title: "常見問題",
    items: [
      { q: "我實際要做啲咩？", a: "喺你街區揀個位，邀請街坊，3 月 20 日帶齊你需要嘅嘢出現就得。我哋建議上晝 11:00 至下晝 1:00，但由你決定！主持幾耐、準備幾多、請食咩，完全有彈性。" },
      { q: "使唔使申請許可？", a: "喺行人路、門口樓梯或者車房嘅聚會大部分都唔使。想封街嘅話，我哋幫你申請。" },
      { q: "我個街區已經有人認領咗，點算？", a: "好嘢！留個口訊一齊主持，或者喺附近任何地方主持：轉角、庭院、你自己門口車道都得。撳「喺你嘅街區主持聚會」話俾我哋知你嘅路段，唔使識嗰度嘅人。" },
      { q: "主持有冇資金支持？", a: "報名時話俾我哋知你需要支持。我哋會盡量提供幫助！" },
      { q: "我可唔可以喺經費上支持其他街區？", a: "可以。喺表格剔「我可以出少少力幫其他街區」。由日落社交俱樂部轉交，雙方都唔具名。" },
      { q: "落雨或者起霧點算？", a: "呢度係日落區吖嘛。車房、門廊加一煲熱辣辣嘅嘢就最好。我哋會同主持人分享落雨方案。" },
      { q: "係咪得一次？", a: "呢個係首屆 Wave。我哋希望佢變成每年一次嘅社區傳統。" },
      { q: "邊個搞嘅？", a: "The Sunset Wave 由日落社交俱樂部組織，係一個由日落區居民營運嘅街坊俱樂部。" },
    ],
  },
  host: {
    title: "喺你嘅街區主持聚會",
    sub: "唔使一分鐘。日子已經定咗，街區係你嘅。",
    name: "你嘅名",
    contact: "電郵或者電話",
    stretch: "你嘅路段",
    stretchPh: "例如：44 街，Judah 同 Kirkham 之間",
    stretchHint: "歡迎修改，等我哋更清楚你會喺邊度搞。",
    moneyNote: "你之後可以隨時改答案！",
    cohosts: "一齊主持嘅人（可選）",
    addCohost: "加一個主持人",
    cohostName: "佢嘅名",
    cohostContact: "佢嘅電郵或者電話（可選）",
    remove: "移除",
    microgrant: "如果有資金，我希望得到少少額外經費幫補開支。",
    give: "我可以出少少力幫其他街區",
    sheltered: "我主持嘅地方可以避雨。",
    submit: "我舉手",
    sending: "傳送緊…",
    okTitle: "你已經喺地圖上喇！",
    okBody: "多謝你舉手。我哋好快會聯絡你，講主持人派對同下一步。",
    close: "關閉",
    errName: "請填你嘅名。",
    errContact: "請填電郵或者電話。",
    errStretch: "話俾我哋知係邊個路段。",
    errGeneric: "出咗少少問題，請再試一次。",
  },
  note: {
    title: "留口訊俾主持人",
    sub: "我哋會幫你轉交。主持人嘅聯絡資料唔會公開。",
    name: "你嘅名",
    contact: "電郵或者電話",
    message: "你嘅口訊",
    messagePh: "你好！我住喺呢個街區，可以帶幾張櫈……",
    submit: "傳送口訊",
    okTitle: "口訊已傳送",
    okBody: "我哋會轉交俾主持人。多謝你做個好街坊。",
    errMessage: "請寫一句簡短嘅口訊。",
  },
  footer: {
    supported: "The Sunset Wave 由日落社交俱樂部支持，等更多人識到自己嘅街坊，亦等成個社區有機會聚埋一齊。",
    privacy: "私隱",
    terms: "條款",
    contact: "聯絡我哋",
    made: "誕生於三藩市日落區。",
    back: "返回 The Sunset Wave",
  },
  pages: {
    privacyTitle: "私隱",
    privacy: [
      "我哋唔會出售或者分享你嘅資料。",
      "我哋唔用追蹤 Cookie。",
      "如果你報名主持或者留口訊俾主持人，我哋只會用你嘅聯絡資料做呢啲用途：就 Wave 聯絡你，或者轉交你嘅口訊。",
      "地圖上只會顯示主持人嘅名（唔包括姓）。聯絡資料永遠唔會公開。",
      "你可以隨時要求我哋刪除你嘅資料。",
      "本網站適合 14 歲或以上人士使用。",
    ],
    termsTitle: "使用條款",
    terms: [
      "請以關心同尊重嘅態度使用本網站。",
      "主持或者參加聚會時，你要為自己嘅行為負責。",
      "我哋唔會為用戶提交嘅內容背書。",
      "對於聚會內外發生嘅事，我哋唔承擔責任。",
      "本網站喺美國加州營運，任何爭議均受當地法律管轄。",
      "有需要時我哋可能會更新呢啲條款，但會保持簡單易明。",
    ],
    careTitle: "社區關懷",
    care: "事情唔會次次都完美。如果有誤會或者衝突，日落社交俱樂部嘅管理員好樂意幫街坊傾清楚，修補關係。",
    contactTitle: "打個招呼",
    contactBody: "有問題、有諗法，或者想幫手？寫信俾我哋：",
    questions: "有問題？請聯絡",
  },
};

const es: Dict = {
  nav: { host: "Organiza en tu cuadra", lang: "Idioma" },
  hero: {
    brand: "The Sunset Wave", the: "The", sunset: "Sunset", wave: "Wave",
    kicker: "La primera Wave",
    date: "Sábado, 20 de marzo de 2027",
    tagline: "400 cuadras. Una tarde. Organizadas por los vecinos.",
    cta: "Organiza en tu cuadra",
    map: "Ver el mapa",
    count: "{n} vecinos ya levantaron la mano",
    alt: "Casas de colores del Sunset bajando hacia las dunas y el océano, con pelícanos volando",
  },
  invite: {
    title: "Reuniones en cada cuadra. El mismo día.",
    p1: "Imaginamos un día en que los vecinos del Sunset se reúnen. Mesas plegables, sillas de jardín y manos extendidas. Buena voluntad en acción en cada calle.",
    p2: "Es una oportunidad de por fin conocer a tus vecinos, y de que ellos se conozcan entre sí.",
    p3: "Tú organizas en tu cuadra. Te apoyamos con un kit para anfitriones y oportunidades de conocer a otros anfitriones.",
    photoAlt: "El Sunset desde el aire, filas de casas que llegan hasta el océano",
  },
  map: {
    title: "Encuentra tu cuadra",
    sub: "Reuniones por todo el Sunset, de Lincoln a los barrios al sur de Sloat. Una mano significa que un vecino ya levantó la suya.",
    open: "Cuadra libre",
    claimed: "Alguien organiza",
    other: "Organiza una reunión",
    otherSub: "Tu cuadra, un patio o a la vuelta de la esquina. Dinos tu tramo — hay lugar para ti.",
    loading: "Cargando el barrio…",
    unavailable: "No se pudo cargar el mapa.",
    retry: "Intentar de nuevo",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    reset: "Restablecer mapa",
    ocean: "Océano Pacífico",
    park: "Golden Gate Park",
    greatHwy: "Great Hwy",
    laPlaya: "La Playa",
    hint: "Pellizca o desplaza para acercar. Arrastra para moverte.",
    blankNote: "¡Los espacios en blanco son parques y reservorios!",
    southSloat: "Al sur de Sloat",
    openTitle: "Esta cuadra está libre",
    openSub: "Sé quien dice que sí. Co-anfitriones bienvenidos.",
    take: "Organizar en esta cuadra",
    claimedTitle: "{names} levantó la mano aquí",
    claimedSub: "¿Quieres ayudar, traer algo o solo saludar? Mándale una nota al anfitrión. Dos anfitriones en una cuadra es algo bueno, no un conflicto.",
    sendNote: "Mandar una nota al anfitrión",
    cohost: "Quiero ser co-anfitrión",
  },
  easy: {
    title: "Así se ve organizar",
    sub: "Una invitación. Un poco de color. Un lugar para reunirnos.",
    steps: [
      { t: "La invitación", b: "Un pequeño volante en una calle familiar. Algo bueno está pasando aquí." },
      { t: "Color en la banqueta", b: "Manos llenas de gis, colores vivos y niños haciendo suya la calle." },
      { t: "Un lugar para reunirnos", b: "Un letrero casero. Un garaje abierto. Espacio para una silla más." },
      { t: "Vecinos, por fin", b: "Sillas plegables, bocadillos compartidos y conversaciones que siguen." },
    ],
    ideasTitle: "Hazlo a tu manera",
    ideas: ["Juegos de cartas en el garaje", "Potluck enfrente", "Café y donas", "Arte con gis y música", "Té en los escalones", "Desfile de bicis infantil", "¡Tú decides!"],
  },
  gets: {
    title: "No lo harás solo",
    sub: "Si dices que sí, formas parte de una red de 400 anfitriones, coordinada por el Sunset Social Club.",
    items: [
      { t: "Fiesta de anfitriones", w: "4 a 6 semanas antes", b: "Conoce primero a los demás anfitriones. Comida, una breve explicación y los anfitriones de tu avenida." },
      { t: "Red de anfitriones", w: "Desde que te inscribes", b: "Un chat grupal por avenida, y anfitriones con experiencia como mentores amistosos." },
      { t: "Ayuda para planear", w: "Cuando la pidas", b: "Una receta de una página, una llamada o caminata de 20 minutos, y ayuda con permisos si quieres cerrar la calle (casi nadie lo necesita)." },
      { t: "Volantes de artistas locales", w: "6 semanas antes", b: "Artistas del Sunset diseñan un kit de volantes con tu tramo y horario, en inglés y chino. Copias impresas en Sunset Variety." },
      { t: "Un poco de dinero si lo necesitas", w: "Sin preguntas", b: "Unos $100 para quien diga que los necesita, pagados por adelantado. Quien tenga más puede apoyar otra cuadra." },
      { t: "Apoyo el día del evento", w: "20 de marzo", b: "Entrega de materiales (mesas, gis, gafetes), voluntarios recorriendo el barrio, fotos compartidas y una reunión de cierre para anfitriones." },
    ],
  },
  goals: {
    title: "La cuenta",
    items: [
      { n: "100", l: "anfitriones a fines de enero" },
      { n: "250", l: "anfitriones para la fiesta de anfitriones" },
      { n: "400", l: "cuadras el 20 de marzo" },
    ],
    note: "Incluso 150 reuniones en un solo día serían el evento vecinal más grande que ha tenido el Sunset.",
    annual: "Esta es la primera. Queremos que se vuelva tradición: cada primavera, el Sunset saluda.",
  },
  faq: {
    title: "Preguntas",
    items: [
      { q: "¿Qué tengo que hacer exactamente?", a: "Elige un lugar en tu cuadra, invita a tus vecinos y preséntate el 20 de marzo con lo que necesites para tu plan. Sugerimos de 11:00 am a 1:00 pm, ¡pero tú decides! Cuánto dura, cuánto planeas y qué sirves es totalmente flexible." },
      { q: "¿Necesito un permiso?", a: "La mayoría de las reuniones en la banqueta, los escalones o el garaje no lo necesitan. Si quieres cerrar la calle, te ayudamos con el permiso." },
      { q: "Alguien ya tomó mi cuadra. ¿Y ahora?", a: "¡Qué bien! Mándale una nota y organicen juntos, o hazlo en cualquier lugar cercano: a la vuelta de la esquina, un patio, tu propia entrada. Elige \"Organiza en tu cuadra\" y dinos tu tramo. No necesitas conocer a nadie ahí." },
      { q: "¿Hay apoyo económico para organizar?", a: "Avísanos al inscribirte que te vendría bien apoyo. ¡Daremos apoyo donde sea posible!" },
      { q: "¿Puedo apoyar económicamente a otra cuadra?", a: "Sí. Marca \"Puedo dar un poco\" en el formulario. El Sunset Social Club lo canaliza y nadie es nombrado de ningún lado." },
      { q: "¿Y si llueve o hay neblina?", a: "Es el Sunset. Garajes, porches y una olla de algo caliente funcionan muy bien. Compartiremos un plan para días de lluvia." },
      { q: "¿Es algo de una sola vez?", a: "Esta es la primera Wave. Esperamos que se vuelva una tradición anual del barrio." },
      { q: "¿Quién está detrás?", a: "The Sunset Wave lo organiza el Sunset Social Club, un club vecinal dirigido por gente que vive en el Sunset." },
    ],
  },
  host: {
    title: "Organiza en tu cuadra",
    sub: "Menos de un minuto. La fecha está fijada y la cuadra es tuya.",
    name: "Tu nombre",
    contact: "Correo o teléfono",
    stretch: "Tu tramo",
    stretchPh: "p. ej. 44th Ave entre Judah y Kirkham",
    stretchHint: "Siéntete libre de editarlo y danos una mejor idea de dónde vas a organizarlo.",
    moneyNote: "¡Puedes cambiar tu respuesta más adelante!",
    cohosts: "Co-anfitriones (opcional)",
    addCohost: "Agregar co-anfitrión",
    cohostName: "Nombre del co-anfitrión",
    cohostContact: "Su correo o teléfono (opcional)",
    remove: "Quitar",
    microgrant: "Si hay fondos disponibles, me vendría bien un apoyo extra para cubrir gastos.",
    give: "Puedo dar un poco para ayudar a otra cuadra",
    sheltered: "El lugar donde organizo está protegido de la lluvia.",
    submit: "Levanto la mano",
    sending: "Enviando…",
    okTitle: "¡Ya estás en el mapa!",
    okBody: "Gracias por levantar la mano. Pronto te contactaremos sobre la fiesta de anfitriones y los siguientes pasos.",
    close: "Cerrar",
    errName: "Escribe tu nombre.",
    errContact: "Escribe un correo o teléfono.",
    errStretch: "Dinos qué tramo.",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
  },
  note: {
    title: "Mandar una nota al anfitrión",
    sub: "Nosotros se la pasamos. Los datos del anfitrión se mantienen privados.",
    name: "Tu nombre",
    contact: "Correo o teléfono",
    message: "Tu nota",
    messagePh: "¡Hola! Vivo en esta cuadra y puedo traer sillas…",
    submit: "Enviar nota",
    okTitle: "Nota enviada",
    okBody: "Se la pasaremos al anfitrión. Gracias por ser buen vecino.",
    errMessage: "Escribe una nota corta.",
  },
  footer: {
    supported: "The Sunset Wave cuenta con el apoyo del Sunset Social Club, para que más de nosotros conozcamos a nuestros vecinos y nos reunamos como barrio.",
    privacy: "Privacidad",
    terms: "Términos",
    contact: "Contacto",
    made: "Hecho en el Sunset, San Francisco.",
    back: "Volver a The Sunset Wave",
  },
  pages: {
    privacyTitle: "Privacidad",
    privacy: [
      "No vendemos ni compartimos tus datos.",
      "No usamos cookies de rastreo.",
      "Si te ofreces como anfitrión o mandas una nota, solo usaremos tus datos para eso: contactarte sobre la Wave o pasar tu nota.",
      "En el mapa solo aparece el primer nombre del anfitrión. Los datos de contacto nunca se muestran públicamente.",
      "Puedes pedirnos que borremos tu información en cualquier momento.",
      "Este sitio es para personas de 14 años o más.",
    ],
    termsTitle: "Términos de uso",
    terms: [
      "Usa este sitio con cuidado y respeto.",
      "Eres responsable de tus propias acciones al organizar o asistir a reuniones.",
      "No respaldamos el contenido enviado por usuarios.",
      "No aceptamos responsabilidad por lo que ocurra en las reuniones o sus alrededores.",
      "Este sitio opera en California, EE. UU., y cualquier disputa se rige por sus leyes.",
      "Podemos actualizar estos términos si hace falta, pero los mantendremos sencillos y humanos.",
    ],
    careTitle: "Cuidado comunitario",
    care: "Las cosas no siempre salen perfectas. Si surge un malentendido o conflicto, el equipo del Sunset Social Club con gusto ayuda a los vecinos a hablarlo y repararlo.",
    contactTitle: "Saluda",
    contactBody: "¿Preguntas, ideas o quieres ayudar? Escríbenos a",
    questions: "¿Preguntas? Escríbenos a",
  },
};

export const DICTS: Record<Lang, Dict> = { en, zh, yue, es };

export function blockLabel(lang: Lang, avenue: number | string, north: string, south: string) {
  if (typeof avenue === "string" && avenue !== "Great Hwy" && avenue !== "La Playa") {
    return `${avenue} · ${DICTS[lang].map.southSloat}`;
  }
  if (typeof avenue === "string") {
    const street = avenue === "Great Hwy" ? DICTS[lang].map.greatHwy : DICTS[lang].map.laPlaya;
    switch (lang) {
      case "zh": return `${street}（${north} 与 ${south} 之间）`;
      case "yue": return `${street}（${north} 同 ${south} 之間）`;
      case "es": return `${street} entre ${north} y ${south}`;
      default: return `${street} between ${north} and ${south}`;
    }
  }
  switch (lang) {
    case "zh": return `${avenue} 街（${north} 与 ${south} 之间）`;
    case "yue": return `${avenue} 街（${north} 同 ${south} 之間）`;
    case "es": return `${ordinal(avenue)} Ave entre ${north} y ${south}`;
    default: return `${ordinal(avenue)} Ave between ${north} and ${south}`;
  }
}

export function joinNames(lang: Lang, names: string[]) {
  const sep = lang === "zh" || lang === "yue" ? "、" : " & ";
  return names.slice(0, 3).join(sep) + (names.length > 3 ? (lang === "es" ? ` y ${names.length - 3} más` : lang === "en" ? ` +${names.length - 3}` : ` +${names.length - 3}`) : "");
}

export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx | null>(null);
const KEY = "sunset-wave-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && saved in DICTS) setLangState(saved);
    else {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("es")) setLangState("es");
      else if (nav.includes("hk") || nav.includes("yue") || nav.includes("hant") || nav === "zh-tw") setLangState("yue");
      else if (nav.startsWith("zh")) setLangState("zh");
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = (LANGS.find((l) => l.code === lang)?.html ?? "en");
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(KEY, l);
  };
  return <LangContext.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const c = useContext(LangContext);
  if (!c) throw new Error("useLang outside LanguageProvider");
  return c;
}
