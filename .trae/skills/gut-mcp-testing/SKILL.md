---
name: "gut-mcp-testing"
description: "Run GUT unit tests and MCP tool tests for Godot MCP project. Invoke when user asks to run tests, verify test results, or debug test failures."
---

# GUT + MCP Testing Workflow

This skill provides a complete testing workflow for the Godot MCP project, combining GUT unit tests (command-line) and MCP tool tests (via Godot MCP tools).

## Project Context

- **Godot Engine**: v4.6.1, path: `f:/Godot/Godot_v4.6.1-stable_win64.exe`
- **Project Path**: `F:\gitProjects\Godot-MCP`
- **GUT Version**: 9.6.0
- **Test Directory**: `res://test/unit/` (with subdirectories)
- **Config File**: `.gutconfig.json` at project root
- **Test Coverage Doc**: `docs/debugging/test-coverage-analysis-2026-05-02.md`

## Step 1: Run GUT Unit Tests (Command-Line)

Run GUT tests in headless mode from the terminal:

```powershell
Set-Location "F:\gitProjects\Godot-MCP"
& "f:/Godot/Godot_v4.6.1-stable_win64.exe" --headless --path "F:/gitProjects/Godot-MCP" -s addons/gut/gut_cmdln.gd -gdir=res://test/unit/ -ginclude_subdirs -gexit
```

**Important Notes:**
- Use `--headless` flag for CI/automated runs
- The `-gexit` flag makes Godot exit after tests finish (exit code 0 = all passed, 1 = failures)
- PowerShell treats stderr output as errors — this is normal for Godot console output
- To capture output to file, append: `2>&1 | Out-File -FilePath "F:\gitProjects\Godot-MCP\test_output.txt" -Encoding utf8`

### GUT Command-Line Flags

| Flag | Description |
|------|-------------|
| `-gdir=<path>` | Test directory to scan |
| `-ginclude_subdirs` | Include subdirectories |
| `-gexit` | Exit after tests finish |
| `-gselect=<script>` | Run specific test script |
| `-gunit_test_name=<name>` | Run specific test by name |
| `-gignore_pause` | Ignore `pause_before_teardown` calls |

## Step 2: Run MCP Tool Tests (Via Godot Editor)

When Godot Editor is running with the MCP plugin active, test MCP tools directly:

1. Use `execute_script` to verify internal state
2. Use individual MCP tool calls (create_node, read_script, etc.) to test functionality
3. Check `get_editor_logs` for error messages

### Key MCP Test Patterns

```gdscript
// Verify class availability
load("res://addons/godot_mcp/native_mcp/mcp_server_core.gd").new() != null

// Verify singleton access
Engine.get_singleton("GutEditor") != null

// Check project settings
ProjectSettings.get_setting("editor_plugins/enabled")
```

## Step 3: Fix Test Failures

### Common GUT Pitfalls & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `assert_not_has` doesn't exist | GUT has no such method | Use `assert_false(d.has(key))` |
| `assert_starts_with` doesn't exist | GUT has no such method | Use `assert_true(str.begins_with())` |
| `assert_has` on String fails | `assert_has` only works on Dictionary/Array | Use `assert_true(str.contains())` |
| `node.get_path()` returns empty | Node not in scene tree | Use `add_child_autofree(node)` |
| `push_error` treated as failure | GUT captures engine errors | Restructure test to avoid triggering `push_error` |
| `class_name` not available in CLI | Command-line mode doesn't register class_names | Use `load("res://path/to/script.gd").new()` |
| `Expression.parse` too lenient | Godot Expression accepts invalid syntax | Test `has_execute_failed()` instead of parse failure |
| `expression.execute([], null, true)` | `show_error=true` triggers engine error | Use `false` to avoid GUT capturing the error |
| `register_tool` wrong signature | Method expects 6 params, not MCPTool object | Call `register_tool(name, desc, schema, callable, output_schema, annotations)` |
| `assert_ne(dict, null)` | GUT diff tool crashes on Dictionary vs null | Use `assert_true(dict != null)` |
| `push_error` in source code | GUT treats engine errors as test failures | Avoid calling methods that trigger `push_error` |

### GUT Assertion Reference

| Method | Works On | Doesn't Work On |
|--------|----------|-----------------|
| `assert_has(collection, item)` | Dictionary, Array | **String** |
| `assert_true(condition)` | bool | - |
| `assert_false(condition)` | bool | - |
| `assert_eq(a, b)` | any (equality) | - |
| `assert_ne(a, b)` | any (inequality) | - |
| `assert_gt(a, b)` | numbers | - |
| `assert_lt(a, b)` | numbers | - |
| `assert_contains(str, substr)` | String | - |

### Scene Tree Testing Pattern

```gdscript
func test_node_path():
    var root: Node3D = Node3D.new()
    root.name = "Root"
    add_child_autofree(root)  # Adds to scene tree, auto-frees after test
    var child: Node3D = Node3D.new()
    child.name = "Child"
    root.add_child(child)
    # Now get_path() works correctly
    var path: String = str(child.get_path())
    assert_true(path.contains("Child"), "Path should contain node name")
    # Do NOT call root.free() — add_child_autofree handles cleanup
```

### Load Instead of Class Name Pattern

```gdscript
# WRONG - class_name not available in GUT CLI mode
var _core: McpServerCore = null
_core = McpServerCore.new()

# CORRECT - use load() instead
var _core: RefCounted = null
_core = load("res://addons/godot_mcp/native_mcp/mcp_server_core.gd").new()
```

## Step 4: Add New Tests

### Test File Structure

```
test/unit/
├── test_path_validator.gd          # Utils tests
├── test_mcp_auth_manager.gd        # Security tests
├── test_mcp_types.gd               # Type definition tests
├── test_mcp_resource_manager.gd    # Resource management tests
├── test_mcp_server_core.gd         # Server core tests
├── test_mcp_http_server.gd         # HTTP server tests
├── test_mcp_stdio_server.gd        # Stdio server tests
├── test_mcp_transport_base.gd      # Transport base tests
├── test_mcp_server_native.gd       # Plugin structure tests
├── test_node_tools_convert.gd      # Node tools conversion tests
├── test_http_parsing.gd            # HTTP parsing tests
└── tools/
    ├── test_node_tools.gd          # Node tool schema/logic tests
    ├── test_scene_tools.gd         # Scene tool tests
    ├── test_editor_tools.gd        # Editor tool tests
    ├── test_script_tools.gd        # Script tool tests
    ├── test_project_tools.gd       # Project tool tests
    ├── test_debug_tools.gd         # Debug tool tests
    └── test_resource_tools.gd      # Resource tool tests
```

### Test File Template

```gdscript
extends "res://addons/gut/test.gd"

var _instance: RefCounted = null

func before_each():
    _instance = load("res://addons/godot_mcp/path/to/module.gd").new()

func after_each():
    _instance = null

func test_something():
    assert_true(_instance.some_method(), "Should return true")

func test_with_nodes():
    var node: Node3D = Node3D.new()
    add_child_autofree(node)
    assert_true(node.is_inside_tree(), "Node should be in scene tree")
```

## Current Test Status

- **18 test scripts, 226 test cases, 400 assertions**
- **All tests passing** (as of 2026-05-02)
- Security-critical modules: 100% GUT coverage
- Overall GUT function coverage: ~35%
