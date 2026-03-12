# CLI Flags Reference

## Synopsis

```
tokenu [options] [path...]
```

If no path is given, tokenu defaults to the current directory (`.`).

## Options

### `-s, --summarize`

Display only a total for each argument, suppressing individual file and subdirectory entries. See [summarize.md](summarize.md).

### `-h, --human-readable`

Print token counts in human-readable format using K (thousands) and M (millions) suffixes. See [human-readable.md](human-readable.md).

### `-a, --all`

Show counts for all files, not just directories. By default, only directory totals are displayed.

### `-d N, --max-depth N`

Print totals for a directory only if it is N or fewer levels below the command-line argument. `--max-depth 0` shows only the top-level total. See [depth.md](depth.md).

### `-c, --total`

Produce a grand total line at the end of the output. Useful when passing multiple paths. See also [summarize.md](summarize.md).

### `--json`

Output results as JSON for consumption by AI agents and scripts. See [json-output.md](json-output.md).

### `--encoding <enc>`

Select the tokenizer encoding. Available encodings:

- `o200k_base` (default) -- GPT-4o, GPT-4.1, o1, o3, o4
- `o200k_harmony` -- Open-weight Harmony models
- `cl100k_base` -- GPT-4, GPT-3.5-turbo
- `p50k_base` -- text-davinci-003, text-davinci-002
- `p50k_edit` -- code-davinci-edit-001
- `r50k_base` -- text-davinci-001, older models

See [encoding.md](encoding.md).

### `--model <name>`

Select encoding by model name (e.g., `gpt-4o`, `gpt-3.5-turbo`). Cannot be used together with `--encoding`. See [encoding.md](encoding.md).

### `--exclude <pattern>`

Exclude files matching the given pattern. Can be specified multiple times. See [exclude.md](exclude.md).

### `--version`

Print the version number and exit.

### `--help`

Print the help text and exit.

## Combining Flags

Flags can be combined in short form:

```bash
tokenu -hs src/       # human-readable + summarize
tokenu -ahc src/      # all + human-readable + total
```
