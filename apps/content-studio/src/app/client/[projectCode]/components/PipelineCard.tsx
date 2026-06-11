"use client";

interface PipelineCardProps {
  diagnostics?: Record<string, unknown> | null;
  driveConfig?: { folder_structure?: unknown[] } | null;
  selectedPhotos?: string[];
}

export function PipelineCard({
  diagnostics,
  driveConfig,
  selectedPhotos = [],
}: PipelineCardProps) {
  const folderCount = Array.isArray(driveConfig?.folder_structure)
    ? driveConfig.folder_structure.length
    : 0;

  const steps = [
    {
      label: "Brand Scan dokončen",
      done: diagnostics != null,
      active: false,
    },
    {
      label: "Podklady nahrány",
      done: folderCount >= 3,
      active: folderCount > 0 && folderCount < 3,
    },
    {
      label: "Výběr fotek",
      done: selectedPhotos.length > 0,
      active: diagnostics != null && selectedPhotos.length === 0,
    },
    { label: "Příspěvky v přípravě", done: false, active: false },
    { label: "Schválení a publikace", done: false, active: false },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e8e4dc",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#aaa",
          marginBottom: 18,
        }}
      >
        Průběh projektu
      </div>
      <div style={{ position: "relative", paddingLeft: 36 }}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={i} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>
              {/* Vertical line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: -25,
                    top: 22,
                    width: 2,
                    height: 20,
                    background: step.done
                      ? "#d4f0a0"
                      : step.active
                        ? "#fde8a0"
                        : "#e8e4dc",
                  }}
                />
              )}
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: -36,
                  top: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: step.done
                    ? "#f0fce0"
                    : step.active
                      ? "#fff8e8"
                      : "#f5f2ec",
                  border: `2px solid ${step.done ? "#b7e94c" : step.active ? "#f59e0b" : "#ddd"}`,
                }}
              >
                {step.done ? (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path
                      d="M2 5.5L4.5 8L9 3"
                      stroke="#5a8a00"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : step.active ? (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                ) : null}
              </div>
              {/* Label */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: step.done ? 500 : step.active ? 500 : 400,
                  color: step.done ? "#111" : step.active ? "#f59e0b" : "#aaa",
                  opacity: !step.done && !step.active ? 0.4 : 1,
                  paddingTop: 2,
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      {/* Progress */}
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            background: "#ede9e0",
            height: 7,
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#b7e94c",
              borderRadius: 4,
              width: `${(doneCount / 5) * 100}%`,
              transition: "width 1s ease-out",
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: "#3d6b00", fontWeight: 500 }}>
          {doneCount} / 5 kroků
        </div>
      </div>
    </div>
  );
}
