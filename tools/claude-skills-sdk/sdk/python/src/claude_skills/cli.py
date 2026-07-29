from __future__ import annotations

import argparse
import sys

from claude_skills.client import Skills


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="claude-skills", description="Distributable Claude skills CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="List bundled skill ids")

    show = sub.add_parser("show", help="Print one skill's prompt to stdout")
    show.add_argument("skill_id")

    compose = sub.add_parser("compose", help="Concatenate multiple skills as a system prompt")
    compose.add_argument("skill_ids", nargs="+")

    args = parser.parse_args(argv)
    s = Skills()

    if args.cmd == "list":
        for sid in s.list():
            print(sid)
        return 0

    if args.cmd == "show":
        print(s.get(args.skill_id).prompt)
        return 0

    if args.cmd == "compose":
        print(s.compose(args.skill_ids))
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
