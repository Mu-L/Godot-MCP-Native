import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const ExamplesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const examples = [
    {
      prompt: "@mcp godot-mcp read godot://script/current\n我需要帮助优化我的玩家移动代码。",
      response: "AI 分析当前脚本并提供优化建议...",
      icon: "🤖",
    },
    {
      prompt: "@mcp godot-mcp get-scene-tree\n在场景中间添加一个立方体，并创建一个相机看向它。",
      response: "AI 自动创建节点并配置相机...",
      icon: "🎮",
    },
    {
      prompt: "创建一个主菜单，包含开始、选项和退出按钮",
      response: "AI 生成完整的 UI 场景和脚本...",
      icon: "🎨",
    },
    {
      prompt: "实现一个带有动态光照的昼夜循环系统",
      response: "AI 创建完整的昼夜循环系统...",
      icon: "🌓",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
        padding: "40px 80px",
      }}
    >
      {/* 标题 */}
      <div style={{ opacity: titleOpacity, marginBottom: 30 }}>
        <h2
          style={{
            fontSize: 48,
            color: "white",
            margin: "0 0 12px 0",
            fontWeight: 700,
          }}
        >
          示例提示
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
          }}
        >
          连接后，用自然语言与 Godot 项目交互
        </p>
      </div>

      {/* 示例列表 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          opacity: contentOpacity,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {examples.map((example, i) => {
          const itemOpacity = interpolate(
            frame,
            [15 + i * 10, 25 + i * 10],
            [0, 1]
          );

          // bounce 效果
          const itemScale = spring({
            frame: frame - (15 + i * 10),
            fps: 30,
            config: {
              damping: 12,
              stiffness: 180,
            },
          });

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `scale(${Math.min(itemScale, 1)})`,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* 图标 */}
              <div
                style={{
                  fontSize: 36,
                  flexShrink: 0,
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(56, 189, 248, 0.1)",
                  borderRadius: 12,
                }}
              >
                {example.icon}
              </div>

              {/* 内容 */}
              <div style={{ flex: 1 }}>
                {/* 提示框 */}
                <div
                  style={{
                    padding: "14px 20px",
                    background: "rgba(56, 189, 248, 0.08)",
                    borderRadius: 12,
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    marginBottom: 8,
                    fontFamily: "monospace",
                    fontSize: 16,
                    color: "#7dd3fc",
                    whiteSpace: "pre-line",
                    lineHeight: 1.5,
                  }}
                >
                  {example.prompt}
                </div>

                {/* 响应框 */}
                <div
                  style={{
                    padding: "12px 20px",
                    background: "rgba(34, 197, 94, 0.08)",
                    borderRadius: 12,
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    fontSize: 16,
                    color: "#86efac",
                  }}
                >
                  → {example.response}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
