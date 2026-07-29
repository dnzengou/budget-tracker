# @claude-skills/core (JS / TS)

```bash
npm i @claude-skills/core
```

## Quickstart

```ts
import { list, get, compose } from "@claude-skills/core";

console.log(await list());                     // ['arm', 'rrss', ...]
console.log((await get("kafca")).prompt);
const system = await compose(["rrss", "kafca"]);
```

## With Anthropic SDK

```ts
import Anthropic from "@anthropic-ai/sdk";
import { compose } from "@claude-skills/core";

const client = new Anthropic();
const system = await compose(["kafca", "rrss"]);
const reply = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  system,
  messages: [{ role: "user", content: "B+P+D worldmodel-geosim" }],
});
```

## CLI

```bash
claude-skills list
claude-skills show kafca
claude-skills compose rrss kafca > system.txt
```
