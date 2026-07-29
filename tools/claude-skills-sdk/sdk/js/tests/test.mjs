import { test } from "node:test";
import assert from "node:assert/strict";
import { list, get, compose } from "../dist/index.js";

test("list includes all six skills", async () => {
  const ids = new Set(await list());
  for (const expected of ["arm", "rrss", "kafca", "kafcade", "devflow", "evolve"]) {
    assert.ok(ids.has(expected), `missing skill: ${expected}`);
  }
});

test("get returns prompt text", async () => {
  const s = await get("kafca");
  assert.equal(s.id, "kafca");
  assert.ok(s.prompt.includes("KafCa"));
});

test("compose concatenates with separator", async () => {
  const out = await compose(["rrss", "kafca"]);
  assert.ok(out.includes("RRSS"));
  assert.ok(out.includes("KafCa"));
  assert.ok(out.includes("---"));
});
