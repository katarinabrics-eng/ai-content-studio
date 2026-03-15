export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ec" }}>
      {children}
    </div>
  );
}
