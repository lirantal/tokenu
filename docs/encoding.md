# Encoding and Model Selection

tokenu supports multiple tokenizer encodings used by different OpenAI models. The encoding determines how text is split into tokens, which affects the token count.

## Default Encoding

The default encoding is `o200k_base`, used by all modern OpenAI models including GPT-4o, GPT-4.1, o1, o3, and o4.

## Available Encodings

| Encoding | Models |
|----------|--------|
| `o200k_base` | GPT-4o, GPT-4.1, o1, o3, o4, GPT-5 |
| `o200k_harmony` | Open-weight Harmony models (gpt-oss-20b, gpt-oss-120b) |
| `cl100k_base` | GPT-4, GPT-3.5-turbo |
| `p50k_base` | text-davinci-003, text-davinci-002 |
| `p50k_edit` | code-davinci-edit-001 |
| `r50k_base` | text-davinci-001, older models |

## Selecting an Encoding

### By encoding name (`--encoding`)

```bash
tokenu --encoding cl100k_base src/
tokenu --encoding o200k_harmony src/
```

### By model name (`--model`)

```bash
tokenu --model gpt-4o src/
tokenu --model gpt-3.5-turbo src/
```

The model name is resolved to the appropriate encoding automatically.

## Constraints

- `--encoding` and `--model` cannot be used together
- Unknown encoding names produce an error
- Unknown model names produce an error (the model must be recognized by gpt-tokenizer)

## Why Encoding Matters

Different encodings produce different token counts for the same text. For example, `o200k_base` has a larger vocabulary (200K tokens) than `cl100k_base` (100K tokens), so it may produce fewer tokens for the same input.

When estimating costs or context window usage, make sure to use the encoding that matches your target model.

## JSON Output

The encoding used is always included in JSON output:

```json
{
  "encoding": "cl100k_base",
  "results": [...]
}
```
