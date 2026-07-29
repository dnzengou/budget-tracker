# Claude Skills — Chrome Extension

Inject ARM / RRSS / KafCa / KafCade / DevFlow / Evolve skill prompts into Claude.ai, ChatGPT, and Gemini.

## Install (dev)

```bash
# Build (copies skills into the extension)
node -e "import('node:fs/promises').then(fs=>fs.cp('../../skills','./skills',{recursive:true,force:true}))"

# Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Use

1. Click the extension icon
2. Pick the skill IDs to compose
3. Inject (writes into the focused chat composer) or Copy

Manifest V3. CSP-strict. No remote code.
