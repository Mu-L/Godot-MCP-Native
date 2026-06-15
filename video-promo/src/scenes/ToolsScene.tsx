import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export const ToolsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const toolCategories = [
    {
      title: "节点工具 (16)",
      tools: ["创建节点", "删除节点", "更新属性", "复制节点", "移动节点", "重命名节点", "连接信号", "组管理"],
      color: "#6366f1",
    },
    {
      title: "脚本工具 (6)",
      tools: ["读取脚本", "修改脚本", "创建脚本", "分析脚本", "获取当前脚本"],
      color: "#10b981",
    },
    {
      title: "场景工具 (6)",
      tools: ["列出场景", "读取场景", "创建场景", "保存场景", "打开场景", "获取当前场景"],
      color: "#f59e0b",
    },
    {
      title: "编辑器工具 (5)",
      tools: ["获取编辑器状态", "运行项目", "停止项目", "获取选中节点", "设置编辑器"],
      color: "#ef4444",
    },
    {
      title: "调试工具 (5)",
      tools: ["获取编辑器日志", "执行脚本", "获取性能数据", "调试打印", "执行编辑器脚本"],
      color: "#8b5cf6",
    },
    {
      title: "项目工具 (5)",
      tools: ["获取项目信息", "获取项目设置", "列出资源", "创建资源", "获取项目结构"],
      color: "#ec4899",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
          43+ 专业工具集
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
          }}
        >
          覆盖 Godot 开发全流程的 MCP 工具
        </p>
      </div>

      {/* 工具分类网格 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          opacity: contentOpacity,
          overflow: "auto",
          flex: 1,
        }}
      >
        {toolCategories.map((cat, i) => {
          // bounce 效果
          const itemScale = spring({
            frame: frame - (15 + i * 5),
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
                padding: 20,
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 14,
                border: `1px solid ${cat.color}40`,
                opacity: interpolate(frame, [15 + i * 5, 25 + i * 5], [0, 1]),
                transform: `scale(${Math.min(itemScale, 1)})`,
              }}
            >
              <h4
                style={{
                  fontSize: 20,
                  color: cat.color,
                  margin: "0 0 12px 0",
                  fontWeight: 700,
                }}
              >
                {cat.title}
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {cat.tools.map((tool, j) => (
                  <span
                    key={j}
                    style={{
                      padding: "5px 12px",
                      background: `${cat.color}15`,
                      border: `1px solid ${cat.color}30`,
                      borderRadius: 16,
                      fontSize: 16,
                      color: "rgba(255, 255, 255, 0.9)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
