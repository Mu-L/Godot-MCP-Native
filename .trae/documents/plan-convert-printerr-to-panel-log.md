# 计划：将 MCP 插件打印从 Godot 输出面板迁移到 Server Log 面板

## 问题分析

当前 MCP 插件的日志打印会出现在 **Godot 编辑器的输出面板** 中，对用户造成污染。这些日志应该只显示在 MCP 插件面板的 **Server Log 页签** 中。

## 打印来源分析

### 第一类：`printerr()` 输出到 stderr（会显示在输出面板）

| 文件 | 数量 | 类型 |
|------|------|------|
| `mcp_http_server.gd` | 15 处 | HTTP 服务器生命周期日志（连接、错误、配置） |
| `mcp_server_native.gd` | 26 处 | 插件加载诊断、工具注册诊断、日志转发 |
| `mcp_server_core.gd` | 5 处 | 核心日志方法（_log_error/warn/info/debug） |
| `mcp_types.gd` | 4 处 | MCPLogger 类的方法 |
| `mcp_stdio_server.gd` | 5 处 | Stdio 服务器日志 |
| `debug_tools_native.gd` | 1 处 | **debug_print 工具输出（保留）** |

### 第二类：`print()` 输出到 stdout（会显示在输出面板）

| 文件 | 数量 | 类型 |
|------|------|------|
| `mcp_resource_manager.gd` | 6 处 | 资源注册/注销调试信息 |
| `path_validator.gd` | 9 处 | 路径验证测试输出 |
| `resource_tools_native.gd` | 3 处 | 初始化完成信息 |

### 第三类：`push_error()` 到引擎（会显示在输出面板）- **保留**

| 文件 | 数量 | 说明 |
|------|------|------|
| `mcp_transport_base.gd` | 6 处 | 抽象方法未实现（正常情况不触发） |
| `script_utils.gd` | 6 处 | 文件/脚本操作失败 |
| `resource_utils.gd` | 8 处 | 资源操作失败 |
| `node_utils.gd` | 1 处 | 截图类型错误 |
| `mcp_auth_manager.gd` | 1 处 | Token 配置错误 |

**决定**：`push_error()` 保留，因为它们是真正的错误，应该显示给用户。

## 解决方案

### 核心思路

创建一个统一的 `MCPLogManager` 单例或工具类，替代所有 `printerr()` 和 `print()` 调用，将日志直接写入 MCP 面板的 Server Log TextEdit 组件，**不再输出到 Godot 输出面板**。

### 方案一：使用全局日志工具类（推荐）

在 `mcp_types.gd` 中增强 `MCPLogger` 类，添加一个静态方法 `log()`，通过信号或回调将日志传递给 UI 面板。

### 方案二：直接使用 `_main_panel.update_log()`

各模块直接调用 UI 面板的 `update_log()` 方法。但这会引入对 UI 的依赖，破坏模块化。

### 选定方案：方案一的变体——通过 MCPServerCore 的信号集中管理

利用现有的 `log_message` 信号机制，但 **移除所有直接调用 `printerr()` 和 `print()` 的代码**，改为只通过信号将日志发送到 UI 面板。

---

## 具体实施步骤

### 步骤 1：改造 `mcp_server_core.gd` — 核心日志方法

修改 `_log_error`、`_log_warn`、`_log_info`、`_log_debug` 方法，**移除其中的 `printerr()` 调用**，只保留信号发射：

```gdscript
func _log_error(message: String) -> void:
    if _log_level >= MCPTypes.LogLevel.ERROR:
        call_deferred("emit_signal", "log_message", "ERROR", message)

func _log_warn(message: String) -> void:
    if _log_level >= MCPTypes.LogLevel.WARN:
        call_deferred("emit_signal", "log_message", "WARN", message)

func _log_info(message: String) -> void:
    if _log_level >= MCPTypes.LogLevel.INFO:
        call_deferred("emit_signal", "log_message", "INFO", message)

func _log_debug(message: String) -> void:
    if _log_level >= MCPTypes.LogLevel.DEBUG:
        call_deferred("emit_signal", "log_message", "DEBUG", message)
```

### 步骤 2：改造 `mcp_server_native.gd` — 移除所有 `printerr()` 诊断日志

#### 2a：移除 `_enter_tree()` 中的诊断日志（第 101、110、113、119、122 行）

这些是插件加载时的诊断信息，应改为通过 `_log_info()` 输出到 Server Log 面板。

#### 2b：移除 `_register_all_tools()` 和 `_register_tool_module()` 中的诊断日志（第 405-448 行）

14 处 `[DIAG]` 诊断日志。这些只在开发调试时需要，改为通过 `_log_debug()` 输出。

#### 2c：改造 `_on_log_message()`（第 814-822 行）

**移除其中的 `printerr()` 调用**，只保留向 UI 面板转发日志的功能。

#### 2d：改造 `_log_error/warn/info/debug()` 方法（第 828-842 行）

**移除其中的 `printerr()` 调用**，改为通过信号发射日志。

#### 2e：新增日志面板更新方法

`_on_log_message` 中已有 `_main_panel.update_log()` 调用，保留。确保所有日志都通过此路径。

### 步骤 3：改造 `mcp_http_server.gd` — 移除所有 `printerr()` 调用

15 处 `printerr()` 调用需要改造。HTTP 服务器没有直接访问 `_main_panel` 的能力。

**方案**：通过 `McpServerCore` 的日志信号来输出。

具体做法：
- HTTP 服务器需要持有对 `_server_core` 的引用（或者通过信号）
- 将所有 `printerr("[MCP HTTP] ...")` 改为调用核心日志方法

由于 HTTP 服务器是 `McpTransportBase` 的子类，可以通过父类或构造函数传入 `_server_core` 引用来实现。

或者更简单：在 `mcp_server_native.gd` 中连接 HTTP 服务器的信号，将 HTTP 服务器的日志转发到 UI 面板。

实际上，最简洁的方式是：**让 HTTP 服务器持有一个日志回调方法**，在 `mcp_server_native.gd` 中设置。

### 步骤 4：改造 `mcp_resource_manager.gd` — 移除 `print()` 调用

6 处 `print()` 改为通过 `_server_core` 的日志方法输出。

`MCPResourceManager` 在 `mcp_server_core.gd` 中创建，可以传入核心引用或日志回调。

### 步骤 5：改造 `resource_tools_native.gd` — 移除 `print()` 调用

3 处 `print()` 改为通过核心日志方法输出。

### 步骤 6：改造 `path_validator.gd` — 移除 `print()` 调用

9 处 `print()`。这些看起来是测试/调试代码，应改为通过核心日志方法输出。

### 步骤 7：改造 `mcp_types.gd` — 改造 MCPLogger 类

`MCPLogger` 中的 4 处 `printerr()` 改为接受一个回调函数来输出日志。

### 步骤 8：`debug_tools_native.gd` — 保留 debug_print 工具

`debug_print` 工具是用户主动调用的 MCP 工具，用于向 Godot 编辑器输出面板打印调试信息。这是用户期望的行为，**保留其 `printerr()` 调用，不做修改**。

### 步骤 9：改造 `mcp_stdio_server.gd`

5 处 `printerr()` 改为通过核心日志方法输出。

**注意**：`print(json_string)` 在 stdio 模式下是协议通信的必要输出，**不能移除**。但它在 HTTP 模式下不会执行（有条件判断）。

---

## 影响分析

### 预期效果
- Godot 输出面板不再显示 MCP 插件的内部日志
- MCP 面板的 Server Log 页签中仍然可以查看所有日志
- 用户通过 `debug_print` 工具的输出**仍然显示在 Godot 输出面板**（这是用户期望的行为）
- 真正的错误（`push_error()`）仍然会显示在输出面板

### 风险
- stdio 模式下的 `print(json_string)` 保留，不影响协议通信
- 日志功能不受影响，只是显示位置改变
- 对现有单元测试无影响（测试不依赖输出面板内容）

---

## 实施顺序

1. 步骤 1：`mcp_server_core.gd` — 核心日志方法
2. 步骤 2：`mcp_server_native.gd` — 插件主类
3. 步骤 3：`mcp_http_server.gd` — HTTP 服务器
4. 步骤 4：`mcp_resource_manager.gd` — 资源管理器
5. 步骤 5：`resource_tools_native.gd` — 资源工具
6. 步骤 6：`path_validator.gd` — 路径验证器
7. 步骤 7：`mcp_types.gd` — MCPLogger 类
8. 步骤 8：`debug_tools_native.gd` — 调试工具
9. 步骤 9：`mcp_stdio_server.gd` — Stdio 服务器
10. 运行 GUT 单元测试验证
11. 运行 MCP 工具调用测试验证