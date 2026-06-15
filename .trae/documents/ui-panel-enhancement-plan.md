# UI 面板增强计划 - 主屏幕插件改造

## 计划概述

将 MCP 面板从底部停靠面板（EditorDock + DOCK_SLOT_BOTTOM）升级为编辑器主屏幕插件（与 2D、3D、Script 同级），内部使用 TabContainer 分为 3 个页签：Settings、Server Log、Tool Manager。

---

## 当前状态分析

### 现有架构

1. **插件入口** (`mcp_server_native.gd`)
   - 继承 `EditorPlugin`，但未覆写 `_has_main_screen()`
   - 使用 `EditorDock` + `add_dock()` 创建底部面板
   - `_create_ui_panel()` (L744-771): 加载场景 → 实例化 → 创建 EditorDock → `add_dock()`
   - `_exit_tree()` (L191-208): `remove_dock()` 清理

2. **面板脚本** (`mcp_panel_native.gd`, 451行)
   - 继承 `PanelContainer`
   - `_create_ui()` 程序化构建所有 UI（单列 VBoxContainer）
   - 包含：标题、状态、传输设置、HTTP配置、启动/停止按钮、自动启动、日志级别、安全级别、速率限制、Server Log、Tool Management
   - 所有内容堆叠在一个垂直布局中，空间利用率低

3. **面板场景** (`mcp_panel_native.tscn`)
   - 极简：仅 PanelContainer + script 引用
   - `custom_minimum_size = Vector2(200, 100)`

### 问题

- 底部面板空间狭小（高度受限），不适合展示日志和工具列表
- 所有功能挤在一个面板中，信息密度过高
- 无法充分利用编辑器中央区域的大面积空间

---

## 目标架构

### 主屏幕插件

面板将出现在编辑器顶部选择栏中，与 2D、3D、Script、Game、AssetLib 同级：

```
[2D] [3D] [Script] [MCP] [Game] [AssetLib]
┌──────────────────────────────────────────┐
│  ┌─────────┬─────────────┬──────────────┐│
│  │Settings │ Server Log  │ Tool Manager ││
│  └─────────┴─────────────┴──────────────┘│
│                                          │
│  [当前选中页签的内容]                      │
│                                          │
└──────────────────────────────────────────┘
```

### 3 个页签内容

| 页签 | 内容 | 来源 |
|------|------|------|
| **Settings** | 传输模式、HTTP配置、认证、SSE/CORS、启动/停止按钮、自动启动、日志级别、安全级别、速率限制、连接信息 | 现有面板上半部分 |
| **Server Log** | 日志文本区域 + 清除按钮 | 现有 `_log_text_edit` + `clear_log_button` |
| **Tool Manager** | 工具列表（CheckBox + 描述）+ 刷新按钮 | 现有 `_tools_list_container` |

---

## 实现方案

### 核心 API

#### 1. 主屏幕插件 API（EditorPlugin 虚方法）

```gdscript
# 必须覆写，返回 true 声明为主屏幕插件
func _has_main_screen() -> bool:
    return true

# 当用户切换到/离开此主屏幕时调用
func _make_visible(visible: bool) -> void:
    _main_panel.visible = visible

# 主屏幕选择按钮上显示的名称
func _get_plugin_name() -> String:
    return "MCP"

# 主屏幕选择按钮上显示的图标
func _get_plugin_icon() -> Texture2D:
    return EditorInterface.get_editor_theme().get_icon("Network", "EditorIcons")
```

#### 2. 面板注册方式

```gdscript
# 旧方式（底部停靠）
var dock = EditorDock.new()
dock.add_child(panel)
add_dock(dock)

# 新方式（主屏幕）
EditorInterface.get_editor_main_screen().add_child(panel)
panel.hide()  # 初始隐藏，非常重要
```

#### 3. TabContainer 使用

```gdscript
var tab_container = TabContainer.new()
tab_container.set_tab_title(0, "Settings")
tab_container.set_tab_title(1, "Server Log")
tab_container.set_tab_title(2, "Tool Manager")

# 每个 Tab 页签是一个 Control 子节点
var settings_tab = VBoxContainer.new()
var log_tab = VBoxContainer.new()
var tools_tab = VBoxContainer.new()

tab_container.add_child(settings_tab)  # 自动创建 tab 0
tab_container.add_child(log_tab)       # 自动创建 tab 1
tab_container.add_child(tools_tab)     # 自动创建 tab 2
```

---

## 文件修改清单

### 1. `mcp_server_native.gd` — 插件主类改造

**修改内容**:

| 位置 | 修改 |
|------|------|
| 变量声明 (L90-92) | 删除 `_dock: EditorDock`，将 `_bottom_panel` 改名为 `_main_panel` |
| `_enter_tree()` (L101-189) | 将 `_create_ui_panel()` 调用改为 `_create_main_screen_panel()` |
| `_exit_tree()` (L191-208) | 删除 `remove_dock()` 逻辑，改为 `get_editor_main_screen().remove_child()` + `queue_free()` |
| 新增 `_has_main_screen()` | 返回 `true` |
| 新增 `_make_visible(visible)` | 控制 `_main_panel.visible` |
| 新增 `_get_plugin_name()` | 返回 `"MCP"` |
| 新增 `_get_plugin_icon()` | 返回合适的编辑器图标 |
| `_create_ui_panel()` → `_create_main_screen_panel()` | 改用 `get_editor_main_screen().add_child()` + `hide()` |
| 信号回调 (L777-814) | `_bottom_panel` → `_main_panel` |

### 2. `mcp_panel_native.gd` — 面板脚本重构

**修改内容**:

| 位置 | 修改 |
|------|------|
| 基类 | `PanelContainer` → `VBoxContainer`（主屏幕不需要 PanelContainer 的边框） |
| `_create_ui()` | 重构为：创建 TabContainer → 创建 3 个页签 → 分配现有 UI 元素到对应页签 |
| 新增 `_create_settings_tab()` | 从现有 `_create_ui()` 中提取设置相关 UI |
| 新增 `_create_log_tab()` | 从现有 `_create_ui()` 中提取日志相关 UI |
| 新增 `_create_tools_tab()` | 从现有 `_create_ui()` 中提取工具管理相关 UI |
| `_update_ui_state()` | 逻辑不变，仅调整变量引用 |
| 其他方法 | 逻辑不变，无需修改 |

**UI 布局重构细节**:

```
VBoxContainer (根节点)
├── HBoxContainer (顶部状态栏: 状态标签 + 连接信息 + 启动/停止按钮)
└── TabContainer (页签容器, size_flags_vertical = SIZE_EXPAND_FILL)
    ├── VBoxContainer "Settings"
    │   ├── 传输模式选择
    │   ├── HTTP 配置区域 (端口/认证/SSE/CORS)
    │   ├── 自动启动
    │   ├── 日志级别
    │   ├── 安全级别
    │   └── 速率限制
    ├── VBoxContainer "Server Log"
    │   ├── TextEdit (日志区域, size_flags_vertical = SIZE_EXPAND_FILL)
    │   └── Button "Clear Log"
    └── VBoxContainer "Tool Manager"
        ├── Button "Refresh Tools"
        └── ScrollContainer
            └── VBoxContainer (工具列表)
```

**关键改进**:
- 顶部状态栏始终可见（不随页签切换隐藏）
- Server Log 页签的 TextEdit 可以占据全部可用高度
- Tool Manager 页签使用 ScrollContainer 包裹，支持大量工具滚动
- Settings 页签可以水平布局某些配置项，充分利用宽度

### 3. `mcp_panel_native.tscn` — 场景文件更新

**修改内容**:
- 根节点类型从 `PanelContainer` 改为 `VBoxContainer`
- 删除 `custom_minimum_size`（主屏幕自动填满）
- 保持脚本引用不变

### 4. 无需修改的文件

- `plugin.cfg` — 无需修改（插件注册方式不变）
- 所有 `tools/*_tools_native.gd` — 无需修改
- `native_mcp/mcp_server_core.gd` — 无需修改

---

## 实施步骤

### Step 1: 修改 `mcp_server_native.gd`
1. 将 `_dock: EditorDock` 和 `_bottom_panel: Control` 替换为 `_main_panel: Control`
2. 添加 `_has_main_screen()`、`_make_visible()`、`_get_plugin_name()`、`_get_plugin_icon()` 方法
3. 重写 `_create_ui_panel()` → `_create_main_screen_panel()`，使用 `get_editor_main_screen().add_child()` + `hide()`
4. 修改 `_exit_tree()` 清理逻辑
5. 更新所有信号回调中的 `_bottom_panel` → `_main_panel`

### Step 2: 重构 `mcp_panel_native.gd`
1. 修改基类为 `VBoxContainer`
2. 重写 `_create_ui()`，创建 TabContainer 和 3 个页签
3. 提取 `_create_settings_tab()`、`_create_log_tab()`、`_create_tools_tab()`
4. 添加顶部状态栏（始终可见）
5. 确保 `_update_ui_state()`、`refresh()`、`update_log()` 等方法正常工作
6. 为 Server Log 和 Tool Manager 页签添加 `size_flags_vertical = SIZE_EXPAND_FILL`

### Step 3: 更新 `mcp_panel_native.tscn`
1. 根节点类型改为 `VBoxContainer`
2. 删除 `custom_minimum_size`
3. 验证脚本引用正确

### Step 4: 测试验证
1. 重启 Godot 编辑器
2. 确认 MCP 出现在主屏幕选择栏中
3. 测试 3 个页签切换
4. 测试 Settings 页签所有配置功能
5. 测试 Server Log 日志显示和清除
6. 测试 Tool Manager 工具列表和启用/禁用
7. 测试启动/停止服务器
8. 测试切换到其他主屏幕（2D/3D/Script）时面板正确隐藏

---

## 风险和注意事项

1. **主屏幕插件与底部面板不兼容**: 一个 EditorPlugin 不能同时是主屏幕插件和底部面板插件。切换后原有的 `add_dock()` 逻辑必须完全移除。

2. **初始隐藏**: 主屏幕面板创建后必须调用 `hide()` 或 `_make_visible(false)`，否则会默认显示并遮挡 2D/3D 视图。

3. **面板大小**: 主屏幕面板会自动填满编辑器中央区域，无需设置 `custom_minimum_size`。但 TabContainer 和其子页签需要正确设置 `size_flags` 才能充分利用空间。

4. **图标选择**: `_get_plugin_icon()` 必须返回有效的 `Texture2D`。推荐使用 `EditorInterface.get_editor_theme().get_icon("Network", "EditorIcons")` 或其他内置图标。

5. **向后兼容**: 如果用户习惯底部面板，可以考虑未来添加配置选项让用户选择面板位置，但本次实施先完成主屏幕方案。

6. **`_make_visible(false)` 时机**: 在 `_enter_tree()` 中创建面板后立即调用 `_make_visible(false)` 确保初始不显示。

---

## 预期效果

- MCP 面板与 2D、3D、Script 同级，一键切换
- 3 个页签清晰分离：配置、日志、工具管理
- 充分利用编辑器中央大区域空间
- 日志区域和工具列表有更多展示空间
- 状态栏始终可见，无需切换页签即可查看服务器状态
