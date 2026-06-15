---
name: sync-cursor-skills
description: Copies Cursor skills from the current project's .cursor/skills directory to a shared skills repository for reuse across projects. Use when syncing, sharing, or backing up project skills to a central skills repo. Trigger when the user mentions "sync skills", "copy skills to self_skills", "share skills", or "update self_skills with my skills".
allowed-tools: Shell
---

# Sync Cursor Skills to Shared Repository

This skill guides you through copying the current project's Cursor skills (`.cursor/skills`) to a shared skills repository, then committing and pushing the changes.

## Prerequisites

- A shared skills repository must already exist at the target path.
- The target repository must have a `.cursor/skills` directory (created automatically if missing).
- The target repository must be a git repository with a configured remote.

## Configurable Target Path

The target repository path is configurable. If not provided, use this default:

```
F:\gitProjects\self_skills
```

If the default path does not exist on the system where this skill is invoked, prompt the user to provide the correct path before proceeding.

## Workflow

Follow these steps in order. Do not skip verification steps.

### Step 1: Verify Source

Confirm the current project has a `.cursor/skills` directory with skill subdirectories:

```powershell
ls ".cursor/skills" -Directory
```

If the directory is empty or does not exist, report this to the user and stop.

### Step 2: Verify Target

Confirm the target repository exists and is a git repository:

```powershell
Test-Path "F:\gitProjects\self_skills\.git"
```

If the target does not exist or is not a git repository, prompt the user to provide the correct path or initialize the target first.

### Step 3: Copy Each Skill Directory

Copy each skill subdirectory from the current project's `.cursor/skills` to the target repository's `.cursor/skills` directory. Use `Copy-Item -Recurse -Force` to ensure the copy overwrites only the corresponding skill paths.

For each skill subdirectory:

```powershell
Copy-Item -Path ".cursor/skills/<skill-name>" -Destination "F:\gitProjects\self_skills\.cursor\skills\<skill-name>" -Recurse
```

This copies only the specified skill directory. Existing files in the target outside these paths are not modified.

### Step 4: Commit Changes

In the target repository, stage only the copied skill paths and commit:

```powershell
cd "F:\gitProjects\self_skills"
git add -- ".cursor/skills/<skill-name-1>" ".cursor/skills/<skill-name-2>" ".cursor/skills/<skill-name-3>"
git commit -m "Sync cursor skills from <project-name>"
```

Use a descriptive commit message that includes the source project name.

### Step 5: Push to Remote

Push the committed changes to the remote repository:

```powershell
git push origin HEAD
```

### Step 6: Verify Push Result

After pushing, confirm the target repository status shows it is up to date with remote:

```powershell
git status --short --branch
```

The output should show `## main...origin/main` with no ahead/behind indicators (or `[ahead 0]`).

## Example Session

**User:** "Sync my current project's skills to the shared skills repo."

**Assistant:**
1. Lists `.cursor/skills` and finds `context7-usage`, `godot-mcp-usage`, `grill-me`
2. Confirms `F:\gitProjects\self_skills` exists and is a git repository
3. Copies each skill directory to `F:\gitProjects\self_skills\.cursor\skills\`
4. Commits with message: "Sync cursor skills from Godot-MCP"
5. Pushes to `origin/main`
6. Verifies `main...origin/main` is in sync

## Error Handling

- **Copy fails**: Check permissions on the target directory. Ensure the target `.cursor/skills` directory exists (create with `mkdir -p` if needed).
- **Push fails**: Check network connectivity and git remote configuration (`git remote -v`).
- **Target not found**: Prompt the user for the correct target repository path.
- **No skills found**: Report that the current project has no skills to sync.

## Notes

- This skill modifies only the target repository's `.cursor/skills/<skill-name>` paths. Files outside those directories are never touched.
- This skill does not modify the source project in any way. It only reads from the source and writes to the target.