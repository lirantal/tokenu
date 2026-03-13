# Quick Start Guide

## Installation

### Local Installation

```bash { .api }
npm install lockfile-lint
```

### Global Installation

```bash { .api }
npm install -g lockfile-lint
```

### Using npx (No Installation Required)

```bash { .api }
npx lockfile-lint --path package-lock.json --validate-https
```

## Basic Usage

### Validate HTTPS Only

```bash { .api }
lockfile-lint --path package-lock.json --validate-https
```

### Validate Allowed Hosts

```bash { .api }
lockfile-lint --path yarn.lock --allowed-hosts npm yarn
```

### Multiple Validations

```bash { .api }
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --validate-integrity
```

### Plain Output for CI/CD

```bash { .api }
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain
```

## Common Workflows

### Basic Security Check

The most common security check validates HTTPS and restricts to npm registry:

```bash { .api }
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain
```

### With Integrity Validation

Add integrity hash validation for complete protection:

```bash { .api }
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --validate-integrity --format plain
```

### Monorepo Validation

Validate multiple lockfiles in a monorepo:

```bash { .api }
lockfile-lint --path "packages/**/package-lock.json" --validate-https --allowed-hosts npm
```

## Next Steps

- See [CLI Options Reference](../reference/cli-options.md) for all available options
- See [Real-World Scenarios](../examples/real-world-scenarios.md) for comprehensive examples
- See [Configuration Reference](../reference/configuration.md) for file-based configuration

