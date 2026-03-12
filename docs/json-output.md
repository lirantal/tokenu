# JSON Output (`--json`)

The `--json` flag produces structured JSON output designed for consumption by AI agents, scripts, and other tools.

## Schema

```json
{
  "version": "0.0.1",
  "encoding": "o200k_base",
  "timestamp": "2026-03-11T12:00:00.000Z",
  "results": [
    {
      "path": "src/main.ts",
      "tokens": 1234,
      "type": "file"
    },
    {
      "path": "src",
      "tokens": 6912,
      "type": "directory",
      "children": ["src/main.ts", "src/bin/cli.ts"]
    }
  ],
  "total": 6912
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | tokenu version (for schema evolution) |
| `encoding` | string | Tokenizer encoding used |
| `timestamp` | string | ISO 8601 timestamp of the run |
| `results` | array | List of entries (files and directories) |
| `total` | number | Grand total (present with `--total` or `--summarize`) |

### Result Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `path` | string | Relative path to the file or directory |
| `tokens` | number | Token count |
| `type` | string | `"file"` or `"directory"` |
| `children` | string[] | Child paths (directories only) |

## Examples

### All files as JSON

```bash
tokenu --json -a src/
```

### Summarized JSON

```bash
tokenu --json -s src/
```

### With grand total

```bash
tokenu --json -c src/ docs/
```

## Usage with AI Agents

The JSON output is designed for easy parsing by AI agents:

### With jq

```bash
# Get total token count
tokenu --json -s . | jq '.total'

# List files over 1000 tokens
tokenu --json -a . | jq '.results[] | select(.tokens > 1000) | .path'

# Get encoding used
tokenu --json -s . | jq '.encoding'
```

### Piping to an LLM

```bash
tokenu --json -a src/ | llm "Which files have the most tokens?"
```

### In a script

```javascript
import { execSync } from 'child_process'

const output = execSync('tokenu --json -s src/', { encoding: 'utf-8' })
const data = JSON.parse(output)
console.log(`Total tokens: ${data.total}`)
```
