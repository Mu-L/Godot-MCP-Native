import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

// 时间段定义（帧数 @ 30fps，总时长 72 秒 = 2160 帧）
// 0-150: 开场 (0-5s)
// 150-450: 新功能 #1 - 154 工具 (5-15s)
// 450-660: 新功能 #2 - 工具管理面板 (15-22s)
// 660-840: 新功能 #3 - 多语言 + Vibe Coding (22-28s)
// 840-1050: 新功能 #4 - 调试与运行时 (28-35s)
// 1050-1230: 新功能 #5 - PR 流程 + 多 AI (35-41s)
// 1230-1410: Bug 修复 (41-47s)
// 1410-1590: 优化 (47-53s)
// 1590-1770: 测试 (53-59s)
// 1770-1950: 兼容性 (59-65s)
// 1950-2160: 结尾 (65-72s)

interface UpdateV103SceneProps {
  frame: number;
}

export const UpdateV103Scene: React.FC<UpdateV103SceneProps> = ({ frame }) => {

  // 场景判断
  const isOpening = frame < 150;
  const isFeature1 = frame >= 150 && frame < 450;
  const isFeature2 = frame >= 450 && frame < 660;
  const isFeature3 = frame >= 660 && frame < 840;
  const isFeature4 = frame >= 840 && frame < 1050;
  const isFeature5 = frame >= 1050 && frame < 1230;
  const isBugFixes = frame >= 1230 && frame < 1410;
  const isOptimization = frame >= 1410 && frame < 1590;
  const isTesting = frame >= 1590 && frame < 1770;
  const isCompatibility = frame >= 1770 && frame < 1950;
  const isEnding = frame >= 1950;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* 开场 */}
      {isOpening && <OpeningSection frame={frame} />}

      {/* 新功能 #1 - 154 个 MCP 工具 */}
      {isFeature1 && <Feature1Section frame={frame - 150} />}

      {/* 新功能 #2 - 工具管理面板 */}
      {isFeature2 && <Feature2Section frame={frame - 450} />}

      {/* 新功能 #3 - 多语言 + Vibe Coding */}
      {isFeature3 && <Feature3Section frame={frame - 660} />}

      {/* 新功能 #4 - 调试与运行时控制 */}
      {isFeature4 && <Feature4Section frame={frame - 840} />}

      {/* 新功能 #5 - PR 流程 + 多 AI 客户端 */}
      {isFeature5 && <Feature5Section frame={frame - 1050} />}

      {/* Bug 修复 */}
      {isBugFixes && <BugFixesSection frame={frame - 1230} />}

      {/* 优化 */}
      {isOptimization && <OptimizationSection frame={frame - 1410} />}

      {/* 测试 */}
      {isTesting && <TestingSection frame={frame - 1590} />}

      {/* 兼容性 */}
      {isCompatibility && <CompatibilitySection frame={frame - 1770} />}

      {/* 结尾 */}
      {isEnding && <EndingSection frame={frame - 1950} />}
    </AbsoluteFill>
  );
};

// ==================== 开场部分 ====================
const OpeningSection: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 180 },
  });

  const versionOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${Math.min(titleScale, 1)})`,
        }}
      >
        <h1
          style={{
            fontSize: 64,
            color: "white",
            margin: 0,
            fontWeight: 800,
            textAlign: "center",
            textShadow: "0 0 30px rgba(99, 102, 241, 0.8)",
          }}
        >
          Godot MCP Native
        </h1>
      </div>

      <div
        style={{
          opacity: versionOpacity,
          transform: `scale(${Math.min(
            spring({
              frame: frame - 20,
              fps: 30,
              config: { damping: 12, stiffness: 180 },
            }),
            1
          )})`,
        }}
      >
        <h2
          style={{
            fontSize: 56,
            color: "#10b981",
            margin: 0,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          v1.03
        </h2>
      </div>

      <div style={{ opacity: interpolate(frame, [40, 70], [0, 1]) }}>
        <p
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.8)",
            margin: 0,
            textAlign: "center",
          }}
        >
          重要更新发布
        </p>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "8px 0 0 0",
            textAlign: "center",
          }}
        >
          Major Update Release
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==================== 新功能 #1 - 154 个 MCP 工具 ====================
const Feature1Section: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 工具数量动画：0 → 154
  const toolCount = Math.min(Math.floor(interpolate(frame, [20, 80], [0, 154])), 154);

  const categories = [
    { icon: "📦", name: "节点操作", en: "Node Ops", count: 25 },
    { icon: "📜", name: "脚本管理", en: "Script Mgmt", count: 22 },
    { icon: "🎬", name: "场景控制", en: "Scene Ctrl", count: 18 },
    { icon: "🐛", name: "调试工具", en: "Debugging", count: 20 },
    { icon: "⚙️", name: "编辑器", en: "Editor", count: 15 },
    { icon: "🎨", name: "视觉属性", en: "Visual", count: 30 },
    { icon: "🎮", name: "输入模拟", en: "Input Sim", count: 24 },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      {/* 标题 */}
      <div style={{ opacity: titleOpacity, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#10b981",
            margin: 0,
            fontWeight: 700,
          }}
        >
          ✨ 154 个 MCP 工具全量实现
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          154 MCP Tools Fully Implemented
        </p>
      </div>

      {/* 工具数量动画 */}
      <div
        style={{
          opacity: interpolate(frame, [10, 30], [0, 1]),
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#6366f1",
            textShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
          }}
        >
          {toolCount}
        </span>
        <p style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>
          个工具 / Tools
        </p>
      </div>

      {/* 分类展示 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          flex: 1,
        }}
      >
        {categories.map((cat, i) => {
          const itemOpacity = interpolate(
            frame,
            [40 + i * 8, 55 + i * 8],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 28 }}>{cat.icon}</span>
              <span
                style={{
                  fontSize: 14,
                  color: "white",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {cat.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.5)",
                  textAlign: "center",
                }}
              >
                {cat.en}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 新功能 #2 - 工具管理面板 ====================
const Feature2Section: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const items = [
    { label: "30 个核心工具", en: "30 Core Tools", sub: "默认启用 / Enabled by default", color: "#10b981" },
    { label: "124 个补充工具", en: "124 Supplemental", sub: "按需开启 / On-demand", color: "#f59e0b" },
    { label: "按分组动态启用", en: "Group-based Toggle", sub: "灵活配置 / Flexible config", color: "#6366f1" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#10b981",
            margin: 0,
            fontWeight: 700,
          }}
        >
          ⚙️ 工具管理面板
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Tool Management Panel
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {items.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [20 + i * 15, 35 + i * 15],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          const itemScale = spring({
            frame: frame - (20 + i * 15),
            fps: 30,
            config: { damping: 12, stiffness: 180 },
          });

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `scale(${Math.min(itemScale, 1)})`,
                background: `${item.color}15`,
                border: `2px solid ${item.color}`,
                borderRadius: 16,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 26,
                    color: "white",
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: item.color,
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                  }}
                >
                  {item.en}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255, 255, 255, 0.6)",
                    margin: "4px 0 0 0",
                  }}
                >
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 新功能 #3 - 多语言 + Vibe Coding ====================
const Feature3Section: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const items = [
    {
      icon: "🌐",
      title: "多语言支持",
      en: "Multi-language Support",
      desc: "中文 / English 切换，设置持久化",
      descEn: "CN/EN toggle, settings persisted",
      color: "#f59e0b",
    },
    {
      icon: "🎵",
      title: "Vibe Coding 模式",
      en: "Vibe Coding Mode",
      desc: "免打扰模式，默认启用",
      descEn: "Distraction-free mode, enabled by default",
      color: "#6366f1",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#f59e0b",
            margin: 0,
            fontWeight: 700,
          }}
        >
          🌐 多语言 + Vibe Coding
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Multi-language & Vibe Coding
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {items.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [20 + i * 20, 40 + i * 20],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          const itemScale = spring({
            frame: frame - (20 + i * 20),
            fps: 30,
            config: { damping: 12, stiffness: 180 },
          });

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `scale(${Math.min(itemScale, 1)})`,
                background: `${item.color}15`,
                border: `2px solid ${item.color}`,
                borderRadius: 16,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <span style={{ fontSize: 48 }}>{item.icon}</span>
              <div>
                <h3
                  style={{
                    fontSize: 26,
                    color: "white",
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: item.color,
                    margin: "2px 0 6px 0",
                    fontWeight: 500,
                  }}
                >
                  {item.en}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255, 255, 255, 0.7)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {item.desc}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.4)",
                    margin: "4px 0 0 0",
                    fontStyle: "italic",
                  }}
                >
                  {item.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 新功能 #4 - 调试与运行时控制 ====================
const Feature4Section: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const items = [
    {
      icon: "🐛",
      title: "Debugger Bridge",
      features: ["断点 / Breakpoints", "变量检查 / Variable inspection", "表达式求值 / Expression eval"],
      color: "#ef4444",
    },
    {
      icon: "🎬",
      title: "Animation Control",
      features: ["AnimationPlayer 控制", "AnimationTree 状态机", "运行时播放/停止"],
      color: "#10b981",
    },
    {
      icon: "🎨",
      title: "Runtime Properties",
      features: ["Material / Theme 读写", "Shader 参数调整", "TileMap 运行时编辑"],
      color: "#6366f1",
    },
    {
      icon: "🎮",
      title: "Input Simulation",
      features: ["键盘模拟 / Keyboard", "鼠标模拟 / Mouse", "Action 输入事件"],
      color: "#f59e0b",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 38,
            color: "#ef4444",
            margin: 0,
            fontWeight: 700,
          }}
        >
          🐛 调试与运行时控制
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Debugging & Runtime Control
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          flex: 1,
        }}
      >
        {items.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [20 + i * 10, 35 + i * 10],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                background: `${item.color}15`,
                border: `1px solid ${item.color}`,
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <h3
                  style={{
                    fontSize: 18,
                    color: "white",
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </h3>
              </div>
              {item.features.map((feat, j) => (
                <p
                  key={j}
                  style={{
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.7)",
                    margin: "4px 0 0 0",
                    lineHeight: 1.3,
                  }}
                >
                  • {feat}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 新功能 #5 - PR 流程 + 多 AI 客户端 ====================
const Feature5Section: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const prSteps = [
    { step: "1", title: "分支审查", en: "Branch Review" },
    { step: "2", title: "GUT 全量测试", en: "GUT Full Test" },
    { step: "3", title: "Squash Merge", en: "Squash Merge" },
  ];

  const aiClients = [
    { name: "Claude Code", logo: "🤖" },
    { name: "Cline", logo: "🔧" },
    { name: "OpenCode", logo: "💻" },
    { name: "Codex", logo: "📦" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 38,
            color: "#6366f1",
            margin: 0,
            fontWeight: 700,
          }}
        >
          🔀 PR 流程 + 多 AI 客户端
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          PR Workflow & Multi-AI Client
        </p>
      </div>

      {/* PR 流程 */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 20,
            color: "#10b981",
            margin: "0 0 8px 0",
            fontWeight: 600,
          }}
        >
          PR 审查与合并流程
        </h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {prSteps.map((step, i) => {
            const itemOpacity = interpolate(
              frame,
              [20 + i * 15, 35 + i * 15],
              [0, 1],
              { extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  flex: 1,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#10b981",
                    marginBottom: 4,
                  }}
                >
                  {step.step}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255, 255, 255, 0.5)",
                    marginTop: 2,
                  }}
                >
                  {step.en}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 多 AI 客户端 */}
      <div>
        <h3
          style={{
            fontSize: 20,
            color: "#f59e0b",
            margin: "0 0 8px 0",
            fontWeight: 600,
          }}
        >
          支持多 AI 客户端配置
        </h3>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {aiClients.map((client, i) => {
            const itemOpacity = interpolate(
              frame,
              [60 + i * 10, 75 + i * 10],
              [0, 1],
              { extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: 10,
                  padding: "10px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 24 }}>{client.logo}</span>
                <span
                  style={{
                    fontSize: 16,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {client.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==================== Bug 修复 ====================
const BugFixesSection: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bugs = [
    {
      text: "修复端口占用问题",
      en: "Fix port occupation issue",
      detail: "增加报错提示，避免静默失败",
    },
    {
      text: "修复 AnimationTree `float()` 错误",
      en: "Fix AnimationTree `float()` error",
      detail: "Godot 4.6+ 改用 `as float`",
    },
    {
      text: "修复 `match_fields` 过滤 bug",
      en: "Fix `match_fields` filtering bug",
      detail: "移除异步 `current_node` 字段",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#ef4444",
            margin: 0,
            fontWeight: 700,
          }}
        >
          🐛 Bug 修复
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Bug Fixes
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {bugs.map((bug, i) => {
          const itemOpacity = interpolate(
            frame,
            [15 + i * 12, 25 + i * 12],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                background: "rgba(239, 68, 68, 0.1)",
                borderLeft: "4px solid #ef4444",
                borderRadius: 8,
                padding: "12px 20px",
              }}
            >
              <p
                style={{
                  fontSize: 20,
                  color: "white",
                  margin: 0,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                ✅ {bug.text}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.5)",
                  margin: "4px 0 0 0",
                  fontStyle: "italic",
                }}
              >
                {bug.en}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.6)",
                  margin: "4px 0 0 0",
                }}
              >
                {bug.detail}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 优化 ====================
const OptimizationSection: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const items = [
    {
      icon: "⚡",
      title: "精简核心工具",
      en: "Streamlined Core Tools",
      desc: "40 → 30 个，减少初始化负担",
      detail: "非核心工具默认不启用",
    },
    {
      icon: "📊",
      title: "ServerLog 性能优化",
      en: "ServerLog Optimization",
      desc: "减少主线程阻塞",
      detail: "提升 UI 响应速度",
    },
    {
      icon: "📁",
      title: "测试报告归档",
      en: "Test Reports Archived",
      desc: "归档至 docs/debugging/",
      detail: "便于追踪和管理",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#f59e0b",
            margin: 0,
            fontWeight: 700,
          }}
        >
          ⚡ 优化
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Optimizations
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {items.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [15 + i * 15, 30 + i * 15],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          const itemScale = spring({
            frame: frame - (15 + i * 15),
            fps: 30,
            config: { damping: 12, stiffness: 180 },
          });

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `scale(${Math.min(itemScale, 1)})`,
                background: `${item.color || "#f59e0b"}15`,
                border: `2px solid ${item.color || "#f59e0b"}`,
                borderRadius: 14,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 40 }}>{item.icon}</span>
              <div>
                <h3
                  style={{
                    fontSize: 22,
                    color: "white",
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#f59e0b",
                    margin: "2px 0 4px 0",
                  }}
                >
                  {item.en}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255, 255, 255, 0.7)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {item.desc}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.5)",
                    margin: "4px 0 0 0",
                  }}
                >
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 测试 ====================
const TestingSection: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 测试通过率动画
  const passRate = Math.min(Math.floor(interpolate(frame, [20, 80], [0, 100])), 100);

  const items = [
    {
      icon: "✅",
      title: "154 工具全量验证",
      en: "154 Tools Full Validation",
      desc: "100% 通过 / 100% Pass",
    },
    {
      icon: "🧪",
      title: "GUT 单元测试扩展",
      en: "GUT Unit Tests Extended",
      desc: "test_mcp_runtime_probe.gd 等",
    },
    {
      icon: "📚",
      title: "测试知识库文档",
      en: "Test Knowledge Base",
      desc: "记录环境、参数、兼容性",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#6366f1",
            margin: 0,
            fontWeight: 700,
          }}
        >
          🧪 测试
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Testing
        </p>
      </div>

      {/* 通过率展示 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#10b981",
            textShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
          }}
        >
          {passRate}%
        </span>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.6)",
            margin: "4px 0 0 0",
          }}
        >
          测试通过率 / Pass Rate
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [30 + i * 12, 45 + i * 12],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                background: "rgba(99, 102, 241, 0.1)",
                borderLeft: "3px solid #6366f1",
                borderRadius: 8,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    color: "white",
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6366f1",
                    margin: "2px 0 2px 0",
                  }}
                >
                  {item.en}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255, 255, 255, 0.6)",
                    margin: 0,
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

// ==================== 兼容性 ====================
const CompatibilitySection: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const compatItems = [
    {
      icon: "✅",
      title: "Godot 4.6+",
      desc: "使用 `as float` 替代 `float()`",
      color: "#10b981",
    },
    {
      icon: "✅",
      title: "Godot 4.x",
      desc: "使用 `add_node()` 替代 `set_start_node()`",
      color: "#10b981",
    },
    {
      icon: "⚠️",
      title: "TileMap 工具",
      desc: "仅支持旧式 TileMap 节点，不支持 TileMapLayer",
      color: "#f59e0b",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "30px 60px",
      }}
    >
      <div style={{ opacity: titleOpacity, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 42,
            color: "#6366f1",
            margin: 0,
            fontWeight: 700,
          }}
        >
          ⚠️ 兼容性说明
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "4px 0 0 0",
          }}
        >
          Compatibility Notes
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {compatItems.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [15 + i * 12, 25 + i * 12],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                background: `${item.color}15`,
                borderLeft: `4px solid ${item.color}`,
                borderRadius: 8,
                padding: "14px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <h3
                  style={{
                    fontSize: 20,
                    color: "white",
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </h3>
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255, 255, 255, 0.7)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==================== 结尾部分 ====================
const EndingSection: React.FC<{ frame: number }> = ({ frame }) => {
  const contentOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const thankScale = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 12, stiffness: 180 },
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          opacity: contentOpacity,
          transform: `scale(${Math.min(thankScale, 1)})`,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 52,
            color: "#10b981",
            margin: "0 0 16px 0",
            fontWeight: 700,
          }}
        >
          Godot MCP Native
        </h2>
        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.8)",
            margin: "0 0 10px 0",
          }}
        >
          v1.03 更新发布
        </p>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "0 0 20px 0",
          }}
        >
          Update Released
        </p>
        <p
          style={{
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.8)",
            margin: 0,
          }}
        >
          感谢使用，欢迎反馈和贡献！
        </p>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
            margin: "8px 0 0 0",
            fontStyle: "italic",
          }}
        >
          Thank you! Feedback & contributions welcome!
        </p>
      </div>

      <div style={{ opacity: interpolate(frame, [30, 50], [0, 1]) }}>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: 0,
          }}
        >
          GitHub: github.com/yurineko73/godot-mcp-native
        </p>
      </div>
    </AbsoluteFill>
  );
};
