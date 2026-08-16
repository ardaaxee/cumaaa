# cumaaa

## Coding rules (ECC)

This project vendors [ECC](https://github.com/affaan-m/ECC) rule sets under
[`.claude/rules/ecc/`](.claude/rules/ecc/). Follow them when working in this repo:

- **`.claude/rules/ecc/common/`** — universal principles: coding style, git
  workflow, testing, security, performance, patterns, code review.
- **`.claude/rules/ecc/python/`** — Python-specific rules that extend the common
  layer (coding style, FastAPI, patterns, testing, security, hooks).

When language-specific rules conflict with common rules, the language-specific
rules take precedence.

To add another stack later, copy the matching directory from the ECC repo into
`.claude/rules/ecc/` (e.g. `cp -r rules/typescript .claude/rules/ecc/`).
