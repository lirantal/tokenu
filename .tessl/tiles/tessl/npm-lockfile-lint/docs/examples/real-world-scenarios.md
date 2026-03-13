# Real-World Scenarios

## Security Use Cases

### Prevent Malicious Package Injection

Validate that all packages come from trusted registries:

```bash { .api }
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-https
```

This ensures:
- All packages are fetched via HTTPS (preventing man-in-the-middle attacks)
- All packages come from the official npm registry (preventing typosquatting and malicious registries)

### Detect Unauthorized Package Sources

Prevent packages from untrusted sources entering your lockfile:

```bash { .api }
lockfile-lint --path yarn.lock --allowed-hosts yarn --empty-hostname false
```

This ensures:
- No packages from unknown or untrusted registries
- No local file-based packages (when `--empty-hostname false`)
- All packages come from explicitly allowed hosts

### Validate Integrity Hashes

Ensure all packages have sha512 integrity hashes:

```bash { .api }
lockfile-lint --path package-lock.json --validate-integrity
```

This ensures:
- All packages have integrity hashes (preventing tampering)
- All integrity hashes use sha512 algorithm (not weak algorithms like sha1)
- Package contents match the expected hash

### Enforce Package Name Consistency

Prevent package aliasing attacks:

```bash { .api }
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-package-names
```

This ensures:
- Package names in package.json match resolved package URLs
- No malicious packages masquerading as legitimate ones
- Package aliasing is detected and prevented

### Mixed Source Validation

Allow packages from multiple trusted sources:

```bash { .api }
lockfile-lint --path yarn.lock --allowed-hosts yarn npm verdaccio --validate-https
```

This is useful for:
- Organizations using multiple registries
- Monorepos with mixed package sources
- Projects using private registries alongside public ones

### Private Registry with GitHub

Allow private registry and GitHub dependencies:

```bash { .api }
lockfile-lint --path yarn.lock --allowed-hosts "registry.mycompany.com" github.com --allowed-schemes "https:" "git+https:"
```

This configuration:
- Allows packages from company private registry
- Allows GitHub packages via git+https
- Maintains HTTPS security while supporting git-based dependencies

### Monorepo Validation

Validate multiple lockfiles in a monorepo:

```bash { .api }
lockfile-lint --path "packages/**/package-lock.json" --validate-https --allowed-hosts npm
```

This:
- Uses glob patterns to find all lockfiles
- Validates each lockfile independently
- Fails if any lockfile has violations

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

