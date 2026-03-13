# Prerelease Management

Prerelease management enables controlled pre-production releases with coordinated versioning across multiple packages, supporting alpha, beta, and release candidate workflows.

## Capabilities

### Prerelease Mode Control

Main function for entering and exiting prerelease mode with coordinated state management.

```typescript { .api }
/**
 * Manages prerelease mode (enter/exit) with coordinated state tracking
 * @param cwd - Working directory path
 * @param options.command - Either "enter" to start prerelease mode or "exit" to end it
 * @param options.tag - Prerelease tag (required for enter, optional for exit)
 */
function pre(
  cwd: string, 
  options: {command: "enter", tag: string} | {command: "exit", tag?: string}
): Promise<void>;
```

**Usage Examples:**

```typescript
import { run } from "@changesets/cli";

// Enter prerelease mode with beta tag
await run(["pre", "enter", "beta"], {}, cwd);

// Enter prerelease mode with alpha tag
await run(["pre", "enter", "alpha"], {}, cwd);

// Exit prerelease mode
await run(["pre", "exit"], {}, cwd);
```

### Prerelease State Management

Prerelease mode maintains state to coordinate releases across packages:

```typescript { .api }
interface PreState {
  mode: "pre";
  tag: string;                              // Prerelease tag (e.g., "beta", "alpha")
  initialVersions: Record<string, string>;  // Package versions when entering prerelease
  changesets: string[];                     // Changesets consumed in prerelease mode
}
```

## Prerelease Workflow

### Entering Prerelease Mode

When entering prerelease mode:

1. **Captures current versions** as baseline for eventual graduation
2. **Creates prerelease state file** (`.changeset/pre.json`)
3. **Configures version calculation** for prerelease versioning
4. **Enables coordinated prerelease** across all packages

```bash
# CLI usage
changeset pre enter beta

# This creates .changeset/pre.json:
{
  "mode": "pre",
  "tag": "beta",
  "initialVersions": {
    "@myorg/ui": "1.2.0",
    "@myorg/utils": "2.1.0"
  },
  "changesets": []
}
```

### Prerelease Versioning

While in prerelease mode, version updates follow prerelease patterns:

```typescript
// Standard versions become prereleases
// 1.2.0 -> 1.2.1-beta.0 (first prerelease)
// 1.2.1-beta.0 -> 1.2.1-beta.1 (subsequent prereleases)
// 2.0.0 -> 2.0.0-beta.0 (major prerelease)
```

### Exiting Prerelease Mode

When exiting prerelease mode:

1. **Removes prerelease state file**
2. **Graduates to stable versions** based on accumulated changes
3. **Resets changeset tracking** for normal release workflow

```bash
# CLI usage
changeset pre exit

# Versions graduate to stable:
# 1.2.1-beta.3 -> 1.2.1
# 2.0.0-beta.1 -> 2.0.0
```

## Prerelease Version Calculation

### Version Bump Logic

In prerelease mode, version bumps follow special rules:

```typescript
// Patch changes: 1.0.0 -> 1.0.1-beta.0
// Minor changes: 1.0.0 -> 1.1.0-beta.0  
// Major changes: 1.0.0 -> 2.0.0-beta.0

// Subsequent prereleases increment prerelease number:
// 1.0.1-beta.0 -> 1.0.1-beta.1
// 1.1.0-beta.0 -> 1.1.0-beta.1
```

### Coordinated Prerelease Versioning

All packages in prerelease mode are coordinated:

```typescript
// Even if only one package has changes, all packages get prerelease versions
// This ensures consistent prerelease state across the entire project
```

## Integration with Standard Workflow

### Creating Prereleases

Standard changeset workflow applies in prerelease mode:

```bash
# 1. Enter prerelease mode
changeset pre enter beta

# 2. Create changesets as normal
changeset add

# 3. Version with prerelease calculation
changeset version

# 4. Publish with prerelease tag
changeset publish --tag beta
```

### Publishing Prereleases

Prereleases should be published with matching npm dist-tags:

```typescript
import publish from "@changesets/cli/src/commands/publish";

// Publish with matching tag to prevent affecting latest
await publish(cwd, { tag: "beta" }, config);

// This ensures: npm install @myorg/ui@beta
// Instead of affecting: npm install @myorg/ui (latest)
```

## Prerelease Tags and Conventions

### Common Prerelease Tags

- **alpha**: Early development releases with breaking changes expected
- **beta**: Feature-complete releases with potential bugs
- **rc** (release candidate): Near-final releases with minimal expected changes
- **next**: Upcoming feature releases
- **canary**: Automated releases from main branch

### Tag-based Workflows

Different tags can represent different stages:

```bash
# Development flow
changeset pre enter alpha    # Early development
# ... development and testing ...
changeset pre exit
changeset pre enter beta     # Feature complete
# ... testing and stabilization ...
changeset pre exit
changeset pre enter rc       # Release candidate
# ... final testing ...
changeset pre exit           # Graduate to stable
```

## Configuration and Customization

### Prerelease Template Configuration

Customize prerelease version formats:

```json
{
  "snapshot": {
    "prereleaseTemplate": "{tag}.{datetime}.{commit}"
  }
}
```

### Prerelease-specific Settings

```typescript { .api }
interface Config {
  privatePackages: {
    version: boolean;
    tag: boolean;     // Whether to tag private packages in prereleases
  };
}
```

## Advanced Prerelease Patterns

### Multiple Prerelease Tracks

Support for parallel prerelease tracks:

```bash
# Feature branch prereleases  
changeset pre enter feat-new-ui

# Hotfix prereleases
changeset pre enter hotfix-security

# Each track maintains independent state
```

### Conditional Prerelease Logic

Integration with CI/CD for automatic prerelease management:

```bash
# Automatic prerelease entry based on branch
if [[ $BRANCH == "develop" ]]; then
  changeset pre enter beta
elif [[ $BRANCH == "release/*" ]]; then
  changeset pre enter rc
fi
```

## Graduation Strategy

### Version Graduation

When exiting prerelease mode, versions graduate appropriately:

```typescript
// Prerelease versions graduate to their base version
// 1.2.0-beta.3 -> 1.2.0
// 2.0.0-alpha.1 -> 2.0.0

// Additional changes since entering prerelease may bump further
// If entering at 1.0.0 with minor changes -> 1.1.0-beta.0
// On exit with patch changes -> 1.1.1 (not 1.1.0)
```

### Changeset Accumulation

Changesets consumed during prerelease are tracked:

```json
{
  "mode": "pre",
  "tag": "beta", 
  "changesets": [
    "brave-lions-sing",
    "wild-dogs-jump",
    "calm-birds-fly"
  ]
}
```

These changesets determine final version calculation on graduation.

## Error Handling and Validation

### Prerelease State Validation

- **Valid tags**: Ensures prerelease tags follow npm semver conventions
- **State consistency**: Validates prerelease state file integrity
- **Version compatibility**: Ensures existing versions support prerelease graduation

### Common Prerelease Errors

- **Already in prerelease mode**: Attempting to enter when already active
- **Not in prerelease mode**: Attempting to exit when not active  
- **Invalid tag format**: Using tags that don't follow semver conventions
- **State file corruption**: Handling damaged or invalid prerelease state

### Recovery and Cleanup

```typescript
// Manual state cleanup if needed
fs.unlinkSync('.changeset/pre.json');

// Reset to normal versioning mode
// Warning: This loses prerelease tracking state
```

## CI/CD Integration

### Automated Prerelease Workflows

```yaml
# GitHub Actions example
name: Prerelease
on:
  push:
    branches: [develop]

jobs:
  prerelease:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: changeset pre enter beta
      - run: changeset version
      - run: changeset publish --tag beta
```

### Branch-based Prerelease Management

```bash
# Automatic prerelease management based on branch patterns
case $GITHUB_REF in
  refs/heads/develop)
    changeset pre enter beta
    ;;
  refs/heads/release/*)
    changeset pre enter rc
    ;;
  refs/heads/main)
    changeset pre exit  # Graduate to stable
    ;;
esac
```