# Version Management

Version management automates the process of bumping package versions and generating changelogs based on accumulated changesets. This is the core transformation step that converts changeset intentions into concrete version updates.

## Capabilities

### Version Updating

Main function that processes all changesets and updates package versions accordingly.

```typescript { .api }
/**
 * Updates package versions and generates changelogs based on changesets
 * @param cwd - Working directory path
 * @param options.snapshot - Snapshot release mode (boolean or custom tag name)
 * @param config - Changesets configuration object
 */
function version(
  cwd: string, 
  options: {snapshot?: string | boolean}, 
  config: Config
): Promise<void>;
```

**Usage Examples:**

```typescript
import { run } from "@changesets/cli";

// Standard version update
await run(["version"], {}, cwd);

// Snapshot release with default naming
await run(["version"], { snapshot: true }, cwd);

// Snapshot release with custom tag
await run(["version"], { snapshot: "canary" }, cwd);
```

### Snapshot Releases

Snapshot releases allow for experimental or pre-production versions without affecting the main release flow.

**Snapshot Version Format:**
- Default: `0.0.0-{timestamp}-{commit}`
- Custom tag: `0.0.0-{tag}-{timestamp}-{commit}`
- Template-based: Configurable via `snapshotPrereleaseTemplate`

```typescript
// Snapshot with custom template
config.snapshot.prereleaseTemplate = "{tag}-{commit}-{timestamp}";
await version(cwd, { snapshot: "alpha" }, config);
// Result: 1.2.3-alpha-abc1234-20231201120000
```

## Version Calculation

### Semver Bump Logic

The version command processes changesets to determine appropriate version bumps:

1. **Collects all changesets** since the last release
2. **Calculates highest semver bump** for each package
3. **Updates internal dependencies** based on configuration
4. **Handles linked packages** for coordinated releases
5. **Generates changelogs** using configured changelog functions

### Internal Dependency Updates

```typescript { .api }
// Configuration options for internal dependency handling
interface Config {
  updateInternalDependencies: "patch" | "minor";
  bumpVersionsWithWorkspaceProtocolOnly: boolean;
  linked: ReadonlyArray<ReadonlyArray<string>>;
  fixed: ReadonlyArray<ReadonlyArray<string>>;
}
```

**Dependency Update Rules:**
- **Patch**: Internal dependencies updated as patch versions
- **Minor**: Internal dependencies updated as minor versions
- **Workspace Protocol**: Only bump workspace: protocol dependencies
- **Linked Packages**: Coordinated version bumps across related packages
- **Fixed Packages**: All packages in group receive same version

## Changelog Generation

### Default Changelog Format

Changesets automatically generates CHANGELOG.md files for each updated package:

```markdown
# @myorg/ui

## 1.2.0

### Minor Changes

- abc1234: Added new Button component with accessibility features

### Patch Changes

- def5678: Fixed styling issue in Card component
- Updated dependencies
  - @myorg/utils@2.1.0
```

### Custom Changelog Functions

```typescript { .api }
// Configuration for custom changelog generation
interface Config {
  changelog: readonly [string, any] | false;
}

// Example configuration
{
  "changelog": ["@changesets/changelog-git", {
    "repo": "myorg/myrepo"
  }]
}
```

## Package Filtering

### Ignore Packages

Exclude specific packages from version updates:

```typescript
// Via CLI flags
await run(["version"], { 
  ignore: ["@myorg/internal", "@myorg/docs"] 
}, cwd);

// Via configuration
{
  "ignore": ["@myorg/internal", "@myorg/docs"]
}
```

### Private Package Handling

```typescript { .api }
interface Config {
  privatePackages: {
    version: boolean;  // Whether to version private packages
    tag: boolean;      // Whether to tag private packages
  };
}
```

### Versionable Package Detection

Utility function to identify packages that should be versioned:

```typescript { .api }
/**
 * Gets changed packages that are versionable
 * @param config - Changesets configuration
 * @param options.cwd - Working directory
 * @param options.ref - Git reference to compare against
 * @returns Promise resolving to array of versionable packages
 */
function getVersionableChangedPackages(
  config: Config, 
  options: {cwd: string, ref?: string}
): Promise<Package[]>;
```

## Release Planning

### Release Plan Generation

The version command uses release planning to coordinate updates:

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
```

### Prerelease State Management

For packages in prerelease mode:

```typescript { .api }
interface PreState {
  mode: "pre";
  tag: string;
  initialVersions: Record<string, string>;
  changesets: string[];
}
```

## Validation and Safety

### Dependency Graph Validation

Before version updates, the system validates:

1. **Circular dependencies** are properly handled
2. **Version constraints** remain satisfied
3. **Workspace dependencies** are correctly updated
4. **Peer dependencies** receive appropriate bumps

### Changeset Processing

```typescript
// Changesets are processed and then deleted
// This ensures each changeset is only applied once
const changesets = await read(cwd);
// ... process changesets ...
await cleanupChangesets(changesets);
```

### Git Integration

Version updates integrate with git workflows:

1. **Reads changesets** from `.changeset` directory
2. **Updates package.json** files with new versions
3. **Generates/updates CHANGELOG.md** files
4. **Deletes processed changesets** to prevent reuse
5. **Optionally commits changes** with configured commit messages

## Error Handling

### Common Version Errors

- **No changesets found**: Exits without making changes
- **Invalid semver bumps**: Validates semver compliance
- **Dependency conflicts**: Reports unresolvable dependency issues
- **File system errors**: Handles permission and access issues

### Dependency Validation

```typescript
// Validates that all dependents of ignored packages are also ignored
const dependentsGraph = getDependentsGraph(packages);
for (const skippedPackage of ignoredPackages) {
  const dependents = dependentsGraph.get(skippedPackage);
  // Ensure all dependents are also ignored
}
```

## Configuration Options

### Version Bump Configuration

```json
{
  "updateInternalDependencies": "patch",
  "bumpVersionsWithWorkspaceProtocolOnly": false,
  "snapshot": {
    "useCalculatedVersion": false,
    "prereleaseTemplate": null
  }
}
```

### Linked and Fixed Packages

```json
{
  "linked": [
    ["@myorg/ui", "@myorg/theme"],
    ["@myorg/client", "@myorg/server"]
  ],
  "fixed": [
    ["@myorg/core", "@myorg/utils", "@myorg/helpers"]
  ]
}
```

**Linked vs Fixed:**
- **Linked**: Packages are versioned together when any receives a changeset
- **Fixed**: All packages always receive the same version number