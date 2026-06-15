# 修复计划：根据测试报告修复所有工具 Bug

## 修复目标

将 30 个 MCP 工具的通过率从 26.7% (8/30) 提升到 100%，按优先级修复 7 个核心 Bug 和 5 个额外问题。

---

## 步骤 1: 修复 BUG-1 — PathValidator `//` 模式误判 [P0]

**影响**: 15 个工具完全不可用
**文件**: `addons/godot_mcp/utils/path_validator.gd`

**修改内容**:
- `validate_path()` 中，先对路径做 `_sanitize_path()` 清理，然后在 sanitized 路径上检查危险模式
- 将 `"//"` 从 `DANGEROUS_PATTERNS` 中移除（因为 `_sanitize_path()` 已经处理了多余的 `//`）
- 或者：在检查 `//` 前先提取路径部分（去掉 `res://` 或 `user://` 前缀），只检查路径部分中是否有 `//`

**具体方案**: 
1. 修改 `validate_path()` 逻辑：先 sanitize，再在 sanitized 路径上做危险模式检查
2. 从 `DANGEROUS_PATTERNS` 中移除 `"//"`，因为 sanitize 后不会有非法的 `//`
3. 保留 `..` 等其他危险模式检查

---

## 步骤 2: 修复 BUG-2 — 静态方法中 Engine.get_meta 空引用崩溃 [P0]

**影响**: 8 个工具崩溃返回空字典
**文件**: 
- `addons/godot_mcp/tools/scene_tools_native.gd` (save_scene, open_scene, get_current_scene, get_scene_structure)
- `addons/godot_mcp/tools/editor_tools_native.gd` (get_editor_state, run_project, stop_project, get_selected_nodes, set_editor_setting)

**修改内容**:
将所有 `static func _tool_*` 改为实例方法 `func _tool_*`，使用 `_get_editor_interface()` 获取 EditorInterface（有 null 检查和 fallback 逻辑）。

**具体改动**:
1. **scene_tools_native.gd**: 
   - `_tool_save_scene`: `static` → 实例方法，`Engine.get_meta(...)` → `_get_editor_interface()`
   - `_tool_open_scene`: 同上
   - `_tool_get_current_scene`: 同上
   - `_tool_get_scene_structure`: 同上
   - 辅助函数 `_build_node_tree`, `_count_nodes` 保持 static（不访问实例变量）
   - `_tool_list_project_scenes`, `_collect_scenes` 保持 static（不使用 EditorInterface）

2. **editor_tools_native.gd**:
   - `_tool_get_editor_state`: `static` → 实例方法，`Engine.get_meta(...)` → `_get_editor_interface()`
   - `_tool_run_project`: 同上
   - `_tool_stop_project`: 同上
   - `_tool_get_selected_nodes`: 同上
   - `_tool_set_editor_setting`: 同上

---

## 步骤 3: 修复 BUG-3 — 场景定位错误 [P1]

**影响**: 4 个工具操作错误场景
**文件**: `addons/godot_mcp/tools/node_tools_native.gd`

**修改内容**:
`editor_interface.get_edited_scene_root()` 返回 MCPPanelNative 而非用户场景。需要遍历打开的场景找到非 MCP 面板的用户场景。

**具体方案**:
1. 在 `node_tools_native.gd` 中添加 `_get_user_scene_root()` 方法
2. 逻辑：获取 `get_edited_scene_root()`，如果场景名包含 "MCPPanelNative" 或是 MCP 面板，则遍历 `get_open_scenes()` 找到第一个非 MCP 面板的场景
3. 将所有 `_tool_*` 方法中的 `editor_interface.get_edited_scene_root()` 替换为 `_get_user_scene_root()`

---

## 步骤 4: 修复 BUG-4 — 属性值类型转换缺失 [P1]

**影响**: update_node_property 核心功能异常
**文件**: `addons/godot_mcp/tools/node_tools_native.gd`

**修改内容**:
在 `update_node_property` 中添加类型转换逻辑，根据属性的实际类型自动转换传入值。

**具体方案**:
1. 添加 `_convert_value_for_property(node, property_name, value)` 方法
2. 获取属性的 `property_info`（通过 `node.get_property_list()`）
3. 根据 `property_info.hint` 和 `property_info.type` 进行转换：
   - `TYPE_VECTOR2`: Dictionary `{"x":..., "y":...}` → `Vector2(x, y)`
   - `TYPE_VECTOR3`: Dictionary `{"x":..., "y":..., "z":...}` → `Vector3(x, y, z)`
   - `TYPE_COLOR`: String `"#rrggbb"` → `Color(hex)` 或 Dictionary `{"r":..., "g":..., "b":..., "a":...}` → `Color(r, g, b, a)`
   - `TYPE_BOOL`: String `"true"/"false"` → `true/false`
   - `TYPE_INT`/`TYPE_FLOAT`: String 数字 → `int/float`
4. 使用 `ClassDB.class_set_property()` 进行类型安全的属性设置

---

## 步骤 5: 修复 BUG-5 — debug_print 输出污染 stdout [P2]

**影响**: 1 个工具可能干扰 MCP 协议
**文件**: `addons/godot_mcp/tools/debug_tools_native.gd`

**修改内容**:
将 `print(full_message)` 改为 `printerr(full_message)`

---

## 步骤 6: 修复 BUG-6 — get_editor_logs 返回静态文本 [P3]

**影响**: 1 个工具功能不完整
**文件**: `addons/godot_mcp/tools/debug_tools_native.gd`

**修改内容**:
实现基于日志缓存的 get_editor_logs。

**具体方案**:
1. 在 `debug_tools_native.gd` 中添加 `_log_buffer: Array[String]` 和 `_max_log_lines: int = 1000`
2. 在 `initialize()` 中连接 MCPServerCore 的 `log_message` 信号，将日志存入 buffer
3. `_tool_get_editor_logs` 从 buffer 中读取最近的日志
4. 返回格式与文档一致：`{"logs": [...], "count": N}`

---

## 步骤 7: 修复额外问题 [P3]

### ISSUE-1: get_project_info 返回值不准确
**文件**: `addons/godot_mcp/tools/project_tools_native.gd`
- `main_scene`: 使用 `ProjectSettings.globalize_path()` 将 UID 转换为文件路径，或使用 `ResourceUID.uid_to_path()`
- `project_path`: 使用 `ProjectSettings.globalize_path("res://")` 替代 `OS.get_executable_path().get_base_dir()`

### ISSUE-2: set_editor_setting inputSchema 类型定义错误
**文件**: `addons/godot_mcp/tools/editor_tools_native.gd`
- 将 `"type": ["string", "number", "boolean"]` 改为不指定 type（MCP/JSON Schema 允许省略 type 表示任意类型）

### ISSUE-3: execute_script 的 bind_objects print 污染 stdout
**文件**: `addons/godot_mcp/tools/debug_tools_native.gd`
- 将 `print("[MCP Debug] Warning: ...")` 改为 `printerr("[MCP Debug] Warning: ...")`

### ISSUE-4: create_scene 中 root_node.queue_free() 问题
**文件**: `addons/godot_mcp/tools/scene_tools_native.gd`
- 将 `root_node.queue_free()` 改为 `root_node.free()`（未加入场景树的节点需要用 free()）

---

## 步骤 8: 验证修复

1. 重启 Godot 编辑器（使所有修改生效）
2. 逐个测试所有 30 个工具
3. 更新测试报告文档

---

## 修改文件清单

| 文件 | 修改类型 | 涉及 Bug |
|------|---------|---------|
| `utils/path_validator.gd` | 修改验证逻辑 | BUG-1 |
| `tools/scene_tools_native.gd` | static→实例方法 + queue_free→free | BUG-2, ISSUE-4 |
| `tools/editor_tools_native.gd` | static→实例方法 + inputSchema修复 | BUG-2, ISSUE-2 |
| `tools/node_tools_native.gd` | 添加场景定位 + 类型转换 | BUG-3, BUG-4 |
| `tools/debug_tools_native.gd` | print→printerr + 日志缓存 | BUG-5, BUG-6, ISSUE-3 |
| `tools/project_tools_native.gd` | 修复返回值 | ISSUE-1 |

---

## 执行顺序

1. BUG-1 (PathValidator) → 解除 15 个工具的阻塞
2. BUG-2 (static→实例方法) → 解除 8 个工具的崩溃
3. BUG-3 (场景定位) → 修正 4 个工具的操作目标
4. BUG-4 (类型转换) → 修正 update_node_property
5. BUG-5 (debug_print stdout) → 防止协议污染
6. BUG-6 (editor_logs) → 实现日志缓存
7. ISSUE-1~4 → 修复细节问题
8. 验证所有工具
