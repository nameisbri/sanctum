# Sanctum - Claude Code Instructions

## Settings File Warning

**Do NOT paste documentation, plan content, or any non-permission text into `.claude/settings.local.json`.**

The `settings.local.json` file is strictly for Claude Code configuration (permissions, MCP servers, etc.). Each entry in the `allow` array must be a short permission pattern like `Bash(npm:*)` — never multi-line content.

If you need to store technical designs or plans, put them in `.cursor-plans/` instead.

## Project

Personal workout tracking PWA. See `.claude/projects/` memory files for full context.
