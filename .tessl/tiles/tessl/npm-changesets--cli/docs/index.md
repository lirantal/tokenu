# Changesets CLI

Changesets CLI is a comprehensive command-line tool for managing package versioning, changelog generation, and publishing workflows in both monorepo and single-package repositories. It implements the changesets workflow where developers declare release intentions through changeset files, then automates version bumping, changelog generation, and coordinated publishing.

## Package Information

- **Package Name**: @changesets/cli
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install @changesets/cli` or `yarn add @changesets/cli`

## Core Imports

The primary use of @changesets/cli is via the CLI binary. Programmatic usage is limited to specific utilities:

CLI binary:
```bash
npx @changesets/cli
# or if installed globally/locally
changeset
```

Changelog utilities:
```typescript
import changelogGit from "@changesets/cli/changelog";
```

Commit utilities:
```typescript
import commitFunctions from "@changesets/cli/commit";
```

For programmatic functionality, use individual @changesets/* packages instead:
```typescript
import { add } from "@changesets/cli"; // Not available - use CLI
// Instead use individual packages:
import { read } from "@changesets/config";
import { write } from "@changesets/write";
```

## Basic Usage

### CLI Usage
```bash
# Initialize changesets in a repository
changeset init

# Create a new changeset
changeset add
# or simply
changeset

# Update package versions based on changesets
changeset version

# Publish packages to npm
changeset publish

# Check changeset status
changeset status
```

### Programmatic Usage

The CLI does not expose a programmatic API. For programmatic usage, use individual @changesets packages:

```typescript
// Use individual packages instead of @changesets/cli
import { read } from "@changesets/config";
import { write } from "@changesets/write";
import { getPackages } from "@manypkg/get-packages";

// Example: Read changesets configuration
const config = await read("/path/to/repo", packages);

// Example: Write a changeset file
await write(changeset, "/path/to/repo");
```

Utility functions are available for specific integrations:
```typescript
import changelogGit from "@changesets/cli/changelog";
import commitFunctions from "@changesets/cli/commit";

// Use changelog functions
const changelog = changelogGit;

// Use commit message functions
const { getAddMessage, getVersionMessage } = commitFunctions;
```

## Architecture

Changesets CLI is built around several key components:

- **Command System**: Individual command modules (add, version, publish, etc.) that handle specific workflow stages
- **Configuration Management**: Integration with `@changesets/config` for repository-specific settings
- **Package Detection**: Multi-package repository support via `@manypkg/get-packages`
- **Release Planning**: Coordination of version bumps and dependency updates across packages
- **Interactive CLI**: Rich terminal interfaces using enquirer for user interaction
- **Git Integration**: Automatic tagging and change detection via `@changesets/git`

## Capabilities

### Command Interface

Core CLI commands for the complete changesets workflow, from creating changesets to publishing packages.

```bash { .api }
# Initialize changesets
changeset init

# Create a changeset  
changeset [add] [--empty] [--open]

# Update package versions
changeset version [--ignore] [--snapshot <?name>]

# Publish packages
changeset publish [--tag <name>] [--otp <code>] [--no-git-tag]

# Check status
changeset status [--since <branch>] [--verbose] [--output <file>]

# Pre-release management
changeset pre <enter|exit> <tag>

# Tag packages
changeset tag
```

[Command Interface](./commands.md)

### Changeset Creation

Interactive creation of changeset files that declare release intentions through CLI commands.

```bash { .api }
# Interactive changeset creation
changeset
changeset add

# Create empty changeset (for CI workflows)
changeset add --empty

# Create changeset and open in editor
changeset add --open
```

[Changeset Creation](./changeset-creation.md)

### Version Management

Automated version bumping and changelog generation based on accumulated changesets.

```bash { .api }
# Update package versions
changeset version

# Create snapshot version
changeset version --snapshot
changeset version --snapshot alpha

# Ignore specific packages
changeset version --ignore package-name

# Set snapshot prerelease template
changeset version --snapshot-prerelease-template "template"
```

[Version Management](./version-management.md)

### Package Publishing

Automated publishing to npm with support for 2FA, custom tags, and git tagging.

```bash { .api }
# Publish packages to npm
changeset publish

# Publish with OTP for 2FA
changeset publish --otp 123456

# Publish with custom tag
changeset publish --tag beta

# Publish without git tagging
changeset publish --no-git-tag
```

[Package Publishing](./publishing.md)

### Status and Monitoring

Tools for checking changeset status, planning releases, and CI integration.

```bash { .api }
# Check changeset status
changeset status

# Verbose output
changeset status --verbose

# Check since specific branch
changeset status --since main

# Export status to JSON file
changeset status --output status.json

# Check since master (deprecated)
changeset status --since-master
```

[Status and Monitoring](./status-monitoring.md)

### Prerelease Management

Support for prerelease workflows with custom tags and coordinated prerelease versioning.

```bash { .api }
# Enter prerelease mode with tag
changeset pre enter alpha
changeset pre enter beta
changeset pre enter rc

# Exit prerelease mode
changeset pre exit
changeset pre exit alpha
```

[Prerelease Management](./prerelease.md)

### Changelog and Commit Utilities

Utilities for custom changelog generation and commit message formatting, available as separate exports.

```typescript { .api }
// Changelog utility (re-exports @changesets/changelog-git)
import changelogGit from "@changesets/cli/changelog";

// Commit message utilities
import commitFunctions from "@changesets/cli/commit";
const { getAddMessage, getVersionMessage } = commitFunctions;

// Function signatures
function getAddMessage(
  changeset: Changeset, 
  options: { skipCI?: boolean | "add" | "version" } | null
): Promise<string>;

function getVersionMessage(
  releasePlan: ReleasePlan,
  options: { skipCI?: boolean | "add" | "version" } | null
): Promise<string>;
```

[Utility Functions](./utilities.md)

## Types

```typescript { .api }
// Core changeset and release types
type VersionType = "major" | "minor" | "patch" | "none";

interface Release {
  name: string;
  type: VersionType;
}

interface Changeset {
  summary: string;
  releases: Array<Release>;
}

interface NewChangeset extends Changeset {
  id: string;
}

interface ComprehensiveRelease {
  name: string;
  type: VersionType;
  oldVersion: string;
  newVersion: string;
  changesets: string[];
}

interface ReleasePlan {
  changesets: NewChangeset[];
  releases: ComprehensiveRelease[];
  preState: PreState | undefined;
}

interface PreState {
  mode: "pre" | "exit";
  tag: string;
  initialVersions: {[pkgName: string]: string};
  changesets: string[];
}

// Commit function types
interface CommitFunctions {
  getAddMessage(
    changeset: Changeset,
    options: { skipCI?: boolean | "add" | "version" } | null
  ): Promise<string>;
  
  getVersionMessage(
    releasePlan: ReleasePlan,
    options: { skipCI?: boolean | "add" | "version" } | null
  ): Promise<string>;
}

// Configuration types (from @changesets/config)
interface Config {
  changelog: readonly [string, any] | false;
  commit: readonly [string, any] | false;
  fixed: ReadonlyArray<ReadonlyArray<string>>;
  linked: ReadonlyArray<ReadonlyArray<string>>;
  access: "restricted" | "public";
  baseBranch: string;
  changedFilePatterns: readonly string[];
  prettier: boolean;
  updateInternalDependencies: "patch" | "minor";
  ignore: ReadonlyArray<string>;
  bumpVersionsWithWorkspaceProtocolOnly?: boolean;
  privatePackages: {
    version: boolean;
    tag: boolean;
  };
  snapshot: {
    useCalculatedVersion: boolean;
    prereleaseTemplate: string | null;
  };
}
```