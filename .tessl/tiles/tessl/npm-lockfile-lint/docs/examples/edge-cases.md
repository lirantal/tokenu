# Edge Cases and Corner Cases

## Empty Lockfile

- Empty or minimal lockfiles pass validation (no packages to validate)
- Exit code is 0 (success)
- No validation errors are reported

## Lockfile with Only Dev Dependencies

- Dev dependencies are validated the same as production dependencies
- No distinction between dependency types in validation
- All dependency types are subject to the same validation rules

## Lockfile with Git Dependencies

- Git dependencies require `--allowed-schemes` to allow `git+https:` or `git+ssh:`
- Git URLs with commit hashes can be validated with `--allowed-urls`
- Git dependencies must use allowed schemes or be explicitly allowed via `--allowed-urls`
- Cannot use `--validate-https` with git dependencies (must use `--allowed-schemes`)

Example:

```bash { .api }
lockfile-lint --path yarn.lock --allowed-hosts yarn github.com --allowed-schemes "https:" "git+https:"
```

## Lockfile with File Dependencies

- File dependencies (e.g., `file:../local-package`) require `--empty-hostname true` (default)
- Set `--empty-hostname false` to reject file dependencies
- File dependencies use `file://` scheme which requires `--allowed-schemes "file:"` if not using default

Example:

```bash { .api }
# Allow file dependencies (default)
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm

# Reject file dependencies
lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm --empty-hostname false
```

## Lockfile with Scoped Packages

- Scoped packages (e.g., `@org/package`) are validated the same as unscoped packages
- Package name validation includes scope in comparison
- Host validation works the same for scoped and unscoped packages

## Lockfile with Aliased Packages

- Aliased packages (e.g., `npm:package@version`) require `--allowed-package-name-aliases`
- Format: `"alias-name:resolved-name"` in aliases array
- Must enable `--validate-package-names` for alias validation to work
- Common use case: CommonJS/ESM compatibility bridges

Example:

```bash { .api }
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-package-names --allowed-package-name-aliases "string-width-cjs:string-width"
```

## Monorepo with Mixed Lockfile Types

- Use separate commands for npm and yarn lockfiles
- Or use `--type` to explicitly specify type for each validation
- Glob patterns work with mixed types when `--type` is specified per command

Example:

```bash { .api }
# Separate commands
lockfile-lint --path "packages/**/package-lock.json" --type npm --validate-https --allowed-hosts npm
lockfile-lint --path "packages/**/yarn.lock" --type yarn --validate-https --allowed-hosts npm
```

## Lockfile with Private Registry Packages

- Add private registry host to `--allowed-hosts`
- Ensure private registry uses HTTPS or add to `--allowed-schemes`
- Private registry hostnames must match exactly (no wildcards)

Example:

```bash { .api }
lockfile-lint --path package-lock.json --allowed-hosts npm "registry.mycompany.com" --validate-https
```

## Lockfile with Legacy Packages

- Legacy packages without integrity hashes can be excluded with `--integrity-exclude`
- Package names must match exactly as they appear in lockfile
- Use for packages that cannot be updated to include integrity hashes

Example:

```bash { .api }
lockfile-lint --path package-lock.json --validate-integrity --integrity-exclude "legacy-package" "another-package"
```

## Lockfile with npm Aliases (npm:package@version)

- npm aliases require `--allowed-package-name-aliases` when using `--validate-package-names`
- Format: `"package-name:npm:package@version"` or just the alias name
- Must specify both alias and resolved name in the format

Example:

```bash { .api }
lockfile-lint --path package-lock.json --allowed-hosts npm --validate-package-names --allowed-package-name-aliases "my-package:npm:other-package@1.0.0"
```

## Configuration File in Monorepo

- Configuration files are searched from current directory up the tree
- First matching file stops the search
- Each package in monorepo can have its own configuration file
- CLI arguments override configuration file values

## Glob Pattern Edge Cases

- Glob patterns must be quoted in shell: `"packages/**/package-lock.json"`
- Empty results from glob pattern cause error (no lockfiles found)
- Each matched lockfile is validated independently
- Failure in any lockfile causes overall exit code 1

Example:

```bash { .api }
# Correct - quoted glob pattern
lockfile-lint --path "packages/**/package-lock.json" --validate-https --allowed-hosts npm

# Incorrect - unquoted glob pattern may expand incorrectly
lockfile-lint --path packages/**/package-lock.json --validate-https --allowed-hosts npm
```

