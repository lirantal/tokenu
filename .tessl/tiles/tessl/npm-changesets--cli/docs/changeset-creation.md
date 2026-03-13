# Changeset Creation

Changeset creation is the process of declaring release intentions through interactive CLI prompts. This creates markdown files with YAML frontmatter that describe which packages should be released and at what semver level.

## Capabilities

### Interactive Changeset Creation

The primary CLI command for creating changesets through interactive prompts.

```bash { .api }
# Create changeset interactively
changeset
changeset add

# Create empty changeset (for CI workflows)
changeset add --empty

# Create changeset and open in external editor
changeset add --open
```

**Usage Examples:**

```bash
# Start interactive changeset creation
changeset

# The CLI will prompt you to:
# 1. Select which packages to include in the changeset
# 2. Choose the type of change (major, minor, patch)
# 3. Write a summary of the changes

# For CI workflows that require changesets but no changes
changeset add --empty

# Create changeset and immediately open in your default editor
changeset add --open
```

### Changeset Creation Workflow

The interactive creation process guides users through declaring their release intentions:

**Interactive Steps:**

1. **Package Selection**: Choose which packages in your repository have changes that should trigger releases
2. **Change Type Selection**: For each selected package, choose the type of change:
   - **Major**: Breaking changes (1.0.0 → 2.0.0)
   - **Minor**: New features, backwards compatible (1.0.0 → 1.1.0)  
   - **Patch**: Bug fixes, backwards compatible (1.0.0 → 1.0.1)
3. **Summary Writing**: Provide a human-readable description of the changes
4. **Confirmation**: Review and confirm the changeset before creation

**Changeset File Format:**

Created changesets are markdown files with YAML frontmatter:

```markdown
---
"@myorg/ui": minor
"@myorg/utils": patch
---

Add new Button component with improved accessibility features

- New Button component with ARIA support
- Fixed focus management in Modal component
- Updated utility functions for better TypeScript support
```

### Changeset Confirmation Display

Displays changeset summary before final confirmation.

```typescript { .api }
/**
 * Displays changeset summary before confirmation
 * @param changeset - Changeset object with releases and summary
 * @param repoHasMultiplePackages - Whether repository has multiple packages
 */
function printConfirmationMessage(
  changeset: {releases: Array<Release>, summary: string}, 
  repoHasMultiplePackages: boolean
): void;
```

## Interactive Prompts

### Package Selection

The changeset creation process includes several interactive prompts:

1. **Package Selection**: Multi-select prompt for choosing which packages to release
2. **Semver Bump Selection**: For each selected package, choose patch/minor/major
3. **Summary Input**: Free-text description of the changes
4. **Final Confirmation**: Review and confirm the changeset before creation

### CLI Utility Functions

Interactive prompt utilities used throughout the changeset creation process:

```typescript { .api }
/**
 * Interactive multi-select prompt with autocomplete
 * @param message - Prompt message to display
 * @param choices - Array of available choices  
 * @param format - Optional formatting function for choices
 * @returns Promise resolving to array of selected choice values
 */
function askCheckboxPlus(
  message: string, 
  choices: Array<any>, 
  format?: (arg: any) => any
): Promise<Array<string>>;

/**
 * Simple text input prompt
 * @param message - Prompt message to display
 * @returns Promise resolving to user input string
 */
function askQuestion(message: string): Promise<string>;

/**
 * Opens external editor for text input
 * @param message - Prompt message to display
 * @returns User input string from external editor
 */
function askQuestionWithEditor(message: string): string;

/**
 * Yes/no confirmation prompt
 * @param message - Confirmation message to display
 * @returns Promise resolving to boolean confirmation result
 */
function askConfirm(message: string): Promise<boolean>;

/**
 * Single select list prompt
 * @param message - Prompt message to display
 * @param choices - Array of available choices
 * @returns Promise resolving to selected choice
 */
function askList<Choice extends string>(
  message: string, 
  choices: Choice[]
): Promise<Choice>;
```

## Changeset File Format

### Standard Changeset

A typical changeset file contains YAML frontmatter with package versions and a markdown summary:

```markdown
---
"@myorg/ui": patch
"@myorg/utils": minor
---

Fixed button styling issue and added new utility functions for date formatting.
```

### Empty Changeset

Empty changesets contain no package releases but still satisfy CI requirements:

```markdown
---
---

This change doesn't require a release.
```

## Configuration Options

### Editor Integration

When using the `--open` flag, changesets will open the created file in the user's configured editor:

```bash
changeset add --open
```

### Empty Changeset Mode

For CI workflows that require changesets but don't need package releases:

```bash
changeset add --empty
```

### Commit Integration

If the `commit` option is configured, changesets will automatically commit the created changeset files:

```json
{
  "commit": ["@changesets/cli/commit", { "skipCI": false }]
}
```

## Validation and Safety Checks

### Package Validation

- Validates that selected packages exist in the repository
- Checks for proper semver bump types
- Ensures at least one package is selected (unless using `--empty`)

### Dependency Analysis

- Analyzes internal dependencies to suggest appropriate version bumps
- Warns about potential breaking changes in dependent packages
- Validates dependency graph consistency

### Git Integration

- Checks for uncommitted changes before creating changesets
- Optionally commits changeset files with configured commit messages
- Integrates with git hooks and pre-commit workflows

## Types

```typescript { .api }
interface Release {
  name: string;
  type: "major" | "minor" | "patch";
}

interface Package {
  packageJson: PackageJSON;
  dir: string;
}

interface PackageJSON {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
```