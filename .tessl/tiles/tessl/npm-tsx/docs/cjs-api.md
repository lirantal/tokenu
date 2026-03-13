# CommonJS API

The CommonJS API (`tsx/cjs/api`) provides programmatic access to tsx's TypeScript transformation capabilities within CommonJS modules. It enables registration of tsx loaders and provides enhanced require functionality for TypeScript files.

## Capabilities

### Module Registration

Register tsx transformation hooks for CommonJS modules.

```javascript { .api }
/**
 * Register tsx loader for CommonJS modules
 * @param options - Optional configuration
 * @returns Unregister function
 */
function register(options?: RegisterOptions): Unregister;

/**
 * Register tsx loader with required namespace
 * @param options - Configuration with required namespace
 * @returns Namespaced unregister function with additional methods
 */
function register(options: RequiredProperty<RegisterOptions, 'namespace'>): NamespacedUnregister;

interface RegisterOptions {
  namespace?: string;
}

type Unregister = () => void;

interface NamespacedUnregister extends Unregister {
  require: ScopedRequire;
  resolve: ScopedResolve;
  unregister: Unregister;
}

type Register = {
  (options: RequiredProperty<RegisterOptions, 'namespace'>): NamespacedUnregister;
  (options?: RegisterOptions): Unregister;
};
```

**Usage Examples:**

```javascript
const { register } = require("tsx/cjs/api");

// Basic registration
const unregister = register();

// Now TypeScript files can be required
const myModule = require("./my-module.ts");

// Unregister when done
unregister();

// Namespaced registration for isolation
const api = register({ namespace: "my-app" });
const tsModule = api.require("./module.ts", __filename);
api.unregister();
```

### Enhanced Require

Require TypeScript files directly with full transformation support.

```javascript { .api }
/**
 * Require TypeScript files with transformation
 * @param id - Module identifier or path
 * @param fromFile - Current file path (__filename or import.meta.url)
 * @returns Module exports
 */
function require(id: string, fromFile: string | URL): any;
```

**Usage Examples:**

```javascript
const { require: tsxRequire } = require("tsx/cjs/api");

// Require TypeScript files
const utils = tsxRequire("./utils.ts", __filename);
const config = tsxRequire("./config.ts", __filename);

// Works with npm packages written in TypeScript
const myPackage = tsxRequire("my-typescript-package", __filename);

// Relative path resolution
const helper = tsxRequire("../helpers/format.ts", __filename);
```

### Scoped Operations

When using namespace registration, access to scoped require and resolve functions.

```javascript { .api }
type ScopedRequire = (
  id: string,
  fromFile: string | URL,
) => any;

type ScopedResolve = (
  id: string,
  fromFile: string | URL,
  resolveOptions?: { paths?: string[] | undefined },
) => string;
```

**Usage Examples:**

```javascript
const { register } = require("tsx/cjs/api");

// Create namespaced registration
const api = register({ namespace: "isolated-context" });

// Use scoped require - isolated from other tsx instances
const module1 = api.require("./module1.ts", __filename);
const module2 = api.require("./module2.ts", __filename);

// Use scoped resolve to get file paths
const resolvedPath = api.resolve("./module.ts", __filename);
console.log(resolvedPath); // Full resolved path

// Cleanup
api.unregister();
```

### Module Resolution

tsx enhances Node.js module resolution to handle TypeScript files and extensions.

**Features:**
- Resolves `.ts`, `.tsx`, `.mts`, `.cts` extensions
- Handles both relative and absolute imports
- Preserves query parameters in module paths
- Supports namespace isolation for multiple tsx instances

**Usage Examples:**

```javascript
const { register } = require("tsx/cjs/api");

register();

// These all work after registration
require("./config.ts");        // TypeScript file
require("./component.tsx");    // TSX file  
require("./module.mts");       // ES module TypeScript
require("./legacy.cts");       // CommonJS TypeScript

// Query parameters are preserved
require("./module.ts?version=1");
```

### Integration Patterns

Common patterns for integrating tsx in CommonJS applications.

**Temporary Registration:**

```javascript
const { register } = require("tsx/cjs/api");

function loadTypeScriptConfig() {
  const unregister = register();
  try {
    return require("./config.ts");
  } finally {
    unregister();
  }
}
```

**Application-wide Setup:**

```javascript
// app.js entry point
const { register } = require("tsx/cjs/api");

// Register once at application startup
register();

// Now entire application can require TypeScript
const server = require("./src/server.ts");
const routes = require("./src/routes.ts");
const middleware = require("./src/middleware.ts");

server.start();
```

**Multiple Isolated Contexts:**

```javascript
const { register } = require("tsx/cjs/api");

// Create separate contexts for different purposes
const appContext = register({ namespace: "app" });
const testContext = register({ namespace: "test" });

// Load app modules
const appModule = appContext.require("./app.ts", __filename);

// Load test modules (isolated from app)
const testModule = testContext.require("./test.ts", __filename);

// Cleanup both contexts
appContext.unregister();
testContext.unregister();
```

## Types

### Core Types

```javascript { .api }
// Available through require("tsx/cjs/api")

interface LoaderState {
  enabled: boolean;
}

type ResolveFilename = typeof Module._resolveFilename;
type SimpleResolve = (request: string) => string;
```

### Error Handling

tsx integrates with Node.js error handling and preserves stack traces for TypeScript files.

#### TypeScript Transformation Errors

```javascript
const { register } = require("tsx/cjs/api");

register();

try {
  const module = require("./broken.ts");
} catch (error) {
  // Error includes TypeScript source locations with source maps
  console.error('TypeScript compilation error:', error.stack);
  
  // Handle specific error types
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Module could not be resolved:', error.path);
  }
}
```

#### Registration Errors

```javascript
const { register } = require("tsx/cjs/api");

try {
  const unregister = register();
  // Registration successful
} catch (error) {
  console.error('Failed to register tsx loader:', error.message);
  throw error;
}
```

#### Scoped Require Errors

```javascript
const { register } = require("tsx/cjs/api");

const api = register({ namespace: "my-app" });

try {
  const module = api.require("./missing-file.ts", __filename);
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('TypeScript module not found:', error.path);
  } else {
    console.error('Error loading TypeScript module:', error.stack);
  }
}

api.unregister();
```

#### Module Resolution Errors

```javascript
const { register } = require("tsx/cjs/api");

register();

try {
  // Invalid module path
  const module = require("./non-existent-path/module.ts");
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Cannot resolve module:', error.message);
    console.error('Attempted paths:', error.requireStack);
  }
}
```