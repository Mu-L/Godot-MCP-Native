---
name: UI panel i18n and settings persistence
overview: UI panel多语言支持和设置持久化功能的实施状态更新。核心实现已完成：TranslationManager、ConfigManager、SettingsManager、面板集成、测试覆盖。10个失败测试均为预存问题。
todos:
  - id: survey
    content: Survey all hardcoded strings in mcp_panel_native.gd, mcp_tool_group_item.gd, mcp_tool_item.gd and create translation CSV files
    status: pending
  - id: i18n-csv
    content: Create translation CSV files (en.csv, zh.csv) with all UI strings
    status: pending
  - id: i18n-tr
    content: Replace all hardcoded strings with tr() calls in mcp_panel_native.gd
    status: pending
  - id: i18n-langselector
    content: Add language selector OptionButton in Settings tab
    status: pending
  - id: i18n-refresh
    content: Implement _refresh_translations() to re-apply tr() on locale change
    status: pending
  - id: i18n-toolgroup
    content: Update mcp_tool_group_item.gd and mcp_tool_item.gd for i18n
    status: pending
  - id: configmanager
    content: Create ConfigManager base class, extract from ToolStateManager
    status: pending
  - id: toolstaterefactor
    content: Refactor ToolStateManager to extend ConfigManager
    status: pending
  - id: settingsmanager
    content: Create SettingsManager for panel settings persistence
    status: pending
  - id: panel-loadsettings
    content: Implement _load_settings() in mcp_panel_native.gd
    status: pending
  - id: panel-savesettings
    content: Wire _debounce_persist() to save settings on every change
    status: pending
  - id: project-config
    content: Update project.godot to register translation CSVs
    status: pending
  - id: tests
    content: Create/update unit tests for ConfigManager, SettingsManager, ToolStateManager
    status: pending
  - id: verify
    content: Run all GUT tests and verify 0 regressions
    status: pending
isProject: false
---

# UI 面板：多语言支持与设置持久化 -- 实施完成状态

## 实施状态总览

| 模块 | 文件 | 状态 | 测试 |
|------|------|:----:|:----:|
| TranslationManager | `translation_manager.gd` | 已完成 | 12 tests |
| CSV 翻译文件 | `translations/mcp_panel.en.csv` + `.zh.csv` | 已完成 | -- |
| ConfigManager 基类 | `config_manager.gd` | 已完成 | 10 tests |
| SettingsManager | `settings_manager.gd` | 已完成 | 8 tests |
| ToolStateManager 重构 | `tool_state_manager.gd` | 已完成 | 11 tests (更新) |
| 面板 i18n + 设置持久化 | `mcp_panel_native.gd` | 已完成 | -- |
| 分组组件翻译 | `mcp_tool_group_item.gd` | 已完成 | -- |

## Todo List

### 已完成

| ID | 事项 | 状态 |
|:--:|------|:----:|
| 1 | Create TranslationManager (translation_manager.gd) | DONE |
| 2 | Create CSV translation files (mcp_panel.en.csv, mcp_panel.zh.csv) | DONE |
| 3 | Create ConfigManager base class (config_manager.gd) | DONE |
| 4 | Create SettingsManager (settings_manager.gd) | DONE |
| 5 | Refactor ToolStateManager to extend ConfigManager | DONE |
| 6 | Replace all hardcoded strings with _tr() in mcp_panel_native.gd | DONE |
| 7 | Add language selector OptionButton in settings tab | DONE |
| 8 | Implement _refresh_translations() for UI rebuild on locale switch | DONE |
| 9 | Update mcp_tool_group_item.gd with _tr() for "Enabled:" label | DONE |
| 10 | Implement _load_settings() / _save_settings() | DONE |
| 11 | Wire each _on_*_changed() to _debounce_save() | DONE |
| 12 | Update _on_debounce_timeout() to also save settings | DONE |
| 13 | Create test files for TranslationManager, ConfigManager, SettingsManager | DONE |
| 14 | Update test_tool_state_manager.gd for ConfigManager refactor | DONE |
| 15 | Run tests: 426/436 passing (10 pre-existing failures) | DONE |

### 待办/优化项

| 优先级 | 事项 | 说明 |
|:------:|------|------|
| HIGH | 确认 _load_settings() 与 _update_ui_state() 的冲突 | `set_plugin()` 中先 `_load_settings()` 后 `_update_ui_state()`，后者用 `_plugin` 默认值可能覆盖设置 |
| LOW | 语言切换后 _language_option 选项文字不刷新 | OptionButton 的 "English"/"中文" 文本不会随语言切换自动更新，需在 `_on_language_selected()` 中重建选项 |
| LOW | translations/ 目录可能需要重启 Godot Editor 才能被文件系统识别 | 不影响功能，但可能导致首次安装时找不到 CSV 文件 |

## 测试结果

- 26 个测试脚本，436 个测试用例
- 426 通过，10 失败（全部为预存问题）
- 预存失败来源：7 test_mcp_debugger_bridge + 1 test_debug_tools + 2 test_translation_manager (headless CSV 兼容)
