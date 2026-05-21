# Exclude Patterns (`--exclude`)

The `--exclude` flag lets you skip files or directories matching a given pattern.

## Default Exclusions

tokenu excludes these directories by default:

- `node_modules`
- `.git`

It also skips files and directories matched by `.gitignore` files discovered while walking.

Use `--no-ignore` to disable these default smart ignores. Explicit `--exclude` patterns still apply when `--no-ignore` is used.

## Pattern Syntax

The `--exclude` flag supports simple patterns:

| Pattern | Matches |
|---------|---------|
| `*.json` | Any file ending in `.json` |
| `*.test.ts` | Any file ending in `.test.ts` |
| `dist` | A file or directory named exactly `dist` |

## Examples

### Exclude JSON files

```bash
tokenu --exclude '*.json' src/
```

### Exclude multiple patterns

```bash
tokenu --exclude '*.json' --exclude '*.md' src/
```

### Exclude a directory by name

```bash
tokenu --exclude dist src/
```

### Combined with other flags

```bash
# Exclude tests, show all files, human-readable
tokenu -ah --exclude '*.test.ts' src/

# Exclude lock files, JSON output
tokenu --json --exclude '*.lock' .
```

## Notes

- Patterns are matched against the file or directory name (not the full path)
- The `--exclude` flag can be specified multiple times
- Default smart ignores (`node_modules`, `.git`, and `.gitignore` matches) are active unless `--no-ignore` is used
