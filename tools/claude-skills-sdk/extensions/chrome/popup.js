const SELECTED_KEY = "claudeSkills.selected";

async function loadIndex() {
  const url = chrome.runtime.getURL("skills/index.json");
  return (await (await fetch(url)).json()).skills;
}

async function loadSkill(file) {
  const url = chrome.runtime.getURL(`skills/${file}`);
  return await (await fetch(url)).text();
}

async function compose(selectedIds, index) {
  const parts = [];
  for (const id of selectedIds) {
    const meta = index.find((s) => s.id === id);
    if (meta) parts.push(await loadSkill(meta.file));
  }
  return parts.join("\n\n---\n\n");
}

function renderPicker(index, selected) {
  const root = document.getElementById("picker");
  root.innerHTML = "";
  for (const s of index) {
    const label = document.createElement("label");
    label.textContent = s.id;
    label.className = selected.has(s.id) ? "on" : "";
    label.addEventListener("click", () => {
      if (selected.has(s.id)) selected.delete(s.id);
      else selected.add(s.id);
      chrome.storage.local.set({ [SELECTED_KEY]: [...selected] });
      renderPicker(index, selected);
    });
    root.appendChild(label);
  }
}

async function inject(text) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (payload) => {
      const editor = document.querySelector('[contenteditable="true"], textarea');
      if (!editor) return;
      if (editor.tagName === "TEXTAREA") editor.value = payload + "\n\n" + editor.value;
      else editor.textContent = payload + "\n\n" + editor.textContent;
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    },
    args: [text],
  });
}

(async () => {
  const index = await loadIndex();
  const stored = (await chrome.storage.local.get(SELECTED_KEY))[SELECTED_KEY] ?? ["kafca", "rrss"];
  const selected = new Set(stored);
  renderPicker(index, selected);

  document.getElementById("inject").addEventListener("click", async () => {
    const text = await compose([...selected], index);
    await inject(text);
    window.close();
  });

  document.getElementById("copy").addEventListener("click", async () => {
    const text = await compose([...selected], index);
    await navigator.clipboard.writeText(text);
    window.close();
  });
})();
