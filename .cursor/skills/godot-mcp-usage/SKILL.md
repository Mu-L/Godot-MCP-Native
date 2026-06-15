---
name: godot-mcp-usage
description: "Operate the Godot editor via MCP tools: create/manage scenes, nodes, scripts, and resources; execute editor scripts. Use when the user asks to modify a Godot project, create scenes, add nodes, write GDScript, or perform any Godot Editor operation via MCP."
---

# Godot MCP Usage

## Precondition

- Godot Editor must be running with the `godot_mcp` addon enabled
- The MCP server (Node.js) must be started and connected to the Godot WebSocket (port 9080 by default)
- If a tool call returns an error, verify both are running before debugging parameters

## Tool Reference

### Scene management

| Tool | Required params | Optional params | Notes |
|------|----------------|-----------------|-------|
| `create_scene` | `path` | `root_node_type` | Path must end with `.tscn`. Default root type is `Node`. Valid examples: `Node3D`, `Node2D`, `Control`. |
| `save_scene` | none | `path` | Saves the currently open scene. If `path` is omitted, saves to the current scene's path. |
| `open_scene` | `path` | — | Opens a `.tscn` file in the editor. |
| `get_current_scene` | none | — | Returns the path and root node name + type of the currently open scene. |
| `get_project_info` | none | — | Returns project name, Godot version, current scene, etc. |

### Node operations

| Tool | Required params | Optional params | Notes |
|------|----------------|-----------------|-------|
| `create_node` | `parent_path`, `node_type`, `node_name` | — | `parent_path` format: `/root` for the scene root, `/root/ChildName` for children. Do NOT use `/root/SceneName` — the root is always just `/root`. |
| `delete_node` | `node_path` | — | `node_path` format: `/root/NodeName`. Deletes the node and all its children. |
| `update_node_property` | `node_path`, `property`, `value` | — | `value` can be any JSON-serializable type (string, number, object, array). For Vector3 use `{"x":1,"y":2,"z":3}`. |
| `get_node_properties` | `node_path` | — | Parameter is `node_path`, NOT `path`. Returns all properties of a node. |
| `list_nodes` | `parent_path` | — | Lists all direct children under the given parent path. Returns `No child nodes found` if empty. |

### Script operations

| Tool | Required params | Optional params | Notes |
|------|----------------|-----------------|-------|
| `create_script` | `script_path`, `content` | `node_path` | `content` is REQUIRED. If `node_path` is provided, the script is also attached to that node. Path must end with `.gd`. |
| `edit_script` | `script_path`, `content` | — | Replaces the entire file content. `content` is REQUIRED. |
| `get_script` | `script_path` or `node_path` (at least one) | — | Returns the script content. Use `script_path` for files, `node_path` for attached scripts. |
| `create_script_template` | `extends_type` | `class_name`, `include_ready`, `include_process`, `include_input`, `include_physics` | Runs locally (no Godot communication). Returns a string with the generated template. Defaults: `extends_type="Node"`, `include_ready=true`, others false. |

### Resource and editor operations

| Tool | Required params | Optional params | Notes |
|------|----------------|-----------------|-------|
| `create_resource` | `resource_type`, `resource_path` | `properties` | resource_type examples: `StandardMaterial3D`, `ImageTexture`, `StyleBoxFlat`. Path must end with `.tres`. |
| `execute_editor_script` | `code` | — | `code` is REQUIRED. Executes arbitrary GDScript in the editor context. Returns `Output:` followed by any `print()` output. |

## Common pitfalls

### Path format

- Scene root is ALWAYS `/root`, regardless of the root node's display name
- Child nodes: `/root/ChildName` (NOT `/root/SceneName` or `/root/SceneName/ChildName`)
- Wrong: `/root/ToolTest` (when the scene root node is named "ToolTest")
- Correct: `/root` (to reference the root node itself)

### Required parameters that are easy to miss

- `create_script` → `content` is required (not optional, even for an empty script)
- `execute_editor_script` → `code` is required
- `get_node_properties` → parameter name is `node_path`, NOT `path`
- `list_nodes` → parameter name is `parent_path`, NOT `path`

### Error code reference

- `-32602`: Parameter validation error. Check that all required parameters are present and correctly named.
- `Parent node not found`: The `parent_path` is invalid. Verify the path format (use `/root`, not `/root/SceneName`).
- `Node not found`: The `node_path` is invalid or the node doesn't exist.

### `create_script_template` is local-only

This tool does not communicate with Godot. It generates a GDScript template string locally. Use it when you need boilerplate for a new script class.

## Workflow pattern

When building a scene via MCP, follow this sequence:

1. `create_scene` — create the `.tscn` file
2. `create_node` — add child nodes under `/root`
3. `update_node_property` — configure node properties (transform, visibility, etc.)
4. `save_scene` — persist to disk

When writing scripts:

1. `create_script_template` — generate boilerplate (optional)
2. `create_script` — create the `.gd` file
3. `edit_script` — modify the content as needed
4. `get_script` — verify the content

When debugging or introspecting:

1. `get_project_info` — check project state
2. `get_current_scene` — verify which scene is active
3. `list_nodes` — inspect the scene tree
4. `get_node_properties` — examine a specific node
5. `execute_editor_script` — run diagnostic GDScript