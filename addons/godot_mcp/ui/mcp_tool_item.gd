@tool
class_name MCPToolItem
extends HBoxContainer

var _tool_name: String = ""
var _tool_category: String = ""
var _tool_group: String = ""
var _description: String = ""
var _translation_manager = null

signal tool_toggled(tool_name: String, enabled: bool)

func setup(name: String, description: String, enabled: bool, category: String, group: String, translation_manager = null) -> void:
	_tool_name = name
	_tool_category = category
	_tool_group = group
	_description = description
	_translation_manager = translation_manager

	var check: CheckBox = CheckBox.new()
	check.text = name
	check.button_pressed = enabled
	check.toggled.connect(_on_check_toggled)
	add_child(check)

	var badge: Label = Label.new()
	badge.text = "[" + _get_badge_text() + "]"
	badge.add_theme_font_size_override("font_size", 10)
	if category == "supplementary":
		badge.add_theme_color_override("font_color", Color(0.7, 0.7, 0.3))
	else:
		badge.add_theme_color_override("font_color", Color(0.3, 0.7, 0.7))
	add_child(badge)

	var display_desc: String = _get_display_description(description, name)
	var desc_label: Label = Label.new()
	desc_label.text = display_desc
	desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	desc_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	desc_label.mouse_filter = Control.MOUSE_FILTER_PASS
	add_child(desc_label)

func get_tool_name() -> String:
	return _tool_name

func is_enabled() -> bool:
	var check: CheckBox = get_child(0) as CheckBox
	return check.button_pressed if check else true

func set_enabled(enabled: bool) -> void:
	var check: CheckBox = get_child(0) as CheckBox
	if check:
		check.button_pressed = enabled

func _on_check_toggled(button_pressed: bool) -> void:
	tool_toggled.emit(_tool_name, button_pressed)

func _get_badge_text() -> String:
	if _tool_category == "supplementary":
		if _translation_manager:
			var text: String = _translation_manager.get_text("ui.badge_supp")
			if text != "ui.badge_supp":
				return text
		return "SUPP"
	if _translation_manager:
		var text: String = _translation_manager.get_text("ui.badge_core")
		if text != "ui.badge_core":
			return text
	return "CORE"

func _get_display_description(description: String, tool_name: String) -> String:
	if _translation_manager:
		var key: String = "tool.desc." + tool_name
		var translated: String = _translation_manager.get_text(key)
		if translated != key:
			return translated
	return description
