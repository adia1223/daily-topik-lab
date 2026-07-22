"use client";

import { useMemo, useState } from "react";
import { topik102Questions } from "./topik102-data";

type Props = { isPrivate?: boolean; displayName?: string };
type AnalysisTab = "sentence" | "answer" | "notes";

const examSets = [
  ["第 102 回", "2025.10", 0, "待精读"],
  ["第 99 回", "2025.04", 68, "精读中"],
  ["第 98 回", "2024.10", 100, "已完成"],
  ["第 96 回", "2024.07", 31, "练习中"],
] as const;

const detailedNotes: Record<number, { translation?: string; grammar?: string; words: string[]; note: string }> = {
  1: { translation: "搬到这个社区已经一年了。", grammar: "V-(으)ㄴ 지 + 기간이 되다：做某事已经经过一段时间。", words: ["이사하다 搬家", "온 지 自从来到", "일 년이 되다 已经一年"], note: "온 지 是 오다 的定语形加 지，后面接时间长度；句子表达从搬来至今的经过时间。" },
  2: { translation: "到了秋天，树叶的颜色逐渐变红。", grammar: "V-아/어 가다：变化朝着某个方向逐渐发展。", words: ["가을이 되면서 随着进入秋天", "나뭇잎 树叶", "점점 逐渐", "붉게 红红地"], note: "점점 与 변해 간다 一起表示变化过程正在持续，不能用表示意愿或假设的选项。" },
  3: { translation: "现在不出发的话，可能会迟到。", grammar: "V-(으)ㄹ지도 모르다：可能……，表示不确定推测。", words: ["출발하다 出发", "약속 시간 约定时间", "늦다 迟到"], note: "늦을 수도 있다 与 늦을지도 모른다 都表示可能性，④是最接近的同义表达。" },
  4: { translation: "农产品价格正如专家预想的那样在下降。", grammar: "V-(으)ㄴ 대로：按照……的样子、正如……所预料。", words: ["전문가 专家", "예상하다 预想", "농산물 农产品", "떨어지다 下降"], note: "예상한 것과 같이 直接对应“和预想的一样”，④正确。" },
  5: { translation: "广告介绍的是鞋子。", words: ["걷다 走路", "발이 편하다 脚舒服", "가볍다 轻便", "구두 皮鞋"], note: "抓住 걷을 때 발이 편하게 和 디자인 단서，判断对象是 구두。" },
  6: { translation: "横幅介绍的是洗衣店。", words: ["더러워진 옷 脏衣服", "새 옷처럼 像新衣服一样", "두꺼운 이불 厚被子", "맡기다 托付、送洗"], note: "衣物和厚被子都可以 맡기다，服务场所是 세탁소。" },
  7: { translation: "海报介绍的是健康管理。", words: ["달리기 跑步", "활기찬 有活力的", "건강 관리 健康管理"], note: "달리기 和 활기찬 내일 指向通过运动管理健康，而非节电或环保。" },
  8: { translation: "说明的是演出购票方法。", grammar: "-고 나서 / -(으)ㄴ 후에：完成前项后进行后项。", words: ["공연 演出", "날짜 日期", "좌석 座位", "결제하다 结算、付款"], note: "先选择日期和人数，再选座位并付款，内容是 예매 방법。" },
};

function cleanContext(context: string | string[]) {
  return Array.isArray(context) ? context : context ? [context] : [];
}

export default function ExamWorkspace({ isPrivate = false, displayName = "体验模式" }: Props) {
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("sentence");
  const [section, setSection] = useState<"reading" | "listening">("reading");
  const [note, setNote] = useState("");
  const [flagged, setFlagged] = useState<number[]>([]);
  const selectedQuestion = topik102Questions[selectedNumber - 1];
  const detail = detailedNotes[selectedNumber];
  const answeredCount = submitted ? 1 : 0;
  const correctCount = submitted && answer === selectedQuestion.answer ? 1 : 0;
  const answerLabel = String.fromCharCode(9311 + selectedQuestion.answer);
  const contextLines = cleanContext(selectedQuestion.context);
  const isVisual = selectedQuestion.type === "image";

  const groupLabel = useMemo(() => selectedQuestion.group || "第 102 回 · 阅读练习", [selectedQuestion.group]);

  const selectQuestion = (number: number) => {
    setSelectedNumber(number);
    setAnswer(null);
    setSubmitted(false);
    setAnalysisTab("sentence");
    setNote("");
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

      <div className="exam-layout">
        <aside className="exam-library" aria-label="真题目录">
          <div className="library-heading"><div><span>MY ARCHIVE</span><h1>我的真题</h1></div><button type="button">筛选</button></div>
          <button className="import-button" type="button"><span>＋</span><div><strong>导入一套真题</strong><small>PDF + MP3 自动拆分</small></div></button>
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
          <div className="library-summary"><span>已导入 15 套</span><strong>第 102 回 · 50 题</strong></div>
        </aside>

        <section className="question-workspace">
          <div className="workspace-toolbar">
            <div><span>第 102 回 · {section === "reading" ? "阅读" : "听力"}</span><strong>第 {selectedNumber} 题</strong></div>
            <div className="mode-switch"><button className={section === "reading" ? "is-active" : ""} onClick={() => setSection("reading")} type="button">阅读</button><button className={section === "listening" ? "is-active" : ""} onClick={() => setSection("listening")} type="button">听力</button></div>
            <div className="workspace-actions"><button type="button">计时 70:00</button><button className={flagged.includes(selectedNumber) ? "is-flagged" : ""} onClick={() => setFlagged((items) => items.includes(selectedNumber) ? items.filter((item) => item !== selectedNumber) : [...items, selectedNumber])} type="button">{flagged.includes(selectedNumber) ? "已标记" : "标记"}</button></div>
          </div>

          <article className="question-paper">
            <div className="question-group-label">{groupLabel}</div>
            <div className="question-prompt"><span>{selectedQuestion.num}.</span><div><p>{selectedQuestion.question}</p><small>{isVisual ? "扫描版图文题：请对照你提供的 PDF 原卷第 2 页。" : "先独立作答，再打开右侧解析。"}</small></div></div>
            {selectedQuestion.insert_sentence ? <div className="insert-sentence"><span>待插入句</span>{selectedQuestion.insert_sentence}</div> : null}
            {contextLines.length ? <div className={`extracted-passage ${isVisual ? "is-visual" : ""}`} lang="ko">
              {isVisual ? <div className="visual-source"><strong>PDF 图文题</strong><span>原卷页面已识别为图文广告 / 图表题</span><small>选项保留在下方，适合先凭原图作答，再核对答案。</small></div> : contextLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
            </div> : null}
            <div className="answer-options">
              {selectedQuestion.options.map((option, index) => <button className={`${answer === index + 1 ? "is-selected" : ""} ${submitted && index + 1 === selectedQuestion.answer ? "is-correct" : ""} ${submitted && answer === index + 1 && index + 1 !== selectedQuestion.answer ? "is-wrong" : ""}`} key={option} onClick={() => { setAnswer(index + 1); setSubmitted(false); }} type="button"><span>{index + 1}</span><p lang="ko">{option}</p></button>)}
            </div>
            <div className="answer-footer"><span>{submitted ? (answer === selectedQuestion.answer ? "回答正确，已掌握本题判断路径。" : `正确答案是 ${answerLabel}，打开右侧看解析。`) : "选择答案后提交，可查看答案、依据和易错点。"}</span><button disabled={answer === null} onClick={() => { setSubmitted(true); setAnalysisTab("answer"); }} type="button">提交答案</button></div>
          </article>

          <div className="question-strip"><button onClick={() => selectQuestion(Math.max(1, selectedNumber - 1))} type="button">上一题</button><div>{topik102Questions.map((question) => <button className={`${question.num === selectedNumber ? "active" : ""} ${question.num < selectedNumber ? "done" : ""} ${flagged.includes(question.num) ? "flagged" : ""}`} onClick={() => selectQuestion(question.num)} key={question.num} type="button">{question.num}</button>)}</div><span>已答 {answeredCount}/50 · 得分 {correctCount * selectedQuestion.points}/100</span><button onClick={() => selectQuestion(Math.min(50, selectedNumber + 1))} type="button">下一题</button></div>
        </section>

        <aside className="exam-analysis" aria-label="题目解析">
          <div className="analysis-tabs"><button className={analysisTab === "sentence" ? "is-active" : ""} onClick={() => setAnalysisTab("sentence")} type="button">词汇语法</button><button className={analysisTab === "answer" ? "is-active" : ""} onClick={() => setAnalysisTab("answer")} type="button">答案分析</button><button className={analysisTab === "notes" ? "is-active" : ""} onClick={() => setAnalysisTab("notes")} type="button">笔记</button></div>
          {analysisTab === "sentence" ? <div className="sentence-analysis">
            <div className="analysis-kicker">QUESTION {selectedNumber} · {selectedQuestion.type === "order" ? "ORDER" : "READING"}</div><p className="analysis-korean" lang="ko">{detail?.translation || "这一题重点考查根据上下文定位信息，并排除表述范围过大的干扰项。"}</p><p className="analysis-chinese">{detail?.note || "先看题干要求，再用连接词、指代和因果关系回到原文定位。长文题不要凭常识选答案，要确认选项是否被原文完整支持。"}</p>
            {detail?.grammar ? <section><span>核心语法</span><strong>{detail.grammar}</strong></section> : null}
            <section><span>重点词汇</span><div className="analysis-word-list">{(detail?.words || ["문맥 根据语境", "근거 依据", "일치하다 一致"]).map((word) => <button key={word} type="button">{word}</button>)}</div></section>
            <button className="review-action" onClick={() => setFlagged((items) => items.includes(selectedNumber) ? items : [...items, selectedNumber])} type="button">加入错题 / 重点复习</button>
          </div> : null}
          {analysisTab === "answer" ? <div className="answer-analysis">
            <div className="correct-answer"><span>正确答案</span><strong>{answerLabel}</strong></div><h2>第 {selectedNumber} 题 · 判断依据</h2><p>{detail?.note || "答案必须同时符合题干要求和原文信息。选项中只要出现原文没有支持的绝对化内容，就应优先排除。"}</p>
            <div className="trap-list">{selectedQuestion.options.map((option, index) => <article key={option}><span>{index + 1 === selectedQuestion.answer ? "✓" : index + 1}</span><div><strong>{index + 1 === selectedQuestion.answer ? "正确选项" : "干扰项"}</strong><p>{index + 1 === selectedQuestion.answer ? "与原文 / 题干要求完全对应。" : "信息方向、范围或逻辑关系与原文不完全一致。"}</p></div></article>)}</div>
            <button className="mistake-action" onClick={() => setFlagged((items) => items.includes(selectedNumber) ? items.filter((item) => item !== selectedNumber) : [...items, selectedNumber])} type="button">{flagged.includes(selectedNumber) ? "取消重点标记" : "记录错因：需要回看原文"}</button>
          </div> : null}
          {analysisTab === "notes" ? <div className="note-panel"><label htmlFor="exam-note">这道题记住什么？</label><textarea id="exam-note" onChange={(event) => setNote(event.target.value)} placeholder="例如：온 지 表示经过的时间，后面接 일 년이 됐다。" value={note} /><div><span>{note.length}/300</span><button type="button">保存笔记</button></div></div> : null}
          <div className="source-card"><span>原始文件</span><strong>제102회 · 읽기 · 홀수형</strong><small>扫描版 PDF · 当前第 {selectedNumber} 题</small><button type="button">对照 PDF 原页</button></div>
        </aside>
      </div>
    </main>
  );
}
