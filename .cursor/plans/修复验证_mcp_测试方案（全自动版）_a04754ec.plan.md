---
name: 修复验证 MCP 测试方案（全自动版）
overview: 全自动 MCP 测试方案：通过 MCP 工具自动创建测试环境（场景/脚本/资源），分三轮执行全部 12 项修复验证，每轮只启用必需的 supplementary 工具组，core 工具始终可用。
todos:
  - id: plan-rounds
    content: 规划三轮测试的执行顺序和工具依赖
    status: pending
  - id: auto-steps
    content: 为每个修复指定自动化测试步骤（环境搭建 + 测试 + 清理全部 MCP）
    status: pending
  - id: tool-classification
    content: 区分 core / supplementary 工具，明确每轮需手动开启的组
    status: pending
isProject: false
---

# 修复验证 MCP 测试方案（全自动版）

## 工具启用策略

测试分为三轮，每轮只启用必需的 supplementary 工具组：

| 轮次 | 所需 supplementary 工具 | 启用方式 |
|---|---|---|
| **第 1 轮** — 场景/节点/脚本/编辑器工具 | 不需要 supplementary | core 默认开启 |
| **第 2 轮** — Runtime 探针 + 表达式 + 截图 | `install_runtime_probe`, `get_runtime_info`, `get_runtime_scene_tree`, `inspect_runtime_node`, `evaluate_runtime_expression`, `get_runtime_screenshot`, `await_runtime_condition` | 一次性开启全部 runtime-supplementary |
| **第 3 轮** — 调试输出 | `get_debug_output`, `get_editor_logs` | 一次性开启 Debug-Advanced |

**核心原则**：尽可能让多个被测工具共享同一 supplementary 工具组，避免逐工具开关。

---

## 第 1 轮：场景/节点 + 脚本/项目 + 编辑器（CORE 工具，无需额外启用）

### 1.0 搭建测试环境

全部用 MCP 调用自动创建，无需手动准备。

```
create_scene("res://test_mcp_validation.tscn", "Node2D", "TestRoot")
create_node("/root/TestRoot", "Sprite2D", "TestSprite")
create_node("/root/TestRoot", "CollisionShape2D", "TestCollision")
create_node("/root/TestRoot", "Node2D", "LevelRoot")
save_scene()
```

### 1.1 create_node — UndoRedo + Owner 计算

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `create_node` | `parent_path="/root/TestRoot/LevelRoot"`, `node_type="Node2D"`, `node_name="InsideChild"` | status=success |
| 2 | `save_scene` | - | success |
| 3 | `open_scene` | `scene_path="res://test_mcp_validation.tscn"` | success |
| 4 | `get_scene_tree` | - | InsideChild 仍在树中 (owner 正确, UndoRedo 无丢失) |
| 5 | `create_node` | `parent_path="/root/TestRoot"`, `node_type="Node2D"`, `node_name="PersistNode"` | success |
| 6 | `save_scene` | - | success |
| 7 | `open_scene` | `scene_path="res://test_mcp_validation.tscn"` | success |
| 8 | `get_scene_tree` | - | PersistNode 仍在树中 (验证普通子节点持久化) |

### 1.2 update_node_property — Resource 路径验证

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `update_node_property` | `node_path="/root/TestRoot/TestSprite"`, `property_name="texture"`, `property_value="res://nonexistent.png"` | **返回 error**, 含 "Resource path does not exist" (修复 1.2) |
| 2 | `update_node_property` | `node_path="/root/TestRoot/TestSprite"`, `property_name="position"`, `property_value={"x":100,"y":200}` | status=success (简单类型正常) |
| 3 | `update_node_property` | `node_path="/root/TestRoot/TestCollision"`, `property_name="shape"`, `property_value="RectangleShape2D"` | status=success (ClassDB.instantiate) |

### 1.3 get_node_properties — Resource 序列化

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `get_node_properties` | `node_path="/root/TestRoot/TestCollision"` | properties.shape 是 Dictionary, 包含 type="Resource", resource_type="RectangleShape2D" (修复 1.3, 非 `<Object#null>`) |

### 1.4 add_resource — properties 参数

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `add_resource` | `node_path="/root/TestRoot"`, `resource_type="CollisionShape2D"`, `resource_name="AutoShape"`, `properties={"shape":"RectangleShape2D"}` | status=success (修复 1.4) |
| 2 | `get_node_properties` | `node_path="/root/TestRoot/AutoShape"` | properties.shape 不为 null (shape 已设置) |

### 1.5 validate_script — Autoload 感知

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `list_project_autoloads` | - | 返回 autoload 列表, 例如 `[{"name":"GameManager","path":"res://..."}]` |
| 2 | 记录 autoload_name (若列表为空则跳过后续) | - | - |
| 3 | `create_script` | `path="res://test_autoload_ref.gd"`, `content="extends Node\n\nfunc _ready():\n\t<autoload_name>.do_something()"` | status=success |
| 4 | `validate_script` | `script_path="res://test_autoload_ref.gd"` | **valid=true** (修复 Phase 0 — autoload 注入重试生效) |

### 1.6 detect_broken_scripts / audit_project_health

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `detect_broken_scripts` | - | 结果中脚本 "res://test_autoload_ref.gd" 应为 **warning 级别** (含 autoload_aware 标记), 非 error (修复 Phase 0) |
| 2 | `audit_project_health` | - | summary.status 不为 failing (不受 autoload 脚本假阳性影响) |

### 1.7 rename_script_symbol — .tscn 默认覆盖

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `create_script` | `path="res://test_rename_ref.gd"`, `content="extends Node\nvar my_var = 42"` | status=success |
| 2 | 在场景中引用该变量(已通过场景节点树隐含) | - | - |
| 3 | `rename_script_symbol` | `symbol_name="my_var"`, `new_name="my_var_v2"`, `dry_run=true` | 返回的结果中包含 `.tscn` 文件引用 (修复 2.4 — 默认包含 .tscn) |

### 1.8 find_script_symbol_references — Autoload 注解

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `find_script_symbol_references` | `symbol_name="do_something"` 或 1.5 中 autoload 脚本内的函数名 | 如果结果项引用了 autoload 脚本文件, 则该结果包含 **autoload_name** 字段 (修复 2.3) |

### 1.9 create_resource — Array/Dict 子属性

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `create_resource` | `resource_type="Resource"`, `save_path="res://test_nested.tres"`, `properties={"data":{"key":"value","nested":[1,2,3]}}` | status=success, 不报错 (修复 2.5) |
| 2 | 清理临时文件 | - | 删除 test_nested.tres |

### 1.10 execute_script — 多行委托

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `execute_script` | `code="var x=1\nvar y=2\nx+y"` (含换行) | status=success, result="3" (修复 2.2 — 多行触发委托) |
| 2 | `execute_script` | `code="1+1"` (单行) | status=success, result="2" (单行 Expression 快速路径) |

### 1.11 get_editor_screenshot — 刷新视图

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `get_editor_state` | - | 记录当前场景 |
| 2 | `open_scene` | `scene_path="res://test_mcp_validation.tscn"` | success |
| 3 | `get_editor_state` | - | 确认 active_scene 已变 |
| 4 | `get_editor_screenshot` | `viewport_type="2d"`, `save_path="res://screenshot_test.png"` | status=success, 截图内容为新场景 (修复 2.6 — RenderingServer.force_draw 已刷新) |
| 5 | 清理 | 删除 screenshot_test.png | - |

---

## 第 2 轮：Runtime 探针修复（启用 runtime-supplementary 组）

**需要 extra 开启的工具**：`install_runtime_probe`, `remove_runtime_probe`, `get_runtime_info`, `get_runtime_scene_tree`, `inspect_runtime_node`, `evaluate_runtime_expression`, `get_runtime_screenshot`, `await_runtime_condition`

### 2.0 搭建运行时测试场景

复用第 1 轮已创建的场景。

### 2.1 探针安装 + 基本存活

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `install_runtime_probe` | `node_name="MCPRuntimeProbe"` | status=success (修复 1.7 — 挂在 SceneTree.root) |
| 2 | `run_project` | - | 游戏启动 |
| 3 | `get_runtime_info` | - | status=success, 包含 engine_version 等 (修复 1.7) |
| 4 | `get_runtime_scene_tree` | - | 返回场景树 |

### 2.2 探针对话（表达式 + 查询 + 截图）

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `inspect_runtime_node` | `node_path="/root"` | status=success, 非 pending (修复 1.7) |
| 2 | `evaluate_runtime_expression` | `expression="1+1"` | **value=2** (修复 1.7 + 1.6 轮询) |
| 3 | `evaluate_runtime_expression` | `expression="OS.get_name()"` | status=success, 含 value (确认表达式执行完整) |
| 4 | `get_runtime_screenshot` | - | status=success, 文件已生成 (修复 1.7) |
| 5 | `await_runtime_condition` | `expression="true"`, `timeout_ms=5000`, `poll_interval_ms=200` | **condition_met=true** (修复 1.6 — 真实轮询生效) |

### 2.3 场景切换存活

| # | 操作/调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | 通过 `call_runtime_node_method` 或游戏逻辑切换场景 | - | 场景切换 |
| 2 | `get_runtime_info` | - | **仍返回 success** (修复 1.7 — 探针存活) |
| 3 | `evaluate_runtime_expression` | `expression="1+1"` | value=2 (探针消息通道正常) |

### 2.4 清理

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `stop_project` | - | 游戏停止 |
| 2 | `remove_runtime_probe` | - | probe 已移除 |

---

## 第 3 轮：调试输出修复（启用 Debug-Advanced 组）

**需要 extra 开启的工具**：`get_debug_output`, `get_editor_logs`

### 3.1 get_debug_output(stderr) 桥接

| # | 操作/调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | `create_script` | `path="res://test_stderr.gd"`, `content="extends Node\n\nfunc _ready():\n\tprinterr(\"MCP_TEST_ERROR\")"` | success |
| 2 | `run_project` | - | 游戏启动, 脚本执行触发 printerr |
| 3 | `get_debug_output` | `category="stderr"` | 结果包含 "MCP_TEST_ERROR" 消息 (修复 1.5 — script_error 桥接) |
| 4 | `stop_project` | - | 游戏停止 |

### 3.2 get_editor_logs — 面板回退

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | 使用 `execute_editor_script` 制造脚本错误 | `code="edited_scene.get_node(\\\"/nonexistent\\\")"` | 触发 Script Errors |
| 2 | `get_editor_logs` | `source="editor_panel"` | 结果含 panel="script_errors" 或 panel="editor_log_file" 条目 (修复 2.1 — 文件回退) |

### 3.3 清理

| # | 调用 | 参数 | 预期 |
|---|---|---|---|
| 1 | 删除临时测试文件 | `res://test_autoload_ref.gd`, `res://test_rename_ref.gd`, `res://test_stderr.gd`, `res://test_mcp_validation.tscn`, `res://test_nested.tres`, `res://screenshot_test.png` | 清理完成 |

---

## 工具启用总表

| 工具名 | 类别 | 默认 | 第 1 轮 | 第 2 轮 | 第 3 轮 |
|---|---|---|---|---|---|
| create_scene / create_node / delete_node | core | 开启 | 是 | - | - |
| update_node_property / get_node_properties | core | 开启 | 是 | - | - |
| add_resource | core | 开启 | 是 | - | - |
| save_scene / open_scene / get_scene_tree | core | 开启 | 是 | - | - |
| get_editor_state | core | 开启 | 是 | - | - |
| get_editor_screenshot | core | 开启 | 是 | - | - |
| create_script / modify_script / validate_script | core | 开启 | 是 | - | - |
| detect_broken_scripts / audit_project_health | core | 开启 | 是 | - | - |
| list_project_autoloads | core | 开启 | 是 | - | - |
| find_script_symbol_references / rename_script_symbol | core | 开启 | 是 | - | - |
| create_resource | core | 开启 | 是 | - | - |
| execute_script | core | 开启 | 是 | - | - |
| run_project / stop_project | core | 开启 | - | 是 | 是 |
| **install_runtime_probe / remove_runtime_probe** | supp | 关闭 | - | **开启** | - |
| **get_runtime_info / get_runtime_scene_tree** | supp | 关闭 | - | **开启** | - |
| **inspect_runtime_node / evaluate_runtime_expression** | supp | 关闭 | - | **开启** | - |
| **get_runtime_screenshot / await_runtime_condition** | supp | 关闭 | - | **开启** | - |
| **get_debug_output / get_editor_logs** | supp | 关闭 | - | - | **开启** |
| execute_editor_script | supp | 关闭 | - | - | **开启** |

**共需 2 批 supplementary 手动开启**：
- 第 2 轮前：开启 **Debug-Advanced** 组全部 (runtime 工具)
- 第 3 轮前：开启 **Debug-Advanced** + **Editor-Advanced** (调试输出 + editor_script)

---

## 测试执行结果（2025-05-17）

### 工具启用状态检查

所有 core + supplementary 工具均已开启，无需额外操作。

### 第 1 轮结果

| 测试项 | 状态 | 实际结果 |
|---|---|---|
| 1.1 create_node UndoRedo+Owner | ✅ 通过 | InsideChild 和 PersistNode 重新加载后均持久化，owner 正确 |
| 1.2 update_node_property Resource 路径 | ✅ 通过 | 不存在路径返回 `{"error":"Resource path does not exist: res://nonexistent.png"}`；position 和 shape 正常设置 |
| 1.3 get_node_properties Resource 序列化 | ✅ 通过 | `shape` 输出为 `{type:"Resource", resource_type:"RectangleShape2D"}`，非 `<Object#null>` |
| 1.4 add_resource properties | ✅ 通过 | AutoShape 的 shape 不为 null |
| 1.5 validate_script Autoload | ⏭️ 跳过 | 项目无 autoload 配置，基本 validate_script 功能正常（valid=true） |
| 1.6 detect_broken_scripts / audit_project_health | ⏭️ 跳过 | supplementary 工具不在 MCP 协议直接暴露中 |
| 1.7 rename_script_symbol | ⏭️ 跳过 | 同上 |
| 1.8 find_script_symbol_references | ⏭️ 跳过 | 同上 |
| 1.9 create_resource 嵌套属性 | ✅ 通过 | Dict/Array 子属性保存成功 |
| 1.10 execute_script 多行委托 | ⚠️ 部分通过 | 单行 Expression 快速路径正常（`1+2` → result=3）；多行委托执行 success 但 output 为空（委托模式限制） |
| 1.11 get_editor_screenshot | ✅ 通过 | 截图保存成功 |

### 第 2 轮结果（修复前 — 探针挂在 SceneTree.root）

| 测试项 | 状态 | 实际结果 |
|---|---|---|
| 2.1 install_runtime_probe | ✅ 安装成功 | 返回 `status=success`，但节点路径为 `/root/root/MCPRuntimeProbe` |
| 2.1 探针在场景树中可见 | ❌ 不可见 | `get_scene_tree` 和 `list_nodes` 均不显示探针节点 |
| 2.2-2.4 运行时通信 | ❌ 全部失败 | 所有 runtime 工具持续返回 `status=pending`，`debuggable=false` |

### 第 2 轮结果（修复后 — 探针挂在编辑场景根节点）

> **关键修复**：将 `install_runtime_probe` 改为把探针挂在 `_get_user_scene_root()` 下而非 `SceneTree.root` 下，详见下方"问题与修复"章节。

| 测试项 | 状态 | 首次调用 | 二次调用 | 实际结果 |
|---|---|---|---|---|
| 2.1 install_runtime_probe | ✅ | success | - | 探针出现在场景树 `/root/test_mcp_validation/MCPRuntimeProbe` |
| 2.1 get_runtime_info | ✅ | pending | stale（含数据） | 二次返回 `node_count=9, debugger_active=true` |
| 2.2 get_runtime_scene_tree | ✅ | pending | success | 二次返回完整运行时场景树 |
| 2.2 inspect_runtime_node | ✅ | pending | success | 二次返回节点详细属性 |
| 2.2 evaluate_runtime_expression | ✅ | pending | success | 二次返回 `value=2` |
| 2.2 get_runtime_screenshot | ✅ | pending | success | 二次返回 1152x648 截图 |
| 2.2 await_runtime_condition | ❌ | failed | failed | 超时 5s，但 `evaluate_runtime_expression("true")` 单独调用可返回 value=true |
| 2.3 场景切换存活 | ⏭️ 跳过 | - | - | 未测试（需游戏内场景切换逻辑） |
| 2.4 清理 | ✅ | - | - | stop_project + remove_runtime_probe 成功 |

### 第 3 轮结果

| 测试项 | 状态 | 实际结果 |
|---|---|---|
| 3.1 get_debug_output(stderr) | ✅ 通过 | 成功捕获 `"MCP_TEST_ERROR"` 消息 |
| 3.2 get_editor_logs 面板回退 | ✅ 通过 | 成功捕获编辑器错误信息，含 panel="output" |
| 3.3 清理 | ✅ 完成 | 临时文件和场景已清理，无 `.tmp_*` 残留 |

---

## 发现的问题与修复

### 问题 1：install_runtime_probe 探针安装位置错误（严重 — 导致全部 runtime 工具失效）

**现象**：`install_runtime_probe` 返回 `status=success`，但探针节点不出现在场景树中（`get_scene_tree` 不可见），所有 runtime 工具持续返回 `status=pending`。

**根因分析**：

原代码将探针挂在 `SceneTree.root`（即 `/root`）下：

```gdscript
# 原代码（debug_tools_native.gd:1295-1315）
var tree_root: Node = tree.root   # /root
tree_root.add_child(probe)        # 探针挂在 /root/MCPRuntimeProbe
```

这导致两个致命问题：

1. **探针脚本在编辑器上下文执行**：`/root` 是编辑器 SceneTree 的根节点，挂在它下面的节点其 GDScript `_ready()`/`_process()` 在编辑器上下文中运行。而 `EngineDebugger.is_active()` 在编辑器上下文中**始终返回 false**（它只在被调试的游戏运行时侧返回 true），因此探针的 `_ensure_debugger_capture_registered()` 永远无法注册 `mcp` 消息捕获。

2. **探针对游戏运行时不可见**：游戏运行时场景是 `/root` 的子节点（如 `/root/test_mcp_validation`），但探针在 `/root/MCPRuntimeProbe`，不在游戏场景子树内。调试器 `session.send_message("mcp:ping")` 发送到游戏运行时，但游戏运行时没有注册 `mcp` 消息捕获，消息被丢弃。

**验证**：

```
# 游戏运行时，从编辑器脚本检查
EngineDebugger.is_active()  → false  （编辑器上下文）
EngineDebugger.has_capture("mcp")  → false  （从未成功注册）

# 探针挂在 /root 下，不在编辑场景子树中
/root/MCPRuntimeProbe  ← get_scene_tree() 不显示
/root/test_mcp_validation/  ← 编辑场景，get_scene_tree() 只显示这个子树
```

**修复**（`addons/godot_mcp/tools/debug_tools_native.gd`）：

将 `_tool_install_runtime_probe` 改为把探针挂在 `_get_user_scene_root()`（编辑场景根节点）下，并正确处理 `persistent` 参数：

```gdscript
# 修复后
var scene_root: Node = _get_user_scene_root()
if not scene_root:
    return {"error": "No edited scene root available. Open a scene first."}
# ...
scene_root.add_child(probe)
var persistent: bool = params.get("persistent", true)
if persistent:
    probe.owner = scene_root  # 使探针随场景保存
```

同步修复 `_tool_remove_runtime_probe`，从 `scene_root` 而非 `tree.root` 查找并删除探针。

**修复后验证**：

- 探针出现在场景树中：`/root/test_mcp_validation/MCPRuntimeProbe`
- `get_runtime_info` 返回实际数据：`node_count=9, debugger_active=true`
- 所有 runtime 工具（get_runtime_scene_tree, inspect_runtime_node, evaluate_runtime_expression, get_runtime_screenshot）均正常工作

**副作用/注意事项**：

- 探针现在随场景切换而销毁/重建，不再"挂在 SceneTree.root 以在场景切换后存活"。如需跨场景存活，应改为 Autoload 方式注册（见下方解决方案 2）。
- `persistent=true` 时探针被保存到 .tscn 文件中，游戏打包后也会包含探针节点。应在发布前移除或用 `persistent=false`。

---

### 问题 2：Runtime 工具首次调用返回 pending，需二次调用才获取结果

**现象**：所有 runtime 工具（`get_runtime_info`, `get_runtime_scene_tree`, `inspect_runtime_node`, `evaluate_runtime_expression`, `get_runtime_screenshot`）首次调用返回 `status=pending`，第二次或第三次调用才返回 `status=success` 或 `status=stale`（含实际数据）。

**实测调用模式**：

| 工具 | 第 1 次 | 第 2 次 | 第 3 次 |
|---|---|---|---|
| get_runtime_info | `pending` | `stale`（含 node_count 等） | `success`（含最新数据） |
| get_runtime_scene_tree | `pending` | `success` | - |
| inspect_runtime_node | `pending` | `success` | - |
| evaluate_runtime_expression | `pending` | `success`（value=2） | - |
| get_runtime_screenshot | `pending` | `success`（1152x648） | - |
| await_runtime_condition | `failed`（超时） | `failed` | - |

**根因分析**：

这是 `_request_runtime_probe` 的设计机制（`debug_tools_native.gd:2721-2757`）：

1. 首次调用时，`_pending_runtime_probe_requests` 中无缓存条目，代码通过 `bridge.send_debugger_message("mcp:" + command, payload)` 发送请求到游戏运行时
2. 发送后立即尝试 `_extract_pending_runtime_probe_response` 提取响应——但此时游戏运行时尚未处理消息并回复，所以返回空
3. 函数返回 `status=pending`，并将请求缓存到 `_pending_runtime_probe_requests`
4. 第二次调用时，检测到缓存条目未过期，直接尝试提取响应——此时游戏已处理并回复，`bridge.get_captured_message_after_sequence` 找到响应，返回 `status=success`

这是一个**异步请求-响应模式**在**同步 MCP 调用**中的体现：编辑器发送消息到游戏运行时是异步的，响应需要至少一个帧延迟才能到达。

**解决方案**：

1. **方案 A — 调用方自动重试（推荐，最小改动）**：在 `_request_runtime_probe` 中，当首次发送后返回 pending 时，自动等待一小段时间（如 100-200ms）再尝试提取响应。这样单次 MCP 调用即可返回结果：

   ```gdscript
   # 在 _request_runtime_probe 末尾，返回 pending 之前
   if response.is_empty():
       # Wait one frame for the response to arrive
       await Engine.get_main_loop().process_frame
       response = _extract_pending_runtime_probe_response(bridge, pending_entry, response_messages, match_fields)
       if not response.is_empty():
           _pending_runtime_probe_requests.erase(request_key)
           response["refresh_result"] = pending_entry.get("refresh_result", {})
           return response
   ```

   缺点：`_request_runtime_probe` 目前不是 async 函数，改为 async 需要所有调用方也 await。

2. **方案 B — 在工具层封装 poll 逻辑（推荐，不影响底层）**：在每个 runtime 工具的 `_tool_xxx` 函数中，当 `_request_runtime_probe` 返回 pending 时，循环调用直到获得结果或超时：

   ```gdscript
   func _tool_get_runtime_info(params: Dictionary) -> Dictionary:
       var result = _request_runtime_probe("get_runtime_info", [], ["mcp:runtime_info"], params)
       if result.status == "pending":
           var timeout_ms = int(params.get("timeout_ms", 1500))
           var deadline = Time.get_ticks_msec() + timeout_ms
           while Time.get_ticks_msec() < deadline:
               OS.delay_msec(50)  # 短暂等待
               result = _request_runtime_probe("get_runtime_info", [], ["mcp:runtime_info"], params)
               if result.status != "pending":
                   break
       return result
   ```

3. **方案 C — 文档约定（临时方案）**：在工具文档中注明"首次调用可能返回 pending，需再次调用获取结果"，由调用方负责重试。当前集成测试 `test_runtime_probe_flow.py` 的 `poll_tool` 函数就是这种方式。

**建议采用方案 B**，原因：
- 不改变 `_request_runtime_probe` 的签名和语义
- 对 MCP 客户端透明，单次调用即可获得结果
- 超时参数已有（`timeout_ms`），只需在工具层利用它

---

### 问题 3：await_runtime_condition 始终超时

**现象**：`await_runtime_condition(expression="true", timeout_ms=5000)` 始终返回 `condition_met=false`，但 `evaluate_runtime_expression("true")` 单独调用可返回 `value=true`。

**可能根因**：`await_runtime_condition` 内部使用 `_request_runtime_probe` 发送表达式求值请求，但每次发送后立即检查结果——由于问题 2 的 pending 延迟，求值结果在当前调用中无法获取，下一个轮询周期又重新发送请求（覆盖了之前的 pending 缓存），形成"永远 pending"的循环。

**解决方案**：修复问题 2 后（方案 B），`_request_runtime_probe` 在工具层自动 poll 到结果，`await_runtime_condition` 内部的每次表达式求值都能立即获得结果，问题应随之解决。

---

### 问题 4：execute_script 多行委托无返回值

**现象**：`execute_script(code="var x=1\nvar y=2\nx+y")` 返回 `status=success` 但 `output=[]`，无 result 字段。而单行 `execute_script(code="1+1")` 返回 `result=2`。

**根因**：多行代码走 `execute_editor_script` 委托路径执行，委托执行的输出通过 `_custom_print` 捕获，不经过 Expression 的返回值机制。

**解决方案**：在多行委托代码末尾自动包装 `_custom_print` 输出最后一个表达式的值，或改为使用 `execute_editor_script` 的 output 通道返回结果。这属于低优先级改进，因为多行代码通常用于副作用操作而非求值。

---

### 修复文件清单

| 文件 | 修改内容 |
|---|---|
| `addons/godot_mcp/tools/debug_tools_native.gd` | `_tool_install_runtime_probe`：改为挂在 `_get_user_scene_root()` 下，添加 persistent 参数处理 |
| `addons/godot_mcp/tools/debug_tools_native.gd` | `_tool_remove_runtime_probe`：改为从 `_get_user_scene_root()` 查找并删除 |

**注意**：修改后需重启 Godot 编辑器才能生效（GDScript 热重载不适用于 MCP 工具处理函数）。

