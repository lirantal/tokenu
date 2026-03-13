# lockfile-lint

lockfile-lint is a CLI tool for linting npm and yarn lockfiles to enforce security policies and prevent malicious package injection attacks.

## Package Information

- **Package Name**: lockfile-lint
- **Package Type**: npm
- **Language**: JavaScript (Node.js)
- **Installation**: `npm install lockfile-lint`
- **Minimum Node.js**: 16.0.0

## Quick Reference for Agents

**Execution Model:**
- CLI-only tool: No programmatic API; must be invoked via command line or shell scripts
- Synchronous execution: Blocks until validation completes or fails
- Single or multiple lockfiles: Supports glob patterns for multiple files
- Exit codes: `0` on success (no issues), `1` on failure (issues detected or errors)

**Required Arguments:**
- `--path` or `-p`: Path to lockfile (required) - can be a single file or glob pattern

**Key Validation Capabilities:**
- HTTPS protocol enforcement
- Registry host allow-listing
- URI scheme restrictions
- Package name consistency validation
- Integrity hash verification (sha512)
- Package alias handling

**Default Behaviors:**
- Auto-detects lockfile type (npm/yarn) if `--type` not specified
- Output format: "pretty" (colored) by default, "plain" for CI/CD
- Empty hostnames allowed by default (`--empty-hostname true`)
- Configuration file support via cosmiconfig (package.json, .lockfile-lintrc, etc.)

**Execution Lifecycle:**
1. Loads configuration from files (if present) or command-line arguments
2. Parses lockfile(s) based on type (auto-detected or specified)
3. Validates each package entry according to enabled rules
4. Reports violations with detailed error messages
5. Exits with code 0 (success) or 1 (failure)

**When to Use:**
- CI/CD pipeline security checks
- Pre-commit hooks for lockfile validation
- Security audits of dependencies
- Enforcing organizational security policies
- Preventing supply chain attacks

**Decision Points for Agents:**
- Choose `--validate-https` for strict HTTPS-only (mutually exclusive with `--allowed-schemes`)
- Choose `--allowed-schemes` when git-based dependencies are needed (e.g., `git+https:`)
- Always specify `--allowed-hosts` when using `--validate-package-names`
- Use `--format plain` in non-interactive environments (CI/CD)
- Use `--type` explicitly for non-standard lockfile filenames
- Use glob patterns for monorepos: `"packages/**/package-lock.json"`

## Quick Start

```bash { .api }
# Install
npm install lockfile-lint

# Basic usage - validate HTTPS
lockfile-lint --path package-lock.json --validate-https

# Validate with allowed hosts
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-https

# Use via npx (no installation)
npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain
```

See [Quick Start Guide](guides/quick-start.md) for detailed setup instructions.

## Core Concepts

### Validation Types

- **HTTPS Validation**: Ensures all packages use HTTPS protocol
- **Host Validation**: Restricts packages to allowed registry hosts
- **Scheme Validation**: Allows specific URI schemes (e.g., `git+https:`)
- **Package Name Validation**: Verifies package names match resolved URLs
- **Integrity Validation**: Ensures all packages have sha512 integrity hashes

### Configuration

Configuration can be provided via:
- Command-line arguments (highest priority)
- Configuration files (package.json, .lockfile-lintrc, etc.)
- Default values (lowest priority)

See [Configuration Reference](reference/configuration.md) for details.

### Exit Codes

- `0`: Success - no security issues detected
- `1`: Failure - violations found, errors, or missing arguments

## Documentation Structure

### Guides

- **[Quick Start Guide](guides/quick-start.md)** - Getting started with lockfile-lint
  - Installation options
  - Basic usage patterns
  - Common workflows

### Examples

- **[Real-World Scenarios](examples/real-world-scenarios.md)** - Comprehensive usage examples
  - CI/CD integration patterns
  - Pre-commit hooks
  - Security use cases
  - Monorepo validation

- **[Edge Cases](examples/edge-cases.md)** - Advanced scenarios and corner cases
  - Git dependencies
  - File dependencies
  - Scoped packages
  - Aliased packages
  - Private registries
  - Legacy packages

### Reference

- **[CLI Options](reference/cli-options.md)** - Complete command-line interface reference
  - All options with detailed descriptions
  - Option conflicts and requirements
  - Validation logic details
  - Examples for each option

- **[Configuration](reference/configuration.md)** - Configuration file reference
  - Supported configuration files
  - Configuration precedence
  - Configuration options
  - Edge cases

- **[Integration Patterns](reference/integration-patterns.md)** - Integration examples
  - CI/CD pipelines (GitHub Actions, GitLab CI, CircleCI, Jenkins)
  - Pre-commit hooks (husky, lint-staged)
  - NPM scripts

- **[Error Handling](reference/error-handling.md)** - Troubleshooting guide
  - Common error scenarios
  - Validation failures
  - Debugging tips
  - Error message examples

## Requirements

- Node.js runtime (version 16.0.0 or higher)
- File system access to read lockfile(s)
- Valid lockfile (package-lock.json, npm-shrinkwrap.json, or yarn.lock)
- Terminal/console for output (interactive or non-interactive)

## Important Notes

**Programmatic Usage**: lockfile-lint is CLI-only and does not export a programmatic API. For programmatic access, consider using the underlying lockfile parsing libraries directly.

**Non-Interactive Environments**: Use `--format plain` in CI/CD pipelines for better log parsing and to avoid ANSI color codes.

**Performance**: Validation of large lockfiles (thousands of packages) may take several seconds. Consider caching results in CI/CD.

**Lockfile Updates**: Re-run validation after `npm install` or `yarn install` to catch new violations.

**Security Best Practices**: Always use `--validate-https` and `--allowed-hosts` together for maximum security. Combine with `--validate-integrity` for complete protection.

**Agent Usage Patterns**:
- Always check exit code: `0` = success, `1` = failure
- Use `--format plain` for programmatic output parsing
- Enable debug mode with `DEBUG=lockfile-lint` for troubleshooting
- Validate lockfile existence before running tool
- Handle glob pattern results (may match zero or many files)
- Configuration file precedence: CLI args > config file > defaults
