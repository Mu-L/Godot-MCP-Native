import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const ArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 架构层
  const layers = [
    {
      name: "AI Client (Claude等)",
      desc: "通过 MCP 协议与 Godot 通信",
      color: "#6366f1",
      y: 0,
    },
    {
      name: "Godot MCP Native 插件",
      desc: "原生实现，无需 Node.js",
      color: "#10b981",
      y: 0,
    },
    {
      name: "Godot Editor API",
      desc: "直接调用编辑器功能",
      color: "#f59e0b",
      y: 0,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #134e4a 0%, #042f2e 100%)",
        padding: "40px 80px",
      }}
    >
      {/* 标题 */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            color: "white",
            margin: "0 0 12px 0",
            fontWeight: 700,
          }}
        >
          架构设计
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
          }}
        >
          简洁高效的三层架构
        </p>
      </div>

      {/* 架构图 */}
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
        {layers.map((layer, i) => {
          const layerOpacity = interpolate(
            frame,
            [12 + i * 6, 20 + i * 6],
            [0, 1]
          );

          // bounce 效果
          const itemScale = spring({
            frame: frame - (12 + i * 6),
            fps: 30,
            config: {
              damping: 12,
              stiffness: 180,
            },
          });

          return (
            <div key={i}>
              {/* 层卡片 */}
              <div
                style={{
                  opacity: layerOpacity,
                  transform: `scale(${Math.min(itemScale, 1)})`,
                  padding: "20px 36px",
                  background: `${layer.color}10`,
                  border: `2px solid ${layer.color}40`,
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 28,
                    color: layer.color,
                    margin: "0 0 8px 0",
                    fontWeight: 700,
                  }}
                >
                  {layer.name}
                </h3>
                <p
                  style={{
                    fontSize: 18,
                    color: "rgba(255, 255, 255, 0.7)",
                    margin: 0,
                  }}
                >
                  {layer.desc}
                </p>
              </div>

              {/* 连接箭头 */}
              {i < layers.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 8,
                    opacity: interpolate(frame, [20 + i * 6, 28 + i * 6], [0, 1]),
                  }}
                >
                  <div style={{ fontSize: 32, color: `${layers[i + 1].color}80` }}>
                    ↓
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部特性 */}
      <div
        style={{
          opacity: interpolate(frame, [70, 85], [0, 1]),
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 20,
        }}
      >
        {[
          { label: "传输模式", value: "HTTP" },
          { label: "端口", value: "9080" },
          { label: "认证", value: "Token Bearer" },
          { label: "协议", value: "MCP 1.0" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: 6,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#2dd4bf",
                fontWeight: 700,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
