"use client";

interface FolderFile {
  id: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
  subfolder?: string;
  modifiedTime?: string;
}

interface DocumentsListProps {
  folderStructure: FolderFile[];
}

function FileIcon({ mimeType }: { mimeType?: string }) {
  const isImage = mimeType?.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        background: "#f0fce0",
        border: "1px solid #d4f0a0",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isImage ? "🖼️" : isPdf ? "📄" : "📁"}
    </div>
  );
}

export function DocumentsList({ folderStructure }: DocumentsListProps) {
  const files = folderStructure.slice(0, 5);

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
          marginBottom: 14,
        }}
      >
        Dokumenty
      </div>
      {files.length === 0 ? (
        <div style={{ fontSize: 13, color: "#bbb", padding: "20px 0" }}>
          Zatím žádné dokumenty. Kurátor nahraje podklady brzy.
        </div>
      ) : (
        files.map((f, i) => (
          <div
            key={i}
            onClick={() => f.webViewLink && window.open(f.webViewLink, "_blank")}
            style={{
              background: "#f5f2ec",
              border: "1px solid #e8e4dc",
              borderRadius: 10,
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: f.webViewLink ? "pointer" : "default",
              marginBottom: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#f0ece4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#f5f2ec";
            }}
          >
            <FileIcon mimeType={f.mimeType} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#111",
                  marginBottom: 2,
                }}
              >
                {f.name}
              </div>
              <div style={{ fontSize: 10, color: "#aaa" }}>
                {f.subfolder ?? "Kořenová složka"}
                {f.modifiedTime
                  ? ` · ${new Date(f.modifiedTime).toLocaleDateString("cs-CZ")}`
                  : ""}
              </div>
            </div>
            {f.webViewLink && (
              <span style={{ fontSize: 14, color: "#b7e94c" }}>↗</span>
            )}
          </div>
        ))
      )}
      {folderStructure.length > 5 && (
        <button
          style={{
            fontSize: 12,
            color: "#b7e94c",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          Zobrazit všechny soubory ({folderStructure.length}) →
        </button>
      )}
    </div>
  );
}
