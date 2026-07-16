"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Token = {
  korean: string;
  reading: string;
  meaning: string;
  grammar?: string;
  note: string;
};

type GrammarPoint = {
  pattern: string;
  meaning: string;
  example: string;
  note: string;
};

type ReadingHistoryEntry = {
  id: string;
  date: string;
  title: string;
  topic: string;
  level: string;
  wordCount: number;
  viewedAt: string;
  lastViewedAt: string;
  reviewCount: number;
  completed: boolean;
};

type VocabularyReviewItem = {
  korean: string;
  meaning: string;
  addedAt: string;
  dueDate: string;
  reviewStage: number;
};

type SprintTask = {
  label: string;
  detail: string;
  minutes: number;
  status: "must" | "focus" | "review";
};

type SprintWeek = {
  week: string;
  focus: string;
  deliverable: string;
};

type QuizItem = {
  question: string;
  answer: string;
};

type WritingDrill = {
  type: string;
  prompt: string;
  checklist: string[];
  sentenceBank: string[];
};

type DailyReading = {
  id: string;
  date: string;
  title: string;
  level: string;
  topic: string;
  estimatedTime: string;
  korean: string;
  chinese: string;
  tokens: Token[];
  grammarPoints: GrammarPoint[];
  quiz: QuizItem[];
  writingDrill: WritingDrill;
};

const historyStorageKey = "daily-topik-lab-reading-history";
const vocabStorageKey = "daily-topik-lab-vocab-review";

const targetLevel = "TOPIK II 6级";
const targetScore = "230+";
const targetDate = new Date("2026-10-18T09:00:00+08:00");
const todayDate = new Date();
const daysUntilTarget = Math.max(
  0,
  Math.ceil(
    (targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
  ),
);
const weeksUntilTarget = Math.max(1, Math.ceil(daysUntilTarget / 7));

const today = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());

const todayKey = new Intl.DateTimeFormat("en-CA").format(new Date());

const passage = {
  id: "2026-07-10-city-alley",
  date: "2026-07-10",
  title: "도시의 조용한 변화",
  level: "TOPIK II 5-6级",
  topic: "社会 / 城市生活",
  estimatedTime: "12 分钟",
  korean:
    "최근 몇 년 사이에 대도시의 골목은 빠르게 달라지고 있다. 과거에는 자동차가 지나가기 위해 좁은 길까지 포장되었지만, 이제는 주민들이 천천히 걸으며 머물 수 있는 공간으로 바꾸려는 시도가 늘고 있다. 특히 오래된 시장 주변에서는 작은 의자와 화분을 놓고, 주말마다 지역 예술가들이 공연을 열기도 한다. 이러한 변화가 단순히 거리를 아름답게 만드는 데 그치지 않는다는 점이 중요하다. 사람들이 서로 마주칠 기회가 많아지면 자연스럽게 대화가 생기고, 동네 문제를 함께 해결하려는 분위기도 만들어진다. 물론 임대료가 오르거나 기존 상인들이 밀려나는 부작용을 걱정하는 목소리도 있다. 그래서 전문가들은 골목을 새롭게 꾸미는 일보다 그곳에서 살아온 사람들의 생활을 지키는 정책이 먼저 마련되어야 한다고 말한다.",
  chinese:
    "近几年，大城市的小巷正在快速改变。过去，为了让汽车通过，连狭窄的路也被铺成车道；现在，越来越多的尝试把它们改造成居民可以慢慢行走、停留的空间。尤其在老市场周边，人们摆放小椅子和花盆，周末还会有本地艺术家演出。这种变化并不只是让街道变美。人们相遇的机会增加后，会自然产生交流，也会形成共同解决社区问题的氛围。当然，也有人担心租金上涨或原有商户被挤出。因此专家认为，比起重新装饰小巷，更应先制定保护当地居民生活的政策。",
};

const sprintTasks: SprintTask[] = [
  {
    label: "限时阅读",
    detail: "今天这篇 12 分钟内读完，先抓主旨再回看细节。",
    minutes: 12,
    status: "must",
  },
  {
    label: "生词复习",
    detail: "至少复习 20 个中高级词，重点看搭配和汉字词。",
    minutes: 10,
    status: "review",
  },
  {
    label: "写作 54 题",
    detail: "用 35 分钟写一段观点型短文，必须包含让步和结论句。",
    minutes: 35,
    status: "focus",
  },
  {
    label: "错题归因",
    detail: "每道错题只选一个主因，周末按主因补弱项。",
    minutes: 8,
    status: "review",
  },
];

const sprintWeeks: SprintWeek[] = [
  {
    week: "第 1-2 周",
    focus: "阅读速度和高频语法",
    deliverable: "每天 1 篇阅读 + 20 个生词，周末做一次 40 分钟阅读套题。",
  },
  {
    week: "第 3-5 周",
    focus: "写作 51-54 题型",
    deliverable: "每周 2 篇 54 题作文，建立自己的连接词和结论句模板。",
  },
  {
    week: "第 6-8 周",
    focus: "听力主旨题和细节题",
    deliverable: "每周 3 次听写，整理听错词和转折表达。",
  },
  {
    week: "第 9-10 周",
    focus: "整套限时模拟",
    deliverable: "每周 1 套完整模拟，记录分数、耗时和错题原因。",
  },
  {
    week: "最后 2 周",
    focus: "错题回炉和作文稳分",
    deliverable: "只复习错题本、生词本和 6 篇高质量作文。",
  },
];

const writingDrill = {
  type: "54 题观点写作",
  prompt:
    "도시의 오래된 골목을 새롭게 꾸미는 정책에 대해 찬성하는지 반대하는지 쓰십시오. 그 이유를 두 가지 이상 제시하십시오.",
  checklist: ["문제 제기", "찬반 입장", "근거 2개", "반론 인정", "정책 제안"],
  sentenceBank: [
    "물론 ...다는 우려도 있다.",
    "그러나 ...다는 점에서 더 큰 의미가 있다.",
    "따라서 ...기 위한 제도적 장치가 마련되어야 한다.",
  ],
};

const mistakeReasons = [
  "词汇不认识",
  "句子结构没拆开",
  "主旨判断偏了",
  "选项陷阱",
  "时间不够",
];

const tokens: Token[] = [
  {
    korean: "최근",
    reading: "choe-geun",
    meaning: "最近",
    note: "常和 기간、몇 년 사이 等时间表达搭配，说明变化发生在近一段时间。",
  },
  {
    korean: "사이에",
    reading: "sa-i-e",
    meaning: "在...之间 / 期间",
    grammar: "N 사이에",
    note: "这里表示“几年之间”，强调变化在一段时间内发生。",
  },
  {
    korean: "골목",
    reading: "gol-mok",
    meaning: "小巷、巷子",
    note: "TOPIK 阅读中常用来谈城市、社区和商业街区变化。",
  },
  {
    korean: "달라지고 있다",
    reading: "dal-la-ji-go it-da",
    meaning: "正在变得不同",
    grammar: "아/어지다 + 고 있다",
    note: "表示状态逐渐变化并正在持续。",
  },
  {
    korean: "포장되었지만",
    reading: "po-jang-doe-eot-ji-man",
    meaning: "虽然被铺设了",
    grammar: "피동 + 지만",
    note: "되다 构成被动，지만 引出对比。",
  },
  {
    korean: "머물 수 있는",
    reading: "meo-mul su it-neun",
    meaning: "能够停留的",
    grammar: "V-(으)ㄹ 수 있다 + 는",
    note: "修饰后面的 공간，说明空间的功能。",
  },
  {
    korean: "시도",
    reading: "si-do",
    meaning: "尝试",
    note: "늘다、이루어지다、계속되다 等动词常与它搭配。",
  },
  {
    korean: "주변",
    reading: "ju-byeon",
    meaning: "周边、附近",
    note: "市场、学校、역 주변 等地点题材高频词。",
  },
  {
    korean: "열기도 한다",
    reading: "yeol-gi-do han-da",
    meaning: "也会举办",
    grammar: "V-기도 하다",
    note: "列举行为之一，语气比单纯 열다 更柔和。",
  },
  {
    korean: "그치지 않는다",
    reading: "geu-chi-ji an-neun-da",
    meaning: "不止于、不停留在",
    grammar: "N에 그치다",
    note: "常用于文章转折：不仅是 A，还有更深层意义。",
  },
  {
    korean: "마주칠",
    reading: "ma-ju-chil",
    meaning: "遇见、碰到",
    grammar: "V-(으)ㄹ 기회",
    note: "마주치다 强调偶然相遇，后面接 기회 表示机会。",
  },
  {
    korean: "자연스럽게",
    reading: "ja-yeon-seu-reop-ge",
    meaning: "自然地",
    note: "副词形式，说明结果不是强制产生的。",
  },
  {
    korean: "해결하려는",
    reading: "hae-gyeol-ha-ryeo-neun",
    meaning: "想要解决的",
    grammar: "V-(으)려는",
    note: "表示意图，修饰 분위기。",
  },
  {
    korean: "임대료",
    reading: "im-dae-ryo",
    meaning: "租金",
    note: "城市更新、젠트리피케이션 主题常见词。",
  },
  {
    korean: "밀려나는",
    reading: "mil-lyeo-na-neun",
    meaning: "被挤出去的",
    grammar: "밀려나다",
    note: "常用来描述弱势群体或原住民被迫离开。",
  },
  {
    korean: "마련되어야 한다",
    reading: "ma-ryeon-doe-eo-ya han-da",
    meaning: "必须被制定 / 准备好",
    grammar: "아/어야 하다",
    note: "表达必要性。政策、대책、제도 常与 마련되다 搭配。",
  },
];

const grammarPoints: GrammarPoint[] = [
  {
    pattern: "V-기 위해",
    meaning: "为了做某事",
    example: "자동차가 지나가기 위해 길이 포장되었다.",
    note: "后项是前项的目的，正式阅读文章中非常常见。",
  },
  {
    pattern: "V-(으)려는 시도",
    meaning: "想要做某事的尝试",
    example: "공간으로 바꾸려는 시도가 늘고 있다.",
    note: "常用于社会变化、政策、实验性做法的说明。",
  },
  {
    pattern: "N에 그치지 않다",
    meaning: "不止停留在某事",
    example: "변화가 거리를 아름답게 만드는 데 그치지 않는다.",
    note: "后面通常接更重要的影响，是论述文的核心连接结构。",
  },
  {
    pattern: "V-아/어야 한다",
    meaning: "必须、应该",
    example: "정책이 먼저 마련되어야 한다.",
    note: "常出现在结论句，用来提出作者观点或专家建议。",
  },
];

const quiz = [
  {
    question: "作者认为小巷变化最重要的意义是什么？",
    answer: "增加居民相遇与交流的机会，并形成共同解决社区问题的氛围。",
  },
  {
    question: "文章提到的副作用是什么？",
    answer: "租金上涨，以及原有商户可能被挤出原来的社区。",
  },
  {
    question: "专家建议优先做什么？",
    answer: "先制定保护当地居民生活的政策，再进行空间改造。",
  },
];

const previousReading: DailyReading = {
  id: "2026-07-15-questioning-ai",
  date: "2026-07-15",
  title: "인공지능 시대의 질문하는 능력",
  level: "TOPIK II 5-6级",
  topic: "教育 / 人工智能",
  estimatedTime: "13 分钟",
  korean:
    "인공지능이 정보를 빠르게 정리해 주는 시대에는 지식을 많이 외우는 능력보다 적절한 질문을 만드는 능력이 더 중요해질 수 있다. 같은 자료를 활용하더라도 무엇을 확인하려는지에 따라 얻는 결과가 달라지기 때문이다. 그러나 좋은 질문은 단순히 궁금한 점을 말하는 데서 만들어지지 않는다. 먼저 문제의 배경을 이해하고, 이미 알고 있는 사실과 아직 확인되지 않은 주장을 구분해야 한다. 또한 인공지능이 제시한 답을 그대로 받아들이기보다 그 근거가 충분한지, 다른 관점은 없는지 검토하는 태도도 필요하다. 결국 학교 교육은 정답을 빨리 찾는 연습에만 머물지 않고 학생들이 스스로 질문을 수정하고 답의 한계를 설명하도록 도와야 한다. 이러한 과정이 반복될 때 인공지능은 생각을 대신하는 도구가 아니라 생각을 넓혀 주는 도구가 될 수 있다.",
  chinese:
    "在人工智能可以快速整理信息的时代，比起记住大量知识，提出恰当问题的能力可能会变得更加重要。即使使用同一份资料，想确认的内容不同，得到的结果也会不同。然而，好问题并不是简单说出好奇之处就能形成的。首先要理解问题背景，并区分已经知道的事实和尚未被证实的主张。此外，与其原样接受人工智能给出的答案，更需要检查其依据是否充分、是否存在其他观点。最终，学校教育不应只停留在快速寻找正确答案的训练上，还应帮助学生主动修正问题并说明答案的局限。这个过程不断重复时，人工智能才会成为拓展思考而非代替思考的工具。",
  tokens: [
    { korean: "정리해", reading: "jeong-ri-hae", meaning: "整理", grammar: "V-아/어 주다", note: "与 주다 连用，表示为使用者完成整理这一动作。" },
    { korean: "적절한", reading: "jeok-jeol-han", meaning: "恰当的", note: "正式文章高频形容词，常修饰 방법、질문、대책。" },
    { korean: "활용하더라도", reading: "hwal-yong-ha-deo-ra-do", meaning: "即使利用", grammar: "V-더라도", note: "承认前项成立，但强调后项结果仍可能不同。" },
    { korean: "무엇을", reading: "mu-eo-seul", meaning: "什么（宾格）", note: "与 확인하다 搭配，构成“要确认什么”。" },
    { korean: "달라지기", reading: "dal-la-ji-gi", meaning: "变得不同", grammar: "V-기 때문이다", note: "名词化后接 때문이다，用来说明前文判断的理由。" },
    { korean: "궁금한", reading: "gung-geum-han", meaning: "好奇的、想知道的", note: "修饰 점，表示尚不清楚、希望了解的部分。" },
    { korean: "구분해야", reading: "gu-bun-hae-ya", meaning: "必须区分", grammar: "V-아/어야 하다", note: "表示必要条件，是论述文提出要求的常用结构。" },
    { korean: "제시한", reading: "je-si-han", meaning: "所提出的", note: "제시하다 常用于答案、方案、证据等正式语境。" },
    { korean: "받아들이기보다", reading: "ba-da-deul-i-gi-bo-da", meaning: "与其接受", grammar: "V-기보다", note: "比较两种行为，强调后项更合适。" },
    { korean: "근거가", reading: "geun-geo-ga", meaning: "依据、根据（主格）", note: "충분하다、명확하다、부족하다 都是常见搭配。" },
    { korean: "머물지", reading: "meo-mul-ji", meaning: "停留于", grammar: "N에 머물지 않다", note: "表示不局限于现有层次，常用来引出更高要求。" },
    { korean: "한계를", reading: "han-gye-reul", meaning: "局限（宾格）", note: "한계를 설명하다、극복하다、인정하다 是常见搭配。" },
  ],
  grammarPoints: [
    { pattern: "V-더라도", meaning: "即使做某事", example: "같은 자료를 활용하더라도 결과가 달라질 수 있다.", note: "让步连接，常用于比较条件相同但结果不同的情况。" },
    { pattern: "V-기 때문이다", meaning: "是因为……", example: "확인하려는 내용에 따라 결과가 달라지기 때문이다.", note: "用于为前句判断补充正式、明确的理由。" },
    { pattern: "V-기보다", meaning: "与其……不如……", example: "답을 그대로 받아들이기보다 근거를 검토해야 한다.", note: "突出作者更推荐的后项行为，是观点文高频结构。" },
    { pattern: "N에만 머물지 않다", meaning: "不只停留在……", example: "정답을 찾는 연습에만 머물지 않아야 한다.", note: "先否定局限，再引出更深层目标，适合写作54题。" },
  ],
  quiz: [
    { question: "作者认为人工智能时代更重要的能力是什么？", answer: "不是单纯记忆大量知识，而是提出恰当问题并不断修正问题的能力。" },
    { question: "形成好问题之前，需要先完成哪两项判断？", answer: "理解问题的背景，并区分已知事实与尚未得到证实的主张。" },
    { question: "文章最后如何界定人工智能的理想作用？", answer: "它应成为拓展人的思考的工具，而不是替人思考的工具。" },
  ],
  writingDrill: {
    type: "54 题观点写作",
    prompt: "인공지능을 활용하는 교육에서 질문하는 능력을 어떻게 길러야 하는지 쓰십시오. 그 필요성과 구체적인 방법을 두 가지 이상 제시하십시오.",
    checklist: ["현황 제시", "필요성", "방법 2개", "우려 검토", "교육적 결론"],
    sentenceBank: [
      "같은 정보를 활용하더라도 질문에 따라 결과가 달라질 수 있다.",
      "답을 그대로 받아들이기보다 근거를 검토하는 태도가 필요하다.",
      "따라서 학생이 질문을 수정할 기회를 충분히 제공해야 한다.",
    ],
  },
};

const todayReading: DailyReading = {
  id: "2026-07-16-carbon-budget",
  date: "2026-07-16",
  title: "도시의 탄소 예산은 누구의 몫인가",
  level: "TOPIK II 5-6级",
  topic: "环境 / 公共政策",
  estimatedTime: "14 分钟",
  korean:
    "기후 위기에 대응하기 위해 여러 도시는 해마다 배출할 수 있는 온실가스의 총량을 미리 정하는 탄소 예산제를 도입하고 있다. 예산이 줄어들기 전에 사업별 우선순위를 정할 수 있다는 점에서 이 제도는 장기적인 감축 계획을 세우는 데 도움이 된다. 그러나 숫자만 정한다고 해서 정책의 효과가 저절로 나타나는 것은 아니다. 대중교통이 부족한 외곽 주민이나 에너지 효율이 낮은 주택에 사는 사람들의 조건이 충분히 반영되지 않으면, 감축 비용이 특정 집단에 집중될 수 있다. 반대로 부담을 피하려는 목소리만 강조하면 필요한 전환을 계속 미루게 될 가능성도 있다. 따라서 탄소 예산은 배출량을 제한하는 수단에 그치지 않고, 누가 비용을 부담하고 어떤 지원을 받을 것인지 결정하는 사회적 약속으로 다루어져야 한다. 이를 위해 정부는 계산 기준과 집행 결과를 투명하게 공개하고 시민이 우선순위 결정에 참여할 수 있도록 제도를 마련해야 한다.",
  chinese:
    "为了应对气候危机，许多城市正在引入碳预算制度，预先确定每年可以排放的温室气体总量。由于这项制度能在人们面临预算缩减之前确定各项目的优先级，因此有助于制定长期减排计划。然而，仅仅确定数字并不会自动产生政策效果。如果公共交通不足的郊区居民，或居住在低能效住宅中的人们所处的条件没有得到充分反映，减排成本就可能集中到特定群体身上。反过来，如果只强调逃避负担的声音，也可能不断推迟必要的转型。因此，碳预算不应只是限制排放量的手段，而应被视为决定谁承担成本、谁获得支持的社会约定。为此，政府必须公开透明地公布计算标准和执行结果，并建立让市民参与优先级决策的制度。",
  tokens: [
    { korean: "대응하기", reading: "dae-eung-ha-gi", meaning: "应对（名词化）", grammar: "V-기 위해", note: "대응하다 名词化后与 위해 连用，说明引入政策的目的。词性：动词。" },
    { korean: "배출할", reading: "bae-chul-hal", meaning: "将要排放的、可排放的", grammar: "V-(으)ㄹ 수 있다", note: "배출하다 的定语形，修饰后面的 온실가스。词性：动词。" },
    { korean: "총량을", reading: "chong-nyang-eul", meaning: "总量（宾格）", note: "총량 是政策与统计文章中的正式名词，在文中是预先设定的对象。词性：名词。" },
    { korean: "미리", reading: "mi-ri", meaning: "预先、提前", note: "强调在实际排放前先制定上限，是碳预算制度的核心特征。词性：副词。" },
    { korean: "예산제를", reading: "ye-san-je-reul", meaning: "预算制度（宾格）", note: "-제 表示制度，文中指 탄소 예산제。词性：名词。" },
    { korean: "줄어들기", reading: "ju-reo-deul-gi", meaning: "减少、缩减（名词化）", grammar: "V-기 전에", note: "与 전에 连用，表示在预算缩减之前。词性：动词。" },
    { korean: "우선순위를", reading: "u-seon-sun-wi-reul", meaning: "优先级（宾格）", note: "与 정하다 搭配，指出政策资源需要先后排序。词性：名词。" },
    { korean: "반영되지", reading: "ban-yeong-doe-ji", meaning: "未被反映", grammar: "피동 + V-지 않으면", note: "반영되다 是被动表达，后接 않으면 构成否定条件。词性：动词。" },
    { korean: "집중될", reading: "jip-jung-doel", meaning: "可能集中到", grammar: "V-(으)ㄹ 수 있다", note: "被动形式 집중되다，说明成本可能落到特定群体。词性：动词。" },
    { korean: "미루게", reading: "mi-ru-ge", meaning: "使之推迟、最终推迟", grammar: "V-게 되다", note: "与 될 가능성 构成结果可能性，强调政策拖延的风险。词性：动词。" },
    { korean: "수단에", reading: "su-dan-e", meaning: "在手段上、作为手段", grammar: "N에 그치지 않다", note: "与 그치지 않고 连用，表示政策意义不应局限于技术工具。词性：名词。" },
    { korean: "투명하게", reading: "tu-myeong-ha-ge", meaning: "透明地", note: "투명하다 的副词形，修饰 공개하다，体现程序正当性。词性：副词。" },
    { korean: "참여할", reading: "cham-yeo-hal", meaning: "可以参与的、将参与", grammar: "V-(으)ㄹ 수 있도록", note: "与 수 있도록 连用，表达制度应保障的可能性。词性：动词。" },
    { korean: "마련해야", reading: "ma-ryeon-hae-ya", meaning: "必须建立、制定", grammar: "V-아/어야 하다", note: "用在结论中提出政府必须采取的行动。词性：动词。" },
  ],
  grammarPoints: [
    { pattern: "V-기 위해", meaning: "为了做某事", example: "기후 위기에 대응하기 위해 탄소 예산제를 도입한다.", note: "用来说明政策或行动的目的，是正式说明文的高频结构。" },
    { pattern: "V-다고 해서 ... 것은 아니다", meaning: "并非因为……就……", example: "숫자만 정한다고 해서 효과가 나타나는 것은 아니다.", note: "先承认某个条件，再否定其必然结果，常用于反驳简单因果。" },
    { pattern: "N에 그치지 않고", meaning: "不只停留在……而且……", example: "배출량을 제한하는 수단에 그치지 않고 사회적 약속이 되어야 한다.", note: "把论点从技术层面推进到更深的社会层面，适合主旨题与54题写作。" },
    { pattern: "V-(으)ㄹ 수 있도록", meaning: "为了使……能够……", example: "시민이 결정에 참여할 수 있도록 제도를 마련해야 한다.", note: "表示后项措施要为前项创造条件，政策建议句中非常常见。" },
  ],
  quiz: [
    { question: "文章认为碳预算制度的直接优点是什么？", answer: "它能让城市在预算逐步缩减之前确定各项目优先级，从而帮助制定长期减排计划。" },
    { question: "为什么作者强调不同居民的生活条件？", answer: "如果这些条件没有被充分反映，减排成本可能不公平地集中到公共交通不足或住宅能效较低的群体。" },
    { question: "作者最终将碳预算界定为什么？", answer: "不仅是限制排放的技术手段，更是决定成本由谁承担、支持由谁获得的社会约定。" },
  ],
  writingDrill: {
    type: "54 题观点写作",
    prompt: "도시가 탄소 배출을 줄이는 과정에서 정책의 효율성과 사회적 공정성을 어떻게 함께 확보해야 하는지 쓰십시오. 그 필요성과 구체적인 방안을 두 가지 이상 제시하십시오.",
    checklist: ["문제 상황", "효율성의 필요", "공정성의 필요", "방안 2개", "정책적 결론"],
    sentenceBank: [
      "배출량만 줄인다고 해서 정책이 성공했다고 볼 수는 없다.",
      "사회적 조건이 충분히 반영되지 않으면 비용이 특정 집단에 집중될 수 있다.",
      "따라서 집행 과정을 투명하게 공개하고 시민 참여를 보장해야 한다.",
    ],
  },
};

const readingArchive: DailyReading[] = [
  todayReading,
  previousReading,
  {
    ...passage,
    tokens,
    grammarPoints,
    quiz,
    writingDrill,
  },
];

const streakDays = ["一", "二", "三", "四", "五", "六", "日"];

export default function Home() {
  const [activeReadingId, setActiveReadingId] = useState(readingArchive[0].id);
  const activeReading =
    readingArchive.find((reading) => reading.id === activeReadingId) ??
    readingArchive[0];
  const [selectedToken, setSelectedToken] = useState(
    readingArchive[0].tokens[0],
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [vocabReview, setVocabReview] = useState<VocabularyReviewItem[]>([]);
  const [selectedMistakeReason, setSelectedMistakeReason] = useState(
    mistakeReasons[0],
  );
  const didRecordView = useRef(false);

  useEffect(() => {
    if (didRecordView.current) {
      return;
    }

    didRecordView.current = true;
    const now = new Date().toISOString();
    const stored = window.localStorage.getItem(historyStorageKey);
    let parsed: ReadingHistoryEntry[] = [];

    try {
      parsed = stored ? (JSON.parse(stored) as ReadingHistoryEntry[]) : [];
    } catch {
      parsed = [];
    }
    const entryId = `${activeReading.date}-${activeReading.id}`;
    const existing = parsed.find((item) => item.id === entryId);
    const nextHistory = existing
      ? parsed.map((item) =>
          item.id === entryId
            ? {
                ...item,
                lastViewedAt: now,
                reviewCount: item.reviewCount + 1,
              }
            : item,
        )
      : [
          {
            id: entryId,
            date: activeReading.date,
            title: activeReading.title,
            topic: activeReading.topic,
            level: activeReading.level,
            wordCount: activeReading.tokens.length,
            viewedAt: now,
            lastViewedAt: now,
            reviewCount: 1,
            completed: false,
          },
          ...parsed,
        ];

    const trimmedHistory = nextHistory
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
    window.localStorage.setItem(
      historyStorageKey,
      JSON.stringify(trimmedHistory),
    );
    setHistory(trimmedHistory);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(vocabStorageKey);
    let parsed: VocabularyReviewItem[] = [];

    try {
      parsed = stored ? (JSON.parse(stored) as VocabularyReviewItem[]) : [];
    } catch {
      parsed = [];
    }

    setVocabReview(parsed);
  }, []);

  const markActiveReadingComplete = () => {
    const entryId = `${activeReading.date}-${activeReading.id}`;
    const now = new Date().toISOString();
    const nextHistory = history.map((item) =>
      item.id === entryId
        ? {
            ...item,
            completed: true,
            lastViewedAt: now,
          }
        : item,
    );

    window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
    setHistory(nextHistory);
  };

  const openArchivedReading = (reading: DailyReading) => {
    setActiveReadingId(reading.id);
    setSelectedToken(reading.tokens[0]);
    setShowTranslation(false);
    setActiveQuestion(0);

    const stored = window.localStorage.getItem(historyStorageKey);
    let parsed: ReadingHistoryEntry[] = [];

    try {
      parsed = stored ? (JSON.parse(stored) as ReadingHistoryEntry[]) : [];
    } catch {
      parsed = [];
    }

    const now = new Date().toISOString();
    const entryId = `${reading.date}-${reading.id}`;
    const existing = parsed.find((item) => item.id === entryId);
    const nextHistory = existing
      ? parsed.map((item) =>
          item.id === entryId
            ? { ...item, lastViewedAt: now, reviewCount: item.reviewCount + 1 }
            : item,
        )
      : [
          {
            id: entryId,
            date: reading.date,
            title: reading.title,
            topic: reading.topic,
            level: reading.level,
            wordCount: reading.tokens.length,
            viewedAt: now,
            lastViewedAt: now,
            reviewCount: 1,
            completed: false,
          },
          ...parsed,
        ];

    const trimmedHistory = nextHistory
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
    window.localStorage.setItem(historyStorageKey, JSON.stringify(trimmedHistory));
    setHistory(trimmedHistory);
    window.setTimeout(() => {
      document.getElementById("reading")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const addSelectedWordToReview = () => {
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 1);

    const nextItem: VocabularyReviewItem = {
      korean: selectedToken.korean,
      meaning: selectedToken.meaning,
      addedAt: now.toISOString(),
      dueDate: new Intl.DateTimeFormat("en-CA").format(due),
      reviewStage: 1,
    };

    const nextReview = [
      nextItem,
      ...vocabReview.filter((item) => item.korean !== selectedToken.korean),
    ].slice(0, 80);

    window.localStorage.setItem(vocabStorageKey, JSON.stringify(nextReview));
    setVocabReview(nextReview);
  };

  const activeEntry = history.find(
    (item) => item.id === `${activeReading.date}-${activeReading.id}`,
  );
  const completedCount = history.filter((item) => item.completed).length;
  const totalReviewCount = history.reduce(
    (count, item) => count + item.reviewCount,
    0,
  );
  const dueTodayCount = vocabReview.filter(
    (item) => item.dueDate <= todayKey,
  ).length;
  const isSelectedWordSaved = vocabReview.some(
    (item) => item.korean === selectedToken.korean,
  );

  const highlightedText = useMemo(() => {
    const tokenSet = new Set(activeReading.tokens.map((token) => token.korean));
    return activeReading.korean.split(/(\s+)/).map((part, index) => {
      const clean = part.replace(/[.,!?;:，。]/g, "");
      const matched = activeReading.tokens.find(
        (token) => tokenSet.has(clean) && token.korean === clean,
      );

      if (!matched) {
        return <span key={`${part}-${index}`}>{part}</span>;
      }

      return (
        <button
          className={`inline-token ${
            selectedToken.korean === matched.korean ? "is-active" : ""
          }`}
          key={`${part}-${index}`}
          onClick={() => setSelectedToken(matched)}
          type="button"
        >
          {part}
        </button>
      );
    });
  }, [activeReading, selectedToken.korean]);

  return (
    <main className="min-h-screen">
      <section className="hero-section">
        <div className="hero-media" aria-hidden="true">
          <img src="/korean-study-hero.png" alt="" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">TOPIK II 6급 스프린트</p>
          <h1>冲 6 级，训练要像考试一样具体。</h1>
          <p className="hero-copy">
            以 10 月考试为锚点：每天一篇高阶阅读，加上生词复习、错题归因、限时训练和写作 54 题输出。
          </p>
          <div className="hero-actions" aria-label="学习概览">
            <a className="hero-exam-link" href="/exam-lab">
              进入真题精练
              <span aria-hidden="true">→</span>
            </a>
            <span>{targetLevel}</span>
            <span>目标 {targetScore}</span>
            <span>约 {daysUntilTarget} 天</span>
            <span>{today}</span>
          </div>
        </div>
      </section>

      <section className="workspace" aria-label="每日阅读学习台">
        <aside className="sidebar" aria-label="学习导航">
          <div className="brand-block">
            <span className="brand-mark">한</span>
            <div>
              <p>Daily TOPIK Lab</p>
              <strong>韩国语阅读训练</strong>
            </div>
          </div>

          <div className="stat-grid">
            <div>
              <span>目标</span>
              <strong>6级</strong>
            </div>
            <div>
              <span>倒计时</span>
              <strong>{daysUntilTarget}</strong>
            </div>
            <div>
              <span>待复习词</span>
              <strong>{dueTodayCount}</strong>
            </div>
            <div>
              <span>已读</span>
              <strong>{completedCount}</strong>
            </div>
          </div>

          <div className="streak-card">
            <div className="section-label">
              <span>冲刺周期</span>
              <strong>{weeksUntilTarget} 周</strong>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <span style={{ width: "18%" }} />
            </div>
            <div className="streak-row" aria-label="本周学习进度">
              {streakDays.map((day, index) => (
                <span className={index < 5 ? "done" : ""} key={day}>
                  {day}
                </span>
              ))}
            </div>
          </div>

          <nav className="quick-nav" aria-label="页面区域">
            <a className="private-link" href="/exam-lab">真题库</a>
            <a href="#sprint">冲刺</a>
            <a href="#reading">阅读</a>
            <a href="#vocab">词汇</a>
            <a href="#grammar">语法</a>
            <a href="#quiz">测验</a>
            <a href="#writing">写作</a>
            <a href="#history">历史</a>
          </nav>
        </aside>

        <div className="content-grid">
          <section className="sprint-panel" id="sprint">
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">6급 Sprint</p>
                <h2>10 月 6 级冲刺驾驶舱</h2>
              </div>
              <div className="sprint-heading-actions">
                <a href="/exam-lab">真题精练</a>
                <div className="question-count">目标 {targetScore}</div>
              </div>
            </div>

            <div className="sprint-summary">
              <article>
                <span>剩余</span>
                <strong>{daysUntilTarget}</strong>
                <small>天</small>
              </article>
              <article>
                <span>计划</span>
                <strong>{weeksUntilTarget}</strong>
                <small>周</small>
              </article>
              <article>
                <span>今日训练</span>
                <strong>
                  {sprintTasks.reduce((sum, task) => sum + task.minutes, 0)}
                </strong>
                <small>分钟</small>
              </article>
            </div>

            <div className="task-list" aria-label="今日 6 级训练任务">
              {sprintTasks.map((task) => (
                <article className={`task-card ${task.status}`} key={task.label}>
                  <div>
                    <span>{task.status === "must" ? "必做" : task.status === "focus" ? "拉分" : "复盘"}</span>
                    <h3>{task.label}</h3>
                    <p>{task.detail}</p>
                  </div>
                  <strong>{task.minutes}m</strong>
                </article>
              ))}
            </div>
          </section>

          <div className="study-columns">
            <div className="study-column study-column-main">
          <article className="reading-panel" id="reading">
            <div className="reading-context">
              <span>{activeReading.date}</span>
              <strong>
                {activeReading.id === readingArchive[0].id
                  ? "今日阅读"
                  : "历史回看"}
              </strong>
            </div>
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">Daily Passage</p>
                <h2>{activeReading.title}</h2>
              </div>
              <div className="topic-chip">{activeReading.topic}</div>
            </div>

            <p className="reading-text" lang="ko">
              {highlightedText}
            </p>

            <div className="translation-toggle">
              <button
                aria-pressed={showTranslation}
                onClick={() => setShowTranslation((value) => !value)}
                type="button"
              >
                {showTranslation ? "隐藏中文理解" : "显示中文理解"}
              </button>
              <button
                className="secondary-action"
                disabled={activeEntry?.completed}
                onClick={markActiveReadingComplete}
                type="button"
              >
                {activeEntry?.completed ? "本篇已留存" : "标记本篇已读"}
              </button>
            </div>

            {showTranslation ? (
              <p className="translation-text">{activeReading.chinese}</p>
            ) : null}
          </article>

          <section className="grammar-panel" id="grammar">
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">Grammar Map</p>
                <h2>语法拆解</h2>
              </div>
            </div>

            <div className="grammar-list">
              {activeReading.grammarPoints.map((point) => (
                <article key={point.pattern}>
                  <span lang="ko">{point.pattern}</span>
                  <h3>{point.meaning}</h3>
                  <p lang="ko">{point.example}</p>
                  <small>{point.note}</small>
                </article>
              ))}
            </div>
          </section>
            </div>

            <div className="study-column study-column-side">
          <aside className="analysis-panel" id="vocab">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow dark">Word Focus</p>
                <h2>逐词解析</h2>
              </div>
              <span>{selectedToken.reading}</span>
            </div>

            <div className="word-card">
              <strong lang="ko">{selectedToken.korean}</strong>
              <p>{selectedToken.meaning}</p>
              {selectedToken.grammar ? <span>{selectedToken.grammar}</span> : null}
              <small>{selectedToken.note}</small>
              <button
                disabled={isSelectedWordSaved}
                onClick={addSelectedWordToReview}
                type="button"
              >
                {isSelectedWordSaved ? "已在复习队列" : "加入生词复习"}
              </button>
            </div>

            <div className="review-queue">
              <div className="section-label">
                <span>复习队列</span>
                <strong>{vocabReview.length} 个</strong>
              </div>
              {vocabReview.slice(0, 4).map((item) => (
                <div key={item.korean}>
                  <span lang="ko">{item.korean}</span>
                  <small>{item.dueDate} 复习</small>
                </div>
              ))}
            </div>

            <div className="word-list" aria-label="选择要解析的单词">
              {activeReading.tokens.map((token) => (
                <button
                  className={
                    selectedToken.korean === token.korean ? "is-active" : ""
                  }
                  key={token.korean}
                  onClick={() => setSelectedToken(token)}
                  type="button"
                >
                  <span lang="ko">{token.korean}</span>
                  <small>{token.meaning}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="quiz-panel" id="quiz">
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">Check</p>
                <h2>读后确认</h2>
              </div>
              <div className="question-count">
                {activeQuestion + 1}/{activeReading.quiz.length}
              </div>
            </div>

            <div className="quiz-box">
              <p>{activeReading.quiz[activeQuestion].question}</p>
              <details>
                <summary>查看参考答案</summary>
                <span>{activeReading.quiz[activeQuestion].answer}</span>
              </details>
              <div className="quiz-controls">
                {activeReading.quiz.map((item, index) => (
                  <button
                    aria-label={`第 ${index + 1} 题`}
                    className={activeQuestion === index ? "is-active" : ""}
                    key={item.question}
                    onClick={() => setActiveQuestion(index)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mistake-reasons">
                <span>如果这题错了，主因是：</span>
                <div>
                  {mistakeReasons.map((reason) => (
                    <button
                      className={
                        selectedMistakeReason === reason ? "is-active" : ""
                      }
                      key={reason}
                      onClick={() => setSelectedMistakeReason(reason)}
                      type="button"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
            </div>
          </div>

          <section className="writing-panel" id="writing">
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">Writing</p>
                <h2>今日写作拉分题</h2>
              </div>
              <div className="question-count">{activeReading.writingDrill.type}</div>
            </div>

            <div className="writing-box">
              <p lang="ko">{activeReading.writingDrill.prompt}</p>
              <div className="writing-grid">
                <article>
                  <h3>必须写到</h3>
                  {activeReading.writingDrill.checklist.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </article>
                <article>
                  <h3>6 级句型</h3>
                  {activeReading.writingDrill.sentenceBank.map((sentence) => (
                    <span lang="ko" key={sentence}>
                      {sentence}
                    </span>
                  ))}
                </article>
              </div>
            </div>
          </section>

          <section className="plan-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">Roadmap</p>
                <h2>12 周冲刺路线</h2>
              </div>
            </div>

            <div className="plan-list">
              {sprintWeeks.map((week) => (
                <article key={week.week}>
                  <span>{week.week}</span>
                  <h3>{week.focus}</h3>
                  <p>{week.deliverable}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="history-panel" id="history">
            <div className="panel-heading">
              <div>
                <p className="eyebrow dark">History</p>
                <h2>每日文章归档</h2>
              </div>
              <div className="history-summary">
                <span>{readingArchive.length} 篇文章</span>
                <span>{totalReviewCount} 次打开</span>
              </div>
            </div>

            <p className="history-intro">
              每天的文章都会完整保存在这里。打开历史文章后，上方的原文、逐词解析、语法、测验和写作题会一起切换。
            </p>

            <div className="history-list" aria-label="每日阅读文章归档">
              {readingArchive.map((reading) => {
                const item = history.find(
                  (entry) => entry.id === `${reading.date}-${reading.id}`,
                );
                const isActive = reading.id === activeReading.id;

                return (
                  <article className={isActive ? "is-active" : ""} key={reading.id}>
                    <div>
                      <time dateTime={reading.date}>{reading.date}</time>
                      <h3 lang="ko">{reading.title}</h3>
                      <p>
                        {reading.topic} · {reading.level} · {reading.tokens.length} 个重点词 · {reading.estimatedTime}
                      </p>
                    </div>
                    <div className="history-status">
                      <span className={item?.completed ? "complete" : ""}>
                        {item?.completed ? "已读" : item ? "已浏览" : "未开始"}
                      </span>
                      <button
                        disabled={isActive}
                        onClick={() => openArchivedReading(reading)}
                        type="button"
                      >
                        {isActive ? "正在查看" : "打开全文"}
                      </button>
                      {item ? <small>{item.reviewCount} 次</small> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
