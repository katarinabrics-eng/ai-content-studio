export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">AI Content Studio</h1>
      <p className="mt-2 text-slate-600">
        Správa klientských vstupů pro tvorbu obsahu.
      </p>
      <a
        href="/intake"
        className="mt-4 inline-block rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
      >
        Přejít na Intake formulář
      </a>
    </div>
  );
}
