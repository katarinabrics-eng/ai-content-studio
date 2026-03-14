'use client'
import { useState } from 'react'
import Image from 'next/image'
const reference = [
  {
    id: 1,
    jmeno: 'Viktorie Tiw',
    kontext: 'Podnikatelka · osobní brand',
    iniciala: 'V',
    foto: null, // doplň: '/placeholders/reference/viktorie.jpg'
    kratky: 'Za jeden den jsme nafotily přes 1000 záběrů, z nichž minimálně polovina je naprosto špičkových. Disponovat kvalitním vizuálním materiálem mi umožnilo být na sociálních sítích aktivní a konzistentní.',
    plny: `Fotografování s Katarínou bylo naprosto skvělé – spousta zábavy a na konci jsem měla úžasné fotky, které naprosto odpovídaly mým představám. Měla jsem možnost soustředit se na pocity, které jsem chtěla přenést do fotek, a Katarína mě skvěle usměrnila.
Katarínu jsem si vybrala cíleně – měla jsem ji na svém wish listu už několik měsíců, a rozhodně toho nelituji. V postprodukci dokáže vytvořit skutečné zázraky, přitom fotky stále vypadají přirozeně, bez přehnaných efektů. Navíc během focení stihne natáčet videa, ze kterých následně vytváří Reels.
Fotografování s Katy mě opravdu baví. S obsahem si teď hraju a dál ho recykluji, ať už na reelsy, animace, nebo jako materiál pro články na blogu. Můj blog, sociální sítě i celý web nyní působí mnohem profesionálněji. Kvalitní fotografie přitahují pozornost nových klientů.`,
  },
  {
    id: 2,
    jmeno: 'Tereza Zachová',
    kontext: 'Ochutnávkové focení · studio Lucifera',
    iniciala: 'T',
    foto: null,
    kratky: 'Katarina má úžasnou energii — živelná, tvůrčí bytost, která dokáže celý prostor oživit a zároveň z něj udělat bezpečné místo. Cítila jsem se uvolněná a přirozená.',
    plny: `Dostala jsem možnost zažít ochutnávkové focení ve studiu Lucifera a moc ráda jsem ji využila. Už komunikace s Katarinou před samotným focením byla velmi milá a lidská. Jela jsem pozdě – její odpověď byla úplně v pohodě: „To nějak zvládneme, hlavně přijeď v dobré náladě." A právě tohle vystihuje celý její přístup.
Focení probíhalo v atmosféře lehkosti a hravosti. Poskakovala po žebříku, nabízela různé úhly, nápady, hrála si se světlem i detaily. Během focení mi citlivě pomáhala s pózami, vedla mě nenásilně a s respektem.
Celkově moc příjemná a obohacující zkušenost. Katarinu bych doporučila všem, kdo chtějí zažít živé, hravé, ale zároveň profesionální focení.`,
  },
  {
    id: 3,
    jmeno: 'Tereza Kassasová',
    kontext: 'Brandové video · rebranding',
    iniciala: 'T',
    foto: null,
    kratky: 'Brandové video jsem využila ve svém podnikání nesčetněkrát a pomohlo mi vyškálovat efektivitu tvorby na sociální sítě i přivést do mých programů platící klienty.',
    plny: `Katarínu jsem oslovila, když jsem stála před dalším rebrandingem a chtěla jsem profesionální videozáznamy, které by vystihovali moji značku, osobnost i přístup k mým klientům. Vždy mám od spoluprací vysoká očekávání — a spolupráce s Katarínou je rozhodně naplnila.
Ve svém oboru jsem profík, před kamerou se nestydím, ale nemám estetické cítění. Nevím, jak se nastavit, kam se hnout — a bavilo mě, že Katarína vytvořila prostředí, ve kterém jsem mohla být nejen profesionálem, ale mohla jsem se především uvolnit.
Spolupráci s Katarínou doporučuji každé podnikatelce, která očekává profesionální péči, lidskost a kvalitní výstup. Pokud budu chtít svoje materiály znovu upgradovat, určitě se opět obrátím.`,
  },
  {
    id: 4,
    jmeno: 'Veronika Tesaříková',
    kontext: 'Portrétní focení · ateliér',
    iniciala: 'V',
    foto: null,
    kratky: 'Nešlo jen o focení, ale o příjemné setkání, které si budu pamatovat. Jejich klidná energie, empatie a sehranost — jeden pohled, nenápadná poznámka — a najednou všechno plyne.',
    plny: `Na focení jsem šla s obavami. Nejsem člověk, který by se rád fotografoval – jakmile se přede mnou objeví objektiv, většinou ztuhnu.
Katarína a Luboš mě přivítali s milou samozřejmostí. Jejich přístup je nejen profesionální, ale hlavně lidský. Jeden pohled, nenápadná poznámka nebo úsměv mezi nimi – a najednou všechno plyne, ani nevíte jak.
Povedlo se jim zachytit i ten malý moment uvolnění. Nešlo jen o focení, ale o příjemné setkání. Určitě se vrátím.`,
  },
  {
    id: 5,
    jmeno: 'Gabina Zezulová',
    kontext: 'Focení + rebranding fotografií',
    iniciala: 'G',
    foto: null,
    kratky: 'Katy z vás zkrátka vytáhne to, co je pro fotografii potřeba a co třeba ani vy sami nevidíte. Nové oblečení, jiná dynamika, brandové barvy — sjednocený vzhled. Výsledek je absolutně super.',
    plny: `Katy má cit pro kompozici i barvy a vytváří příjemnou atmosféru i pro nás, co se OPRAVDU neradi fotíme. A navíc, díky profi vizážistce si připadáte jako filmová hvězda.
Rebranding fotografií: vybrala jsem 5 fotografií, které chci používat, ale úplně mi barevně neladily. Výsledek je absolutně super — nové oblečení, zajímavé detaily, jiná dynamika, brandové barvy a hlavně sjednocený vzhled.
Katy i Luboše, který je nedílnou součástí její práce, mohu jen doporučit.`,
  },
  {
    id: 6,
    jmeno: 'Lenka Roubalová',
    kontext: 'Portrétní focení · ateliér',
    iniciala: 'L',
    foto: null,
    kratky: 'Katka má dar uvolnit to stažení. Cítila jsem se „doma" a myslím, že vznikly fotky, z kterých budu dlouho čerpat. Lucifera je zážitek — fajn místo, fajn atmosféra, fajn lidi, profesionalita.',
    plny: `Když se fotím sama, jsem v pohodě. Ale když mě fotí profík — připadám si zatuhlá, dřevěná, nepřirozená.
Na focení s Katarínou a Lubošem v Lucifeře jsem se moc těšila. A byla jsem tak zvláštně v klidu. No stress, no kosmetika, no kadeřnice. A šlo to.
Katka má dar uvolnit to stažení a Luboše taky jakoby člověk znal dýl než jen pár minut. Cítila jsem se „doma". Protože Lucifera je zážitek. Fajn místo, fajn atmosféra, fajn lidi, profesionalita. A větrák, co roztančí vlasy!`,
  },
]
function Kartička({ r, index }: { r: typeof reference[0]; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <article
      className="ref-karta"
      style={{ '--delay': `${index * 80}ms` } as React.CSSProperties}
    >
      <span className="quote-dekor">&ldquo;</span>
      <p className="kratky">{r.kratky}</p>
      {open && (
        <div className="plny">
          {r.plny.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      <button className="toggle" onClick={() => setOpen(!open)}>
        {open ? 'Zavřít ↑' : 'Číst celou referenci ↓'}
      </button>
      <footer className="autor">
        <div className="avatar">
          {r.foto ? (
            <Image src={r.foto} alt={r.jmeno} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span>{r.iniciala}</span>
          )}
        </div>
        <div>
          <div className="autor-jmeno">{r.jmeno}</div>
          <div className="autor-kontext">{r.kontext}</div>
        </div>
      </footer>
      <style jsx>{`
        .ref-karta {
          position: relative;
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          padding: 28px 24px 20px;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.45s ease forwards var(--delay);
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .ref-karta:hover {
          border-color: #d4d4d0;
          box-shadow: 0 6px 24px rgba(0,0,0,0.06);
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .quote-dekor {
          position: absolute;
          top: 12px;
          right: 18px;
          font-size: 64px;
          line-height: 1;
          color: #b7e94c;
          font-family: Georgia, serif;
          user-select: none;
          pointer-events: none;
        }
        .kratky {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #1a1a1a;
          font-style: italic;
          margin: 0 0 1rem;
          padding-right: 2rem;
        }
        .plny {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid #f2f2ee;
          padding-top: 1rem;
          margin-bottom: 0.75rem;
          animation: rozbal 0.3s ease;
        }
        @keyframes rozbal {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .plny p {
          font-size: 0.875rem;
          line-height: 1.75;
          color: #555;
          margin: 0;
        }
        .toggle {
          align-self: flex-start;
          background: none;
          border: none;
          padding: 0;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #333;
          cursor: pointer;
          text-decoration: underline;
          text-decoration-color: #b7e94c;
          text-underline-offset: 3px;
          margin-bottom: 1.25rem;
          transition: color 0.15s;
        }
        .toggle:hover { color: #888; }
        .autor {
          display: flex;
          align-items: center;
          gap: 12px;
          border-top: 1px solid #f2f2ee;
          padding-top: 1rem;
          margin-top: auto;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #b7e94c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a1a1a;
          flex-shrink: 0;
          overflow: hidden;
        }
        .autor-jmeno {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111;
        }
        .autor-kontext {
          font-size: 0.75rem;
          color: #999;
          margin-top: 2px;
        }
      `}</style>
    </article>
  )
}
export default function ReferenceSekce() {
  return (
    <section className="sekce">
      <div className="wrapper">
        <span className="label">Reference klientů</span>
        <h2 className="nadpis">
          Co říkají ti,<br />
          <em>kteří to zažili.</em>
        </h2>
        <div className="grid">
          {reference.map((r, i) => (
            <Kartička key={r.id} r={r} index={i} />
          ))}
        </div>
      </div>
      <style jsx>{`
        .sekce {
          padding: 5rem 1.5rem 6rem;
          background: #fafaf8;
        }
        .wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }
        .label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 1rem;
        }
        .nadpis {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          line-height: 1.15;
          color: #111;
          margin: 0 0 3rem;
        }
        .nadpis em {
          font-style: italic;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 900px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 580px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
