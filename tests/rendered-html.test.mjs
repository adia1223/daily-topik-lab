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
  assert.match(html, /알고리즘 추천은 누구의 책임인가/);
  assert.match(html, /디지털 전시는 원작을 대신할 수 있는가/);
  assert.match(html, /편리함 뒤에 숨은 구독의 비용/);
  assert.match(html, /회의가 길어지는 조직의 공통점/);
  assert.match(html, /도시의 탄소 예산은 누구의 몫인가/);
  assert.match(html, /인공지능 시대의 질문하는 능력/);
  assert.match(html, /도시의 조용한 변화/);
  assert.match(html, /7<!-- --> 篇文章/);
  assert.match(html, /打开全文/);
});

test("server-renders the interactive exam lab", async () => {
  const response = await render("/exam-lab");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /真题精练工作台/);
  assert.match(html, /PDF \+ MP3 自动拆分/);
  assert.match(html, /逐句解析/);
  assert.match(html, /选项分析/);
  assert.match(html, />听力<\/button>/);
  assert.match(html, /登录进入我的私人真题库/);
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
