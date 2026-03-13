# Configuration Reference

lockfile-lint supports file-based configuration via [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), allowing options to be specified in configuration files instead of command-line arguments.

## Supported Configuration Files

Configuration files are searched in the following order (first match wins):

1. `lockfile-lint` key in `package.json`
2. `.lockfile-lintrc` (JSON or YAML)
3. `.lockfile-lintrc.json`
4. `.lockfile-lintrc.yaml` or `.lockfile-lintrc.yml`
5. `.lockfile-lintrc.js` (CommonJS module exporting object)
6. `lockfile-lint.config.js` (CommonJS module exporting object)

## Configuration Search

Configuration files are searched starting from the current working directory up the file tree until found. Search stops at the first matching file.

## Configuration Precedence

1. Command-line arguments (highest priority)
2. Configuration file values
3. Default values (lowest priority)

Command-line arguments always override configuration file values.

## Configuration Options

All CLI options are supported in configuration files using camelCase naming:

```json { .api }
{
  "path": "package-lock.json",
  "type": "npm",
  "validateHttps": true,
  "allowedHosts": ["npm"],
  "allowedSchemes": ["https:", "git+https:"],
  "allowedUrls": ["https://github.com/user/repo#hash"],
  "emptyHostname": true,
  "validatePackageNames": true,
  "validateIntegrity": true,
  "allowedPackageNameAliases": ["alias:original"],
  "integrityExclude": ["package-name"],
  "format": "pretty"
}
```

## Configuration Examples

### package.json

```json { .api }
{
  "name": "my-project",
  "lockfile-lint": {
    "path": "package-lock.json",
    "validateHttps": true,
    "allowedHosts": ["npm"]
  }
}
```

### .lockfile-lintrc

```json { .api }
{
  "path": "yarn.lock",
  "allowedHosts": ["yarn", "npm"],
  "allowedSchemes": ["https:", "git+https:"],
  "validatePackageNames": true
}
```

### .lockfile-lintrc.js

```javascript { .api }
module.exports = {
  path: "package-lock.json",
  validateHttps: true,
  allowedHosts: ["npm"],
  validateIntegrity: true
};
```

## Configuration File Edge Cases

- If `path` is specified in config file, it can still be overridden by `--path` CLI argument
- Array options in config files (e.g., `allowedHosts`) are merged with CLI arguments, with CLI taking precedence
- Boolean options in config files are completely overridden by CLI arguments
- Invalid JSON/YAML syntax in config files causes the tool to exit with code 1
- Missing config files are silently ignored (tool uses defaults or CLI arguments)
- Configuration file search stops at first match (does not search parent directories after finding a match)

## Debug Mode

lockfile-lint uses the `debug` npm package for detailed logging.

### Enable Debug Output

```bash { .api }
DEBUG=lockfile-lint lockfile-lint --path yarn.lock --validate-https
```

### Debug Information Includes

- Parsed configuration options (from files and CLI)
- Validator invocations and their parameters
- Validation results for each package
- Configuration file loading and resolution
- Lockfile parsing details
- Error details and stack traces

### Debug Output Format

Debug output uses the standard `debug` package format:

```text { .api }
lockfile-lint:validator:https Validating package: example@1.0.0
lockfile-lint:config Loading config from: .lockfile-lintrc.json
```

