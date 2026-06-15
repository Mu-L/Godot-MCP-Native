# Tool Manager 工具描述多语言适配计划

**日期**: 2026-05-14
**状态**: 计划

---

## 1. 现状分析

### 数据流

```
*_tools_native.gd (硬编码英文 description)
  → server_core.register_tool(name, description, ...)
    → MCPTypes.MCPTool.description (原样存储)
      → get_registered_tools() (原样传出)
        → mcp_panel_native._refresh_tools_list()
          → MCPToolGroupItem.setup()
            → MCPToolItem.setup(description)
              → desc_label.text = description (直接显示英文)
```

**问题**：整条链路无翻译处理，154 个工具描述全部硬编码英文。

### 现有翻译基础设施

- `TranslationManager`：支持 `get_text(key)`、`set_locale()`、CSV 加载、回退机制
- `mcp_panel.csv`：35 个 UI 翻译 key（无工具描述 key）
- `MCPToolGroupItem`：持有 `_translation_manager` 引用，但未对 description 翻译
- `MCPToolItem`：**无** `_translation_manager` 引用

---

## 2. 方案选择

### 方案 A：UI 层翻译（推荐）

在 UI 显示层做翻译，MCP 协议层 description 保持英文（AI 客户端收到的仍是英文）。

**改动文件**：4 个
**改动量**：约 20 行代码 + 154 行翻译 CSV

### 方案 B：注册层翻译（不推荐）

在 `register_tool()` 中翻译 description，会影响 MCP 协议输出（AI 客户端收到翻译后的描述）。

**不推荐**：MCP 协议 description 应保持英文供 AI 理解。

---

## 3. 实现步骤（方案 A）

### Step 1：`mcp_tool_item.gd` — 接收 TranslationManager

```gdscript
# 新增成员变量
var _translation_manager = null

# setup() 增加参数
func setup(name: String, description: String, enabled: bool, category: String, group: String, translation_manager = null) -> void:
    _translation_manager = translation_manager
    # ...
    # 翻译描述
    var display_desc: String = description
    if _translation_manager:
        var translated: String = _translation_manager.get_text("tool.desc." + name)
        if translated != "tool.desc." + name:  # key 存在时返回翻译，不存在时返回 key
            display_desc = translated
    desc_label.text = display_desc
```

### Step 2：`mcp_tool_group_item.gd` — 传递 TranslationManager

```gdscript
# 第53行：传递 _translation_manager 给 MCPToolItem
tool_item.setup(tool_name, description, enabled, category, _group_name, _translation_manager)
```

### Step 3：`mcp_panel.csv` — 新增 154 个工具描述翻译 key

格式：
```
key,en,zh
tool.desc.create_node,Create a new node...,在 Godot 场景树中创建新节点。返回节点路径和类型。
tool.desc.delete_node,Delete a node...,删除场景树中的一个节点。
...
```

### Step 4：翻译文本生成

从 7 个 `*_tools_native.gd` 文件中提取所有 `register_tool()` 的 description 参数，生成翻译 key 和中文翻译。

---

## 4. 翻译 key 命名规范

| 规则 | 示例 |
|------|------|
| 前缀 `tool.desc.` | `tool.desc.create_node` |
| tool_name 使用原始注册名 | `tool.desc.get_editor_logs` |
| group 名翻译用 `tool.group.` | `tool.group.Node-Write` |

---

## 5. 回退机制

- `TranslationManager.get_text(key)` key 不存在时返回 key 本身
- UI 层检测：如果返回值等于 key，说明翻译不存在，回退到原始英文 description
- 效果：未翻译的工具仍显示英文描述，不会显示 key 字符串

---

## 6. 测试计划

| 测试项 | 验证点 |
|--------|--------|
| 切换语言为中文 | 工具描述显示中文 |
| 切换语言为英文 | 工具描述显示英文 |
| 未翻译的工具 | 回退显示英文描述 |
| MCP 协议 tools/list | description 仍为英文 |
| Tool Manager 面板刷新 | 描述随语言切换更新 |

---

## 7. 风险评估

| 风险 | 影响 | 缓解 |
|------|------|------|
| 翻译文本不准确 | 用户困惑 | 机器翻译 + 人工校验 |
| CSV 文件过大（154行） | 加载延迟 | 微量，可忽略 |
| 工具名变更导致 key 失效 | 显示 key 而非描述 | 回退机制兜底 |
