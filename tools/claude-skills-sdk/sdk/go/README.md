# claude-skills (Go)

```bash
go get github.com/dnzengou/claude-skills-sdk/sdk/go
```

## Quickstart

```go
package main

import (
    "fmt"
    skills "github.com/dnzengou/claude-skills-sdk/sdk/go"
)

func main() {
    ids, _ := skills.List()
    fmt.Println(ids)

    s, _ := skills.Get("kafca")
    fmt.Println(s.Prompt[:200])

    system, _ := skills.Compose([]string{"rrss", "kafca"}, "")
    fmt.Println(len(system), "chars composed")
}
```

Skill bundle is `go:embed`ed at build time — no runtime file dependency.
