# Commit Style Guide

This guide outlines the commit message conventions for TravelAgentic to ensure consistent, readable, and actionable git history.

## 📋 Format

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## 🏷️ Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add flight search component` |
| `fix` | Bug fix | `fix: resolve booking form validation error` |
| `docs` | Documentation changes | `docs: update API documentation` |
| `style` | Code style changes (formatting, etc.) | `style: format user preference components` |
| `refactor` | Code refactoring | `refactor: improve error handling in edge functions` |
| `test` | Adding or fixing tests | `test: add unit tests for booking flow` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `perf` | Performance improvements | `perf: optimize flight search queries` |
| `ci` | CI/CD changes | `ci: add deployment workflow` |
| `revert` | Revert previous commit | `revert: remove experimental voice feature` |

## 🎯 Scopes

Use scopes to indicate which part of the codebase is affected:

| Scope | Description |
|-------|-------------|
| `web` | Frontend application |
| `api` | Edge functions/API |
| `database` | Database schema/migrations |
| `langflow` | AI workflows |
| `docs` | Documentation |
| `config` | Configuration files |

## ✅ Good Examples

### Features
```bash
feat(web): add user preference collection form
feat(api): implement flight search endpoint
feat(langflow): create booking automation workflow
```

### Bug Fixes
```bash
fix(web): prevent form submission with invalid dates
fix(api): handle rate limiting for external APIs
fix(database): correct user preferences table schema
```

### Documentation
```bash
docs(api): add authentication examples
docs: update contributing guidelines
docs(langflow): document workflow deployment process
```

### Refactoring
```bash
refactor(web): extract search components into reusable modules
refactor(api): consolidate error handling utilities
```

### Tests
```bash
test(web): add component tests for flight search
test(api): increase coverage for booking endpoints
```

## ❌ Avoid These

```bash
# Too vague
fix: stuff
update: things
change: code

# Too long/detailed (save for body)
feat: add a new flight search component that allows users to search for flights with various filters and displays results in a paginated table

# Missing type
add flight search component
updated README

# Inconsistent capitalization
Fix: booking Form validation
FEAT: Add search component
```

## 📝 Writing Guidelines

### Description Rules
- Use **lowercase** for the description
- Use **present tense** ("add" not "added")
- Use **imperative mood** ("fix" not "fixes")
- No period at the end
- Keep under 72 characters

### Body (Optional)
Use the body to explain **what** and **why**, not **how**:

```bash
feat(web): add automated booking retry logic

Users experienced frustration when bookings failed due to temporary
API issues. This adds automatic retry with exponential backoff to
improve success rates.

Closes #123
```

### Footer (Optional)
Use for:
- **Breaking changes**: `BREAKING CHANGE: removed deprecated search API`
- **Issue references**: `Closes #123`, `Fixes #456`
- **Co-authors**: `Co-authored-by: Name <email@example.com>`

## 🔄 Breaking Changes

For breaking changes, use the footer:

```bash
feat(api): redesign booking response format

BREAKING CHANGE: booking API now returns nested objects instead of flat structure
```

Or use `!` after the type:

```bash
feat(api)!: redesign booking response format
```

## 🚀 Release Notes

Good commit messages automatically generate meaningful release notes:

```bash
feat(web): add dark mode toggle
feat(api): implement voice call fallback
fix(database): resolve migration rollback issue
docs: update API documentation
```

Becomes:

**Features**
- Add dark mode toggle (web)
- Implement voice call fallback (api)

**Bug Fixes**
- Resolve migration rollback issue (database)

**Documentation**
- Update API documentation

## 🛠️ Tools

### Git Hooks
Consider using `commitlint` to enforce these conventions:

```bash
# Install commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Add to package.json
"commitlint": {
  "extends": ["@commitlint/config-conventional"]
}
```

### IDE Integration
- **VS Code**: Conventional Commits extension
- **WebStorm**: Git Commit Template plugin

## 📊 Commit Frequency

### Small, Focused Commits
```bash
# ✅ Good: Focused changes
feat(web): add flight search form
feat(web): implement search result display
feat(web): add pagination to search results

# ❌ Bad: Too much in one commit
feat(web): add entire flight search feature with form, results, and pagination
```

### Logical Grouping
```bash
# ✅ Good: Related changes together
refactor(api): extract booking validation logic
test(api): add tests for booking validation
docs(api): document booking validation rules

# ❌ Bad: Unrelated changes
feat(web): add search component and fix database migration and update docs
```

## 🎯 Quick Reference

**Common Patterns:**
- `feat(web): add [component/feature]`
- `fix(api): resolve [specific issue]`
- `docs: update [documentation area]`
- `test: add [test description]`
- `refactor: improve [code area]`
- `chore: update [dependency/config]`

**Remember:**
- Present tense, imperative mood
- Lowercase description
- No period at end
- Use scopes for clarity
- Keep under 72 characters

---

**Questions?** Check the [Conventional Commits](https://www.conventionalcommits.org/) specification or ask in our Discord channel. 