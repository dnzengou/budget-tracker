#!/usr/bin/env node
import { list, get, compose } from "./index.js";

async function main(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv;

  if (cmd === "list") {
    for (const id of await list()) console.log(id);
    return 0;
  }

  if (cmd === "show" && rest[0]) {
    console.log((await get(rest[0])).prompt);
    return 0;
  }

  if (cmd === "compose" && rest.length) {
    console.log(await compose(rest));
    return 0;
  }

  console.error("usage: claude-skills <list | show <id> | compose <id> [<id>...]>");
  return 1;
}

main(process.argv.slice(2)).then((code) => process.exit(code));
