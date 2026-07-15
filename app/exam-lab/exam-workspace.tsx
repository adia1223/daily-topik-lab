"use client";

import { useState } from "react";

type Props = { isPrivate?: boolean; displayName?: string };

const examSets = [
  ["第 99 届", "2025.04", 68, "精读中"],
  ["第 98 届", "2024.10", 100, "已完成"],
  ["第 96 届", "2024.07", 31, "练习中"],
  ["第 91 届", "2023.10", 0, "未开始"],
] as const;

const sentences = [
  {
    korean: "기술이 발전할수록 사람들은 더 많은 정보를 짧은 시간 안에 접하게 된다.",
    chinese: "技术越发展，人们越能在短时间内接触到更多信息。",
    grammar: "V-(으)ㄹ수록：越……越……",
    words: ["발전하다 发展", "접하다 接触", "짧은 시간 短时间"],
  },
  {
    korean: "그러나 정보의 양이 늘어나는 것이 반드시 더 나은 판단으로 이어지는 것은 아니다.",
    chinese: "但是，信息量增加并不一定会带来更好的判断。",
    grammar: "반드시 ... 것은 아니다：未必、并不一定",
    words: ["판단 判断", "이어지다 导致、连接", "반드시 一定"],
  },
  {
    korean: "중요한 것은 정보를 얼마나 많이 아느냐가 아니라 서로 다른 관점을 비교하는 능력이다.",
    chinese: "重要的不是知道多少信息，而是比较不同观点的能力。",
    grammar: "A가 아니라 B이다：不是 A，而是 B",
    words: ["관점 观点", "비교하다 比较", "능력 能力"],
  },
];

const options = [
  "정보의 양이 많을수록 판단은 정확해진다.",
  "기술의 발전은 정보 습득을 어렵게 만든다.",
  "좋은 판단에는 다양한 관점을 비교하는 과정이 필요하다.",
  "짧은 시간에 얻은 정보는 대부분 가치가 없다.",
];

export default function ExamWorkspace({ isPrivate = false, displayName = "体验模式" }: Props) {
  const [activeSentence, setActiveSentence] = useState(1);
  const [answer, setAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [analysisTab, setAnalysisTab] = useState<"sentence" | "answer" | "notes">("sentence");
  const [section, setSection] = useState<"reading" | "listening">("reading");
  const [speed, setSpeed] = useState("1.0");
  const [showTranscript, setShowTranscript] = useState(false);
  const [note, setNote] = useState("");
  const selectedSentence = sentences[activeSentence];

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

      {!isPrivate ? <div className="demo-banner"><span>无版权示例：体验 PDF 提取后的完整练习方式。</span><a href="/vault">登录进入我的私人真题库</a></div> : null}

      <div className="exam-layout">
        <aside className="exam-library" aria-label="真题目录">
          <div className="library-heading"><div><span>MY ARCHIVE</span><h1>我的真题</h1></div><button type="button">筛选</button></div>
          <button className="import-button" type="button"><span>＋</span><div><strong>导入一套真题</strong><small>PDF + MP3 自动拆分</small></div></button>
          <div className="import-status">
            <div><span>正在提取</span><strong>第 100 届</strong></div>
            <div className="thin-progress"><span style={{ width: "72%" }} /></div>
            <small>已识别 36/50 题 · 正在匹配听力时间轴</small>
          </div>
          <div className="exam-set-list">
            {examSets.map((exam, index) => <button className={index === 0 ? "is-active" : ""} key={exam[0]} type="button">
              <div><strong>{exam[0]}</strong><small>{exam[1]} · TOPIK II</small></div><span>{exam[3]}</span>
              <div className="exam-set-progress"><i style={{ width: `${exam[2]}%` }} /></div>
            </button>)}
          </div>
          <div className="library-summary"><span>已导入 14 套</span><strong>完成 3 套</strong></div>
        </aside>

        <section className="question-workspace">
          <div className="workspace-toolbar">
            <div><span>第 99 届 · {section === "reading" ? "阅读" : "听力"}</span><strong>第 33 题</strong></div>
            <div className="mode-switch"><button className={section === "reading" ? "is-active" : ""} onClick={() => setSection("reading")} type="button">阅读</button><button className={section === "listening" ? "is-active" : ""} onClick={() => setSection("listening")} type="button">听力</button></div>
            <div className="workspace-actions"><button type="button">计时 02:18</button><button type="button">标记</button></div>
          </div>

          {section === "listening" ? <div className="audio-workbench">
            <button className="play-button" type="button" aria-label="播放听力">▶</button>
            <div className="audio-track"><div><span style={{ width: "38%" }} /></div><small>00:34 / 01:28</small></div>
            <button type="button">-5s</button><button type="button">A-B 循环</button>
            <select aria-label="播放速度" value={speed} onChange={(event) => setSpeed(event.target.value)}><option value="0.8">0.8×</option><option value="1.0">1.0×</option><option value="1.2">1.2×</option></select>
            <button onClick={() => setShowTranscript((value) => !value)} type="button">{showTranscript ? "隐藏原文" : "显示原文"}</button>
          </div> : null}

          <article className="question-paper">
            <div className="question-prompt"><span>33.</span><div><p>다음을 읽고 글의 중심 생각을 고르십시오.</p><small>阅读下文，选择文章的中心思想。</small></div></div>
            <div className="extracted-passage" lang="ko">
              {section === "listening" && !showTranscript ? <div className="transcript-hidden"><strong>听力原文已隐藏</strong><span>先完整听一遍，再按需打开逐句原文。</span></div> : sentences.map((sentence, index) => <button className={activeSentence === index ? "is-active" : ""} key={sentence.korean} onClick={() => { setActiveSentence(index); setAnalysisTab("sentence"); }} type="button"><span>{index + 1}</span>{sentence.korean}</button>)}
            </div>
            <div className="answer-options">
              {options.map((option, index) => <button className={`${answer === index ? "is-selected" : ""} ${showResult && index === 2 ? "is-correct" : ""} ${showResult && answer === index && index !== 2 ? "is-wrong" : ""}`} key={option} onClick={() => { setAnswer(index); setShowResult(false); }} type="button"><span>{index + 1}</span><p lang="ko">{option}</p></button>)}
            </div>
            <div className="answer-footer"><span>{showResult ? (answer === 2 ? "回答正确。主旨落在“比较不同观点”。" : "再看第 2、3 句的转折与对照。") : "选择答案后提交，可查看选项陷阱。"}</span><button disabled={answer === null} onClick={() => { setShowResult(true); setAnalysisTab("answer"); }} type="button">提交答案</button></div>
          </article>

          <div className="question-strip"><button type="button">上一题</button><div>{[31, 32, 33, 34, 35, 36].map((number) => <button className={number < 33 ? "done" : number === 33 ? "active" : number === 36 ? "flagged" : ""} key={number} type="button">{number}</button>)}</div><span>进度 2/6</span><button type="button">下一题</button></div>
        </section>

        <aside className="exam-analysis" aria-label="题目解析">
          <div className="analysis-tabs"><button className={analysisTab === "sentence" ? "is-active" : ""} onClick={() => setAnalysisTab("sentence")} type="button">逐句解析</button><button className={analysisTab === "answer" ? "is-active" : ""} onClick={() => setAnalysisTab("answer")} type="button">选项分析</button><button className={analysisTab === "notes" ? "is-active" : ""} onClick={() => setAnalysisTab("notes")} type="button">笔记</button></div>
          {analysisTab === "sentence" ? <div className="sentence-analysis">
            <div className="analysis-kicker">SENTENCE {activeSentence + 1}</div><p className="analysis-korean" lang="ko">{selectedSentence.korean}</p><p className="analysis-chinese">{selectedSentence.chinese}</p>
            <section><span>核心语法</span><strong>{selectedSentence.grammar}</strong></section>
            <section><span>重点词汇</span><div className="analysis-word-list">{selectedSentence.words.map((word) => <button key={word} type="button">{word}</button>)}</div></section>
            <button className="review-action" type="button">加入复习队列</button>
          </div> : null}
          {analysisTab === "answer" ? <div className="answer-analysis">
            <div className="correct-answer"><span>正确答案</span><strong>③</strong></div><h2>中心思想题</h2><p>第二句先否定“信息越多，判断越好”，第三句用 <b>아니라</b> 提出作者真正强调的观点。</p>
            <div className="trap-list"><article><span>①</span><div><strong>反向干扰</strong><p>与第二句“并不一定”相反。</p></div></article><article><span>②</span><div><strong>无中生有</strong><p>文章没有说获取信息更难。</p></div></article><article><span>④</span><div><strong>过度推断</strong><p>原文没有否定短时间信息的价值。</p></div></article></div>
            <button className="mistake-action" type="button">记录错因：主旨判断偏了</button>
          </div> : null}
          {analysisTab === "notes" ? <div className="note-panel"><label htmlFor="exam-note">这道题记住什么？</label><textarea id="exam-note" onChange={(event) => setNote(event.target.value)} placeholder="例如：看到 A가 아니라 B 时，主旨通常落在 B..." value={note} /><div><span>{note.length}/300</span><button type="button">保存笔记</button></div></div> : null}
          <div className="source-card"><span>原始文件</span><strong>TOPIK_99_reading.pdf</strong><small>第 8 页 · OCR 置信度 98%</small><button type="button">对照 PDF 原页</button></div>
        </aside>
      </div>
    </main>
  );
}
