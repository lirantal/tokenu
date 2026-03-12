# Max Depth (`-d, --max-depth`)

The `--max-depth` flag limits the depth of directory traversal and display, similar to `du --max-depth`.

## Behavior

- `-d 0` or `--max-depth 0`: Show only the top-level total for each argument
- `-d 1` or `--max-depth 1`: Show the argument and its immediate children
- `-d N`: Show entries up to N levels deep

Depth counting starts at 0 for the argument itself. Subdirectories at depth 1 are the immediate children, and so on.

## Examples

### Depth 0 (top-level only)

```bash
$ tokenu -d 0 src/
3383    src
```

### Depth 1 (argument + immediate children)

```bash
$ tokenu -d 1 src/
1127    src/bin
3383    src
```

### Depth 2 (two levels deep)

```bash
$ tokenu -d 2 -a src/
1127    src/bin/cli.ts
1127    src/bin
783     src/formatter.ts
263     src/main.ts
3383    src
```

### Combined with other flags

```bash
# Depth-limited with grand total
tokenu -d 1 -c src/ docs/

# Depth-limited with human-readable output
tokenu -d 1 -h src/

# Depth-limited JSON output
tokenu -d 1 --json src/
```

## Comparison with `du -d`

| `du` | `tokenu` | Description |
|------|----------|-------------|
| `du -d 0 dir/` | `tokenu -d 0 dir/` | Top-level total only |
| `du -d 1 dir/` | `tokenu -d 1 dir/` | One level of subdirectories |
| `du -d 2 dir/` | `tokenu -d 2 dir/` | Two levels deep |

## Error Handling

An invalid depth value (non-numeric or negative) produces an error:

```bash
$ tokenu -d abc .
tokenu: invalid max depth: abc
```
