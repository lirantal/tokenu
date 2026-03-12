# Summarize (`-s, --summarize`)

The `--summarize` flag displays only a total for each path argument, suppressing the breakdown of individual files and subdirectories. This is analogous to `du -s`.

## Behavior

When `--summarize` is active:

- Only one line is printed per path argument
- The line shows the total token count for the entire directory tree (or file)
- Subdirectory and file breakdowns are hidden

## Examples

### Default (no summarize)

```bash
$ tokenu src/
127     src/bin/cli.ts
127     src/bin
83      src/formatter.ts
26      src/main.ts
32      src/tokenizer.ts
16      src/types.ts
72      src/walker.ts
356     src
```

### With summarize

```bash
$ tokenu -s src/
356     src
```

### Summarize with human-readable

```bash
$ tokenu -hs src/
356     src
```

### Summarize multiple paths

```bash
$ tokenu -s src/ docs/
356     src
120     docs
```

### Summarize with grand total

```bash
$ tokenu -sc src/ docs/
356     src
120     docs
476     total
```

## JSON Output

When combined with `--json`, the summarized output includes a `total` field:

```bash
$ tokenu --json -s src/
```

```json
{
  "version": "0.0.1",
  "encoding": "o200k_base",
  "timestamp": "2026-03-11T12:00:00.000Z",
  "results": [
    {
      "path": "src",
      "tokens": 356,
      "type": "directory"
    }
  ],
  "total": 356
}
```

## Comparison with `du -s`

| `du` | `tokenu` | Description |
|------|----------|-------------|
| `du -s dir/` | `tokenu -s dir/` | Show only total for dir |
| `du -sh dir/` | `tokenu -hs dir/` | Human-readable total |
| `du -sc dir1/ dir2/` | `tokenu -sc dir1/ dir2/` | Totals with grand total |
