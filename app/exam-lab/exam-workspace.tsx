"use client";

import { useEffect, useMemo, useState } from "react";
import { topik102Questions } from "./topik102-data";

type Props = { isPrivate?: boolean; displayName?: string };
type AnalysisTab = "sentence" | "answer" | "notes";
type ExamProgress = {
  answers: Record<string, number>;
  submitted: Record<string, boolean>;
  notes: Record<string, string>;
  flagged: number[];
  updatedAt: string;
};

const examProgressStorageKey = "daily-topik-lab-topik-102-progress";

const examSets = [
  ["第 102 回", "2025.10", 0, "待精读"],
] as const;

type DetailedNote = {
  translation?: string;
  grammar?: string;
  words: string[];
  note: string;
  breakdown?: string;
  correctReason?: string;
  traps?: string[];
  examTip?: string;
};

const detailedNotes: Record<number, DetailedNote> = {
  1: {
    translation: "搬到这个社区已经一年了。",
    grammar: "V-(으)ㄴ 지 + 기간이 되다：做某事已经经过一段时间。",
    words: ["이사하다 搬家", "온 지 自从来到", "일 년이 되다 已经一年"],
    note: "这句不是在单纯叙述“搬家”，而是在计算搬来之后经过了多久。온 지 是 오다 的定语形加 지，后面接时间长度。",
    breakdown: "이 동네로 = 搬到这个社区；이사를 오다 = 搬来；온 지 = 自从搬来；일 년이 됐다 = 已经一年了。",
    correctReason: "题干要表达“从搬来这件事开始，已经过了一年”。V-(으)ㄴ 지 + 기간이 되다 正好表示动作发生后经过的时间，因此选择表示“搬来后已经一年”的选项。",
    traps: ["正确：符合“动作发生后经过一段时间”的结构。", "올 때 = 来的时候，表示某个时点或条件，不表示已经经过的时间。", "오거나 = 来或者……，必须和另一个选择并列，不能独立表达“已经一年”。", "오다가 = 来着/在来的过程中，强调动作途中发生变化，也没有“经过一年”的含义。"],
    examTip: "看到 지 后面接 일 년, 두 달, 오래 等时间长度，优先判断为“做某事以来经过了多久”。",
  },
  2: {
    translation: "到了秋天，树叶的颜色逐渐变红。",
    grammar: "V-아/어 가다：变化朝着某个方向逐渐发展。",
    words: ["가을이 되면서 随着进入秋天", "나뭇잎 树叶", "점점 逐渐", "붉게 红红地"],
    note: "점점 和变色过程是本题的两个关键线索：树叶不是突然变红，而是颜色持续朝红色变化。",
    breakdown: "가을이 되면서 = 随着秋天到来；나뭇잎의 색이 = 树叶的颜色；점점 = 逐渐；붉게 변해 간다 = 渐渐变红。",
    correctReason: "점점 表示变化逐步推进，변해 가다 表示这种变化正在朝某个方向持续发展，两者语义完全吻合，所以应选“逐渐变红”的表达。",
    traps: ["正确：表示颜色正在逐渐发生变化，与 점점 呼应。", "변할 뻔했다 = 差点发生变化但最终没有发生，和树叶实际变红相矛盾。", "변한 척했다 = 假装发生了变化，主语是树叶的颜色时不合逻辑。", "변하면 된다 = 只要发生变化就可以，表达条件或要求，不是在陈述观察到的过程。"],
    examTip: "점점、차츰、서서히 常与 -아/어 가다 或 -아/어지다 搭配，看到“逐渐”就排除差点、假装、只要等逻辑。",
  },
  3: {
    translation: "现在不出发的话，可能会迟到。",
    grammar: "V-(으)ㄹ지도 모르다：可能……，表示不确定推测。",
    words: ["출발하다 出发", "약속 시간 约定时间", "늦다 迟到"],
    note: "前半句是不出发的条件，后半句不是确定结果，而是带有担心和不确定性的可能结果。",
    breakdown: "지금 출발하지 않으면 = 如果现在不出发；약속 시간에 = 在约定时间；늦을지도 모른다 = 也许会迟到。",
    correctReason: "-(으)ㄹ지도 모르다 表示说话人无法确定但认为有可能发生。늦을 수도 있다 也是“可能迟到”，语气和判断方向最接近，因此选择④。",
    traps: ["늦는 셈이다 = 等于迟到/可以算作迟到，接近已下定论，不是“不确定的可能”。", "늦어도 된다 = 即使迟到也可以，表示许可，完全没有“可能迟到”的推测。", "늦을 리가 없다 = 不可能迟到，和原句担心迟到的方向相反。", "正确：늦을 수도 있다 与 늦을지도 모른다 都表达尚未确定的可能性。"],
    examTip: "지도 모르다、수도 있다 是可能性；리 없다 是否定可能性。先判断语气方向，再看时态和连接关系。",
  },
  4: {
    translation: "农产品价格正如专家预想的那样在下降。",
    grammar: "V-(으)ㄴ 대로：按照……的样子、正如……所预料。",
    words: ["전문가 专家", "예상하다 预想", "농산물 农产品", "떨어지다 下降"],
    note: "这里的 대로 不是“按照指示去做”，而是把现实结果和之前的预测进行对照，意思是“正如预想的那样”。",
    breakdown: "전문가들이 예상한 대로 = 正如专家们预想的那样；농산물 가격이 = 农产品价格；떨어지고 있다 = 正在下降。",
    correctReason: "예상한 대로 表示现实情况与专家此前的预测一致。选项④的 예상한 것과 같이 也是“和预想的一样”，可以自然替换，因而正确。",
    traps: ["탓에 = 因为……的缘故，通常带负面原因，不能表达“与预测一致”。", "동안에 = 在……期间，说明时间范围，不表示结果符合预测。", "기만 하면 = 只要……就……，表示条件或反复条件，句子逻辑不成立。", "正确：예상한 것과 같이 = 和预想的一样，与 예상한 대로 意义相同。"],
    examTip: "대로 接在预测、计划、说明、命令后，常译为“正如……、按照……”；先看前项是预测还是动作指令。",
  },
  5: {
    translation: "广告语：走路时脚很舒服，轻便，设计也漂亮。",
    words: ["걸을 때 走路时", "발이 편하다 脚舒服", "가볍다 轻便", "디자인도 예쁘다 设计也漂亮", "구두 皮鞋"],
    note: "这类题不是逐句翻译题，而是从广告关键词推商品。발이 편하다、가볍다、디자인 都是在描述穿在脚上的东西。",
    breakdown: "걸을 때 발이 편하게 = 走路时脚舒服；가볍고 = 轻；디자인도 예뻐요 = 设计也漂亮。",
    correctReason: "四个选项里，只有 구두 可以同时满足“走路时脚舒服”“轻便”“设计漂亮”这三个线索。우산、자전거、선풍기 都不能用 발이 편하다 来描述。",
    traps: ["正确：구두 是穿在脚上的物品，可以被描述为轻便、脚舒服、设计漂亮。", "우산 = 雨伞，可以轻、设计漂亮，但不能说走路时脚舒服。", "자전거 = 自行车与走路无关，也不是穿戴物。", "선풍기 = 电风扇，和脚、走路、设计搭配都不自然。"],
    examTip: "广告对象题先找“只能修饰某一类物品”的词。발이 편하다 基本直接锁定鞋类。",
  },
  6: {
    translation: "广告语：把脏衣服洗得像新衣服一样！厚被子也请交给我们。",
    words: ["더러워진 옷 变脏的衣服", "새 옷처럼 像新衣服一样", "두꺼운 이불 厚被子", "맡겨 주세요 请交给/托付给我们", "세탁소 洗衣店"],
    note: "더러워진 옷、새 옷처럼、두꺼운 이불 都和清洗衣物有关。맡기다 在服务广告里常表示“送去处理、交给店家”。",
    breakdown: "더러워진 옷을 새 옷처럼 = 把脏衣服弄得像新衣服一样；두꺼운 이불도 맡겨 주세요 = 厚被子也请交给我们。",
    correctReason: "题面同时出现 옷、이불 和 맡기다，说明这是清洗衣物和被子的服务场所，所以答案是 세탁소。",
    traps: ["은행 = 银行，可能有 맡기다 的“存放/托付”含义，但不能处理 옷、이불。", "시장 = 市场，能买东西，但不是把脏衣服和厚被子交给它处理。", "正确：세탁소 可以洗衣服和被子，完全对应题面。", "가구점 = 家具店，和 이불 可能有生活用品联想，但 더러워진 옷 不成立。"],
    examTip: "看到 더러워진 옷、이불、맡기다 三个词连在一起，优先想到 세탁소，不要被 맡기다 的多义干扰。",
  },
  7: {
    translation: "海报语：跑步，现在马上开始吧。充满活力的明天在等着你。",
    words: ["달리기 跑步", "지금 바로 现在马上", "시작하세요 请开始", "활기찬 내일 充满活力的明天", "건강 관리 健康管理"],
    note: "核心动作是 달리기，目的效果是 활기찬 내일。题目问“关于什么”，要从行为和目的合起来判断。",
    breakdown: "달리기 = 跑步；지금 바로 시작하세요 = 现在马上开始吧；활기찬 내일이 기다립니다 = 有活力的明天在等着你。",
    correctReason: "跑步是运动，广告强调通过跑步获得有活力的明天，所以主题是 건강 관리。",
    traps: ["전기 절약 = 节电，没有电器、用电、절약 等线索。", "正确：건강 관리 能概括 달리기 和 활기찬 내일。", "생활 예절 = 生活礼仪，题面没有礼貌、规则、公共场所行为。", "환경 보호 = 环境保护，跑步虽可联想到环保出行，但题面没有 환경、보호、줄이다 等环保词。"],
    examTip: "主题判断题不要只看一个词。달리기 是行为，활기찬 내일 是目的，两者合起来才是 건강 관리。",
  },
  8: {
    translation: "说明：1. 选择演出日期和人数后按“下一步”按钮。2. 选择想要的座位后付款。",
    grammar: "V-고：按顺序连接动作；V-(으)ㄴ 후：完成前项后做后项。",
    words: ["공연 날짜 演出日期", "인원 人数", "다음 버튼 下一步按钮", "좌석 座位", "결제하다 付款"],
    note: "这不是活动介绍，而是在告诉使用者按什么顺序完成购票。날짜、인원、좌석、결제 是典型购票流程词。",
    breakdown: "공연 날짜, 인원을 선택하고 = 选择演出日期和人数后；다음 버튼을 누르세요 = 点击下一步；좌석을 선택한 후 결제하세요 = 选座后付款。",
    correctReason: "题面按步骤说明 날짜/인원 선택 -> 다음 -> 좌석 선택 -> 결제，这正是 예매 방법。",
    traps: ["正确：예매 방법 概括了选日期、选座、付款的全过程。", "행사 소개 = 活动介绍，应出现活动内容、时间、地点、对象等介绍信息。", "등록 문의 = 报名咨询，通常出现 문의、전화、접수、등록 기간 等。", "교환 순서 = 交换顺序，题面没有 교환，也没有换货/交换流程。"],
    examTip: "看到 날짜 선택、좌석 선택、결제하세요，基本就是 예매/예약 방법。TOPIK 广告说明题常用流程词锁答案。",
  },
  9: {
    translation: "公告：招募为孩子读绘本的志愿者。资格为高中生或大学生，韩国语好的外国学生也可以。申请方法是在儿童图书馆主页申请，活动期间为 2025 年 12 月 1 日到 2026 年 2 月 28 日。",
    words: ["그림책 绘本", "읽어 주는 给别人读", "자원봉사자 志愿者", "모집 招募", "신청 방법 申请方法", "활동 기간 活动期间"],
    note: "这题问内容一致项。不要被日期和资格条件带跑，先抓公告标题：그림책 읽어 주는 자원봉사자 모집。",
    breakdown: "그림책 읽어 주는 자원봉사자 모집 = 招募读绘本的志愿者；어린이들에게 꿈과 희망을 선물하세요 = 请给孩子们送去梦想和希望；신청 방법은 홈페이지 = 申请方式是网页。",
    correctReason: "标题直接说明 모집 的对象是“给孩子读绘本的志愿者”。② 아이들에게 책을 읽어 줄 봉사자를 찾고 있다 与标题完全一致。",
    traps: ["두 달 동안 = 两个月，但活动期间是 2025.12.1 到 2026.2.28，接近三个月，不是两个月。", "正确：아이들에게 책을 읽어 줄 봉사자를 찾고 있다 与 그림책 읽어 주는 자원봉사자 모집 对应。", "직접 가서 해야 한다 = 必须亲自去图书馆，但题面写的是 홈페이지 申请。", "학생이 아닌 사람들도 = 非学生也可以，但资格限定为 고등학생 또는 대학생，外国学生也仍然是 학생。"],
    examTip: "一致题先核对限制词：기간、신청 방법、자격。选项只要把网页申请改成亲自去、把学生限定改成非学生可参加，就是错。",
  },
  10: {
    translation: "图表：选择旅行社时重要考虑因素。价格 48%，旅行商品多样性 25%，公司规模 16%，使用评价 9%，其他 2%。调查对象为成年男女 1,600 名。",
    words: ["여행사 旅行社", "중요하게 생각하는 것 认为重要的因素", "가격 价格", "여행 상품의 다양성 旅行商品的多样性", "회사의 규모 公司规模", "이용 후기 使用评价"],
    note: "图表题要先按数值排序：가격 48 > 다양성 25 > 회사 규모 16 > 이용 후기 9 > 기타 2。再逐项检查比较关系。",
    breakdown: "가격 48% = 最大项；여행 상품의 다양성 25% = 第二；회사의 규모 16% = 第三；이용 후기 9% = 第四；기타 2% = 最低。",
    correctReason: "④说“重视公司规模的人比重视旅行商品多样性的人少”。图中 회사의 규모 16%，여행 상품의 다양성 25%，16 小于 25，所以正确。",
    traps: ["회사의 규모가 가장 낮다 = 错，最低是 기타 2%，회사 규모是 16%。", "가격이 전체의 반을 넘는다 = 错，价格是 48%，没有超过一半 50%。", "이용 후기가 다양성보다 두 배 이상 많다 = 错，利用后记 9% 小于多样性 25%，方向都反了。", "正确：회사의 규모 16% < 여행 상품의 다양성 25%。"],
    examTip: "图表题先写出排序和关键比较。반을 넘는다 要大于 50%，두 배 이상은至少 2 倍，方向和倍数都要核对。",
  },
  11: {
    translation: "上个月开馆的邮票博物馆很受市民喜爱。历史室可以一眼看到邮票的发展历史，儿童体验室可以闻香味邮票、摸木制邮票，还能亲手制作放入自己照片的邮票。写信投进慢邮筒后，一年后可以收到。",
    words: ["지난달 上个月", "문을 열다 开门、开馆", "우표 박물관 邮票博物馆", "한눈에 볼 수 있다 一眼看全", "향을 맡다 闻香味", "직접 만들다 亲手制作", "느린 우체통 慢邮筒"],
    note: "这是一致题，要逐项核对“时间、能不能做、是否允许触摸、能不能寄信”。原文的 핵심 근거 是 자신의 사진이 들어간 우표도 직접 만들 수 있다。",
    breakdown: "지난달 문을 연 = 上个月开馆；역사실에서는 우표의 역사를 한눈에 볼 수 있다 = 在历史室能看邮票历史；어린이 체험실에서는 향을 맡거나 만져 볼 수 있다 = 体验室可闻可摸；직접 만들 수 있다 = 可以亲自制作。",
    correctReason: "②“可以在这家博物馆亲手制作邮票”和原文 자신의 사진이 들어간 우표도 직접 만들 수 있다 完全对应，所以选 ②。",
    traps: ["일 년 전부터 운영 = 错，原文是 지난달 문을 연，上个月才开馆。", "正确：직접 우표를 만들어 볼 수 있다 对应 직접 만들 수 있다。", "만질 수 없다 = 错，原文说 나무 우표 등을 만져 볼 수 있다。", "편지를 보내지 못한다 = 错，느린 우체통은 편지를 써서 넣으면 일 년 뒤에 받아 볼 수 있다。"],
    examTip: "一致题最怕“能/不能”反向改写。看到 수 있다 / 수 없다 时，一定回原文逐字对照。",
  },
  12: {
    translation: "休息日爬山的警察救助了登山客。金警尉在仁州山山顶发现一名女子倒下，给她盖上外套防止体温下降并拨打 119，随后把她背到救援车能到达的山腰避难所。女子被送往医院后恢复健康。",
    words: ["휴일 休息日", "등산객 登山客", "쓰러져 있다 倒下", "체온이 떨어지다 体温下降", "겉옷 外套", "신고하다 报警", "업고 내려가다 背着下去", "대피소 避难所"],
    note: "这题要抓事件顺序和动作主语：发现倒下的人是 김 경위，报警的是 김 경위，背到 대피소 的也是 김 경위；救援车只是能到达山腰避难所。",
    breakdown: "인주산 정상에서 한 여성이 쓰러져 있는 것을 발견했다 = 在山顶发现女子倒下；겉옷을 벗어서 덮어 주고 = 脱下外套盖上；119에 신고했다 = 报警；산 중턱 대피소까지 여성을 업고 뛰어 내려갔다 = 背到山腰避难所。",
    correctReason: "①“有一名登山客倒在山顶”对应原文 인주산 정상에서 한 여성이 쓰러져 있는 것을 발견했다。",
    traps: ["正确：한 등산객이 산 정상에 쓰러져 있었다 是原文直接信息。", "차량으로 이동했다 = 错，车辆不能到山顶，김 경위是把人背到车辆可到达的 대피소。", "구조대가 업고 병원으로 뛰어갔다 = 错，背人的是 김 경위，送医是之后 이송된。", "신고를 받고 산에 올라갔다 = 错，김 경위는 휴일에 산을 오르던 중 발견했고 신고也是他打的。"],
    examTip: "救援类叙事题要画出主语链：谁发现、谁报警、谁背人、谁送医。选项换主语就很容易错。",
  },
  13: {
    translation: "神秘桃是 2017 年首次在韩国介绍的夏季水果。它结合了皮薄桃子和果肉柔软桃子的优点，因此连皮吃也方便，不硬，口感好。比其他桃子更早上市也是优点。",
    words: ["순서에 맞게 배열하다 按顺序排列", "처음 소개되다 首次介绍", "여름 과일 夏季水果", "장점 优点", "결합하다 结合", "껍질째 连皮", "식감 口感", "이른 시기 较早时期"],
    note: "排序题先找主题引入句。(나) 先定义 신비 복숭아；(라) 说明它怎么来的；(가) 的 그래서 承接前句的“皮薄、果肉软”；(다) 的 것도 是追加优点，适合放最后。",
    breakdown: "(나) 介绍对象 -> (라) 说明制作方式和优点来源 -> (가) 用 그래서 接结果 -> (다) 用 것도 补充另一个优点。",
    correctReason: "正确顺序是 (나)-(라)-(가)-(다)，所以选 ①。",
    traps: ["正确：先介绍 신비 복숭아，再说明优点结合，最后补充上市早。", "(나)-(가) 不自然，因为 그래서 前面还没有给出“为什么连皮吃方便、口感好”的原因。", "(라) 开头直接说 장점을 결합해 만들었다，但读者还不知道 신비 복숭아 是什么。", "(다) 的 것도 表示追加信息，不能放在定义句之前。"],
    examTip: "排序题看到 그래서，要往前找原因；看到 것도，要判断前面是否已经出现第一个同类优点。",
  },
  14: {
    translation: "孩子感冒后整夜大声哭。我一边哄孩子，一边担心哭声会吵醒邻居。早上带孩子去医院时遇见隔壁阿姨，阿姨反而担心孩子是不是很不舒服。",
    words: ["감기에 걸리다 感冒", "밤새 整夜", "달래다 哄", "깰까 봐 担心会醒", "집을 나서다 出门", "옆집 아주머니 隔壁阿姨", "오히려 反而"],
    note: "这题按时间线和反应来排：先发生夜里孩子哭的事，再写说话人的担心；第二天早上遇见邻居，最后才出现邻居的反应。",
    breakdown: "(가) 事件起因：孩子感冒夜哭 -> (라) 我担心邻居被吵醒 -> (다) 早上出门遇见隔壁阿姨 -> (나) 阿姨反而担心孩子。",
    correctReason: "正确顺序是 (가)-(라)-(다)-(나)，所以选 ②。",
    traps: ["(가)-(나) 不行，아주머니 的反应必须发生在早上遇见她之后。", "正确：밤새 的事情在前，아침에 的事情在后。", "(나) 不能开头，因为还没交代 아이 为什么 아팠다。", "(라) 不能放在 (다) 后，因为担心邻居醒来发生在夜里哄孩子时。"],
    examTip: "叙事排序先抓时间词：밤새 -> 아침에。오히려 常引出和“我担心的结果”相反的反应。",
  },
  15: {
    translation: "最近网购家具增加，退货案例也变多了。但是昂贵退货费导致消费者受损，甚至出现商家用苛刻条件拒绝退货的情况。因此消费者购买前应确认退货费用和条件。",
    words: ["온라인 가구 구매 网购家具", "반품 退货", "사례 案例", "피해를 보다 受损", "까다로운 조건 苛刻条件", "내세우다 提出、打出", "거절하다 拒绝", "확인하다 确认"],
    note: "这题是典型“现象 -> 问题 -> 问题加深 -> 对策”。(나) 的 그런데 把话题转到消费者 피해，(다) 的 따라서 必须接在问题说明之后作结论。",
    breakdown: "(가) 背景：网购家具和退货案例增加 -> (나) 转折：退货费贵造成 피해 -> (라) 进一步说明：商家拒绝退货 -> (다) 结论：购买前确认费用和条件。",
    correctReason: "正确顺序是 (가)-(나)-(라)-(다)，所以选 ①。",
    traps: ["正确：背景现象之后接 그런데，再接更严重的拒退情况，最后用 따라서 总结对策。", "(가)-(라)-(다)-(나) 不行，따라서 后面不能再回到 그런데 引出新问题。", "(라) 不能开头，因为 반품 是什么问题还没铺垫。", "(다) 不能放中间，它是消费者应怎么做的结论句。"],
    examTip: "排序题里 따라서 往往是结尾候选；그런데 后面通常是反转、问题或限制。",
  },
  16: {
    translation: "北极狐会随着季节改变毛色。冬天变成像雪一样的白色，夏天变成类似岩石或泥土的褐色。这种毛色变化能让它在北极缺少藏身处的特殊环境中保护自己，并在捕猎时悄悄接近猎物。",
    words: ["계절에 따라 随季节", "털 색깔 毛色", "바꾸다 改变", "천적 天敌", "보호하다 保护", "사냥하다 捕猎", "먹잇감 猎物", "몰래 다가가다 悄悄靠近"],
    note: "空格前是 사냥할 때，说明答案必须和“捕猎时能做什么”直接相关。毛色伪装既能躲避天敌，也能靠近猎物。",
    breakdown: "털 색깔의 변화로 = 通过毛色变化；천적으로부터 자신을 보호하고 = 保护自己免受天敌伤害；사냥할 때 먹잇감에 몰래 다가갈 수 있다 = 捕猎时能悄悄接近猎物。",
    correctReason: "② 먹잇감에 몰래 다가갈 与 사냥할 때 的语义最贴合，也和毛色伪装的功能一致。",
    traps: ["무리를 이룰 = 成群，与毛色变化和捕猎无关。", "正确：먹잇감에 몰래 다가갈 是伪装在捕猎中的直接作用。", "체온을 유지할 = 保持体温，虽然北极动物可能相关，但本文讲的是 털 색깔，不是保温。", "발자국을 남기지 않을 = 不留脚印，原文没有 발자국 线索。"],
    examTip: "填空题别凭常识扩展。空格附近的 사냥할 때 比 북극여우 的背景知识更重要。",
  },
  17: {
    translation: "最近很多孩子握铅笔、端正写字有困难，这是因为从小长时间使用电子设备。反复按或滑屏幕，会导致手部肌肉得不到充分使用。因此专家建议在小肌肉发育到 11 岁之前，多做需要活动手指的游戏。",
    words: ["연필을 잡다 握铅笔", "반듯하게 쓰다 写得端正", "장시간 长时间", "전자 기기 电子设备", "반복하다 反复", "근육 肌肉", "소근육 小肌肉", "발달하다 发育"],
    note: "因果链是：长时间用电子设备 -> 只做简单点击/滑动 -> 手部肌肉没有充分使用 -> 写字困难。空格处必须填“肌肉使用不足”。",
    breakdown: "전자 기기의 화면을 단순히 누르거나 미는 동작 = 简单点击或滑动屏幕；반복하다 보면 = 反复这样做的话；손에 있는 근육을 충분히 사용하지 못한다 = 不能充分使用手部肌肉。",
    correctReason: "③ 충분히 사용하지 正好解释为什么 소근육 发展受影响、写字困难。",
    traps: ["감싸지 = 包住、围住，不能和 손 근육 的发育问题搭配。", "줄이지 = 减少，文中不是说肌肉减少，而是没被充分使用。", "正确：충분히 사용하지 못한다 与点击滑屏动作单一直接对应。", "회복하지 = 恢复，前文没有受伤或恢复的语境。"],
    examTip: "原因解释题要把 탓이다、그래서 串起来，中间空格通常填导致后果的核心机制。",
  },
  18: {
    translation: "支石墓是青铜器时代的坟墓。一个盖石可能重达几十吨。要运输并竖立如此巨大的石头，需要很多人的力量。因此支石墓很可能属于拥有巨大权力、能够召集人们建墓的人。",
    words: ["고인돌 支石墓", "청동기 시대 青铜器时代", "받침돌 支撑石", "덮개돌 盖石", "수십 톤 几十吨", "운반하다 运输", "불러 모으다 召集", "권력 权力"],
    note: "空格前说“能把人召集起来，让他们做造墓工作”，这不是体力、武器或寿命，而是社会权力。",
    breakdown: "거대한 돌을 운반하고 세우려면 = 要运输并竖立巨石；많은 사람들의 힘이 필요했다 = 需要很多人的力量；사람들을 불러 모아 일을 시킬 수 있을 정도로 = 达到能召集并指挥人劳动的程度。",
    correctReason: "① 대단한 권력을 가진 与“能召集很多人建墓”的依据完全对应。",
    traps: ["正确：대단한 권력을 가진 是从动员大量劳动力推出的身份特征。", "체력이 약한 = 体力弱，与能建巨石墓无关。", "무기를 잘 제작하는 = 会制造武器，原文没提 무기。", "수명이 짧은 = 寿命短，和墓的规模、劳动力都没有逻辑关系。"],
    examTip: "考古说明文常从遗物规模推社会地位。많은 사람들을 시킬 수 있다 基本对应 권력。",
  },
  19: {
    translation: "城市道路多由不透水的沥青覆盖，导致雨水难以下渗、地下水不足，也容易积水。最近开发出容易渗水的新型道路铺装材料，雨水能通过微孔补充地下水。此外，流向下水道的雨水减少，道路浸水风险也会降低。",
    words: ["스며들다 渗入", "아스팔트 沥青", "지하수 地下水", "침수 浸水", "포장재 铺装材料", "미세한 구멍 微小孔洞", "보충되다 得到补充", "또한 此外"],
    note: "空格前后是同方向的两个好处：补充地下水 + 降低道路浸水风险。要选追加关系，而不是让步、疑问或对比。",
    breakdown: "빗물이 쉽게 통과해 지하수 자원이 보충된다 = 雨水通过后补充地下水；또한 하수구로 몰리는 빗물의 양이 줄어 = 此外，流向下水道的雨水量减少。",
    correctReason: "① 또한 表示并列追加，能自然连接新铺装材料的第二个积极效果。",
    traps: ["正确：또한 = 此外，连接两个并列效果。", "비록 = 即使、虽然，后面一般接让步，不符合此处同向补充。", "과연 = 究竟、果然，常用于疑问或强调，不适合说明效果。", "반면 = 相反、另一方面，表示对比，但前后不是对立关系。"],
    examTip: "连接词题先判断前后方向：同向补充选 또한/게다가，反向才考虑 반면/하지만。",
  },
  20: {
    translation: "文章主旨：透水铺装材料能让雨水下渗，补充地下水，同时减少流向下水道的雨水量，从而降低道路积水风险。",
    words: ["주제 主题", "부족 不足", "문제 해결 解决问题", "도움이 되다 有帮助", "새 포장재 新铺装材料", "위험이 줄어들다 风险降低"],
    note: "主旨题要覆盖全文两个问题和一个方案：问题是 지하수 부족 与 도로 침수，方案是 새 포장재。正确选项必须同时包含两类效果。",
    breakdown: "前半段提出沥青路造成地下水不足和道路浸水；后半段说明透水铺装材料通过微孔让雨水下渗，解决这两个问题。",
    correctReason: "④“新铺装材料有助于解决地下水不足和道路浸水问题”完整概括全文，因此正确。",
    traps: ["지하수 오염 = 错，文中讲 부족，不是污染。", "도시마다의 특성 = 错，文中没有比较不同城市。", "도로 침수 피해 = 只说了问题之一，没有概括新材料的解决作用。", "正确：새 포장재 + 지하수 부족 + 도로 침수 문제 해결 三个核心都在。"],
    examTip: "主旨题不能只选“文章提到过的一句话”。要包含问题、手段、结果的最大公约数。",
  },
  21: {
    translation: "仁州市一条街因聚集餐厅和咖啡馆而成为美食街，访客增加。但一些访客挡住车辆通行、在路中间拍照、在人行横道上架三脚架等行为令人皱眉。因为经常发生差点出事故的危险情况，司机和访客之间的争执也变多了。",
    words: ["먹거리 골목 美食街", "특화되다 专门化、形成特色", "차량 통행 车辆通行", "횡단보도 人行横道", "삼각대 三脚架", "촬영하다 拍摄", "눈살을 찌푸리게 하다 令人皱眉", "다투다 争吵"],
    note: "空格描述 일부 방문객의 행동。后面说危险情况、司机与访客争执，所以应选表示令人不快、让人皱眉的惯用表达。",
    breakdown: "차량 통행을 막고 = 阻碍车辆通行；삼각대를 세우고 촬영하는 등 = 架三脚架拍摄等；행동이 눈살을 찌푸리게 한다 = 行为令人皱眉。",
    correctReason: "③ 눈살을 찌푸리게 与后文의 위험한 상황、다투는 일 完全一致，表示行为让人反感。",
    traps: ["목이 빠지게 = 翘首以盼，常和 기다리다 搭配，不表示不满。", "한숨을 돌리게 = 松一口气，方向相反。", "正确：눈살을 찌푸리게 = 令人皱眉、不舒服。", "코가 납작해지게 = 受挫、丢脸，和公共秩序问题不贴合。"],
    examTip: "惯用语题不要硬翻单词，先看后文情绪方向：危险、争执通常对应 부정적 평가。",
  },
  22: {
    translation: "内容一致项：这条美食街访客增加，但部分访客拍照行为影响车辆通行，危险情况频发，司机和访客之间争执增多。",
    words: ["내용과 같은 것 内容一致项", "방문객 访客", "운전자 司机", "갈등 矛盾", "늘고 있다 正在增加", "사고가 날 뻔하다 差点出事故"],
    note: "这题和 21 题共用同一篇文章。核心事实不是“人变少”或“政府禁行”，而是 방문객과 운전자 간에 다투는 일도 잦아지고 있다。",
    breakdown: "위험한 상황이 자주 발생하면서 = 危险情况经常发生；운전자와 방문객 간에 다투는 일도 잦아지고 있다 = 司机和访客之间争执也变频繁。",
    correctReason: "③“访客和司机之间的矛盾正在增加”对应原文 운전자와 방문객 간에 다투는 일도 잦아지고 있다。",
    traps: ["사진을 찍는 방문객이 줄어들었다 = 错，原文说 방문객이 늘고 있다。", "인주시가 차량 통행을 금지했다 = 错，阻碍通行的是部分访客行为，不是市政府禁行。", "正确：방문객과 운전자 사이에 갈등이 늘고 있다。", "식당이 없어 불편 = 错，原文说 식당과 카페가 모였다。"],
    examTip: "同篇双题第二题要回到原文最后一句，TOPIK 常把结论句改写成一致项。",
  },
};

function cleanContext(context: string | string[]) {
  return Array.isArray(context) ? context : context ? [context] : [];
}

function buildGeneratedDetail(question: (typeof topik102Questions)[number]): DetailedNote {
  const answerText = question.options[question.answer - 1];
  const answerLabel = String.fromCharCode(9311 + question.answer);
  const baseWords = ["정답 근거 正确依据", "선택지 함정 选项陷阱", "문맥 文脉", "범위 范围", "일치하다 一致"];

  if (question.type === "order") {
    return {
      translation: "排序题先不要急着翻选项，先看四个句子的功能：主题引入、原因说明、结果承接、补充说明或结论。",
      words: ["순서 배열 排序", "주제 도입 主题引入", "연결어 连接词", "그래서 因此", "따라서 因此", "그런데 但是", ...baseWords],
      note: "这题的关键不是记住答案，而是判断每个分句在段落里的位置。先找能独立介绍对象的句子，再用连接词和指代关系把后续句子接上。",
      breakdown: "做题顺序：先找主题句，再找承接词；그래서/따라서 前面必须有原因或问题，그런데 后面通常进入转折或问题，것도 表示前面已经出现过同类信息。",
      correctReason: `正确答案是 ${answerLabel}：${answerText}。这个顺序能让主题、原因、结果和补充信息连成完整段落。`,
      traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 的前后逻辑最完整。` : `${option}：至少有一处连接词、时间线或指代关系接不上。`),
      examTip: "排序题要把连接词当作路标，而不是四个句子平均用力硬读。",
    };
  }

  if (question.type === "insert") {
    return {
      translation: "插入句题要先判断给定句的作用：补充原因、承接转折、总结前文，还是引出后文。",
      words: ["주어진 문장 给定句", "들어갈 곳 插入位置", "앞문장 前句", "뒷문장 后句", "하지만 但是", "이에 因此、于是", ...baseWords],
      note: "给定句不能只和前一句顺，还必须能自然接住后一句。尤其要看 하지만、이에、오히려 这类连接词前后是否有足够铺垫。",
      breakdown: `给定句：${question.insert_sentence || "题干给定句"}。先看它是否补足前后逻辑，再判断放在 ${question.options.join(", ")} 的哪一处最顺。`,
      correctReason: `正确位置是 ${answerLabel}：${answerText}。放在这里时，前一句的内容能引出给定句，后一句也能自然继续。`,
      traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 前后衔接完整。` : `${option}：放在这里会让转折、因果或指代关系变突兀。`),
      examTip: "插入句题不要只看前一句；一定同时检查“前一句 + 插入句 + 后一句”三句是否连贯。",
    };
  }

  if (question.question.includes("심정")) {
    return {
      translation: "心情题要抓动作和心理描写，不要只按事件本身判断。题目问的是人物在划线部分表现出的当下情绪。",
      words: ["심정 心情", "설레다 激动期待", "당황스럽다 慌张", "아쉽다 可惜", "그립다 想念", ...baseWords],
      note: "先定位划线附近的心理词和动作描写，再判断情绪方向是期待、紧张、失落还是愤怒。",
      breakdown: "如果出现 가슴이 뛰다、잠이 오지 않다，多为期待兴奋；머릿속이 새하얘지다、얼어붙다，多为惊讶慌张。",
      correctReason: `正确答案是 ${answerLabel}：${answerText}。它最能概括人物在该场景里的即时反应。`,
      traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 与心理描写方向一致。` : `${option}：情绪方向或强度和原文描写不一致。`),
      examTip: "心情题先判正负，再判具体：期待、害怕、尴尬、遗憾、怀念不要混在一起。",
    };
  }

  if (question.question.includes("주제") || question.question.includes("목적") || question.question.includes("태도")) {
    return {
      translation: "主旨、目的、态度题要看全文中心，不要选只覆盖一个例子或一个细节的选项。",
      words: ["주제 主题", "목적 目的", "태도 态度", "핵심 주장 核心主张", "근거 依据", "예시 例子", ...baseWords],
      note: "先找作者最后落到的观点，再回看例子是不是为这个观点服务。正确选项通常能概括问题、理由和作者立场。",
      breakdown: "做题顺序：排除只重复细节的选项；排除原文没说的扩大项；保留能覆盖全文结论和作者态度的选项。",
      correctReason: `正确答案是 ${answerLabel}：${answerText}。它覆盖了文章的核心判断，而不是只抓住局部信息。`,
      traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 能概括全文中心。` : `${option}：要么范围太窄，要么把作者态度说反，要么加入了原文没有的主张。`),
      examTip: "主旨题里的例子是证据，不是答案本身；最后一两句常常藏着作者真正想说的话。",
    };
  }

  if (question.question.includes("제목")) {
    return {
      translation: "标题解释题要把新闻标题里的省略表达补完整，特别注意比喻、惯用语和带引号的关键词。",
      words: ["신문 기사 新闻报道", "제목 标题", "방영 효과 播出效果", "메달 가뭄 奖牌荒", "솜방망이 处罚过轻", ...baseWords],
      note: "标题常把因果和评价压缩成短语。先还原标题含义，再和选项逐项对照有没有添加不存在的信息。",
      breakdown: `标题原句：${cleanContext(question.context).join(" ")}。正确解释要保留标题的核心因果或评价，不额外加原因、对策或结果。`,
      correctReason: `正确答案是 ${answerLabel}：${answerText}。它把标题压缩的信息展开得最准确。`,
      traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 与标题含义一致。` : `${option}：添加了标题没有说的内容，或把评价方向改错。`),
      examTip: "新闻标题题要特别小心“问题发生了”和“问题严重但处罚轻”这种评价差异。",
    };
  }

  if (question.question.includes("내용과 같은")) {
    return {
      translation: "内容一致题要回原文逐项验证。正确项必须被原文直接支持，不能靠常识补出来。",
      words: ["내용 일치 内容一致", "직접 근거 直接依据", "반대 표현 反向表达", "과장 夸大", "누락 遗漏", ...baseWords],
      note: "先找选项里的主语、时间、程度和 가능/불가능，再回原文核对。只要有一个限制词不一致，就排除。",
      breakdown: "同一篇文章的第二题通常考最后一句或核心事实的改写；不要因为某个词眼熟就选，要看整句是否完整对应。",
      correctReason: `正确答案是 ${answerLabel}：${answerText}。它和原文事实方向一致，且没有多加限制。`,
      traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 可以在原文中找到直接依据。` : `${option}：和原文在主语、时间、程度或可能性上不一致。`),
      examTip: "一致题的错项常见套路：把 늘다 改成 줄다，把 가능 改成 불가능，把 일부 改成 전체。",
    };
  }

  return {
    translation: "填空题要先判断空格所在句子的功能：原因、结果、目的、追加说明，还是对前文的概括。",
    words: ["빈칸 填空", "앞뒤 문맥 前后文脉", "원인 原因", "결과 结果", "목적 目的", "핵심어 关键词", ...baseWords],
    note: "先读空格前后各一句，抓住重复出现的关键词。正确答案通常能同时接住前面的原因，也能解释后面的结果。",
    breakdown: "如果空格后出现 때문에，空格内容多半是原因；如果空格前有 위해서이다，要找目的；如果前后列举两个效果，要找追加或概括表达。",
    correctReason: `正确答案是 ${answerLabel}：${answerText}。它最符合空格前后的语义关系。`,
    traps: question.options.map((option, index) => index + 1 === question.answer ? `正确：${option} 能顺畅接住上下文。` : `${option}：语义方向、搭配对象或逻辑关系与上下文不合。`),
    examTip: "填空题不要把选项单独翻译得通就选，要把它放回原句读一遍。",
  };
}

function sourcePageForQuestion(number: number) {
  if (number <= 4) return 3;
  if (number <= 8) return 4;
  if (number <= 10) return 5;
  if (number <= 12) return 6;
  if (number <= 15) return 7;
  if (number <= 18) return 8;
  if (number <= 20) return 9;
  if (number <= 22) return 10;
  if (number <= 24) return 11;
  if (number <= 27) return 12;
  if (number <= 29) return 13;
  if (number <= 31) return 14;
  if (number <= 33) return 15;
  if (number <= 35) return 16;
  if (number <= 37) return 17;
  if (number <= 39) return 18;
  if (number <= 41) return 19;
  if (number <= 43) return 20;
  if (number <= 45) return 21;
  if (number <= 47) return 22;
  return 23;
}

export default function ExamWorkspace({ isPrivate = false, displayName = "体验模式" }: Props) {
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("sentence");
  const [section, setSection] = useState<"reading" | "listening">("reading");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [showPdf, setShowPdf] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const selectedQuestion = topik102Questions[selectedNumber - 1];
  const generatedDetail = useMemo(() => buildGeneratedDetail(selectedQuestion), [selectedQuestion]);
  const detail = detailedNotes[selectedNumber] ?? generatedDetail;
  const answer = answers[selectedNumber] ?? null;
  const submitted = Boolean(submittedQuestions[selectedNumber]);
  const note = notes[selectedNumber] ?? "";
  const answeredCount = topik102Questions.filter((question) => submittedQuestions[question.num]).length;
  const correctScore = topik102Questions.reduce((score, question) => {
    return submittedQuestions[question.num] && answers[question.num] === question.answer ? score + question.points : score;
  }, 0);
  const answerLabel = String.fromCharCode(9311 + selectedQuestion.answer);
  const contextLines = cleanContext(selectedQuestion.context);
  const isVisual = selectedQuestion.type === "image";
  const sourcePage = sourcePageForQuestion(selectedNumber);
  const inlineVisualQuestion = selectedNumber >= 5 && selectedNumber <= 10 ? String(selectedNumber).padStart(2, "0") : null;

  const groupLabel = useMemo(() => selectedQuestion.group || "第 102 回 · 阅读练习", [selectedQuestion.group]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(examProgressStorageKey);
      if (stored) {
        const progress = JSON.parse(stored) as Partial<ExamProgress>;
        setAnswers((progress.answers || {}) as Record<number, number>);
        setSubmittedQuestions((progress.submitted || {}) as Record<number, boolean>);
        setNotes((progress.notes || {}) as Record<number, string>);
        setFlagged(Array.isArray(progress.flagged) ? progress.flagged : []);
      }
    } catch {
      window.localStorage.removeItem(examProgressStorageKey);
    } finally {
      setProgressLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    const progress: ExamProgress = {
      answers: answers as Record<string, number>,
      submitted: submittedQuestions as Record<string, boolean>,
      notes: notes as Record<string, string>,
      flagged,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(examProgressStorageKey, JSON.stringify(progress));
  }, [answers, flagged, notes, progressLoaded, submittedQuestions]);

  const selectQuestion = (number: number) => {
    setSelectedNumber(number);
    setAnalysisTab("sentence");
  };

  const toggleFlagged = (number: number) => {
    setFlagged((items) => items.includes(number) ? items.filter((item) => item !== number) : [...items, number]);
  };

  const clearLocalProgress = () => {
    if (!window.confirm("清空第 102 回在本浏览器保存的答案、标记和笔记？")) return;
    window.localStorage.removeItem(examProgressStorageKey);
    setAnswers({});
    setSubmittedQuestions({});
    setNotes({});
    setFlagged([]);
    setAnalysisTab("sentence");
  };

  return (
    <main className="exam-app">
      <header className="exam-topbar">
        <div className="exam-brand">
          <a href="/" aria-label="返回每日训练">한</a>
          <div><strong>Daily TOPIK Lab</strong><span>真题精练工作台</span></div>
        </div>
        <nav className="exam-primary-nav" aria-label="真题工作台导航">
          <a href="/">原创训练</a>
          <a className="is-active" href={isPrivate ? "/vault" : "/exam-lab"}>真题库</a>
          <a href="#review">错题本</a>
          <a href="#report">成绩分析</a>
        </nav>
        <div className="account-chip">
          <span className={isPrivate ? "status-dot private" : "status-dot"} />
          <div><small>{isPrivate ? "私人空间" : "公开演示"}</small><strong>{displayName}</strong></div>
        </div>
      </header>

      {!isPrivate ? <div className="demo-banner"><span>第 102 回阅读：已整理 50 题，答案与题型均可交互练习。</span><a href="/vault">登录进入我的私人真题库</a></div> : null}

      <div className={`exam-layout ${isLibraryOpen ? "" : "is-library-collapsed"} ${isAnalysisOpen ? "" : "is-analysis-collapsed"}`}>
        <aside className={`exam-library ${isLibraryOpen ? "" : "is-collapsed"}`} aria-label="真题目录">
          <button
            aria-expanded={isLibraryOpen}
            className="side-collapse-toggle"
            onClick={() => setIsLibraryOpen((open) => !open)}
            type="button"
          >
            <span>{isLibraryOpen ? "收起" : "目录"}</span>
          </button>
          {isLibraryOpen ? <>
            <div className="library-heading"><div><span>MY ARCHIVE</span><h1>我的真题</h1></div><button type="button">筛选</button></div>
            <div className="import-status">
              <div><span>已提取</span><strong>第 102 回</strong></div>
              <div className="thin-progress"><span style={{ width: "100%" }} /></div>
              <small>阅读 50/50 题 · 解析工作台已就绪</small>
            </div>
            <div className="exam-set-list">
              {examSets.map((exam, index) => <button className={index === 0 ? "is-active" : ""} key={exam[0]} type="button">
                <div><strong>{exam[0]}</strong><small>{exam[1]} · TOPIK II</small></div><span>{exam[3]}</span>
                <div className="exam-set-progress"><i style={{ width: `${exam[2]}%` }} /></div>
              </button>)}
            </div>
            <div className="library-summary"><span>已整理 1 套</span><strong>第 102 回 · 50 题</strong></div>
          </> : null}
        </aside>

        <section className="question-workspace">
          <div className="workspace-toolbar">
            <div><span>第 102 回 · {section === "reading" ? "阅读" : "听力"}</span><strong>第 {selectedNumber} 题</strong></div>
            <div className="mode-switch"><button className={section === "reading" ? "is-active" : ""} onClick={() => setSection("reading")} type="button">阅读</button><button className={section === "listening" ? "is-active" : ""} onClick={() => setSection("listening")} type="button">听力</button></div>
            <div className="workspace-actions"><button type="button">本机保存</button><button type="button">计时 70:00</button><button className={flagged.includes(selectedNumber) ? "is-flagged" : ""} onClick={() => toggleFlagged(selectedNumber)} type="button">{flagged.includes(selectedNumber) ? "已标记" : "标记"}</button><button onClick={clearLocalProgress} type="button">清空本地记录</button></div>
          </div>

          <article className="question-paper">
            <div className="question-group-label">{groupLabel}</div>
            <div className="question-prompt"><span>{selectedQuestion.num}.</span><div><p>{selectedQuestion.question}</p><small>{inlineVisualQuestion ? "图文材料已截出，可直接看图作答。" : "先独立作答，再打开右侧解析。"}</small></div></div>
            {selectedQuestion.insert_sentence ? <div className="insert-sentence"><span>待插入句</span>{selectedQuestion.insert_sentence}</div> : null}
            {inlineVisualQuestion ? <figure className="inline-exam-visual">
              <figcaption><span>原卷图文</span><strong>第 {selectedNumber} 题材料</strong></figcaption>
              <img alt={`第 ${selectedNumber} 题原卷图文材料`} src={`/exam-assets/topik-102/questions/question-${inlineVisualQuestion}.png`} />
            </figure> : null}
            {contextLines.length ? <div className={`extracted-passage ${isVisual ? "is-visual" : ""}`} lang="ko">
              {isVisual ? <div className="visual-source"><strong>PDF 图文题</strong><span>原卷页面已识别为图文广告 / 图表题</span><small>选项保留在下方，适合先凭原图作答，再核对答案。</small></div> : contextLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
            </div> : null}
            <div className="answer-options">
              {selectedQuestion.options.map((option, index) => <button className={`${answer === index + 1 ? "is-selected" : ""} ${submitted && index + 1 === selectedQuestion.answer ? "is-correct" : ""} ${submitted && answer === index + 1 && index + 1 !== selectedQuestion.answer ? "is-wrong" : ""}`} key={option} onClick={() => { setAnswers((items) => ({ ...items, [selectedNumber]: index + 1 })); setSubmittedQuestions((items) => ({ ...items, [selectedNumber]: false })); }} type="button"><span>{index + 1}</span><p lang="ko">{option}</p></button>)}
            </div>
            <div className="answer-footer"><span>{submitted ? (answer === selectedQuestion.answer ? "回答正确，已保存到本机记录。" : `正确答案是 ${answerLabel}，本机记录已更新。`) : "选择答案后提交，可查看答案、依据和易错点。"}</span><button disabled={answer === null} onClick={() => { setSubmittedQuestions((items) => ({ ...items, [selectedNumber]: true })); setAnalysisTab("answer"); }} type="button">提交答案</button></div>
          </article>

          <div className="question-strip"><button onClick={() => selectQuestion(Math.max(1, selectedNumber - 1))} type="button">上一题</button><div>{topik102Questions.map((question) => {
            const isSubmitted = Boolean(submittedQuestions[question.num]);
            const answerState = isSubmitted ? (answers[question.num] === question.answer ? "correct" : "wrong") : "";
            return <button className={`${question.num === selectedNumber ? "active" : ""} ${answerState} ${flagged.includes(question.num) ? "flagged" : ""}`} onClick={() => selectQuestion(question.num)} key={question.num} type="button">{question.num}</button>;
          })}</div><span>已答 {answeredCount}/50 · 得分 {correctScore}/100</span><button onClick={() => selectQuestion(Math.min(50, selectedNumber + 1))} type="button">下一题</button></div>
        </section>

        <aside className={`exam-analysis ${isAnalysisOpen ? "" : "is-collapsed"}`} aria-label="题目解析">
          <button
            aria-expanded={isAnalysisOpen}
            className="side-collapse-toggle"
            onClick={() => setIsAnalysisOpen((open) => !open)}
            type="button"
          >
            <span>{isAnalysisOpen ? "收起" : "解析"}</span>
          </button>
          {isAnalysisOpen ? <>
            <div className="analysis-tabs"><button className={analysisTab === "sentence" ? "is-active" : ""} onClick={() => setAnalysisTab("sentence")} type="button">词汇语法</button><button className={analysisTab === "answer" ? "is-active" : ""} onClick={() => setAnalysisTab("answer")} type="button">答案分析</button><button className={analysisTab === "notes" ? "is-active" : ""} onClick={() => setAnalysisTab("notes")} type="button">笔记</button></div>
            {analysisTab === "sentence" ? <div className="sentence-analysis">
              <div className="analysis-kicker">QUESTION {selectedNumber} · {selectedQuestion.type === "order" ? "ORDER" : "READING"}</div><p className="analysis-korean" lang="ko">{detail?.translation || "这一题重点考查根据上下文定位信息，并排除表述范围过大的干扰项。"}</p><p className="analysis-chinese">{detail?.note || "先看题干要求，再用连接词、指代和因果关系回到原文定位。长文题不要凭常识选答案，要确认选项是否被原文完整支持。"}</p>
              {detail?.breakdown ? <section><span>句子拆分</span><p className="analysis-detail-text">{detail.breakdown}</p></section> : null}
              {detail?.correctReason ? <section><span>为什么选这个</span><p className="analysis-detail-text">{detail.correctReason}</p></section> : null}
              {detail?.grammar ? <section><span>核心语法</span><strong>{detail.grammar}</strong></section> : null}
              {detail?.traps ? <section><span>选项陷阱</span><div className="analysis-traps">{detail.traps.map((trap) => <p key={trap}>{trap}</p>)}</div></section> : null}
              {detail?.examTip ? <section><span>考场识别</span><strong>{detail.examTip}</strong></section> : null}
              <section><span>重点词汇</span><div className="analysis-word-list">{(detail?.words || ["문맥 根据语境", "근거 依据", "일치하다 一致"]).map((word) => <button key={word} type="button">{word}</button>)}</div></section>
              <button className="review-action" onClick={() => setFlagged((items) => items.includes(selectedNumber) ? items : [...items, selectedNumber])} type="button">加入错题 / 重点复习</button>
            </div> : null}
            {analysisTab === "answer" ? <div className="answer-analysis">
              <div className="correct-answer"><span>正确答案</span><strong>{answerLabel}</strong></div><h2>第 {selectedNumber} 题 · 判断依据</h2><p>{detail?.correctReason || detail?.note || "答案必须同时符合题干要求和原文信息。选项中只要出现原文没有支持的绝对化内容，就应优先排除。"}</p>
              <div className="trap-list">{selectedQuestion.options.map((option, index) => <article key={option}><span>{index + 1 === selectedQuestion.answer ? "✓" : index + 1}</span><div><strong>{index + 1 === selectedQuestion.answer ? "正确选项" : "干扰项"}</strong><p>{detail?.traps?.[index] || (index + 1 === selectedQuestion.answer ? "与原文 / 题干要求完全对应。" : "信息方向、范围或逻辑关系与原文不完全一致。")}</p></div></article>)}</div>
              <button className="mistake-action" onClick={() => toggleFlagged(selectedNumber)} type="button">{flagged.includes(selectedNumber) ? "取消重点标记" : "记录错因：需要回看原文"}</button>
            </div> : null}
            {analysisTab === "notes" ? <div className="note-panel"><label htmlFor="exam-note">这道题记住什么？</label><textarea id="exam-note" onChange={(event) => setNotes((items) => ({ ...items, [selectedNumber]: event.target.value.slice(0, 300) }))} placeholder="例如：온 지 表示经过的时间，后面接 일 년이 됐다。" value={note} /><div><span>{note.length}/300</span><button type="button">已自动保存</button></div></div> : null}
            <div className="source-card"><span>原始文件</span><strong>제102회 · 읽기 · 홀수형</strong><small>已载入项目原页图片 · 当前第 {selectedNumber} 题对应第 {sourcePage} 页</small><button onClick={() => setShowPdf(true)} type="button">对照 PDF 原页</button></div>
          </> : null}
          {showPdf ? <div className="pdf-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPdf(false); }}><section className="pdf-modal" role="dialog" aria-label={`第 ${sourcePage} 页 PDF 原页`} aria-modal="true"><div className="pdf-modal-header"><div><span>原页对照</span><strong>第 {sourcePage} 页 · 第 {selectedNumber} 题</strong></div><button aria-label="关闭 PDF 原页" onClick={() => setShowPdf(false)} type="button">×</button></div><div className="pdf-modal-page"><img alt={`第 ${sourcePage} 页 PDF 原页`} src={`/exam-assets/topik-102/page-${String(sourcePage).padStart(2, "0")}.png`} /></div></section></div> : null}
        </aside>
      </div>
    </main>
  );
}
