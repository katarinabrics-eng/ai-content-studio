export default function StartLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#F7F7F5", color: "#1A1A1A" }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          className="animate-spin"
          style={{
            width: 40,
            height: 40,
            margin: "0 auto 16px",
            borderRadius: "50%",
            border: "2px solid #EAEAE7",
            borderTopColor: "#B7E300",
          }}
        />
        <p style={{ fontSize: 15, color: "#6F6F6F" }}>Načítám…</p>
      </div>
    </div>
  );
}
