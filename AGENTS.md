# Contributor Guide

## Dev Environment Tips

- Install dependencies with `bun install` if `node_modules` is missing.
- Use `bun prettier --write .` to format changes.
- Use `bun run` to execute project scripts.

## Testing Instructions

- Run `bun test` to execute the full suite. All tests must pass before committing.
- Check workflows under `.github/workflows` for the CI plan.
- After tests pass, copy the latest summary into the `README.md` Test Results section.

## PR instructions

- Title format: `[LucasBot] <Title>`
- Keep commit messages concise and run `git status` to ensure a clean worktree before pushing.
