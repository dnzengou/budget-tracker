import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export interface SkillMeta {
  id: string;
  name: string;
  file: string;
  category: string;
  tags: string[];
  overlay: boolean;
}

export interface Skill extends SkillMeta {
  prompt: string;
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");

let indexCache: SkillMeta[] | null = null;

async function loadIndex(): Promise<SkillMeta[]> {
  if (indexCache) return indexCache;
  const raw = await readFile(join(ROOT, "index.json"), "utf-8");
  indexCache = (JSON.parse(raw) as { skills: SkillMeta[] }).skills;
  return indexCache;
}

export async function list(): Promise<string[]> {
  return (await loadIndex()).map((s) => s.id);
}

export async function get(skillId: string): Promise<Skill> {
  const index = await loadIndex();
  const meta = index.find((s) => s.id === skillId);
  if (!meta) throw new Error(`skill not found: ${skillId}`);
  const prompt = await readFile(join(ROOT, meta.file), "utf-8");
  return { ...meta, prompt };
}

export async function compose(skillIds: string[], separator = "\n\n---\n\n"): Promise<string> {
  const parts = await Promise.all(skillIds.map((id) => get(id).then((s) => s.prompt)));
  return parts.join(separator);
}
