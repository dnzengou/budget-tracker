# claude-skills (Python)

```bash
pip install claude-skills
```

## Quickstart

```python
from claude_skills import Skills

s = Skills()
print(s.list())                        # ['arm', 'rrss', 'kafca', 'kafcade', 'devflow', 'evolve']
print(s.get("kafca").prompt[:200])     # raw skill markdown
print(s.compose(["rrss", "kafca"]))    # overlay prompt for the model
```

## With Anthropic

```python
import anthropic
from claude_skills import Skills

client = anthropic.Anthropic()
system = Skills().compose(["kafca", "rrss"])
reply = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    system=system,
    messages=[{"role": "user", "content": "B+P+D worldmodel-geosim"}],
)
print(reply.content[0].text)
```

## CLI

```bash
claude-skills list
claude-skills show kafca
claude-skills compose rrss kafca > system.txt
```

See the [main README](https://github.com/dnzengou/claude-skills-sdk) for full distribution channels.
