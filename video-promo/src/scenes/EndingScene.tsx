import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const EndingScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame: frame - 5,
    fps: 30,
    config: { damping: 100, stiffness: 150 },
  });

  const badges = [
    { label: "Godot 4.x", color: "#478cbf" },
    { label: "MIT 许可证", color: "#10b981" },
    { label: "原生实现", color: "#6366f1" },
    { label: "43+ 工具", color: "#f59e0b" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #16213e 100%)",
        padding: "0 100px",
      }}
    >
      {/* 背景光效 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 60%)",
        }}
      />

      {/* Logo/标题 */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${Math.min(scale, 1)})`,
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            textShadow: "0 0 40px rgba(99, 102, 241, 0.5)",
            lineHeight: 1.2,
          }}
        >
          Godot MCP Native
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.8)",
            margin: "16px 0 0 0",
            fontWeight: 300,
          }}
        >
          让 AI 成为你的 Godot 开发助手
        </p>
      </div>

      {/* 特性标签 */}
      <div
        style={{
          opacity: interpolate(frame, [10, 20], [0, 1]),
          display: "flex",
          gap: 12,
          marginBottom: 40,
        }}
      >
        {badges.map((badge, i) => (
          <div
            key={i}
            style={{
              padding: "8px 20px",
              background: `${badge.color}15`,
              border: `1px solid ${badge.color}40`,
              borderRadius: 50,
              color: badge.color,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {badge.label}
          </div>
        ))}
      </div>

      {/* 安装指南 */}
      <div
        style={{
          opacity: interpolate(frame, [30, 45], [0, 1]),
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.9)",
            margin: "0 0 16px 0",
            fontWeight: 600,
          }}
        >
          📦 立即安装
        </p>
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {[
            "AssetLib 搜索安装",
            "手动复制到 addons/",
            "GitHub 克隆下载",
          ].map((method, i) => (
            <div
              key={i}
              style={{
                padding: "12px 24px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 12,
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 18,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {method}
            </div>
          ))}
        </div>
      </div>

      {/* 链接 */}
      <div
        style={{
          opacity: interpolate(frame, [60, 75], [0, 1]),
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.5)",
            margin: 0,
            fontFamily: "monospace",
          }}
        >
          github.com/yurineko73/godot-mcp-native
        </p>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.3)",
            margin: "8px 0 0 0",
          }}
        >
          yurineko73 © 2024 | MIT License
        </p>
      </div>
    </AbsoluteFill>
  );
};
