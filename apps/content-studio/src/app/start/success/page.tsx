export default function StartSuccessPage() {
  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">Projekt byl odeslán!</h1>
        
        <p className="mt-4 text-lg text-white/80">
          Děkujeme za vaši objednávku.
        </p>

        <div className="glass-panel mt-8 p-6 text-left">
          <h2 className="font-semibold text-white">Co bude následovat?</h2>
          <ul className="mt-4 space-y-3 text-white/70">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-400">1.</span>
              <span>Náš tým začne pracovat na vašich 3 příspěvcích.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-400">2.</span>
              <span>Do 48 hodin dostanete e-mail s návrhy ke schválení.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-400">3.</span>
              <span>Po schválení vám dodáme finální verze k publikaci.</span>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-white/50">
          Potvrzení objednávky jsme odeslali na váš e-mail.
        </p>

        <a href="/" className="btn-lime-primary mt-8 inline-block text-zinc-900">
          Zpět na hlavní stránku
        </a>
      </div>
    </main>
  );
}
