---
applyTo: "**/*"
---

# SW360 Frontend Git Commit & Contribution Instructions

> **Eclipse SW360 Frontend follows conventional commits with signed-off commits (DCO)**

## Commit Message Format

```
<type>(<scope>): <description>

[optional body with more details]

Signed-off-by: Your Name <your.email@example.com>
```

### Rules
- Use the conventional commit format: `<type>(<scope>): <description>`
  - Follow specification https://www.conventionalcommits.org/en/v1.0.0/#specification
- **REQUIRED**: All commits must have DCO
- Keep the subject line concise (under 72 characters, ideally under 50)
- Use imperative mood (e.g., "add" not "added" or "adds")
- Don't end the subject with a period
- Use lowercase for the first word unless it's a proper noun
- Separate subject from body with a blank line
- Wrap body at 72 characters
- Every commit should mention thet was produced by AI, and origin of AI service as an independent line

### Types
| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(admin): add bulk user upload functionality` |
| `fix` | Bug fix | `fix(projects): resolve null check for dependencies` |
| `docs` | Documentation only | `docs(readme): update development setup instructions` |
| `style` | Formatting, no code change | `style(components): fix indentation in table components` |
| `refactor` | Code restructure, no behavior change | `refactor(utils): extract API error handling logic` |
| `test` | Adding/fixing tests | `test(cypress): add e2e tests for license page` |
| `chore` | Build, CI, dependencies, cleanup | `chore(deps): bump next from 16.1.3 to 16.1.4` |
| `build` | Build system changes | `build(docker): update Node.js base image` |

### Common Scopes (SW360 Frontend-specific)
| Scope | Description |
|-------|-------------|
| `admin` | Admin pages (users, vendors, configurations, etc.) |
| `auth` | Authentication (NextAuth, Keycloak, tokens) |
| `projects` | Projects module |
| `licenses` | Licenses module |
| `components` | Components module |
| `releases` | Releases module |
| `packages` | Packages module |
| `requests` | Moderation requests |
| `CR` | Clearing requests |
| `UI` | General UI/UX changes |
| `navbar` | Navigation bar |
| `footer` | Footer component |
| `attachments` | Attachments functionality |
| `AdvSearch` | Advanced search |
| `repo` | Repository configuration (CODEOWNERS, etc.) |
| `biome` | Biome linter configuration |
| `lint` | Linting changes |
| `deps` | Production dependency updates |
| `deps-dev` | Dev dependency updates |
| `translations` | Internationalization/translations |
| `css` | Styling changes |
| `styles` | Styling refactors |
| `icons` | Icon changes |
| `statuscodes` | HTTP status code handling |
| `loop` | Render loop fixes |
| `Config` | Configuration pages |
| `import` | Import functionality |
| `token` | Token handling |
| `link` | Link/routing fixes |
| `intl` | Internationalization |
| `ai` | AI-related features |

### Examples from Project History
```bash
# Feature
feat(admin): Add bulk user upload functionality
feat(auth): Add refresh token support for Keycloak
feat(licenses): Add functionality to ignore licenses

# Fix
fix(repo): fix CODEOWNERS de002 to deo002
fix(loop): Fix render loop in useeffect
fix(navbar): Redirect SW360 logo to home page

# Refactor
refactor(styles): Unify all styles in globals
refactor(icons): Standardize icon usage and styling site wide

# Chore
chore(deps): bump next from 16.1.3 to 16.1.4
chore(deps-dev): bump @biomejs/biome from 2.3.11 to 2.3.12
chore(biome): Add noUnusedImports check as error
```

---

## Branch Naming Conventions

- **Always create** new branch from `https://github.com/eclipse-sw360/sw360-frontend/main`
- Use kebab-case (lowercase with hyphens)
- Follow the pattern: `<type>/<short-description>` or `<type>/<issue-number>-<short-description>`

### Branch Types
| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat/bulk-user-upload` |
| `fix` | Bug fix | `fix/session-expiry-handling` |
| `docs` | Documentation | `docs/update-api-docs` |
| `refactor` | Code refactor | `refactor/cleanup-api-utils` |
| `chore` | Maintenance | `chore/update-dependencies` |

---

## Pre-Commit Checks

### Biome Linting & Formatting
The project uses [Biome](https://biomejs.dev/) for linting and formatting. Before committing:

```bash
# Check for issues
pnpm biome check

# Auto-fix issues
pnpm biome check --fix

# Run CI check locally (same as GitHub Actions)
pnpm biome ci
```

### Common Biome Issues to Watch For
| Issue | Description | Solution |
|-------|-------------|----------|
| `noUnusedImports` | Unused import detected | Remove the unused import |
| `noRedeclare` | Variable/import declared twice | Remove duplicate declaration |
| `organizeImports` | Imports not sorted | Run `pnpm biome check --fix` |
| `File content differs` | Formatting mismatch (often line endings) | Run `pnpm biome format --fix` |

### Line Endings (Windows Users)
The project enforces LF line endings. If you see formatting errors on all lines:

```bash
# Configure Git to not auto-convert line endings
git config core.autocrlf false

# Or bypass pre-commit hooks if needed (use sparingly)
git commit --no-verify -m "your message"
```

### Internationalization (i18n)
When adding new UI text:
1. Add translation keys to **ALL 10 locale files** in `messages/`:
   - `en.json`, `de.json`, `es.json`, `fr.json`, `ja.json`
   - `ko.json`, `pt-BR.json`, `vi.json`, `zh-CN.json`, `zh-TW.json`
2. Use the `useTranslations` hook in components:
   ```tsx
   const t = useTranslations('default')
   // Usage: {t('Your Translation Key')}
   ```

---

## Git Workflow

### Before Starting Work
```bash
# Sync with upstream main
git fetch eclipse-sw360-frontend
git checkout main
git rebase eclipse-sw360-frontend/main

# Create feature branch
git checkout -b feat/my-feature
```

### Committing Changes
```bash
# Stage changes
git add .

# Commit with sign-off (REQUIRED)
git commit -s -m "feat(admin): add new functionality"

# For additional changes, amend the commit
git add .
git commit --amend -s --no-edit
```

### Before Pushing
```bash
# Run linting/formatting checks
pnpm biome ci

# Rebase on latest main
git fetch eclipse-sw360-frontend
git rebase eclipse-sw360-frontend/main

# Push to your fork (siemens remote)
git push -u siemens-frontend feat/my-feature

# If you amended, force push with lease
git push siemens-frontend feat/my-feature --force-with-lease
```

### Remotes Setup
```bash
# Upstream (eclipse-sw360 - main project)
git remote add eclipse-sw360-frontend git@github.com:eclipse-sw360/sw360-frontend.git

# Your fork (siemens - push here for PRs)
git remote add siemens-frontend git@github.com:siemens/sw360-frontend.git

# Verify remotes
git remote -v
```

---

## Pull Request Guidelines

### Before Creating PR
- [ ] All commits are signed-off (`Signed-off-by:` line present)
- [ ] Branch is rebased on latest `main`
- [ ] `pnpm biome ci` passes locally
- [ ] All 10 locale files updated (if adding UI text)
- [ ] New files have EPL-2.0 license headers with correct year

### License Header Format
```tsx
// Copyright <Contributor>, <Year>. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE
```

**Examples:**
```tsx
// Copyright Siemens AG, 2026. Part of the SW360 Frontend Project.
// Copyright Bosch.IO GmbH, 2025. Part of the SW360 Frontend Project.
// Copyright Siemens AG, 2023-2026. Part of the SW360 Frontend Project.  // For files modified over multiple years
```

### PR Description Template
```markdown
## Summary
Brief description of changes

## Related Issue
Fixes #<issue_number>
<!-- or use: Closes #<issue_number>, Resolves #<issue_number> -->

## Changes
- List of specific changes made
- Files added/modified

## Testing
Steps to test the changes

## Screenshots
(If UI changes)

## Checklist
- [ ] Biome CI passes
- [ ] All locales updated (if adding UI text)
- [ ] Tested locally
- [ ] Self-reviewed my code

## Reviewers
@<reviewer_username>
<!-- Suggested reviewers based on CODEOWNERS or domain expertise -->
```

### After PR is Open
- Ensure all CI checks pass (GitHub Actions)
- Respond to review comments promptly
- Squash commits if requested by reviewers
- Keep the PR focused and small when possible

### Eclipse Contributor Agreement
- You must have signed the [Eclipse Contributor Agreement (ECA)](http://www.eclipse.org/legal/ECA.php)
- Your commits must include `Signed-off-by` with the same email as your ECA

> **⚠️ Common Pitfall: ECA Email Mismatch**
>
> Many contributors sign the ECA with one email but have a different email configured in Git.
> The `Signed-off-by` email **must match** the email used to sign the ECA.
>
> **AI Hint**: Before committing, verify the user's Git email configuration:
> ```bash
> # Check current Git email configuration
> git config user.email
> git config user.name
>
> # If email doesn't match ECA, configure it:
> git config user.email "your.eca.email@example.com"
> git config user.name "Your Full Name"
> ```
>
> **Troubleshooting Checklist**:
> - [ ] Verify `git config user.email` matches the email used for ECA sign-up
> - [ ] If email was wrong when you committed, amend with: `git commit --amend --reset-author -s`
> - [ ] For multiple commits with wrong email, use interactive rebase: `git rebase -i HEAD~N` and mark commits for `edit`

---

## Quick Reference

```bash
# Standard commit with sign-off
git commit -s -m "feat(admin): add user upload feature"

# Amend last commit (keep message)
git commit --amend -s --no-edit

# Amend last commit (change message)
git commit --amend -s

# Run linting before push
pnpm biome ci

# Push to siemens fork with tracking
git push -u siemens-frontend my-branch

# Force push after rebase/amend (safer)
git push siemens-frontend my-branch --force-with-lease

# Bypass pre-commit hooks (use sparingly)
git commit --no-verify -s -m "message"
```

---

## Troubleshooting

### CI Failing with Biome Errors
```bash
# Run locally to see exact errors
pnpm biome ci

# Auto-fix what can be fixed
pnpm biome check --fix

# Check specific file
pnpm biome check "src/path/to/file.tsx"

# Check only changed files (faster)
pnpm biome ci --changed --since=HEAD~1
```

### Common Biome Error Types

#### 1. Unused Imports (`noUnusedImports`)
```tsx
// ❌ Error: This import is unused
import { useState, useEffect } from 'react'  // useEffect not used

// ✅ Fix: Remove unused import
import { useState } from 'react'
```

#### 2. Duplicate/Redeclare (`noRedeclare`)
```tsx
// ❌ Error: Shouldn't redeclare 'ApiUtils'
import { ApiUtils } from '@/utils/index'
import { ApiError, ApiUtils } from '@/utils/index'

// ✅ Fix: Combine into single import
import { ApiError, ApiUtils } from '@/utils/index'
```

#### 3. Unsorted Imports (`organizeImports`)
```bash
# Fix: Run biome to auto-organize
pnpm biome check --fix "src/path/to/file.tsx"
```

#### 4. Formatting Mismatch (`File content differs`)
Often caused by line endings (CRLF vs LF) or indentation:
```bash
# Fix formatting
pnpm biome format --fix "src/path/to/file.tsx"

# Or fix all files
pnpm biome format --fix
```

#### 5. Indentation Issues
```tsx
// ❌ Error: Wrong indentation (4 spaces instead of 6)
? updater({
    pageIndex: pageableQueryParam.page,
    pageSize: pageableQueryParam.page_entries,
})

// ✅ Fix: Correct indentation
? updater({
      pageIndex: pageableQueryParam.page,
      pageSize: pageableQueryParam.page_entries,
  })
```

### Line Ending Issues on Windows
```bash
# Check current setting
git config core.autocrlf

# Disable auto CRLF conversion
git config core.autocrlf false

# Re-checkout files with correct line endings
git checkout -- .
```

### Stash/Unstash During Rebase
```bash
# Stash local changes
git stash

# Pull/rebase
git pull origin main --rebase

# Restore changes
git stash pop

# If conflicts, resolve and drop stash
git stash drop
```
