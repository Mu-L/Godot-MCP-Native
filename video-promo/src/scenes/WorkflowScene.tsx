import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const steps = [
    {
      step: "1",
      title: "安装插件",
      desc: "从 AssetLib 安装或手动复制到 addons/ 目录",
      color: "#6366f1",
    },
    {
      step: "2",
      title: "启用插件",
      desc: "在项目设置 > 插件中启用 Godot MCP Native",
      color: "#10b981",
    },
    {
      step: "3",
      title: "配置连接",
      desc: "选择 HTTP 模式，配置端口和身份验证",
      color: "#f59e0b",
    },
    {
      step: "4",
      title: "连接 Claude",
      desc: "在 Claude Desktop 配置文件中添加 MCP 服务器",
      color: "#ef4444",
    },
    {
      step: "5",
      title: "开始使用",
      desc: "用自然语言与 Godot 项目交互，AI 直接理解和编辑",
      color: "#8b5cf6",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
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
          快速开始
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
          }}
        >
          5 步完成配置，即刻体验 AI 辅助开发
        </p>
      </div>

      {/* 步骤列表 */}
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
        {steps.map((item, i) => {
          const stepOpacity = interpolate(
            frame,
            [15 + i * 8, 25 + i * 8],
            [0, 1]
          );

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
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: stepOpacity,
                transform: `scale(${Math.min(itemScale, 1)})`,
              }}
            >
              {/* 步骤编号 */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `${item.color}20`,
                  border: `3px solid ${item.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: item.color,
                  }}
                >
                  {item.step}
                </span>
              </div>

              {/* 内容 */}
              <div
                style={{
                  flex: 1,
                  padding: "16px 24px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 14,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <h4
                  style={{
                    fontSize: 24,
                    color: "white",
                    margin: "0 0 6px 0",
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: 18,
                    color: "rgba(255, 255, 255, 0.6)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
