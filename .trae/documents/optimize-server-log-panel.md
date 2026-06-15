# Server Log 面板性能优化方案

## 问题分析

当前 `mcp_panel_native.gd` 的 Server Log 面板使用单个 `TextEdit` (`_log_text_edit`) 显示所有日志。当日志量过大时，`TextEdit` 的文本会变得非常长，导致：

1. **文本拼接性能差**：`_log_text_edit.text += message + "\n"` 每次追加都会重新处理整个文本（Godot 4.x 已知性能问题，见 [godot#64350](https://github.com/godotengine/godot/issues/64350)）
2. **渲染卡顿**：超长文本导致 TextEdit 渲染和布局计算变慢
3. **内存持续增长**：无上限的日志累积

> 注意：当前代码中 `_log_text_edit.text += message + "\n"` 已被注释掉（第844行），说明开发者已经意识到此问题但尚未解决。

## 方案对比

### 方案 A：环形缓冲区 + TextEdit（推荐）

**思路**：维护一个固定大小的日志行数组（环形缓冲区），当日志超过上限时删除最旧的行，然后整体刷新 TextEdit 文本。

**优点**：
- 实现简单，改动最小
- 内存有上限
- 保持 TextEdit 的可选中/复制功能

**缺点**：
- 超限时需要重建整个文本，有瞬间开销
- TextEdit 本身对长文本仍有渲染压力

**关键优化**：
- 使用 `insert_line_at()` 代替 `text +=`（避免重新处理整个文本）
- 设置最大行数（如 500 行），超限时批量删除旧行
- 使用定时器合并高频日志更新（debounce），避免每条日志都触发刷新

### 方案 B：ItemList 替代 TextEdit

**思路**：用 `ItemList` 替代 `TextEdit`，每条日志作为列表的一个 item。

**优点**：
- ItemList 天然支持虚拟化（只渲染可见行），性能极佳
- 每行独立管理，无需处理整体文本

**缺点**：
- ItemList 不支持文本选中/复制
- 不支持自动换行，长日志行会被截断
- 失去 TextEdit 的语法高亮能力
- 改动较大

### 方案 C：RichTextLabel + 环形缓冲区

**思路**：用 `RichTextLabel` 替代 `TextEdit`，配合环形缓冲区，支持按日志级别着色。

**优点**：
- 支持按级别着色（ERROR 红色、WARN 黄色等）
- `append_text()` 比 TextEdit 的 `text +=` 性能更好（增量追加）
- 可读性更好

**缺点**：
- RichTextLabel 不可编辑/选中复制（只读场景可接受）
- 长文本仍有渲染压力，仍需环形缓冲区限制

## 最终推荐方案：方案 A（环形缓冲区 + TextEdit + insert_line_at + debounce）

理由：
1. 改动最小，不改变 UI 组件类型
2. `insert_line_at()` 是 Godot 官方推荐的增量追加方式，避免 `text +=` 的全量重处理
3. 环形缓冲区限制日志行数，防止无限增长
4. debounce 机制合并高频日志，减少刷新次数
5. 保留 TextEdit 的选中/复制能力

## 实现步骤

### Step 1：添加日志缓冲区变量

在 `mcp_panel_native.gd` 顶部添加：

```gdscript
var _log_buffer: Array[String] = []
var _max_log_lines: int = 500
var _log_dirty: bool = false
var _log_debounce_timer: Timer = null
```

### Step 2：创建 debounce 定时器

在 `_create_log_tab()` 中创建定时器，用于合并高频日志更新：

```gdscript
_log_debounce_timer = Timer.new()
_log_debounce_timer.wait_time = 0.1
_log_debounce_timer.one_shot = true
_log_debounce_timer.timeout.connect(_flush_log_buffer)
add_child(_log_debounce_timer)
```

### Step 3：修改 `_append_log()` 方法

将直接操作 TextEdit 改为先写入缓冲区，再通过 debounce 刷新：

```gdscript
func _append_log(message: String) -> void:
    if not _log_text_edit:
        return
    _log_buffer.append(message)
    if _log_buffer.size() > _max_log_lines:
        _log_buffer = _log_buffer.slice(_log_buffer.size() - _max_log_lines)
    if not _log_debounce_timer.is_stopped():
        return
    _log_debounce_timer.start()
```

### Step 4：实现 `_flush_log_buffer()` 方法

使用 `insert_line_at()` 增量追加新日志行：

```gdscript
func _flush_log_buffer() -> void:
    if not _log_text_edit:
        return
    var current_lines: int = _log_text_edit.get_line_count()
    var start_index: int = maxi(0, _log_buffer.size() - _max_log_lines)
    for i in range(start_index, _log_buffer.size()):
        _log_text_edit.insert_line_at(_log_text_edit.get_line_count(), _log_buffer[i])
    while _log_text_edit.get_line_count() > _max_log_lines:
        _log_text_edit.remove_line(0)
    _log_text_edit.scroll_vertical = _log_text_edit.get_line_count()
```

### Step 5：修改 `clear_log()` 方法

清空缓冲区和 TextEdit：

```gdscript
func clear_log() -> void:
    _log_buffer.clear()
    if _log_text_edit:
        _log_text_edit.text = ""
```

### Step 6：取消注释并验证

取消第 844 行的注释，确保 `insert_line_at` 方案生效后不再使用 `text +=` 方式。

## 涉及文件

- `addons/godot_mcp/ui/mcp_panel_native.gd`（主要修改）
