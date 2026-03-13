# Integration Patterns

## CI/CD Integration

### GitHub Actions

```yaml { .api }
- name: Lint Lockfile
  run: npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain
```

### GitLab CI

```yaml { .api }
lockfile-security:
  script:
    - npm install lockfile-lint
    - npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain
```

### CircleCI

```yaml { .api }
- run:
    name: Validate Lockfile Security
    command: npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain
```

### Jenkins Pipeline

```groovy { .api }
stage('Lockfile Security') {
    steps {
        sh 'npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain'
    }
}
```

## Pre-commit Hooks

### Using husky

```json { .api }
{
  "husky": {
    "hooks": {
      "pre-commit": "lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm"
    }
  }
}
```

### Using husky v5+

```javascript { .api }
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm
```

### Using lint-staged

```json { .api }
{
  "lint-staged": {
    "package-lock.json": [
      "lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm"
    ]
  }
}
```

## NPM Scripts

```json { .api }
{
  "scripts": {
    "lint:lockfile": "lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm",
    "pretest": "npm run lint:lockfile",
    "prepublishOnly": "npm run lint:lockfile"
  }
}
```

