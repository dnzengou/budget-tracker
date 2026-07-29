from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from importlib.resources import files
from typing import Iterable


@dataclass(frozen=True)
class Skill:
    id: str
    name: str
    file: str
    category: str
    tags: tuple[str, ...]
    overlay: bool
    prompt: str


class Skills:
    """Load and compose bundled skill prompts."""

    def __init__(self) -> None:
        self._root = files("claude_skills") / "_skills"

    @lru_cache(maxsize=1)
    def _index(self) -> list[dict]:
        return json.loads((self._root / "index.json").read_text(encoding="utf-8"))["skills"]

    def list(self) -> list[str]:
        return [s["id"] for s in self._index()]

    def get(self, skill_id: str) -> Skill:
        for s in self._index():
            if s["id"] == skill_id:
                prompt = (self._root / s["file"]).read_text(encoding="utf-8")
                return Skill(
                    id=s["id"],
                    name=s["name"],
                    file=s["file"],
                    category=s["category"],
                    tags=tuple(s["tags"]),
                    overlay=s["overlay"],
                    prompt=prompt,
                )
        raise KeyError(f"skill not found: {skill_id}")

    def compose(self, skill_ids: Iterable[str], separator: str = "\n\n---\n\n") -> str:
        return separator.join(self.get(sid).prompt for sid in skill_ids)
