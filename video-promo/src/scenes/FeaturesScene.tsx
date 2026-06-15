import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const features = [
    {
      title: "完整项目访问",
      desc: "AI 可以读取和修改脚本、场景、节点和资源",
      icon: "📂",
      color: "#6366f1",
    },
    {
      title: "原生实现",
      desc: "完全在 Godot 中运行，无需 Node.js 依赖",
      icon: "⚡",
      color: "#10b981",
    },
    {
      title: "实时编辑",
      desc: "直接在编辑器中应用 AI 建议，即时预览",
      icon: "🚀",
      color: "#f59e0b",
    },
    {
      title: "全面工具集",
      desc: "43+ 工具覆盖开发全流程",
      icon: "🛠️",
      color: "#ef4444",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "50px 80px",
      }}
    >
      {/* 标题 */}
      <div style={{ opacity: titleOpacity, marginBottom: 40, textAlign: "center" }}>
        <h2
          style={{
            fontSize: 56,
            color: "white",
            margin: "0 0 12px 0",
            fontWeight: 700,
          }}
        >
          核心功能
        </h2>
        <div
          style={{
            width: 100,
            height: 5,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            borderRadius: 3,
            margin: "0 auto",
          }}
        />
      </div>

      {/* 功能网格 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          opacity: contentOpacity,
          flex: 1,
          alignItems: "center",
        }}
      >
        {features.map((feature, i) => {
          // bounce 效果
          const itemScale = spring({
            frame: frame - (15 + i * 8),
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
                padding: 28,
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 20,
                borderLeft: `5px solid ${feature.color}`,
                transform: `scale(${Math.min(itemScale, 1)})`,
                opacity: interpolate(frame, [15 + i * 8, 30 + i * 8], [0, 1]),
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: 32,
                  color: feature.color,
                  margin: "0 0 10px 0",
                  fontWeight: 700,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 20,
                  color: "rgba(255, 255, 255, 0.7)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
