import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the TOPIK reading archive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Daily TOPIK Lab \| 韩语阅读训练<\/title>/i);
  assert.match(html, /每日文章归档/);
  assert.match(html, /공공 도서관의 디지털 서비스는 누구를 위한 것인가/);
  assert.match(html, /학교 밖 청소년 지원은 왜 지역의 일이 되는가/);
  assert.match(html, /작은 자동 결제는 왜 큰 부담이 되는가/);
  assert.match(html, /밤길 안전은 누구의 책임인가/);
  assert.match(html, /직장에서 침묵은 언제 문제가 되는가/);
  assert.match(html, /도시의 빗물은 버려지는 물인가/);
  assert.match(html, /공공 서비스의 인공지능은 어디까지 결정해야 하는가/);
  assert.match(html, /지역 축제의 성공은 방문객 수로 판단되는가/);
  assert.match(html, /성인 재교육은 누구의 책임인가/);
  assert.match(html, /중고 거래 시장은 소비 문화를 어떻게 바꾸는가/);
  assert.match(html, /데이터 센터의 물 사용은 누구에게 설명되어야 하는가/);
  assert.match(html, /원격 근무의 평가는 무엇으로 이루어져야 하는가/);
  assert.match(html, /지역 서점은 왜 문화 정책의 대상인가/);
  assert.match(html, /돌봄 노동의 가치는 어떻게 보상될 것인가/);
  assert.match(html, /지역 의료 공백은 어떻게 메울 것인가/);
  assert.match(html, /폭염 시대의 냉방권은 복지인가/);
  assert.match(html, /알고리즘 추천은 누구의 책임인가/);
  assert.match(html, /디지털 전시는 원작을 대신할 수 있는가/);
  assert.match(html, /편리함 뒤에 숨은 구독의 비용/);
  assert.match(html, /회의가 길어지는 조직의 공통점/);
  assert.match(html, /도시의 탄소 예산은 누구의 몫인가/);
  assert.match(html, /인공지능 시대의 질문하는 능력/);
  assert.match(html, /도시의 조용한 변화/);
  assert.match(html, /23<!-- --> 篇文章/);
  assert.match(html, /打开全文/);
});

test("server-renders the interactive exam lab", async () => {
  const response = await render("/exam-lab");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /真题精练工作台/);
  assert.match(html, /第 102 回/);
  assert.match(html, /目录/);
  assert.match(html, /解析/);
  assert.match(html, /清空本地记录/);
  assert.match(html, /登录进入我的私人真题库/);
  assert.doesNotMatch(html, /阅读 50\/50 题/);
  assert.doesNotMatch(html, /词汇语法/);
  assert.doesNotMatch(html, /答案分析/);
  assert.doesNotMatch(html, /对照 PDF 原页/);
  assert.doesNotMatch(html, /导入一套真题/);
  assert.doesNotMatch(html, /第 99 回/);
  assert.doesNotMatch(html, /已导入 15 套/);
});

test("keeps complete archived reading data in the client", async () => {
  const page = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /const readingArchive: DailyReading\[\]/);
  assert.match(page, /openArchivedReading/);
  assert.match(page, /activeReading\.tokens/);
  assert.match(page, /activeReading\.grammarPoints/);
  assert.match(page, /activeReading\.quiz/);
  assert.match(page, /activeReading\.writingDrill/);
});

test("embeds original PDF page images for early visual exam questions", async () => {
  const workspace = await readFile(
    new URL("../app/exam-lab/exam-workspace.tsx", import.meta.url),
    "utf8",
  );

  assert.match(workspace, /selectedNumber >= 5 && selectedNumber <= 10/);
  assert.match(workspace, /inline-exam-visual/);
  assert.match(workspace, /\/exam-assets\/topik-102\/questions\/question-/);
});

test("distinguishes correct and wrong submitted questions in answer strip", async () => {
  const workspace = await readFile(
    new URL("../app/exam-lab/exam-workspace.tsx", import.meta.url),
    "utf8",
  );
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(workspace, /answers\[question\.num\] === question\.answer \? "correct" : "wrong"/);
  assert.match(css, /\.question-strip > div button\.correct/);
  assert.match(css, /\.question-strip > div button\.wrong/);
});

test("keeps detailed explanations for early visual exam questions", async () => {
  const workspace = await readFile(
    new URL("../app/exam-lab/exam-workspace.tsx", import.meta.url),
    "utf8",
  );

  assert.match(workspace, /발이 편하다、가볍다、디자인/);
  assert.match(workspace, /더러워진 옷、새 옷처럼、두꺼운 이불/);
  assert.match(workspace, /달리기 是行为，활기찬 내일 是目的/);
  assert.match(workspace, /날짜\/인원 선택 -> 다음 -> 좌석 선택 -> 결제/);
  assert.match(workspace, /그림책 읽어 주는 자원봉사자 모집/);
  assert.match(workspace, /가격 48 > 다양성 25 > 회사 규모 16 > 이용 후기 9 > 기타 2/);
});

test("keeps detailed explanations for mid exam questions", async () => {
  const workspace = await readFile(
    new URL("../app/exam-lab/exam-workspace.tsx", import.meta.url),
    "utf8",
  );

  assert.match(workspace, /우표 박물관/);
  assert.match(workspace, /김 경위는 휴일에 산을 오르던 중 발견했고 신고也是他打的/);
  assert.match(workspace, /正确顺序是 \(나\)-\(라\)-\(가\)-\(다\)/);
  assert.match(workspace, /밤새 -> 아침에/);
  assert.match(workspace, /现象 -> 问题 -> 问题加深 -> 对策/);
  assert.match(workspace, /먹잇감에 몰래 다가갈/);
  assert.match(workspace, /운전자와 방문객 간에 다투는 일도 잦아지고 있다/);
});

test("maps TOPIK questions to the correct original PDF page image", async () => {
  const workspace = await readFile(
    new URL("../app/exam-lab/exam-workspace.tsx", import.meta.url),
    "utf8",
  );

  assert.match(workspace, /if \(number <= 10\) return 5;/);
  assert.match(workspace, /if \(number <= 12\) return 6;/);
  assert.match(workspace, /if \(number <= 15\) return 7;/);
  assert.match(workspace, /if \(number <= 18\) return 8;/);
  assert.match(workspace, /if \(number <= 22\) return 10;/);
  assert.match(workspace, /if \(number <= 47\) return 22;/);
  assert.match(workspace, /return 23;/);
});

test("keeps the exam workspace height-bound with scrollable panels", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.exam-layout \{[\s\S]*height: calc\(100vh - 72px\)/);
  assert.match(css, /\.exam-analysis \{[\s\S]*overflow-y: auto/);
  assert.match(css, /\.question-workspace \{[\s\S]*height: 100%/);
  assert.match(css, /\.question-paper \{[\s\S]*overflow: auto/);
});
