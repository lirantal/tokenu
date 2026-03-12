# Exclude Patterns (`--exclude`)

The `--exclude` flag lets you skip files or directories matching a given pattern.

## Default Exclusions

tokenu always excludes these directories by default:

- `node_modules`
- `.git`

These cannot be overridden.

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
- Default exclusions (`node_modules`, `.git`) are always active
