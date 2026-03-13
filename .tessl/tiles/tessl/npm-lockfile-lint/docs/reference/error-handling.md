# Error Handling and Troubleshooting

## Common Error Scenarios

### Missing Lockfile

```text { .api }
Error: ENOENT: no such file or directory, open 'package-lock.json'
```

**Solution**: Ensure the lockfile path is correct and the file exists. Verify the path is relative to the current working directory or use an absolute path.

### Invalid Lockfile Format

```text { .api }
Error: Unable to parse lockfile
```

**Solution**: Verify the lockfile is valid JSON (npm) or YAML (yarn). May indicate corruption. Re-generate lockfile with `npm install` or `yarn install`.

### Missing Required Option

```text { .api }
Error: --path is required
```

**Solution**: Always provide `--path` argument or specify it in configuration file. The path can be a single file or glob pattern.

### Configuration File Syntax Error

```text { .api }
Error: Failed to parse configuration file
```

**Solution**: Check JSON/YAML syntax in configuration files. Validate with JSON/YAML linter. Ensure proper escaping in JSON strings.

### Option Conflict

```text { .api }
Error: --validate-https and --allowed-schemes cannot be used together
```

**Solution**: Use either `--validate-https` (strict HTTPS) or `--allowed-schemes` (flexible), not both. Choose based on whether you need to allow git-based dependencies.

### Missing Dependency for Validation

```text { .api }
Error: --validate-package-names requires --allowed-hosts
```

**Solution**: Always specify `--allowed-hosts` when using `--validate-package-names`. Package name validation requires host information.

## Validation Failures

### HTTPS Violation

```text { .api }
✗ Package 'example@1.0.0' uses non-HTTPS URL: http://registry.example.com/example
```

**Solution**: Update package to use HTTPS or add host to `--allowed-hosts` if legitimate. If package must use HTTP, use `--allowed-schemes` instead of `--validate-https`.

### Host Violation

```text { .api }
✗ Package 'example@1.0.0' uses unauthorized host: untrusted-registry.com
```

**Solution**: Add host to `--allowed-hosts` if trusted, or investigate why package is using untrusted registry. Verify package source is legitimate.

### Integrity Violation

```text { .api }
✗ Package 'example@1.0.0' missing integrity hash
✗ Package 'example@1.0.0' uses unsupported integrity algorithm: sha1
```

**Solution**: Update package to include sha512 integrity hash, or exclude using `--integrity-exclude` for legacy packages. Package names must match exactly as they appear in lockfile.

### Package Name Mismatch

```text { .api }
✗ Package name 'example' does not match resolved URL path
```

**Solution**: Investigate package aliasing. Use `--allowed-package-name-aliases` for legitimate aliases. Format: `"package-name:resolved-name"`.

## Debugging Tips

1. **Enable Debug Output**: Use `DEBUG=lockfile-lint` to see detailed validation process
2. **Check Configuration**: Verify configuration file is being loaded correctly by checking debug output
3. **Validate Lockfile**: Ensure lockfile is valid and not corrupted by parsing it manually
4. **Test with Single Option**: Isolate issues by testing with one validation option at a time
5. **Check Exit Codes**: Use exit codes in CI/CD to determine failure type (0 = success, 1 = failure)
6. **Verify File Paths**: Ensure lockfile path is correct relative to current working directory
7. **Check Node.js Version**: Verify Node.js version is 16.0.0 or higher

