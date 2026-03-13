# Status and Monitoring

Status and monitoring capabilities provide comprehensive visibility into changeset status, release planning, and CI/CD integration for automated workflows.

## Capabilities

### Status Reporting

Main function that provides detailed information about current changesets and planned releases.

```typescript { .api }
/**
 * Shows status of packages and changesets with detailed release planning
 * @param cwd - Working directory path
 * @param options.sinceMaster - Check changes since master branch (deprecated)
 * @param options.since - Custom branch or tag to compare against
 * @param options.verbose - Include detailed output with new versions and changeset links
 * @param options.output - JSON output file path for machine-readable results
 * @param config - Changesets configuration object
 * @returns Promise resolving to ReleasePlan object or void
 */
function status(
  cwd: string, 
  options: {
    sinceMaster?: boolean, 
    since?: string, 
    verbose?: boolean, 
    output?: string
  }, 
  config: Config
): Promise<ReleasePlan | void>;
```

**Usage Examples:**

```typescript
import { run } from "@changesets/cli";

// Basic status check
await run(["status"], {}, cwd);

// Verbose status with detailed information
await run(["status"], { verbose: true }, cwd);

// Status since specific branch
await run(["status"], { since: "main" }, cwd);

// Export status to JSON file
await run(["status"], { 
  output: "./release-plan.json",
  verbose: true 
}, cwd);
```

## Release Planning

### Release Plan Structure

The status command generates comprehensive release plans showing what will be released:

```typescript { .api }
interface ReleasePlan {
  changesets: Changeset[];
  releases: Release[];
  preState: PreState | undefined;
}

interface Release {
  name: string;
  type: "major" | "minor" | "patch" | "none";
  oldVersion: string;
  newVersion: string;
  changelog: string | null;
}

interface Changeset {
  id: string;
  summary: string;
  releases: Array<{name: string, type: "major" | "minor" | "patch"}>;
}
```

### Status Output Formats

**Console Output:**
```
🦋  info The following packages are included in this release:
🦋  info @myorg/ui: patch => 1.2.1
🦋  info @myorg/utils: minor => 2.1.0
🦋  info @myorg/core: major => 3.0.0
```

**JSON Output:**
```json
{
  "releases": [
    {
      "name": "@myorg/ui",
      "type": "patch", 
      "oldVersion": "1.2.0",
      "newVersion": "1.2.1",
      "changelog": "Fixed button styling issue"
    }
  ],
  "changesets": [
    {
      "id": "brave-lions-sing",
      "summary": "Fixed button styling issue",
      "releases": [{"name": "@myorg/ui", "type": "patch"}]
    }
  ]
}
```

## CI/CD Integration

### Exit Codes

The status command uses exit codes for CI integration:

- **Exit 0**: No issues found, ready for release or no changes
- **Exit 1**: Changes detected but no changesets present (requires action)

### Automated Changeset Detection

```bash
# CI script example
changeset status --since=origin/main
if [ $? -eq 1 ]; then
  echo "Changes detected but no changesets found"
  exit 1
fi
```

### JSON Output for Automation

Machine-readable output enables sophisticated CI workflows:

```typescript
// Parse JSON output in CI scripts
const releasePlan = JSON.parse(fs.readFileSync('release-plan.json', 'utf8'));

// Check if specific packages are being released
const isUiPackageReleased = releasePlan.releases.some(
  release => release.name === '@myorg/ui' && release.type !== 'none'
);

// Conditional deployment based on release plan
if (isUiPackageReleased) {
  // Run UI-specific deployment steps
}
```

## Change Detection

### Git-based Change Detection

Status monitoring integrates with git to detect changes since specific references:

```typescript
// Compare against specific branch
await status(cwd, { since: "origin/main" }, config);

// Compare against specific tag  
await status(cwd, { since: "v1.0.0" }, config);

// Compare against commit hash
await status(cwd, { since: "abc123" }, config);
```

### Package Change Analysis

Analyzes which packages have changes and need potential releases:

```typescript { .api }
/**
 * Gets packages that have changes and are eligible for versioning
 * @param config - Changesets configuration
 * @param options.cwd - Working directory path
 * @param options.ref - Git reference to compare against
 * @returns Promise resolving to array of changed packages
 */
function getVersionableChangedPackages(
  config: Config, 
  options: {cwd: string, ref?: string}
): Promise<Package[]>;
```

## Validation and Health Checks

### Changeset Validation

Status checking includes comprehensive validation:

1. **Changeset Format**: Validates YAML frontmatter and markdown structure
2. **Package References**: Ensures referenced packages exist in repository
3. **Semver Compliance**: Validates version bump types
4. **Dependency Consistency**: Checks internal dependency relationships

### Repository Health

```typescript
// Health checks performed during status analysis:
// - .changeset directory exists and is properly configured
// - All changesets reference valid packages
// - No conflicting version requirements
// - Dependency graph is resolvable
```

### Configuration Validation

Status reporting validates configuration consistency:

```typescript
// Validates:
// - ignore patterns match actual packages
// - linked/fixed package groups are valid
// - changelog and commit configuration is loadable
// - private package settings are consistent
```

## Verbose Output

### Detailed Release Information

With `--verbose` flag, status provides comprehensive details:

```typescript
// Enhanced output includes:
// - New version numbers for each package
// - Links to changeset files
// - Dependency update cascade effects
// - Private package handling details
// - Prerelease state information
```

### Changeset Summaries

Verbose mode displays changeset content:

```
🦋  Changeset: brave-lions-sing
🦋  Summary: Fixed button styling issue and improved accessibility
🦋  Releases:
🦋    @myorg/ui: patch
🦋    @myorg/theme: patch (dependency)
```

## Prerelease Status

### Prerelease Mode Detection

Status monitoring provides special handling for prerelease mode:

```typescript { .api }
interface PreState {
  mode: "pre";
  tag: string;
  initialVersions: Record<string, string>;
  changesets: string[];
}

// Status output indicates prerelease state
// Shows prerelease tag and planned prerelease versions
```

### Prerelease Version Calculation

```
🦋  info In prerelease mode (tag: beta)
🦋  info @myorg/ui: 1.2.0 => 1.2.1-beta.0  
🦋  info @myorg/utils: 2.0.0 => 2.1.0-beta.0
```

## Filtering and Scoping

### Package Filtering

Status can be scoped to specific packages or patterns:

```typescript
// Configuration-based filtering
{
  "ignore": ["@myorg/docs", "@myorg/examples"]
}

// Private package handling
{
  "privatePackages": {
    "version": false  // Exclude private packages from status
  }
}
```

### Branch-based Filtering

Compare only changes since specific branches or tags:

```bash
# Only show status for changes since main branch
changeset status --since=origin/main

# Show status for changes since last release tag
changeset status --since=$(git describe --tags --abbrev=0)
```

## Integration with External Tools

### GitHub Actions Integration

```yaml
name: Changeset Status
on: pull_request

jobs:
  status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - run: changeset status --output=status.json
      - uses: actions/upload-artifact@v3
        with:
          name: release-plan
          path: status.json
```

### Custom Tooling Integration

JSON output enables custom tools and dashboards:

```typescript
// Custom release dashboard
const statusData = JSON.parse(fs.readFileSync('status.json'));

// Generate release notifications
const releaseNotification = {
  packages: statusData.releases.filter(r => r.type !== 'none'),
  changesetCount: statusData.changesets.length,
  breaking: statusData.releases.some(r => r.type === 'major')
};
```

## Error Handling

### Common Status Errors

- **No .changeset directory**: Repository not initialized
- **Invalid changesets**: Malformed YAML or missing packages
- **Git errors**: Unable to detect changes or access git history
- **Configuration errors**: Invalid configuration options

### Graceful Degradation

Status monitoring provides useful information even with partial failures:

```typescript
// Continues analysis even if some changesets are invalid
// Reports validation issues while showing available information
// Provides suggestions for resolving configuration problems
```