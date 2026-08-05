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
};

function cleanContext(context: string | string[]) {
  return Array.isArray(context) ? context : context ? [context] : [];
}

function sourcePageForQuestion(number: number) {
  if (number <= 4) return 3;
  if (number <= 8) return 4;
  if (number <= 12) return 5;
  if (number <= 15) return 6;
  if (number <= 18) return 7;
  if (number <= 22) return 8;
  if (number <= 24) return 9;
  if (number <= 27) return 10;
  if (number <= 31) return 11;
  if (number <= 34) return 12;
  if (number <= 38) return 14;
  if (number <= 41) return 16;
  if (number <= 43) return 17;
  if (number <= 45) return 18;
  if (number <= 47) return 19;
  return 20;
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
  const detail = detailedNotes[selectedNumber];
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
