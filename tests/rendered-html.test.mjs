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
