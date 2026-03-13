# CLI Options Reference

## Command Structure

```bash { .api }
lockfile-lint --path <lockfile> [options]
```

**Executable**: `lockfile-lint`

## Required Options

### `--path`, `-p` (string)

Path to lockfile or glob pattern for multiple lockfiles.

- Examples: `package-lock.json`, `yarn.lock`, `packages/**/package-lock.json`
- Supports glob patterns for monorepos
- Must be a valid file path or glob pattern
- Required: Always provide this argument or specify in configuration file

## Lockfile Type

### `--type`, `-t` (string)

Lockfile type - "npm" or "yarn" (auto-detected if omitted).

- Auto-detection based on filename: `package-lock.json` or `npm-shrinkwrap.json` → npm, `yarn.lock` → yarn
- Explicit type specification overrides auto-detection
- Required if using non-standard filenames
- Use when lockfile has non-standard name or when auto-detection fails

## Help and Version

### `--help`, `-h` (boolean)

Display help text with all available options.

### `--version` (boolean)

Display version number.

## Validation Options

### `--validate-https`, `-s` (boolean)

Validates all package URLs use HTTPS protocol.

- Checks that all resolved package URLs use `https://` scheme
- Fails if any package uses `http://` or other non-HTTPS schemes
- Mutually exclusive with `--allowed-schemes`
- Use for strict HTTPS-only validation

### `--allowed-hosts`, `-a` (array)

Whitelist of allowed registry hosts.

- Accepts multiple hosts: `--allowed-hosts npm yarn github.com`
- Supports host aliases: `npm`, `yarn`, `verdaccio` (see Host Aliases below)
- Validates that all package URLs resolve to one of the allowed hosts
- Required when using `--validate-package-names`
- Can use aliases or full hostnames

### `--allowed-schemes`, `-o` (array)

Whitelist of allowed URI schemes.

- Examples: `--allowed-schemes "https:" "git+https:"`
- Accepts multiple schemes as space-separated values
- Mutually exclusive with `--validate-https` (cannot use both)
- Useful for allowing git-based dependencies with specific schemes
- Common schemes: `https:`, `git+https:`, `git+ssh:`, `file:`

### `--allowed-urls`, `-u` (array)

Whitelist of specific allowed URLs.

- Examples: `--allowed-urls "https://github.com/user/repo#commit-hash"`
- Accepts full URLs including protocol, host, path, and fragment
- When combined with `--allowed-hosts`, URL validation is optimized through host validation
- Useful for allowing specific git repositories or custom package sources
- Validates exact URL match including fragment

### `--validate-package-names`, `-n` (boolean)

Validates package name matches resolved URL.

- Ensures package name in package.json matches the resolved package URL
- Prevents package aliasing attacks where malicious packages masquerade as legitimate ones
- Requires `--allowed-hosts` to be specified
- Can be combined with `--allowed-package-name-aliases` for legitimate aliases

### `--validate-integrity`, `-i` (boolean)

Validates integrity hashes use sha512 algorithm.

- Checks that all packages have integrity hashes
- Validates that integrity hashes use sha512 algorithm (not sha1 or other weak algorithms)
- Can exclude specific packages using `--integrity-exclude`
- Important for ensuring package integrity and preventing tampering

### `--allowed-package-name-aliases`, `-l` (array)

Allows package name aliases in format "name:alias".

- Format: `--allowed-package-name-aliases "string-width-cjs:string-width"`
- Where `name` is the package.json name, `alias` is the resolved name
- Useful for packages that use aliasing for compatibility (e.g., CommonJS/ESM bridges)
- Only effective when `--validate-package-names` is enabled
- Format must be exact: `"package-name:resolved-name"`

### `--integrity-exclude` (array)

Excludes specific packages from integrity validation.

- Examples: `--integrity-exclude "legacy-package" "another-package"`
- Useful for packages that don't have integrity hashes (legacy packages)
- Package names must match exactly as they appear in the lockfile
- Use for legacy packages that cannot be updated

### `--empty-hostname`, `-e` (boolean, default: true)

Allows empty hostnames in URLs.

- When `true`: Allows URLs with empty hostnames (e.g., `file:///path/to/package`)
- When `false`: Rejects URLs with empty hostnames
- Default is `true` for compatibility with local file-based packages
- Set to `false` to reject local file dependencies

## Output Options

### `--format`, `-f` (string)

Output format - "pretty" (default, with colors) or "plain" (no colors).

- "pretty": Human-readable output with colors and formatting
- "plain": Plain text output suitable for CI/CD pipelines and log parsing
- Use "plain" in non-interactive environments
- Required for automated log parsing

## Supported Lockfiles

- npm: `package-lock.json`, `npm-shrinkwrap.json`
- yarn: `yarn.lock`
- Auto-detection based on filename when `--type` not specified

## Host Aliases

The `--allowed-hosts` option supports convenient aliases:

- `npm` → `https://registry.npmjs.org`
- `yarn` → `https://registry.yarnpkg.com`
- `verdaccio` → `https://registry.verdaccio.org`

These aliases can be used instead of full registry URLs for convenience.

## Exit Codes

- `0`: Success - no security issues detected, validation passed
- `1`: Failure - occurs when:
  - Security issues detected in lockfile (violations found)
  - Missing required arguments (e.g., no `--path` specified)
  - Invalid configuration files (syntax errors, invalid options)
  - Uncaught exceptions during validation (parsing errors, file not found, etc.)
  - Lockfile type detection failure

## Option Conflicts and Requirements

- `--allowed-schemes` and `--validate-https` are mutually exclusive (cannot use both)
  - Use `--validate-https` for strict HTTPS-only validation
  - Use `--allowed-schemes` when you need to allow specific non-HTTPS schemes (e.g., `git+https:`)
- `--validate-package-names` requires `--allowed-hosts` to be specified
  - Package name validation needs host information to verify consistency
- When both `--allowed-urls` and `--allowed-hosts` are provided, URL validation is optimized through host validation
  - Host validation is performed first, then URL validation for efficiency

## Validation Logic Details

1. **HTTPS Validation**: Checks that all resolved package URLs use `https://` protocol. Fails on `http://`, `file://`, or any other scheme unless explicitly allowed.

2. **Host Validation**: Extracts hostname from each package URL and verifies it matches one of the allowed hosts. Supports host aliases and exact hostname matching.

3. **Scheme Validation**: Validates that URL scheme matches one of the allowed schemes. Case-insensitive matching. Common schemes: `https:`, `git+https:`, `git+ssh:`, `file:`.

4. **Package Name Validation**: Compares package name from package.json with the resolved package URL. Ensures the package name matches the URL path to prevent aliasing attacks.

5. **Integrity Validation**: Verifies that all packages have integrity hashes and that they use sha512 algorithm. Checks for presence of integrity field and validates algorithm.

6. **URL Validation**: When `--allowed-urls` is specified, validates that package URLs exactly match one of the allowed URLs (including path and fragment).

## Examples

```bash { .api }
# Validate HTTPS only
lockfile-lint --path yarn.lock --validate-https

# Validate specific hosts with HTTPS
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-https

# Allow GitHub packages with git+https scheme
lockfile-lint --path yarn.lock --allowed-hosts yarn github.com --allowed-schemes "https:" "git+https:"

# Multiple lockfiles via glob pattern
lockfile-lint --path "packages/**/package-lock.json" --validate-https --allowed-hosts npm

# Allow specific URL with host validation
lockfile-lint --path yarn.lock --allowed-hosts yarn --allowed-urls "https://github.com/user/repo#commit-hash"

# Validate package names match URLs
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-package-names

# Validate integrity hashes
lockfile-lint --path package-lock.json --validate-integrity

# Validate integrity with exclusions
lockfile-lint --path yarn.lock --validate-integrity --integrity-exclude "legacy-package" "another-package"

# Allow package aliases
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-package-names --allowed-package-name-aliases "string-width-cjs:string-width"

# Plain output for CI/CD
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --format plain

# Explicit lockfile type
lockfile-lint --path custom.lock --type npm --validate-https

# Debug mode
DEBUG=lockfile-lint lockfile-lint --path yarn.lock --validate-https
```

