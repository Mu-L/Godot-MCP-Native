extends Node2D

func _ready() -> void:
	var btn: Button = $SwitchButton
	if btn:
		btn.pressed.connect(_on_switch_pressed)

func _on_switch_pressed() -> void:
	get_tree().change_scene_to_file("res://screenshots/runtime_test_sub_scene.tscn")
