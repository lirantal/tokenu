# Migration Tools

Built-in migration utilities for moving from tsup to tsdown with automatic configuration conversion. Provides seamless migration path with dry-run capabilities and comprehensive file updates.

## Capabilities

### Migration Function

Main migration function that converts tsup configurations and dependencies to tsdown equivalents.

```typescript { .api }
/**
 * Migrate from tsup to tsdown configuration and dependencies
 * @internal Not exported from main entry point - use CLI instead
 * @param options - Migration configuration options
 */
function migrate(options: {
  cwd?: string;
  dryRun?: boolean;
}): Promise<void>;
```

**Usage Examples:**

```typescript
// Note: migrate function is only available via CLI
// For programmatic usage, it's an internal function
// Use CLI: npx tsdown migrate

// If needed programmatically (not part of public API):
// import { migrate } from "tsdown/src/migrate";
```

### Migration Process

The migration process handles multiple aspects of converting from tsup to tsdown:

#### 1. Package.json Updates

**Dependency Fields Updated:**
- `dependencies` - Updates `tsup` to `tsdown` with current version
- `devDependencies` - Updates `tsup` to `tsdown` with current version  
- `peerDependencies` - Updates `tsup` to `tsdown` with wildcard version

**Script Updates:**
- Replaces `tsup` commands with `tsdown` in all scripts
- Handles `tsup-node` commands (also converted to `tsdown`)
- Preserves all command-line arguments and options

**Configuration Field Updates:**
- Renames `tsup` configuration field to `tsdown` in package.json

**Example Migration:**

```json
// Before migration
{
  "devDependencies": {
    "tsup": "^8.0.0"
  },
  "scripts": {
    "build": "tsup src/index.ts",
    "dev": "tsup src/index.ts --watch",
    "build:prod": "tsup-node --minify"
  },
  "tsup": {
    "entry": "src/index.ts",
    "format": ["esm", "cjs"]
  }
}

// After migration
{
  "devDependencies": {
    "tsdown": "^0.14.2"
  },
  "scripts": {
    "build": "tsdown src/index.ts",
    "dev": "tsdown src/index.ts --watch", 
    "build:prod": "tsdown --minify"
  },
  "tsdown": {
    "entry": "src/index.ts",
    "format": ["esm", "cjs"]
  }
}
```

#### 2. Configuration File Migration

**Supported Configuration Files:**
- `tsup.config.ts` → `tsdown.config.ts`
- `tsup.config.cts` → `tsdown.config.cts`
- `tsup.config.mts` → `tsdown.config.mts`
- `tsup.config.js` → `tsdown.config.js`
- `tsup.config.cjs` → `tsdown.config.cjs`
- `tsup.config.mjs` → `tsdown.config.mjs`
- `tsup.config.json` → `tsdown.config.json`

**Content Updates:**
- Replaces all instances of `tsup` with `tsdown` in code
- Replaces all instances of `TSUP` with `TSDOWN` in constants
- Updates import statements and references
- Preserves all existing configuration options and structure

**Example Configuration Migration:**

```typescript
// Before: tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  onSuccess: 'echo "TSUP build complete"'
});

// After: tsdown.config.ts  
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  onSuccess: 'echo "TSDOWN build complete"'
});
```

### Dry Run Mode

Preview migration changes without applying them to files.

```typescript { .api }
interface MigrateOptions {
  /**
   * Preview changes without applying them
   * @default false
   */
  dryRun?: boolean;
}
```

**Dry Run Output:**
- Shows unified diff of all file changes
- Displays package.json modifications
- Shows configuration file renames and content changes
- No files are actually modified

**Example Dry Run:**

```bash
tsdown migrate --dry-run

# Output:
[dry-run] package.json:
--- package.json
+++ package.json
@@ -2,7 +2,7 @@
   "name": "my-library",
   "devDependencies": {
-    "tsup": "^8.0.0"
+    "tsdown": "^0.14.2"
   },
   "scripts": {
-    "build": "tsup src/index.ts"
+    "build": "tsdown src/index.ts"
   }

[dry-run] tsup.config.ts -> tsdown.config.ts:
--- tsup.config.ts
+++ tsdown.config.ts
@@ -1,4 +1,4 @@
-import { defineConfig } from 'tsup';
+import { defineConfig } from 'tsdown';
```

### CLI Migration Command

Command-line interface for migration operations.

```bash
tsdown migrate [options]
```

**Options:**
- `-c, --cwd <dir>` - Working directory (default: current directory)
- `-d, --dry-run` - Preview changes without applying them

**Interactive Confirmation:**
The migration command includes safety prompts to prevent accidental changes:

```bash
tsdown migrate

# Output:
Before proceeding, review the migration guide at https://tsdown.dev/guide/migrate-from-tsup, 
as this process will modify your files.
Uncommitted changes will be lost. Use the --dry-run flag to preview changes without applying them.

Continue? (Y/n)
```

### Migration Validation

The migration process validates and reports on the success of operations:

#### Success Cases
- Dependencies found and updated successfully
- Scripts containing tsup commands updated
- Configuration files found and migrated
- All changes applied without errors

#### Error Cases
- No `package.json` found in target directory
- No tsup-related content found to migrate
- File system permission errors
- Invalid JSON in configuration files

#### Example Success Output

```bash
tsdown migrate

✓ Migrating `devDependencies` to tsdown.
✓ Migrating `build` script to tsdown
✓ Migrating `dev` script to tsdown  
✓ Found `tsup.config.ts`
✓ Migrated `tsup.config.ts` to `tsdown.config.ts`
✓ Migration completed. Remember to run install command with your package manager.
```

### Post-Migration Steps

After successful migration, users should:

1. **Install Dependencies**: Run package manager install command
   ```bash
   npm install
   # or
   yarn install
   # or  
   pnpm install
   ```

2. **Verify Configuration**: Test that existing build configurations work
   ```bash
   npm run build
   ```

3. **Update Documentation**: Update any documentation referencing tsup
4. **Commit Changes**: Commit the migration changes to version control

### Configuration Compatibility

tsdown maintains high compatibility with tsup configuration options:

- **Supported Options**: All major tsup options are supported in tsdown
- **New Options**: tsdown-specific options can be added after migration
- **Deprecated Options**: Warnings are shown for deprecated options with migration paths

### Workspace Migration

Migration works seamlessly with workspace/monorepo setups:

```bash
# Migrate root configuration
tsdown migrate

# Migrate individual packages
tsdown migrate --cwd packages/ui-lib
tsdown migrate --cwd packages/utils

# Or migrate all packages with a script
for dir in packages/*/; do
  tsdown migrate --cwd "$dir"
done
```

### Troubleshooting Migration

Common migration issues and solutions:

- **Permission Errors**: Ensure write permissions on all files
- **No Changes Found**: Verify tsup is actually in use in the project
- **Invalid JSON**: Fix malformed package.json before migration
- **Git Conflicts**: Commit or stash changes before migration
- **Missing Dependencies**: Run package manager install after migration