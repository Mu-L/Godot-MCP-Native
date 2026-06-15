import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame: frame - 20,
    fps: 30,
    config: { damping: 100, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        padding: "50px 80px",
      }}
    >
      {/* 标题 */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: "center",
          marginBottom: 40,
          transform: `scale(${Math.min(scale, 1)})`,
        }}
      >
        <h2
          style={{
            fontSize: 64,
            color: "white",
            margin: "0 0 16px 0",
            fontWeight: 800,
          }}
        >
          🎯 Godot MCP Native
        </h2>
        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.9)",
            margin: 0,
            fontWeight: 300,
          }}
        >
          让 AI 直接理解和编辑你的 Godot 项目
        </p>
      </div>

      {/* 核心卖点 */}
      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          opacity: contentOpacity,
          flex: 1,
          alignItems: "center",
        }}
      >
        {[
          {
            title: "原生实现",
            desc: "完全在 Godot 中运行\n无需 Node.js 依赖",
            color: "#10b981",
            icon: "⚡",
          },
          {
            title: "43+ 工具",
            desc: "节点、脚本、场景\n编辑器全覆盖",
            color: "#3b82f6",
            icon: "🛠️",
          },
          {
            title: "实时编辑",
            desc: "AI 建议直接应用\n在编辑器中即时生效",
            color: "#8b5cf6",
            icon: "⚡",
          },
        ].map((item, i) => {
          // 每个卡片的 bounce 效果
          const itemScale = spring({
            frame: frame - (20 + i * 8),
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
                flex: 1,
                maxWidth: 400,
                padding: 32,
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 20,
                border: `2px solid ${item.color}40`,
                textAlign: "center",
                transform: `scale(${Math.min(itemScale, 1)})`,
                opacity: interpolate(frame, [20 + i * 8, 35 + i * 8], [0, 1]),
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 20 }}>{item.icon}</div>
              <h3
                style={{
                  fontSize: 32,
                  color: item.color,
                  margin: "0 0 12px 0",
                  fontWeight: 700,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 20,
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: 0,
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                }}
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* 底部标语 */}
      <div
        style={{
          opacity: interpolate(frame, [100, 115], [0, 1]),
          textAlign: "center",
          paddingTop: 30,
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          "AI 驱动的 Godot 开发新体验"
        </p>
      </div>
    </AbsoluteFill>
  );
};
