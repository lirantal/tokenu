# CLI Interface

Full-featured command-line interface with extensive options for customizing behavior, git operations, and output formatting.

## Capabilities

### Basic Command

The primary command-line interface for lint-staged.

```bash { .api }
lint-staged [options]
```

**Basic Usage Examples:**

```bash
# Run lint-staged against all staged files with default configuration
npx lint-staged

# Run with a specific configuration file
npx lint-staged --config .lintstagedrc.json

# Run with debug output
npx lint-staged --debug

# Run in a specific directory
npx lint-staged --cwd ./packages/frontend
```

### Command-Line Options

Complete list of available command-line flags and options.

```bash { .api }
Options:
  -V, --version                    output the version number
  
  -h, --help                       display help for command
  
  --allow-empty                    allow empty commits when tasks revert all staged changes
  
  -p, --concurrent <number|boolean> the number of tasks to run concurrently, or false for serial
                                   (default: true)
  
  -c, --config [path]              path to configuration file, or - to read from stdin
  
  --cwd [path]                     run all tasks in specific directory, instead of the current
  
  -d, --debug                      print additional debug information
  
  --diff [string]                  override the default "--staged" flag of "git diff" to get list of files.
                                   Implies "--no-stash"
  
  --diff-filter [string]           override the default "--diff-filter=ACMR" flag of "git diff" to get list of files
  
  --max-arg-length [number]        maximum length of the command-line argument string (default: auto-detected)
  
  --no-revert                      do not revert to original state in case of errors
  
  --no-stash                       disable the backup stash. Implies "--no-revert"
  
  --no-hide-partially-staged       disable hiding unstaged changes from partially staged files
  
  -q, --quiet                      disable lint-staged's own console output
  
  -r, --relative                   pass relative filepaths to tasks
  
  -v, --verbose                    show task output even when tasks succeed; by default only failed output is shown
  
  -h, --help                       display help for command
```

### Usage Examples

**Configuration File Usage:**

```bash
# Use explicit configuration file
npx lint-staged --config lint-staged.config.js

# Read configuration from stdin
echo '{"*.js": "eslint --fix"}' | npx lint-staged --config -

# Use configuration in different directory
npx lint-staged --config ./configs/.lintstagedrc.json
```

**Concurrency Control:**

```bash
# Run tasks in serial (one after another)
npx lint-staged --concurrent false

# Run maximum 2 tasks at the same time
npx lint-staged --concurrent 2

# Use default concurrent behavior (all tasks in parallel)
npx lint-staged --concurrent true
```

**Git Operation Customization:**

```bash
# Compare against different commit instead of staged files
npx lint-staged --diff "HEAD~1"

# Only process added and modified files
npx lint-staged --diff-filter "AM"

# Disable backup stash (faster but less safe)
npx lint-staged --no-stash

# Disable reverting on failures
npx lint-staged --no-revert
```

**Output and Debugging:**

```bash
# Enable debug output
npx lint-staged --debug

# Suppress lint-staged's own output
npx lint-staged --quiet

# Show output from successful tasks (normally only failures are shown)
npx lint-staged --verbose

# Combine debug and verbose for maximum output
npx lint-staged --debug --verbose
```

**File Path Handling:**

```bash
# Pass relative file paths to tasks instead of absolute paths
npx lint-staged --relative

# Set maximum command line argument length (useful for Windows)
npx lint-staged --max-arg-length 8000

# Run in specific working directory
npx lint-staged --cwd /path/to/project
```

**Advanced Scenarios:**

```bash
# Allow empty commits (when all changes are reverted by tasks)
npx lint-staged --allow-empty

# Process partially staged files differently
npx lint-staged --no-hide-partially-staged

# Custom git diff for monorepos
npx lint-staged --diff "origin/main...HEAD" --diff-filter "ACMR"
```

### Exit Codes

lint-staged uses standard exit codes to indicate execution results:

```bash { .api }
Exit Codes:
  0  - All tasks completed successfully
  1  - Task failures, configuration errors, or git workflow errors
```

### Configuration from Stdin

You can provide configuration via stdin using the `--config -` option:

```bash
# Using echo
echo '{"*.js": "eslint --fix", "*.css": "stylelint --fix"}' | npx lint-staged --config -

# Using heredoc
npx lint-staged --config - << EOF
{
  "*.{js,ts}": ["eslint --fix", "prettier --write"],
  "*.css": "stylelint --fix",
  "*.md": "prettier --write"
}
EOF

# Using file input
cat lint-staged-config.json | npx lint-staged --config -
```

### Integration Examples

**With npm scripts:**

```json
{
  "scripts": {
    "lint-staged": "lint-staged",
    "lint-staged:debug": "lint-staged --debug --verbose",
    "lint-staged:ci": "lint-staged --concurrent false --quiet"
  }
}
```

**With Husky pre-commit hook:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**In CI/CD pipelines:**

```bash
# GitLab CI
script:
  - npx lint-staged --concurrent false --quiet

# GitHub Actions
- name: Run lint-staged
  run: npx lint-staged --debug

# Jenkins
sh 'npx lint-staged --concurrent 2'
```

### Error Recovery

When lint-staged fails, you can recover using git stash:

```bash
# List available stashes (look for "automatic lint-staged backup")
git stash list

# Restore from automatic backup stash
git stash apply --index stash@{0}

# Or restore without staging
git stash apply stash@{0}
```