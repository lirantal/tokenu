# Command Interface

The changesets CLI provides a comprehensive command-line interface for managing package versioning and publishing workflows. All functionality is accessed through the `changeset` binary command.

## Capabilities

### Core Commands

The changesets CLI supports the following commands for managing releases:

```bash { .api }
# Available commands
changeset init
changeset [add] [--empty] [--open]
changeset version [--ignore] [--snapshot <?name>] [--snapshot-prerelease-template <template>]
changeset publish [--tag <name>] [--otp <code>] [--no-git-tag]
changeset status [--since <branch>] [--verbose] [--output <file>]
changeset pre <enter|exit> <tag>
changeset tag

# Get help
changeset --help

# Get version
changeset --version
```

**Usage Examples:**

```bash
# Initialize changesets in a repository
changeset init

# Create a new changeset interactively
changeset
changeset add

# Create empty changeset for CI workflows
changeset add --empty

# Update package versions
changeset version

# Publish packages to npm
changeset publish --otp 123456

# Check status with verbose output
changeset status --verbose --output status.json
```

### Repository Initialization

Sets up a new repository with changesets configuration and default files, creating the `.changeset` folder with initial configuration.

```bash { .api }
# Initialize changesets in current directory
changeset init
```

**Usage Examples:**

```bash
# Initialize changesets in a new project
cd my-project
changeset init

# This creates:
# - .changeset/config.json (configuration file)
# - .changeset/README.md (documentation)
```

**Configuration Created:**

The `init` command creates a `.changeset/config.json` file with default settings that can be customized for your project's needs.

### Tag Management

Creates git tags for published packages, typically used after successful publishing to mark release points in git history.

```bash { .api }
# Create git tags for published packages
changeset tag
```

**Usage Examples:**

```bash
# Tag all packages that have been published but not yet tagged
changeset tag

# This is typically run after:
# 1. changeset version (to update versions)
# 2. git add . && git commit (to commit version changes)
# 3. changeset publish (to publish to npm)
# 4. changeset tag (to create git tags)
```

**Workflow Integration:**

The `tag` command is typically used in automated release workflows to ensure git history is properly marked with release versions.

## CLI Flag Processing

### Supported Flags

```typescript { .api }
type CliOptions = {
  sinceMaster?: boolean;    // Check changes since master (deprecated)
  verbose?: boolean;        // Detailed output
  output?: string;          // JSON output file path
  otp?: string;            // One-time password for 2FA
  empty?: boolean;         // Create empty changeset
  since?: string;          // Custom branch to compare against
  ignore?: string | string[]; // Packages to ignore
  snapshot?: string | boolean; // Snapshot release mode
  snapshotPrereleaseTemplate?: string; // Template for snapshot prereleases
  prettier?: boolean;      // Format with prettier (legacy)
  tag?: string;           // Custom npm dist-tag
  gitTag?: boolean;       // Whether to create git tags
  open?: boolean;         // Open changeset in editor
};
```

### Flag Processing Examples

```bash
# Multiple ignore packages
changeset version --ignore @myorg/internal-pkg --ignore @myorg/test-utils

# Snapshot release with custom template
changeset version --snapshot canary --snapshot-prerelease-template "{tag}-{commit}-{timestamp}"

# Publish with custom tag and no git tags
changeset publish --tag next --no-git-tag --otp $NPM_OTP

# Verbose status output to file
changeset status --verbose --output release-plan.json
```

## Error Handling

The command interface provides comprehensive error handling for common scenarios:

```typescript { .api }
// Built-in error types from @changesets/errors
class ExitError extends Error {
  code: number;
}

class InternalError extends Error {
  // Unexpected internal errors that should be reported
}
```

**Error Scenarios:**
- Missing `.changeset` folder (prompts to run `changeset init`)
- Invalid configuration files (guides migration from v1 to v2)
- Unknown commands (provides help text)
- Invalid package names in ignore flags
- Conflicting configuration between CLI flags and config file

## Configuration Integration

Commands automatically load and validate changesets configuration from `.changeset/config.json`:

**Configuration Loading:**
- Validates package names in ignore flags
- Checks dependency graph for skipped packages  
- Detects and guides migration from v1 to v2 config format
- Applies command-line flag overrides to configuration settings

**Configuration Precedence:**
1. Command-line flags (highest priority)
2. `.changeset/config.json` settings
3. Built-in defaults (lowest priority)

## Help and Version Information

```bash
# Display help information
changeset --help

# Display version information
changeset --version
```

The CLI provides built-in help text with command descriptions and flag options, automatically generated from the command definitions.