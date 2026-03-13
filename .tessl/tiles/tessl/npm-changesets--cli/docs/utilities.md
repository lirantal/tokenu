# Changelog and Commit Utilities

The @changesets/cli package provides two main utility exports for custom changelog generation and commit message formatting, which are used in advanced integrations and configuration.

## Capabilities

### Changelog Utilities

Re-exports the default changelog generator from @changesets/changelog-git for Git-based changelog generation.

```typescript { .api }
// Default export from @changesets/cli/changelog
import changelogGit from "@changesets/cli/changelog";

// This is equivalent to:
import changelogGit from "@changesets/changelog-git";
```

**Usage Examples:**

```typescript
import changelogGit from "@changesets/cli/changelog";

// Use in .changeset/config.json changelog configuration
{
  "changelog": ["@changesets/cli/changelog", {
    "repo": "owner/repo-name"
  }]
}

// The changelog utility generates git-based changelogs
// with commit links and author information
```

### Commit Message Utilities

Provides standard commit message generation functions for changeset operations.

```typescript { .api }
import commitFunctions from "@changesets/cli/commit";

interface CommitFunctions {
  /**
   * Generates commit message for adding changesets
   * @param changeset - Changeset object with summary and releases
   * @param options - Options including skip CI configuration
   * @returns Promise resolving to formatted commit message
   */
  getAddMessage(
    changeset: Changeset, 
    options: {skipCI?: boolean | "add" | "version"} | null
  ): Promise<string>;

  /**
   * Generates commit message for version updates
   * @param releasePlan - Complete release plan with all package updates
   * @param options - Options including skip CI configuration  
   * @returns Promise resolving to formatted commit message
   */
  getVersionMessage(
    releasePlan: ReleasePlan, 
    options: {skipCI?: boolean | "add" | "version"} | null
  ): Promise<string>;
}
```

**Usage Examples:**

```typescript
import commitFunctions from "@changesets/cli/commit";

const { getAddMessage, getVersionMessage } = commitFunctions;

// Generate commit message for changeset creation
const addMessage = await getAddMessage(changeset, { skipCI: false });
// Result: "docs(changeset): Add new Button component with accessibility features"

// Generate commit message for version updates  
const versionMessage = await getVersionMessage(releasePlan, { skipCI: "version" });
// Result: "RELEASING: Releasing 3 package(s)\n\nReleases:\n  @myorg/ui@1.2.0\n  @myorg/utils@1.1.1\n\n[skip ci]"
```

### Configuration Integration

Both utilities can be integrated into changesets configuration:

```json
{
  "changelog": ["@changesets/cli/changelog", {
    "repo": "myorg/myrepo"
  }],
  "commit": ["@changesets/cli/commit", {
    "skipCI": "version"
  }]
}
```

**Commit Message Patterns:**

- **Add messages**: `"docs(changeset): {changeset.summary}"`
- **Version messages**: `"RELEASING: Releasing X package(s)\n\nReleases:\n  package@version"`
- **Skip CI**: Adds `[skip ci]` when configured

## Types

```typescript { .api }
interface Changeset {
  summary: string;
  releases: Array<{
    name: string;
    type: "major" | "minor" | "patch";
  }>;
}

interface ReleasePlan {
  releases: Array<{
    name: string;
    newVersion: string;
    type: "major" | "minor" | "patch" | "none";
  }>;
  changesets: Changeset[];
}
```

## Note on Internal Utilities

The @changesets/cli package contains many internal utility functions for interactive prompts, package analysis, and workflow automation. However, these are not part of the public API and should not be imported directly. 

For programmatic package management operations, use the individual @changesets/* packages:

- `@changesets/config` - Configuration management
- `@changesets/read` - Reading changesets
- `@changesets/write` - Writing changesets  
- `@changesets/apply-release-plan` - Applying version updates
- `@changesets/git` - Git operations