---
name: godot-mcp-custom-tooling
description: "Add, register, debug, and validate new custom tools for this Godot MCP project. Use when the user wants to create a new MCP tool, extend existing Godot MCP capabilities, or troubleshoot a newly added tool across TypeScript and GDScript."
---

# Godot MCP Custom Tooling

This skill is for adding or debugging a custom tool that spans the full Godot MCP bridge:

```text
Claude / MCP client → FastMCP server (TypeScript) → WebSocket → Godot editor (GDScript)
```

A custom tool is only complete when all layers agree on the same command name, the server builds, Godot loads the scripts, and at least one real MCP call succeeds.

## When to use this skill

Use this skill when the user asks to:

- add a new MCP tool to the Godot integration
- expose a new Godot/editor capability to Claude
- debug why a newly added tool is not visible, times out, or returns the wrong data
- wire a new request/response flow between `server/src/tools/*.ts` and `addons/godot_mcp/commands/*.gd`

## Core rule: command name must match exactly

For a tool named `my_new_tool`, the string must match in all of these places:

1. TypeScript tool `name`
2. TypeScript `godot.sendCommand('my_new_tool', ...)`
3. GDScript `match command_type:` branch

If any one of these differs, the tool will fail even if the rest of the code looks correct.

## Standard file touchpoints

Most new tools require these four changes:

1. Create `server/src/tools/XXXX_tools.ts`
2. Edit `server/src/index.ts`
3. Create `addons/godot_mcp/commands/XXXX_commands.gd`
4. Edit `addons/godot_mcp/command_handler.gd`

## Recommended implementation workflow

Follow this order. Do not skip validation.

### Step 1: Define the TypeScript MCP tool

Create a new file under `server/src/tools/`.

Requirements:

- Use `zod` for parameter validation
- Define a typed params interface
- Use `getGodotConnection()`
- Call `godot.sendCommand()` with the exact command string
- Return a user-facing `Promise<string>`

Template shape:

```typescript
import { z } from 'zod';
import { getGodotConnection } from '../utils/godot_connection.js';
import { MCPTool, CommandResult } from '../utils/types.js';

interface MyToolParams {
  foo: string;
  bar?: number;
}

export const myTools: MCPTool[] = [
  {
    name: 'my_new_tool',
    description: 'Describe what the tool does',
    parameters: z.object({
      foo: z.string(),
      bar: z.number().optional(),
    }),
    execute: async ({ foo, bar }: MyToolParams): Promise<string> => {
      const godot = getGodotConnection();
      const result = await godot.sendCommand<CommandResult>('my_new_tool', {
        foo,
        bar,
      });
      return JSON.stringify(result);
    },
  },
];
```

Implementation notes:

- Prefer explicit, narrow schemas instead of loose dictionaries
- If the Godot side returns structured data, format it into readable text in `execute`
- If a parameter is required conceptually, make it required in Zod so MCP rejects bad calls before WebSocket traffic starts

### Step 2: Register the TypeScript tool

Edit `server/src/index.ts`:

- import the new tool array
- spread it into the tool registration list

Pattern:

```typescript
import { myTools } from './tools/my_tools.js';

[...nodeTools, ...scriptTools, ...sceneTools, ...editorTools, ...myTools].forEach(tool => {
  server.addTool(tool);
});
```

After this change, rebuild the server:

```bash
cd server && npm run build
```

If the tool is not visible from MCP later, first verify this registration point.

### Step 3: Implement the GDScript command processor

Create a new file under `addons/godot_mcp/commands/`.

Requirements:

- `@tool`
- `class_name MCP...`
- `extends MCPBaseCommandProcessor`
- implement `process_command()`
- route the matching command name to a private handler
- use `_send_success()` / `_send_error()`

Template shape:

```gdscript
@tool
class_name MCPMyCommands
extends MCPBaseCommandProcessor

func process_command(client_id: int, command_type: String, params: Dictionary, command_id: String) -> bool:
	match command_type:
		"my_new_tool":
			_my_new_tool(client_id, params, command_id)
			return true
	return false

func _my_new_tool(client_id: int, params: Dictionary, command_id: String) -> void:
	var foo: String = params.get("foo", "")
	_send_success(client_id, {"foo": foo}, command_id)
```

Use inherited helpers when appropriate:

- `_send_success()`
- `_send_error()`
- `_get_editor_node()`
- `_mark_scene_modified()`
- `_get_undo_redo()`
- `_parse_property_value()`

### Step 4: Register the GDScript processor

Edit `addons/godot_mcp/command_handler.gd`.

Create the processor instance, attach `_websocket_server`, append it to `_command_processors`, and `add_child()` it.

Important: prefer explicit preload for newly added processors.

Observed reliable pattern:

```gdscript
const MY_COMMANDS_SCRIPT = preload("res://addons/godot_mcp/commands/my_commands.gd")

func _initialize_command_processors():
	var my_commands = MY_COMMANDS_SCRIPT.new()
	my_commands._websocket_server = _websocket_server
	_command_processors.append(my_commands)
	add_child(my_commands)
```

Why this matters:

- Directly referencing a fresh `class_name` such as `MCPMyCommands.new()` can fail at parse/load time if Godot has not resolved that global class yet
- Explicit `preload()` avoids that registration-order problem
- This exact issue occurred when adding `MCPDebugCommands`

## Validation checklist

A tool is not done until all of these pass.

### 1. Server build

Run:

```bash
cd server && npm run build
```

This confirms:

- the new tool compiles
- imports are correct
- registration is syntactically valid

### 2. Godot project load

Open the project in Godot, or run a headless load if needed.

Goal:

- confirm there is no parse error in the new `.gd` file
- confirm `command_handler.gd` loads cleanly
- confirm the addon initializes

If a class resolution error appears in `command_handler.gd`, switch from direct class instantiation to explicit `preload()`.

### 3. MCP tool registration

Do a minimal real call from MCP.

A good first probe is a deliberately incomplete call.

Example:

- call the tool with a missing required parameter
- if MCP returns `-32602` validation error, the tool is at least registered and visible to the MCP server

This is useful because it distinguishes:

- tool missing entirely
- tool present but called incorrectly

### 4. Real end-to-end call

Run at least one real invocation with valid parameters.

Validate:

- request reaches the TypeScript server
- WebSocket command reaches Godot
- Godot responds with the expected shape
- TypeScript formats the result correctly

### 5. Branch-specific testing

If the tool has multiple modes or sources, test each branch separately.

Example from `read_logs`:

- `source = runtime` worked
- `source = editor` timed out

Conclusion: the tool was only partially correct, even though registration and one branch were fine.

Do not mark a tool complete just because one code path works.

## Practical troubleshooting flow

When a new tool fails, narrow it down in this order.

### Symptom: tool not visible in MCP

Check:

- `server/src/index.ts` import exists
- tool array is included in the registration spread
- `npm run build` was rerun
- MCP server was restarted or reloaded

### Symptom: `-32602` parameter validation error

Interpretation:

- tool is registered
- call reached FastMCP
- schema rejected the input

Action:

- fix the call arguments or Zod schema
- do not debug WebSocket yet

### Symptom: `Unknown command`

Check exact command string equality across:

- TS tool `name`
- `sendCommand('...')`
- GDScript `match`

### Symptom: command times out

Interpretation:

- request likely reached Godot
- Godot did not send a response in time

Check:

- handler branch actually returns `_send_success()` or `_send_error()` on every path
- no branch falls through silently
- no Godot API call is hanging or failing before response send
- the processor was actually appended to `_command_processors`

Then isolate with smaller probes:

- use `execute_editor_script` for quick runtime checks
- test each sub-branch independently
- reduce the handler to a minimal `_send_success()` response if needed

### Symptom: parse error like class not declared

Prefer:

```gdscript
const SOME_SCRIPT = preload("res://...")
var instance = SOME_SCRIPT.new()
```

Instead of relying on immediate `class_name` resolution inside `command_handler.gd`.

## Response design guidance

Prefer these Godot response shapes:

### Success

```json
{
  "status": "success",
  "result": {
    "key": "value"
  },
  "commandId": "cmd_0"
}
```

### Error

```json
{
  "status": "error",
  "message": "Human-readable error",
  "commandId": "cmd_0"
}
```

Design rules:

- return structured data from Godot
- format for readability in TypeScript
- treat missing files / unsupported branches as explicit errors or explicit empty results
- avoid silent failures that cause server-side timeouts

## What to record in your final implementation

When finishing a new tool, report:

1. which files were added or changed
2. whether server build passed
3. whether Godot loaded the new scripts successfully
4. whether the tool is visible from MCP
5. which parameter combinations were actually tested
6. any branch that still times out or returns partial results

## Additional rules for data-heavy or multi-branch tools

Apply the following rules whenever a tool matches any of these conditions:

- it returns dozens of text entries or more
- it reads editor logs, terminal output, cached text, script output, or other noisy sources
- it has multiple `source`, `mode`, or branch paths
- its payload may contain rich text, ANSI sequences, control characters, or other non-clean text
- it needs pagination, sorting, filtering, or incremental reads

When any of the above is true:

- do not just read raw data and return it directly
- normalize text as early as possible at the data source
- separate transport/debug output from user-meaningful output
- cap in-memory buffers for frequently growing sources
- return structured entries with stable indices when the caller needs pagination or ordering

## Error-handling layers

Use these layers consistently.

### 1. Parameter layer

Handle in TypeScript with Zod.

Rules:

- reject invalid enums, ranges, and shapes before WebSocket traffic starts
- if a parameter is conceptually required, make it required in the schema
- define an explicit upper bound for large result controls such as `count`

Interpretation:

- if FastMCP returns `-32602`, registration likely succeeded and the schema blocked bad input

### 2. Branch layer

Handle in GDScript command routing and per-branch handlers.

Rules:

- every branch must end in `_send_success()` or `_send_error()`
- do not treat one successful branch as proof the whole tool is done
- if a branch legitimately has no matching data, return an explicit empty success result

For collection-style tools, prefer shapes like:

```json
{
  "logs": [],
  "total_count": 0,
  "source": "editor"
}
```

### 3. Data-source layer

Handle resource availability and data cleanup where the data is collected.

Rules:

- missing files, unavailable plugin APIs, or absent editor/plugin state should return explicit errors
- offset overflow, type mismatch, or empty filtered results should usually return empty success results, not errors
- normalize polluted text before storing it in caches or response objects
- if the source mixes business data and transport/debug noise, filter that noise before pagination and formatting

### 4. Timeout layer

When a tool times out, narrow it down in this order:

1. confirm every code path returns `_send_success()` or `_send_error()`
2. isolate whether only one branch or source is failing
3. check whether large payload size or polluted text amplifies the issue
4. check whether debug output is being written back into the same source being read
5. check whether the tool needs pagination, buffer caps, or smaller responses

## `read_logs` lessons learned

These are real project-specific lessons and should be applied to future tools.

- New GDScript processors should be registered with explicit `preload()` in `command_handler.gd` for reliability
- A tool can be correctly registered yet still be functionally incomplete
- Parameter validation errors are useful positive evidence that MCP registration succeeded
- Always test every branch of a multi-mode tool, not just one happy path
- `execute_editor_script` is useful for fast runtime diagnostics, but keep the probe script minimal to avoid parser/indentation noise
- Runtime log access can succeed while editor-specific APIs still fail or hang
- If a tool reads text from editor-facing sources, sanitize ANSI/control characters before the text enters long-lived caches or response formatting
- If plugin transport/debug messages share the same source as user-facing data, filter them at collection time instead of only at display time
- For high-volume text reads, prefer capped buffers plus pagination over rescanning an unbounded source on every request
- A fix is not complete until noisy-input cases and high-volume cases are tested explicitly, not inferred from a small happy-path sample

## Fast implementation checklist

Use this short checklist during execution:

- define Zod schema
- implement `execute()` with `sendCommand()`
- register tool in `server/src/index.ts`
- create GDScript processor
- register processor in `command_handler.gd`
- prefer `preload()` for processor instantiation
- run `npm run build`
- confirm Godot loads without parse errors
- verify tool appears in MCP
- run one invalid-params probe
- run one valid real call per branch
- report exact success/failure status