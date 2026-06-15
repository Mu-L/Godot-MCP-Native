import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const problems = [
    {
      icon: "🤔",
      title: "AI 无法理解 Godot 项目",
      desc: "Claude 等 AI 助手无法直接访问你的场景和脚本",
    },
    {
      icon: "🔄",
      title: "手动复制粘贴低效",
      desc: "需要手动将代码粘贴给 AI，再手动应用建议",
    },
    {
      icon: "⚠️",
      title: "上下文丢失",
      desc: "AI 无法看到完整的项目结构，建议往往不准确",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%)",
        padding: "60px 80px",
      }}
    >
      {/* 标题区域 */}
      <div style={{ opacity: titleOpacity, marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 56,
            color: "white",
            margin: "0 0 16px 0",
            fontWeight: 700,
          }}
        >
          开发者的痛点
        </h2>
        <div
          style={{
            width: 100,
            height: 5,
            background: "linear-gradient(90deg, #ef4444, #f97316)",
            borderRadius: 3,
          }}
        />
      </div>

      {/* 问题列表 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: contentOpacity,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {problems.map((problem, i) => {
          const itemOpacity = interpolate(
            frame,
            [15 + i * 10, 30 + i * 10],
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
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: itemOpacity,
                transform: `scale(${Math.min(itemScale, 1)})`,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  width: 90,
                  height: 90,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: 20,
                  flexShrink: 0,
                }}
              >
                {problem.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: 36,
                    color: "#fca5a5",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
                  {problem.title}
                </h3>
                <p
                  style={{
                    fontSize: 24,
                    color: "rgba(255, 255, 255, 0.7)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {problem.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
