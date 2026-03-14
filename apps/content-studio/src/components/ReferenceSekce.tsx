'use client'

import { useState } from 'react'

const reference = [
  {
    id: 1,
    jmeno: 'Viktorie Tiw',
    kontext: 'Podnikatelka · osobní brand',
    kratky: 'Za jeden den jsme nafotily přes 1000 záběrů, z nichž minimálně polovina je naprosto špičkových. Disponovat kvalitním vizuálním materiálem mi umožnilo být na sociálních sítích aktivní a konzistentní.',
    plny: `Fotografování s Katarínou bylo naprosto skvělé – spousta zábavy a na konci jsem měla úžasné fotky, které naprosto odpovídaly mým představám. Už při přípravách na focení jsme se opravdu bavily a celý proces probíhal naprosto profesionálně. Měla jsem možnost soustředit se na pocity, které jsem chtěla přenést do fotek, a Katarína mě skvěle usměrnila.

Katarínu jsem si vybrala cíleně, měla jsem ji na svém wish listu už několik měsíců, a rozhodně toho nelituji. V postprodukci dokáže vytvořit skutečné zázraky, přitom fotky stále vypadají přirozeně, bez přehnaných efektů. Navíc během focení stihne natáčet videa, ze kterých následně vytváří Reels.

Za jeden den jsme nafotily přes 1000 záběrů, z nichž minimálně polovina je naprosto špičkových. Jakmile jsem obdržela první fotografie, začala jsem s nadšením sdílet nové příspěvky na sociálních sítích. Disponovat kvalitním vizuálním materiálem mi umožnilo být na sociálních sítích aktivní a konzistentní, což se stalo mým každodenním rituálem.

Fotografování s Katy mě opravdu baví. S obsahem si teď hraju a dál ho recykluji, ať už na reelsy, animace, nebo jako materiál pro články na blogu. Katarínu rozhodně doporučuji. Můj blog, sociální sítě i celý web nyní působí mnohem profesionálněji. Kvalitní fotografie přitahují pozornost nových klientů, což vedlo k rychlému nárůstu zájmu o mé služby.`,
  },
  {
    id: 2,
    jmeno: 'Tereza Zachová',
    kontext: 'Ochutnávkové focení · studio Lucifera',
    kratky: 'Katarina má úžasnou energii – živelná, tvůrčí bytost, která dokáže celý prostor oživit a zároveň z něj udělat bezpečné místo. Cítila jsem se uvolněná a přirozená.',
    plny: `Dostala jsem možnost zažít ochutnávkové focení ve studiu Lucifera a moc ráda jsem ji využila. Už komunikace s Katarinou před samotným focením byla velmi milá a lidská. Pamatuju si, že jsem jela pozdě a volala jí s obavou – její odpověď byla ale úplně v pohodě a bez stresu. Řekla něco ve smyslu: „To nějak zvládneme, hlavně přijeď v dobré náladě." A právě tohle vystihuje celý její přístup – uvolněný, chápavý a velmi přátelský.

Focení samotné probíhalo v atmosféře lehkosti a hravosti. Katarina má úžasnou energii – není to ten typ tichého, klidného fotografa, ale naopak živelná, tvůrčí bytost, která dokáže celý prostor oživit a zároveň z něj udělat bezpečné místo. Poskakovala po žebříku, nabízela různé úhly, nápady, hrála si se světlem i detaily.

Během focení mi citlivě pomáhala s pózami, vedla mě nenásilně a s respektem, takže jsem se cítila uvolněná a přirozená. Oceňuji i její kreativní přístup – třeba efekty jako větrák, které focení dodaly dynamiku a nový rozměr.

Celkově to pro mě byla moc příjemná a obohacující zkušenost. Katarinu bych doporučila všem, kdo chtějí zažít živé, hravé, ale zároveň profesionální focení s respektem k tomu, jak se právě cítíte.`,
  },
  {
    id: 3,
    jmeno: 'Tereza Kassasová',
    kontext: 'Brandové video · rebranding',
    kratky: 'Brandové video jsem využila ve svém podnikání nesčetněkrát a pomohlo mi vyškálovat efektivitu mé tvorby na sociální sítě i přivést do mých programů platící klienty.',
    plny: `Katarínu jsem oslovila, když jsem stála před dalším rebrandingem a chtěla jsem pro své podnikání získat profesionální videozáznamy, které by vystihovali moji značku, osobnost i přístup k mým klientům. Vždy mám od spoluprací vysoká očekávání, a spolupráce s Katarínou je rozhodně naplnila.

Ve svém oboru jsem profík, před kamerou se nestydím, ale nemám estetické cítění. Nevím, jak se nastavit, kam se hnout, jak se tvářit a bavilo mě, že Katarína vytvořila přesně takové prostředí, ve kterém jsem mohla být nejen profesionálem, ale mohla jsem se především uvolnit.

Dostala jsem skvělou podporu, atmosféru i úžasné profesionální záběry. Brandové video jsem využila ve svém podnikání nesčetněkrát a pomohlo mi vyškálovat efektivitu mé tvorby na sociální sítě i přivést do mých programů platící klienty.

Spolupráci s Katarínou doporučuji každé podnikatelce, která očekává profesionální péči, lidskost a kvalitní výstup. Pokud budu chtít svoje materiály znovu upgradovat, určitě se opět obrátím na Katarínu.`,
  },
  {
    id: 4,
    jmeno: 'Veronika Tesaříková',
    kontext: 'Portrétní focení · ateliér',
    kratky: 'Nešlo jen o focení, ale o příjemné setkání, které si budu pamatovat. Jejich klidná energie, empatie a sehranost – jeden pohled, nenápadná poznámka – a najednou všechno plyne.',
    plny: `Na focení jsem šla s obavami. Nejsem člověk, který by se rád fotografoval – a upřímně, jakmile se přede mnou objeví objektiv, většinou ztuhnu a veškerá přirozenost je ta tam.

Už delší dobu jsem ale sledovala tvorbu Kataríny a Luboše a právě ta uvolněnost a bezprostřednost lidí na jejich fotkách mě oslovovala. Bylo v tom něco opravdového a lidského – žádná křeč, ale přirozenost a lehkost.

Katarína a Luboš mě hned od začátku přivítali s milou samozřejmostí. Jejich přístup je nejen profesionální, ale hlavně lidský. Dokážou vytvořit atmosféru, ve které se člověk cítí dobře – i když si sám sebou před foťákem zrovna jistý není.

Oceňuji jejich klidnou energii, empatii, smysl pro detail i sehranost. Jeden pohled, nenápadná poznámka nebo úsměv mezi nimi – a najednou všechno plyne, ani nevíte jak. Nešlo jen o focení, ale o příjemné setkání, které si budu pamatovat. A navíc – povedlo se jim zachytit i ten malý moment uvolnění.

Určitě se vrátím.`,
  },
  {
    id: 5,
    jmeno: 'Gabina Zezulová',
    kontext: 'Focení + rebranding fotografií',
    kratky: 'Katy z vás zkrátka vytáhne to, co je pro fotografii potřeba a co třeba ani vy sami nevidíte. Nové oblečení, jiná dynamika, brandové barvy — sjednocený vzhled. Výsledek je absolutně super.',
    plny: `Katy je pro mě člověk dvou tváří. Na jedné straně na mě působí lehce chaoticky, myšlenky jí přeskakují a domluva se občas táhne. Pokud tuhle její tvář vnímáte podobně, nenechte se zmást. Má totiž i druhou — neuvěřitelně kreativní, tvůrčí, jemnou a laskavou.

Ta velmi dobře vynikne v průběhu focení, které jsem s ní zažila. Katy má cit pro kompozici i barvy a vytváří příjemnou atmosféru i pro nás, co se OPRAVDU neradi fotíme. A navíc, díky profi vizážistce si připadáte jako filmová hvězda.

Katy z vás zkrátka vytáhne to, co je pro fotografii potřeba a co třeba ani vy sami nevidíte. Katy i Luboše, který je nedílnou součástí její práce a mile vyvažujícím mužským elementem, mohu jen doporučit.

Rebranding fotografií: Vybrala jsem 5 fotografií, které chci používat, ale úplně mi barevně neladily. Výsledek je absolutně super. Nové oblečení, zajímavé detaily, jiná dynamika, brandové barvy a hlavně sjednocený vzhled.`,
  },
  {
    id: 6,
    jmeno: 'Lenka Roubalová',
    kontext: 'Portrétní focení · ateliér',
    kratky: 'Katka má dar uvolnit to stažení. Cítila jsem se „doma" a myslím, že vznikly fotky, z kterých budu dlouho čerpat. Lucifera je zážitek — fajn místo, fajn atmosféra, fajn lidi, profesionalita.',
    plny: `Když se fotím nebo natáčím sama, jsem v pohodě. Ale když mě fotí profík, tak to teda ani náhodou. Připadám si zatuhlá, dřevěná, nepřirozená.

Na focení s Katarínou a Lubošem v Lucifeře jsem se moc těšila. A byla jsem tak zvláštně v klidu. No stress, no kosmetika, no kadeřnice. A šlo to.

Katka má dar uvolnit to stažení a Luboše taky jakoby člověk znal dýl než jen pár minut. Cítila jsem se „doma" a myslím, že vznikly fotky, z kterých budu dlouho čerpat.

Mám z nich radost a těším se na další focení. Věřím, že vyjde ještě letos. Protože Lucifera je zážitek. Fajn místo, fajn atmosféra, fajn lidi, profesionalita. A větrák, co roztančí vlasy!`,
  },
]

function ReferenceKartička({ ref: r, index }: { ref: typeof reference[0]; index: number }) {
  const [rozbaleno, setRozbaleno] = useState(false)

  return (
    <div
      className="reference-karta"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="karta-akcent" />
      <div className="karta-obsah">
        <p className="kratky-text">„{r.kratky}"</p>

        {rozbaleno && (
          <div className="plny-text">
            {r.plny.split('\n\n').map((odstavec, i) => (
              <p key={i}>{odstavec}</p>
            ))}
          </div>
        )}

        <button
          className="toggle-btn"
          onClick={() => setRozbaleno(!rozbaleno)}
          aria-expanded={rozbaleno}
        >
          {rozbaleno ? 'Zavřít ↑' : 'Číst celou referenci ↓'}
        </button>
      </div>

      <div className="karta-autor">
        <div className="autor-iniciala">{r.jmeno.charAt(0)}</div>
        <div>
          <div className="autor-jmeno">{r.jmeno}</div>
          <div className="autor-kontext">{r.kontext}</div>
        </div>
      </div>
    </div>
  )
}

export default function ReferenceSekce() {
  return (
    <section className="reference-sekce">
      <div className="reference-container">
        <div className="reference-header">
          <span className="sekce-label">Reference klientů</span>
          <h2 className="sekce-nadpis">
            Co říkají ti,<br />
            <em>kteří to zažili.</em>
          </h2>
        </div>

        <div className="reference-grid">
          {reference.map((r, i) => (
            <ReferenceKartička key={r.id} ref={r} index={i} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .reference-sekce {
          padding: 6rem 1.5rem;
          background: #fafaf8;
        }

        .reference-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .reference-header {
          margin-bottom: 3.5rem;
        }

        .sekce-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 1rem;
        }

        .sekce-nadpis {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.15;
          color: #111;
          margin: 0;
        }

        .sekce-nadpis em {
          font-style: italic;
          color: #111;
        }

        .reference-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 700px) {
          .reference-grid {
            grid-template-columns: 1fr;
          }
        }

        .reference-karta {
          position: relative;
          background: #fff;
          border: 1px solid #e8e8e4;
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeSlideIn 0.5s ease forwards;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }

        .reference-karta:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }

        @keyframes fadeSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .karta-akcent {
          position: absolute;
          left: 0;
          top: 1.5rem;
          bottom: 1.5rem;
          width: 3px;
          background: #b7e94c;
          border-radius: 0 2px 2px 0;
        }

        .karta-obsah {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .kratky-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #333;
          margin: 0;
          font-style: italic;
        }

        .plny-text {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid #f0f0ec;
          padding-top: 1rem;
          animation: rozbalAnim 0.3s ease;
        }

        @keyframes rozbalAnim {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .plny-text p {
          font-size: 0.875rem;
          line-height: 1.75;
          color: #555;
          margin: 0;
        }

        .toggle-btn {
          align-self: flex-start;
          background: none;
          border: none;
          padding: 0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #111;
          cursor: pointer;
          letter-spacing: 0.02em;
          text-decoration: underline;
          text-decoration-color: #b7e94c;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }

        .toggle-btn:hover {
          color: #555;
        }

        .karta-autor {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid #f0f0ec;
          margin-top: auto;
        }

        .autor-iniciala {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #b7e94c;
          color: #111;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .autor-jmeno {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111;
        }

        .autor-kontext {
          font-size: 0.75rem;
          color: #999;
          margin-top: 1px;
        }
      `}</style>
    </section>
  )
}
