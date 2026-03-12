# Human-Readable Output (`-h, --human-readable`)

The `--human-readable` flag formats token counts with K (thousands) and M (millions) suffixes for easier reading.

## Formatting Rules

| Range | Format | Example |
|-------|--------|---------|
| 0 -- 999 | Exact number | `42`, `999` |
| 1,000 -- 999,999 | `{n}K` or `{n.d}K` | `1K`, `1.5K`, `10K` |
| 1,000,000+ | `{n}M` or `{n.d}M` | `1M`, `2.5M` |

- Whole numbers omit the decimal: `1K` not `1.0K`
- One decimal place is used when needed: `1.5K`, `2.3M`

## Examples

### Without human-readable

```bash
$ tokenu -a src/
1234    src/main.ts
5678    src/bin/cli.ts
6912    src
```

### With human-readable

```bash
$ tokenu -ah src/
1.2K    src/main.ts
5.7K    src/bin/cli.ts
6.9K    src
```

### Large projects

```bash
$ tokenu -hs .
2.5M    .
```

## Comparison with `du -h`

The `-h` flag in tokenu works the same way as `du -h`, except the units represent tokens instead of bytes. There are no B/KB/MB/GB suffixes -- just K and M, since token counts are typically smaller than byte counts.
