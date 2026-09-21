---
title: "ai-sandbox-landlock"
created: 2026-07-15
updated: 2026-07-15
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-15-401365"
cron-counter: 343
source-platform: github
source-url: "https://github.com/classx/ai-sandbox-landlock"
---

agent: 小马(架构师)
owner: 沈超

# ai-sandbox-landlock

## 来源元数据

- 平台: github
- URL: https://github.com/classx/ai-sandbox-landlock
- 查询: developer tools IDE
- Stars: 1
- Language: Rust
- Topics: (无)

## 仓库简介

A minimal Rust launcher that applies Linux Landlock LSM restrictions to developer tools (IDE, Copilot backends, local LLMs) using declarative YAML profiles. Runs as an unprivileged user and sandboxes itself before executing a target command.

## README 摘录(前 1500 字符)

ai-sandbox-landlock

A minimal Rust launcher that applies Linux Landlock LSM restrictions to developer tools (IDE, Copilot backends, local LLMs) using declarative YAML profiles. Runs as an unprivileged user and sandboxes itself before executing a target command.

Requirements
- Linux kernel ≥ 5.13 with Landlock enabled (lsm includes `landlock`).
- Rust toolchain (cargo) for building.

Install
Local project build and run:

[code]

Optional local install (unpublished):

[code]

Usage
Two modes: profile-based and root-only.

Profile-based:
[code]

Root-only:
[code]

Common flags:
- `--dry-run`: Print planned rules; no enforcement, no exec.
- `--print-ruleset`: Print handled rights and per-path rules, then exit.
- `--print-config`: Dump selected profile YAML, then exit.
- `--require-landlock`: Fail if Landlock is unavailable; otherwise warn and run unsandboxed.
- `--log-level {error|warn|info|debug|trace}`: Set logging verbosity.

Generate a profile (dynamic):
[code]

YAML Schema
Profiles file structure (simplified):
- `version`: schema version (supports `1`).
- `profiles.<name>`:
  - `description`: optional.
  - `access_roots.<group>.paths`: array of path strings.
  - `access_roots.<group>.permissions`: booleans for rights (`read_file`, `read_dir`, `execute`, `write_file`, `remove_file`, `remove_dir`, `truncate`).
  - `control_access`: global handled rights for the ruleset.
  - `command`: `binary`, `args`, `working_dir`, `env`.
  - `log_level`, `dry_run`: optional defaults per p

