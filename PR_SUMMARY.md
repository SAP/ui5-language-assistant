## PR Summary: Dependency Cleanup & Security Fixes

### Overview
This PR removes unused dependencies, cleans up obsolete configuration files, and addresses security vulnerabilities identified by `yarn audit`.

**Vulnerability Reduction:** 90 → 23 (0 high severity remaining)

---

### Changes Made

#### 1. Removed 12 Unused devDependencies
| Package | Reason |
|---------|--------|
| `@types/jest-specific-snapshot` | jest-specific-snapshot not used |
| `@types/sinon` | sinon not installed |
| `@types/sinon-chai` | sinon-chai not installed |
| `conventional-changelog-cli` | Not referenced in scripts |
| `coveralls` | Only badge in README, not used |
| `jest-environment-jsdom` | Jest uses testEnvironment: "node" |
| `jest-esm-transformer` | Not configured anywhere |
| `jest-junit` | Not in any jest config |
| `jest-specific-snapshot` | Not imported or used |
| `make-dir` | Not directly imported |
| `simple-git` | Not imported anywhere |
| `source-map-support` | Only in obsolete .mocharc.js |

#### 2. Deleted Obsolete Files
- `.mocharc.js` - Mocha is not installed; project uses Jest

#### 3. Dependency Updates
| Package | From | To |
|---------|------|-----|
| `lerna` | `9.0.3` | `9.0.5` |

#### 4. Removed Obsolete Patch
- `patches/lerna+9.0.3.patch` - No longer needed with lerna 9.0.5

#### 5. Security Resolutions Added/Updated
```json
"resolutions": {
  "js-yaml": "^4.1.1",       // NEW - CVE-2025-64718 Prototype Pollution
  "lodash": "^4.17.23",      // UPDATED - CVE-2025-13465 Prototype Pollution  
  "minimatch": "^9.0.7"      // NEW - Multiple ReDoS vulnerabilities
}
```

---

### Security Vulnerabilities Fixed

| Severity | Package | CVE/Issue |
|----------|---------|-----------|
| Moderate | `lodash` | CVE-2025-13465 - Prototype Pollution in `_.unset` and `_.omit` |
| Moderate | `js-yaml` | CVE-2025-64718 - Prototype Pollution in merge |
| High (12) | `minimatch` | Multiple ReDoS vulnerabilities |

---

### Known Remaining Issues

| Severity | Package | Why Can't Fix |
|----------|---------|---------------|
| Critical | `vscode-ui5-language-assistant` | **False positive** - name collision with a malicious npm package. Our package is the legitimate SAP extension, not installed from npm. |
| Moderate | `ajv` | Transitive via eslint/semantic-model; would require major version bumps |

---

### Testing
- [x] `yarn install` - Clean install works
- [x] `yarn build:quick` - Passes
- [x] VSIX package builds successfully
- [x] `yarn audit --level high` - No high/critical (except false positive)
