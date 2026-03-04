/** Login stránka nemá mít admin sidebar – přepíše rodičovský layout. */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
