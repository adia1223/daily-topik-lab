import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  assert.match(html, /인공지능 시대의 질문하는 능력/);
  assert.match(html, /도시의 조용한 변화/);
  assert.match(html, /2<!-- --> 篇文章/);
  assert.match(html, /打开全文/);
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
