# Package Publishing

Package publishing automates the process of releasing packages to npm registries with support for 2FA, custom tags, git tagging, and multi-package coordination.

## Capabilities

### Main Publishing Function

The primary function for publishing packages to npm and creating git tags.

```typescript { .api }
/**
 * Publishes packages to npm registry and creates git tags
 * @param cwd - Working directory path
 * @param options.otp - One-time password for 2FA authentication
 * @param options.tag - Custom npm dist-tag (defaults to "latest")
 * @param options.gitTag - Whether to create git tags (defaults to true)
 * @param config - Changesets configuration object
 */
function publish(
  cwd: string, 
  options: {otp?: string, tag?: string, gitTag?: boolean}, 
  config: Config
): Promise<void>;
```

**Usage Examples:**

```typescript
import { run } from "@changesets/cli";

// Standard publishing
await run(["publish"], {}, cwd);

// Publishing with 2FA token
await run(["publish"], { otp: "123456" }, cwd);

// Publishing with custom tag
await run(["publish"], { tag: "beta" }, cwd);

// Publishing without git tags
await run(["publish"], { gitTag: false }, cwd);
```

### Core Package Publishing

Lower-level function for publishing individual packages with detailed control.

```typescript { .api }
/**
 * Core package publishing logic for multiple packages
 * @param options.packages - Array of packages to publish
 * @param options.access - Package access level (public or restricted)
 * @param options.otp - One-time password for 2FA
 * @param options.preState - Prerelease state for coordinated prereleases
 * @param options.tag - Custom npm dist-tag
 * @returns Array of publish results with success/failure status
 */
function publishPackages(options: {
  packages: Package[], 
  access: AccessType, 
  otp?: string, 
  preState: PreState | undefined, 
  tag?: string
}): Promise<PublishedResult[]>;
```

**Usage Examples:**

```typescript
import publishPackages from "@changesets/cli/src/commands/publish/publishPackages";

const results = await publishPackages({
  packages: packagesToPublish,
  access: "public",
  otp: process.env.NPM_OTP,
  preState: undefined,
  tag: "latest"
});

// Check results
results.forEach(result => {
  if (result.published) {
    console.log(`✓ Published ${result.name}@${result.newVersion}`);
  } else {
    console.log(`✗ Failed to publish ${result.name}`);
  }
});
```

## NPM Registry Integration

### Registry Detection and Configuration

Utilities for handling npm registry configuration and authentication.

```typescript { .api }
/**
 * Determines the correct npm registry for a package
 * @param packageJson - Package.json object (optional)
 * @returns Registry information including scope and URL
 */
function getCorrectRegistry(packageJson?: PackageJSON): RegistryInfo;

/**
 * Checks if 2FA token is required for publishing
 * @returns Promise resolving to boolean indicating 2FA requirement
 */
function getTokenIsRequired(): Promise<boolean>;

/**
 * Gets package information from npm registry
 * @param packageJson - Package.json object
 * @returns Promise resolving to package registry information
 */
function getPackageInfo(packageJson: PackageJSON): Promise<any>;

/**
 * Gets package info from registry, handling 404s gracefully
 * @param packageJson - Package.json object  
 * @returns Promise resolving to publish status and package info
 */
function infoAllow404(
  packageJson: PackageJSON
): Promise<{published: boolean, pkgInfo: any}>;
```

### Two-Factor Authentication

Comprehensive 2FA support for secure publishing:

```typescript { .api }
/**
 * Gets 2FA token from user input or existing state
 * @param twoFactorState - Current 2FA state object
 * @returns Promise resolving to OTP token string
 */
function getOtpCode(twoFactorState: TwoFactorState): Promise<string>;

/**
 * Publishes a single package to npm with 2FA support
 * @param packageJson - Package.json object
 * @param opts - Publishing options including registry and access
 * @param twoFactorState - 2FA state for token management
 * @returns Promise resolving to publish result
 */
function publish(
  packageJson: PackageJSON, 
  opts: PublishOptions, 
  twoFactorState: TwoFactorState
): Promise<{published: boolean}>;
```

**2FA State Management:**

```typescript { .api }
interface TwoFactorState {
  token: string | null;
  isRequired: Promise<boolean>;
}
```

## Git Tag Management

### Automatic Git Tagging

Publishing automatically creates git tags for published versions:

```typescript
// Default tag format: {packageName}@{version}
// Examples:
// @myorg/ui@1.2.0
// my-package@2.1.0
```

### Manual Tag Creation

Separate tag creation for packages that were published externally:

```typescript { .api }
/**
 * Creates git tags for published packages
 * @param cwd - Working directory path
 * @param config - Changesets configuration object
 */
function tag(cwd: string, config: Config): Promise<void>;
```

### Untagged Package Detection

Utility to find packages missing git tags after publishing:

```typescript { .api }
/**
 * Finds packages that are missing git tags
 * @param packages - Array of package objects
 * @param cwd - Working directory path
 * @param tool - Package manager tool type
 * @returns Promise resolving to array of packages needing tags
 */
function getUntaggedPackages(
  packages: Package[], 
  cwd: string, 
  tool: Tool
): Promise<PublishedResult[]>;
```

## Access Control and Visibility

### Package Access Configuration

```typescript { .api }
type AccessType = "restricted" | "public";

// Configuration options
interface Config {
  access: "restricted" | "public";  // Default access level
  privatePackages: {
    version: boolean;  // Whether to version private packages
    tag: boolean;      // Whether to tag private packages  
  };
}
```

### Per-Package Access Control

Individual packages can override global access settings:

```json
{
  "name": "@myorg/public-package",
  "publishConfig": {
    "access": "public"
  }
}
```

## Registry Configuration

### Scoped Package Registries

Support for publishing scoped packages to custom registries:

```typescript { .api }
interface RegistryInfo {
  scope?: string;    // Package scope (e.g., "@myorg")
  registry: string;  // Registry URL
}
```

### Registry URL Resolution

```javascript
// .npmrc configuration examples
registry=https://registry.npmjs.org/
@myorg:registry=https://npm.myorg.com/
//npm.myorg.com/:_authToken=${NPM_TOKEN}
```

## Publishing Workflow

### Standard Publishing Flow

1. **Validation**: Check that packages are ready for publishing
2. **Registry Check**: Verify package doesn't already exist at target version
3. **Authentication**: Handle 2FA tokens and registry authentication
4. **Publishing**: Upload packages to registry with proper access settings
5. **Git Tagging**: Create git tags for successfully published packages
6. **Cleanup**: Update local state and cleanup temporary files

### Prerelease Publishing

For packages in prerelease mode:

```typescript
// Prerelease packages use the prerelease tag
// Example: 1.0.0-beta.1 published with tag "beta"
await publish(cwd, { tag: "beta" }, config);
```

### Snapshot Publishing

Snapshot releases are published with temporary versions:

```typescript
// Snapshot versions like 0.0.0-20231201-abc1234
// Published with "snapshot" tag by default
await publish(cwd, { tag: "snapshot" }, config);
```

## Error Handling and Recovery

### Common Publishing Errors

- **Authentication failures**: Invalid or expired tokens
- **Version conflicts**: Package version already exists in registry
- **Network issues**: Registry connectivity problems
- **Permission errors**: Insufficient publish permissions

### Retry Logic

The publishing system includes built-in retry logic for transient failures:

```typescript
// Automatic retry for network-related failures
// Manual retry prompts for authentication issues
// Graceful degradation for partial publish failures
```

### Partial Failure Handling

When publishing multiple packages, the system handles partial failures gracefully:

```typescript { .api }
interface PublishedResult {
  name: string;
  newVersion: string;
  published: boolean;
}

// Results indicate which packages succeeded/failed
// Failed packages can be retried individually
// Git tags are only created for successfully published packages
```

## Configuration Options

### Publishing Configuration

```json
{
  "access": "restricted",
  "privatePackages": {
    "version": true,
    "tag": false
  }
}
```

### Custom Publish Scripts

Integration with custom publish workflows:

```json
{
  "scripts": {
    "changeset:publish": "changeset publish",
    "changeset:publish:beta": "changeset publish --tag beta",
    "changeset:publish:dry": "changeset publish --dry-run"
  }
}
```

## Types

```typescript { .api }
interface PublishOptions {
  registry?: string;
  tag?: string;
  access?: AccessType;
  dryRun?: boolean;
}

interface PublishedResult {
  name: string;
  newVersion: string;
  published: boolean;
}

type Tool = "yarn" | "npm" | "pnpm";

interface PreState {
  mode: "pre";
  tag: string;
  initialVersions: Record<string, string>;
  changesets: string[];
}
```