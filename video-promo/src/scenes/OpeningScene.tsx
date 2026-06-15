import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 标题 bounce 效果
  const titleScale = spring({
    frame: frame - 5,
    fps: 30,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  const subtitleOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 副标题 bounce 效果
  const subtitleScale = spring({
    frame: frame - 25,
    fps: 30,
    config: {
      damping: 14,
      stiffness: 180,
    },
  });

  const badgeScale = spring({
    frame: frame - 40,
    fps: 30,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "0 100px",
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
        }}
      />

      {/* 主标题 */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${Math.min(titleScale, 1)})`,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontSize: 90,
            fontWeight: 800,
            color: "white",
            margin: 0,
            textAlign: "center",
            textShadow: "0 0 40px rgba(99, 102, 241, 0.8)",
            letterSpacing: "-2px",
            lineHeight: 1.2,
          }}
        >
          Godot MCP
        </h1>
        <h1
          style={{
            fontSize: 90,
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 30px 0",
            textAlign: "center",
            letterSpacing: "-2px",
            lineHeight: 1.2,
          }}
        >
          Native
        </h1>
      </div>

      {/* 副标题 */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `scale(${Math.min(subtitleScale, 1)})`,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.9)",
            margin: 0,
            textAlign: "center",
            fontWeight: 300,
          }}
        >
          让 AI 直接理解和编辑你的 Godot 项目
        </p>
      </div>

      {/* 特性标签 */}
      <div
        style={{
          opacity: interpolate(frame, [40, 55], [0, 1]),
          display: "flex",
          gap: 16,
          transform: `scale(${Math.min(badgeScale, 1)})`,
        }}
      >
        {["原生实现", "43+ 工具", "实时编辑"].map((text, i) => (
          <div
            key={i}
            style={{
              padding: "10px 24px",
              background: "rgba(99, 102, 241, 0.2)",
              border: "2px solid rgba(99, 102, 241, 0.5)",
              borderRadius: 50,
              color: "#a5b4fc",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* 底部版本信息 */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [70, 85], [0, 1]),
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: 18,
        }}
      >
        v1.0.0 | MIT License | yurineko73
      </div>
    </AbsoluteFill>
  );
};
