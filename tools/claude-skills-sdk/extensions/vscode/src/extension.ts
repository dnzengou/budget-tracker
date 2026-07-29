import * as vscode from "vscode";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface SkillMeta {
  id: string;
  name: string;
  file: string;
  category: string;
  tags: string[];
  overlay: boolean;
}

function loadIndex(ctx: vscode.ExtensionContext): SkillMeta[] {
  const raw = readFileSync(join(ctx.extensionPath, "skills", "index.json"), "utf-8");
  return (JSON.parse(raw) as { skills: SkillMeta[] }).skills;
}

function readSkill(ctx: vscode.ExtensionContext, meta: SkillMeta): string {
  return readFileSync(join(ctx.extensionPath, "skills", meta.file), "utf-8");
}

async function pickSkill(ctx: vscode.ExtensionContext, canPickMany: boolean) {
  const index = loadIndex(ctx);
  const items = index.map((s) => ({
    label: s.id,
    description: s.name,
    detail: s.tags.join(" · "),
    meta: s,
  }));
  return vscode.window.showQuickPick(items, {
    canPickMany,
    placeHolder: canPickMany ? "Select skills to compose" : "Select a skill to insert",
  });
}

export function activate(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("claudeSkills.list", () => {
      const ids = loadIndex(ctx).map((s) => s.id).join(", ");
      vscode.window.showInformationMessage(`Bundled: ${ids}`);
    }),

    vscode.commands.registerCommand("claudeSkills.insert", async () => {
      const picked = await pickSkill(ctx, false);
      if (!picked || Array.isArray(picked)) return;
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = readSkill(ctx, picked.meta);
      editor.edit((eb) => eb.insert(editor.selection.active, text));
    }),

    vscode.commands.registerCommand("claudeSkills.compose", async () => {
      const picked = await pickSkill(ctx, true);
      if (!picked || !Array.isArray(picked) || picked.length === 0) return;
      const composed = picked.map((p) => readSkill(ctx, p.meta)).join("\n\n---\n\n");
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        const doc = await vscode.workspace.openTextDocument({ content: composed, language: "markdown" });
        vscode.window.showTextDocument(doc);
        return;
      }
      editor.edit((eb) => eb.insert(editor.selection.active, composed));
    })
  );
}

export function deactivate() {}
