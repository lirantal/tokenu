# Husky

Husky is a modern native Git hooks tool that provides ultra-fast and lightweight Git hook management for automatically enforcing code quality, commit standards, and running development checks. With around 1ms execution time and only 2kB package size, it offers all 14 client-side Git hooks with exceptional performance and minimal overhead.

## Package Information

- **Package Name**: husky
- **Package Type**: npm
- **Language**: JavaScript (ES Modules)
- **Installation**: `npm install husky --save-dev`
- **Requirements**: Node.js >= 18, Git

## Core Imports

```javascript
import husky from "husky";
```

For CommonJS:
```javascript
const husky = require("husky");
```

## Basic Usage

```javascript
// Initialize husky in your project
import husky from "husky";

// Set up hooks with default directory
const result = husky();
console.log(result); // "" on success or error message

// Set up hooks with custom directory
const result = husky('.git-hooks');
console.log(result); // "" on success or error message
```

CLI usage:
```bash
# Initialize husky in project
npx husky init

# Install hooks (legacy command, shows deprecation warning)
npx husky install

# Install hooks with custom directory
npx husky .custom-hooks
```

## Capabilities

### Installation and Setup

Core installation function that configures Git hooks and creates the necessary directory structure.

```javascript { .api }
/**
 * Install and configure husky Git hooks
 * @param dir - Target directory for husky installation (default: '.husky')
 * @returns Status message - empty string on success, error message on failure
 */
function husky(dir?: string): string;
```

**Installation Process:**
- Validates directory path (rejects paths containing '..')
- Checks for Git repository (.git directory must exist)
- Configures Git's core.hooksPath to point to husky directory
- Creates hook directory structure with appropriate permissions
- Generates executable hook scripts for all supported Git hooks (with 0o755 permissions)
- Sets up shell script runner (husky executable) and configuration files
- Creates .gitignore file in hooks directory to ignore all hook contents

**Environment Variables:**
- `HUSKY=0` - Completely skips installation when set
- `HUSKY=2` - Enables debug mode for hook execution

**Error Handling:**
```javascript
const result = husky();
if (result) {
  console.error('Husky installation failed:', result);
  // Possible error messages:
  // "HUSKY=0 skip install"
  // ".. not allowed"
  // ".git can't be found"
  // "git command not found"
  // Git configuration errors
}
```

### CLI Commands

Command-line interface for project initialization and hook management.

```bash { .api }
# Initialize husky in project (recommended)
npx husky init

# Install hooks with default directory
npx husky
# Alternative: npx husky install (shows deprecation warning)

# Install hooks with custom directory
npx husky <directory>
```

**`husky init` Command:**
- Reads and modifies package.json, preserving original formatting (tabs vs spaces)
- Adds `"prepare": "husky"` script to package.json scripts section
- Creates `.husky` directory
- Generates default `.husky/pre-commit` hook with package manager-specific test command
- Automatically detects package manager from npm_config_user_agent environment variable
- Default pre-commit content: `<detected_package_manager> test\n` (e.g., "npm test", "pnpm test", "yarn test")
- Calls main installation function
- Process exits immediately after completion

**Deprecated Commands:**
- `husky add` - Shows deprecation warning and exits with code 1
- `husky set` - Shows deprecation warning and exits with code 1
- `husky uninstall` - Shows deprecation warning and exits with code 1
- `husky install` - Shows deprecation warning but continues execution (legacy compatibility)

### Git Hook Support

Husky supports all 14 client-side Git hooks with automatic script generation.

```javascript { .api }
// Supported Git hooks (automatically created):
const SUPPORTED_HOOKS: readonly string[] = [
  'pre-commit',
  'pre-merge-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-rebase',
  'post-rewrite',
  'post-checkout',
  'post-merge',
  'pre-push',
  'pre-auto-gc'
];
```

**Hook Script Structure:**
Each generated hook script:
- Points to husky's shell runner executable
- Executes user-defined commands from corresponding hook files
- Provides error reporting with exit codes
- Supports PATH modification for node_modules/.bin access

### Runtime Configuration

Runtime behavior and configuration options for hook execution.

```bash { .api }
# Environment variables for hook execution:
export HUSKY=0     # Disable all hook execution
export HUSKY=2     # Enable debug mode (shows detailed execution)

# User configuration file (optional):
~/.config/husky/init.sh    # Global initialization script
```

**User Configuration:**
- Place global configuration in `~/.config/husky/init.sh`
- Deprecated `~/.huskyrc` still supported with warning
- Configuration runs before each hook execution
- Can modify environment, PATH, or add global setup

**Runtime Features:**
- Automatic PATH modification to include `node_modules/.bin`
- Graceful handling of missing hook scripts
- Detailed error reporting with exit codes
- Cross-platform compatibility (macOS, Linux, Windows)

## Installation Workflow

**Automatic Setup (Recommended):**
```bash
npm install husky --save-dev
npx husky init
```

**Manual Setup:**
```javascript
import husky from "husky";

// Install hooks
const result = husky();
if (result) {
  throw new Error(`Husky setup failed: ${result}`);
}

// Create custom hooks
import fs from 'fs';
fs.writeFileSync('.husky/pre-commit', 'npm test\n', { mode: 0o755 });
fs.writeFileSync('.husky/commit-msg', 'npx commitlint --edit $1\n', { mode: 0o755 });
```

## Types

```typescript { .api }
/**
 * Main husky installation function
 */
declare function husky(dir?: string): string;

export default husky;
```