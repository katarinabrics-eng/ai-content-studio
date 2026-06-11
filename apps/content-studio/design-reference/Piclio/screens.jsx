/* ============================================================
   Media Library + Approval + Plans + Landing screens
   ============================================================ */

const { useState: useStateS, useEffect: useEffectS } = React;

/* -------- LIBRARY ----------------------------------------------------- */
// Color dots (K-klasifikace) + styl piluje
const COLOR_DOTS = [
  { id: "",    swatch: "linear-gradient(135deg,#4A6FA5,#E8B4B8,#4A9B8E,#2C2C2C)", label: "Vše" },
  { id: "k02", swatch: "#4A6FA5",  label: "K02 · Cool Business" },
  { id: "k03", swatch: "#D8D4CC",  label: "K03 · Clean Minimal" },
  { id: "k04", swatch: "#E8B4B8",  label: "K04 · Soft Feminine" },
  { id: "k05", swatch: "#2C2C2C",  label: "K05 · Edgy" },
  { id: "k06", swatch: "#8B7355",  label: "K06 · Raw" },
  { id: "k09", swatch: "#4A9B8E",  label: "K09 · Teal" },
  { id: "custom", swatch: "linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff)", label: "Vlastní barva" },
];
const STYLE_PILLS = ["Všechny styly", "Soft Feminine", "Editorial", "Lifestyle", "Minimal"];
const HOOKS = [
  "Každé ráno si říkám…",
  "Takhle vypadá můj svět.",
  "Tohle nikdo nevidí.",
  "Jedna věc která změnila vše.",
  "Tři věci co změnily vše.",
  "Stála jsem a jen… byla.",
  "Volnost má svůj rytmus.",
  "Detail který říká vše.",
  "Tohle mi trvalo roky pochopit.",
  "Ticho. A pak všechno.",
  "Každý snímek říká víc.",
  "Pohyb. Světlo. Záměr.",
];

function MediaLibrary({ plan, credits, onUseCredits, showToast }) {
  const [tab, setTab] = useStateS("inspirace");
  const [activeColor, setActiveColor] = useStateS("");
  const [activeStyle, setActiveStyle] = useStateS("Všechny styly");
  const [liked, setLiked] = useStateS(new Set(["l2", "l5"]));
  const [composer, setComposer] = useStateS(null);
  const allImgs = window.LUCIFERA.LIBRARY_IMAGES;
  const moje = allImgs.slice(3, 10).map((i, idx) => ({
    ...i, id: "me-" + idx,
    label: idx === 0 ? "Hero web" : idx === 1 ? "O mně" : idx === 2 ? "Služby" : "Web archiv",
  }));
  const baseList = tab === "moje" ? moje
    : tab === "oblibene" ? allImgs.filter(i => liked.has(i.id))
    : allImgs;
  const imgs = baseList.map((img, i) => ({ ...img, hook: HOOKS[i % HOOKS.length] }));

  const toggleLike = (id) => {
    const next = new Set(liked);
    if (next.has(id)) next.delete(id); else {
      next.add(id);
      showToast("Uloženo do tvého stylu ❤");
    }
    setLiked(next);
  };

  const activeColorLabel = COLOR_DOTS.find(c => c.id === activeColor)?.label || "Vše";

  return (
    <div className="page ml-page">
      {/* ── Top header strip ── */}
      <div className="ml-header">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)" }}>Vizuální knihovna</h1>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            Studio Lucifera · studiolucifera.cz
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>487</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Celkem</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>412</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Fotky</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>75</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Videa</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ml-tabs">
        {[
          { id: "inspirace", label: "Inspirace" },
          { id: "moje", label: "Moje fotky" },
          { id: "oblibene", label: `Oblíbené ${liked.size > 0 ? `(${liked.size})` : ""}` },
        ].map((t) => (
          <button key={t.id}
            className={`ml-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── Filters row ── */}
      {tab !== "oblibene" && (
        <div className="ml-filters">
          <span className="ml-filter-label">Styl</span>
          {COLOR_DOTS.map(dot => (
            <div key={dot.id || "all"}
              onClick={() => setActiveColor(dot.id)}
              title={dot.label}
              className={`ml-dot ${activeColor === dot.id ? "active" : ""}`}
              style={{ background: dot.swatch }} />
          ))}
          <div className="ml-sep" />
          {STYLE_PILLS.map(p => (
            <button key={p}
              onClick={() => setActiveStyle(p)}
              className={`ml-pill ${activeStyle === p ? "active" : ""}`}>{p}</button>
          ))}
        </div>
      )}

      {/* ── Gallery wrap ── */}
      <div className="ml-gallery-wrap">
        {/* CTA banner */}
        {tab !== "oblibene" && (
          <div className="ml-cta">
            <p>
              <b>Použij vizuál → vytvoř příspěvek.</b>{" "}
              Klikni na fotku a za 200 kreditů ti připravím hook, caption a hashtagy.
            </p>
            <button className="btn btn-ink" style={{ fontSize: 12, padding: "9px 16px", whiteSpace: "nowrap" }}>
              Jak to funguje →
            </button>
          </div>
        )}

        {/* Count */}
        {tab !== "oblibene" && (
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14 }}>
            {imgs.length} fotek · {activeStyle === "Všechny styly" ? activeColorLabel : activeStyle}
          </div>
        )}

        {/* Grid */}
        {tab === "oblibene" && liked.size === 0 ? (
          <EmptyLikes onExplore={() => setTab("inspirace")} />
        ) : (
          <div className="ml-masonry">
            {imgs.map((img, i) => (
              <LibraryTile key={img.id} img={img}
                liked={liked.has(img.id)}
                featured={i === 2 || i === 7}
                onLike={() => toggleLike(img.id)}
                onUse={() => setComposer(img)} />
            ))}
          </div>
        )}
      </div>

      {composer && (
        <ComposerModal img={composer} plan={plan}
          onClose={() => setComposer(null)}
          onConfirm={() => {
            onUseCredits(200);
            setComposer(null);
            showToast("Tvořím příspěvek… bude hotový za moment.");
          }} />
      )}
    </div>
  );
}

function LibraryTile({ img, liked, featured, onLike, onUse }) {
  return (
    <div className="ml-tile" onClick={onUse}>
      <img src={img.src} alt={img.label}
        style={{ width: "100%", height: "auto", display: "block",
          aspectRatio: featured ? "4/5" : "3/4", objectFit: "cover",
          borderRadius: 8 }} />

      {/* Label */}
      <div className="ml-tile-label">{img.label}</div>

      {/* Heart */}
      <button onClick={(e) => { e.stopPropagation(); onLike(); }}
        className="ml-heart"
        style={{ color: liked ? "#e05a5a" : "#111",
                 opacity: liked ? 1 : undefined }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>
        </svg>
      </button>

      {/* Hover overlay with hook */}
      <div className="ml-hover">
        <button onClick={(e) => { e.stopPropagation(); onUse(); }}
          className="ml-use-btn">
          Vytvořit příspěvek
        </button>
        {img.hook && <div className="ml-hook">„{img.hook}"</div>}
      </div>
    </div>
  );
}

function EmptyLikes({ onExplore }) {
  return (
    <div style={{
      padding: 60, textAlign: "center",
      background: "var(--bg-elev)", border: "1px dashed var(--line)", borderRadius: 16,
    }}>
      <div style={{ fontSize: 36, opacity: .3, marginBottom: 16 }}>♡</div>
      <h3 style={{ fontSize: 20, marginBottom: 6 }}>Zatím žádné oblíbené</h3>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>
        Každé lajknutí trénuje tvůj styl. Čím víc, tím přesněji Lucifera tvoří.
      </div>
      <button className="btn btn-ghost" onClick={onExplore}>Procházet inspiraci →</button>
    </div>
  );
}

function ComposerModal({ img, plan, onClose, onConfirm }) {
  const isFree = plan === "free";
  const [phase, setPhase] = useStateS("preview");
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "22px 24px 0", display: "flex",
          justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">Nový příspěvek</div>
            <h3 style={{ fontSize: 22, marginTop: 4 }}>Tvořím pro tebe</h3>
          </div>
          <button onClick={onClose} style={{ padding: 6 }}>
            <Icon name="close" size={18}/>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 18,
          padding: 24 }}>
          <img src={img.src}
            style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover",
              borderRadius: 10, border: "1px solid var(--line)" }} />
          <div>
            <div className="eyebrow">Hook</div>
            <div style={{ fontSize: 15, fontFamily: "var(--font-display)",
              marginTop: 6, marginBottom: 14, lineHeight: 1.3 }}>
              „Autenticita, která se fotí — a pamatuje.“
            </div>
            <div className="eyebrow">Caption</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6,
              marginBottom: 14, lineHeight: 1.55 }}>
              Portrét není selfie. Je to vzkaz, že si to o sobě dovolíš říct nahlas.
              Každý kdo dělá vlastní práci, má co říct. Ty taky.
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["#StudioLucifera", "#brand", "#portrét", "#autenticita"].map(h => (
                <span key={h} className="chip" style={{ fontSize: 10 }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{
          padding: "16px 24px", background: "var(--bg-soft)",
          borderTop: "1px solid var(--line)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            Použiješ <b style={{ color: "var(--ink)" }}>200 kreditů</b>
            {isFree && <span style={{ marginLeft: 8, color: "var(--warn)" }}>
              · Free trial — 2 ze 3 zbývá
            </span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Zrušit</button>
            <button className="btn btn-primary" onClick={onConfirm}>
              <Icon name="spark" size={13}/> Vytvořit teď
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- APPROVAL ---------------------------------------------------- */
function Approval({ plan, onApprove, pending, onEditHook }) {
  const posts = window.LUCIFERA.POSTS_SEED;
  const [selected, setSelected] = useStateS(posts[0].id);
  const [statuses, setStatuses] = useStateS(
    Object.fromEntries(posts.map(p => [p.id, "pending"]))
  );
  const [editing, setEditing] = useStateS(false);
  const [drafts, setDrafts] = useStateS(
    Object.fromEntries(posts.map(p => [p.id, { hook: p.title, body: p.caption }]))
  );
  const sel = posts.find(p => p.id === selected);
  const selStatus = statuses[selected];

  const setStatus = (id, s) => {
    setStatuses({ ...statuses, [id]: s });
    if (s === "approved") onApprove(id);
  };

  const isFree = plan === "free";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Příspěvky · tento týden</div>
          <h1 className="page-title">Schval svůj obsah</h1>
          <div className="page-sub">
            Zvol variantu A nebo B, uprav text, schval. Posty jdou do Canvy na plán.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="chip">{Object.values(statuses).filter(s => s === "pending").length} čeká</div>
          <div className="chip chip-lime">
            {Object.values(statuses).filter(s => s === "approved").length} schváleno
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1,
            background: "var(--line)",
          }}>
            {posts.map((p) => {
              const status = statuses[p.id];
              const isSel = selected === p.id;
              return (
                <div key={p.id} onClick={() => setSelected(p.id)}
                  style={{
                    background: "var(--bg-elev)", cursor: "pointer",
                    padding: 16, display: "flex", gap: 14,
                    position: "relative",
                    outline: isSel ? "2px solid var(--accent)" : "none",
                    outlineOffset: "-2px",
                    transition: "background .15s",
                  }}>
                  <img src={p.img}
                    style={{
                      width: 70, height: 90, objectFit: "cover",
                      borderRadius: 8, flexShrink: 0,
                    }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <span className="chip" style={{ fontSize: 9.5, padding: "2px 8px",
                        background: p.type === "Grafika" ? "var(--accent-soft)" : "var(--bg-soft)",
                        color: p.type === "Grafika" ? "var(--accent-ink)" : "var(--ink-2)",
                        borderColor: "transparent",
                      }}>{p.type}</span>
                      <span className="chip" style={{ fontSize: 9.5, padding: "2px 8px" }}>
                        {p.aspect}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
                      marginBottom: 4, lineHeight: 1.3,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>{drafts[p.id].hook}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                      {p.source}
                    </div>
                    {status !== "pending" && (
                      <div style={{
                        position: "absolute", top: 12, right: 12,
                        width: 20, height: 20, borderRadius: 50,
                        background: status === "approved" ? "var(--accent)" : "var(--ink-4)",
                        color: "#111", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon name={status === "approved" ? "check" : "close"} size={12}/>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="card" style={{ padding: 22, position: "sticky", top: 88, alignSelf: "start" }}>
          <div style={{
            aspectRatio: sel.aspect === "1:1" ? "1" : "9/14",
            borderRadius: 12, overflow: "hidden",
            position: "relative", marginBottom: 16,
            backgroundImage: `url(${sel.img})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}>
            {sel.duration && (
              <div style={{
                position: "absolute", top: 10, right: 10,
                padding: "4px 10px", borderRadius: 999,
                background: "rgba(17,17,17,.7)", color: "#fff",
                fontSize: 10, fontWeight: 600, backdropFilter: "blur(4px)",
              }}>
                <Icon name="play" size={10} /> {sel.duration}
              </div>
            )}
          </div>

          <div className="eyebrow" style={{ marginBottom: 4 }}>Hook</div>
          {editing ? (
            <textarea value={drafts[selected].hook}
              onChange={(e) => setDrafts({
                ...drafts, [selected]: { ...drafts[selected], hook: e.target.value },
              })}
              style={{
                width: "100%", padding: 10,
                border: "1px solid var(--line)", borderRadius: 8,
                fontSize: 14, fontFamily: "var(--font-display)",
                minHeight: 50, resize: "vertical", background: "var(--bg-soft)",
              }} />
          ) : (
            <div style={{
              fontSize: 15, fontFamily: "var(--font-display)",
              marginBottom: 10, lineHeight: 1.3,
            }}>{drafts[selected].hook}</div>
          )}

          <div className="eyebrow" style={{ marginTop: 12, marginBottom: 4 }}>Caption</div>
          {editing ? (
            <textarea value={drafts[selected].body}
              onChange={(e) => setDrafts({
                ...drafts, [selected]: { ...drafts[selected], body: e.target.value },
              })}
              style={{
                width: "100%", padding: 10,
                border: "1px solid var(--line)", borderRadius: 8,
                fontSize: 12.5, fontFamily: "inherit",
                minHeight: 80, resize: "vertical", background: "var(--bg-soft)",
              }} />
          ) : (
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
              {drafts[selected].body}
            </div>
          )}

          <button onClick={() => setEditing(!editing)}
            style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10,
              display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="edit" size={12}/> {editing ? "Hotovo" : "Upravit text"}
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }}
              onClick={() => setStatus(selected, "rejected")}>
              <Icon name="close" size={13}/> Odmítnout
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }}
              onClick={() => setStatus(selected, "approved")}>
              <Icon name="check" size={13}/>
              {selStatus === "approved" ? "Schváleno" : "Schválit"}
            </button>
          </div>

          {isFree && (
            <div style={{
              marginTop: 14, fontSize: 11, color: "var(--warn)",
              padding: 10, background: "var(--bg-soft)",
              border: "1px solid var(--line)", borderRadius: 8,
            }}>
              Free trial — můžeš si stáhnout 1 schválený příspěvek.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- PLANS ------------------------------------------------------- */
function Plans({ plan, onSelectPlan }) {
  const PLANS = window.LUCIFERA.PLANS;
  const tiers = ["start", "plus", "pro"];
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Tarify</div>
          <h1 className="page-title">Tempo, které ti sedne</h1>
          <div className="page-sub">
            Začni s Brand Scanem. Kdykoli přejdi na RTG autopilot. Prémium je pro značky, které už ví, kam jdou.
          </div>
        </div>
      </div>

      {/* Hero strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16, marginBottom: 28,
      }}>
        {tiers.map(tid => {
          const t = PLANS[tid];
          const isPop = t.badge === "Nejoblíbenější";
          const isActive = plan === tid;
          return (
            <div key={tid} className="card" style={{
              padding: 26,
              position: "relative",
              background: isPop ? "var(--ink)" : "var(--bg-elev)",
              color: isPop ? "var(--bg)" : "var(--ink)",
              borderColor: isPop ? "var(--ink)" : "var(--line)",
              transform: isPop ? "translateY(-6px)" : "none",
              boxShadow: isPop ? "var(--shadow-lg)" : "var(--shadow-sm)",
            }}>
              {isPop && <div style={{
                position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                background: "var(--accent)", color: "#111",
                padding: "4px 12px", borderRadius: 999,
                fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
              }}>Nejoblíbenější</div>}

              <div style={{
                fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase",
                fontWeight: 600, color: isPop ? "var(--accent)" : "var(--ink-3)",
              }}>RTG · {t.name.replace("RTG ", "")}</div>

              <div style={{
                fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 500,
                letterSpacing: "-.02em", marginTop: 14, lineHeight: 1,
              }}>{t.price}</div>
              <div style={{
                fontSize: 12, color: isPop ? "var(--ink-4)" : "var(--ink-3)",
                marginTop: 6,
              }}>{t.priceNote}</div>

              <div style={{
                fontSize: 13, color: isPop ? "var(--ink-4)" : "var(--ink-2)",
                marginTop: 18, marginBottom: 22, lineHeight: 1.5,
              }}>{t.tagline}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8,
                marginBottom: 22 }}>
                {t.features.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    fontSize: 12.5,
                    color: isPop ? "var(--bg)" : "var(--ink-2)",
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 50, flexShrink: 0,
                      background: isPop ? "var(--accent)" : "var(--accent-soft)",
                      color: isPop ? "#111" : "var(--accent-ink)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 1,
                    }}>
                      <Icon name="check" size={10} stroke={2.4}/>
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPlan(tid)}
                className={isPop ? "btn btn-primary" : "btn btn-ghost"}
                style={{
                  width: "100%", padding: "12px 16px",
                  background: isActive ? "var(--accent)" : (isPop ? "var(--accent)" : undefined),
                  color: isActive || isPop ? "#111" : undefined,
                }}>
                {isActive ? "Aktuální plán ✓" : `Začít s ${t.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Secondary row: free + pvi */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 2fr",
        gap: 16,
      }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">Pro začátek</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26,
            marginTop: 6, lineHeight: 1.1 }}>{PLANS.free.name}</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 10, marginBottom: 16 }}>
            {PLANS.free.tagline}. 14 dní přístup, 3 příspěvky zdarma.
          </div>
          <button onClick={() => onSelectPlan("free")}
            className="btn btn-ghost" style={{ width: "100%" }}>
            {plan === "free" ? "Máš aktivní trial ✓" : "Přejít na Free"}
          </button>
        </div>

        <div className="card" style={{ padding: 28,
          background: "linear-gradient(135deg, var(--bg-elev), var(--bg-soft))",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: 24 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--accent-ink)" }}>Prémium · jednorázová investice</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28,
                marginTop: 6, lineHeight: 1.1 }}>
                Prémiová vizuální identita
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 10, maxWidth: 420 }}>
                Kompletní přestavba značky: DNA dokument, vizuální identita na míru, focení v ateliéru, AI avatar.
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22,
                marginTop: 18 }}>
                {PLANS.pvi.price}
              </div>
            </div>
            <button onClick={() => onSelectPlan("pvi")}
              className="btn btn-ink">
              Domluvit hovor <Icon name="arrow" size={13}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- LANDING ----------------------------------------------------- */
function Landing({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", padding: "28px 28px 60px", background: "var(--bg)" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1280, margin: "0 auto 40px",
      }}>
        <img src="assets/logo.png" style={{ height: 22 }} alt="Lucifera"/>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-ghost" style={{ padding: "9px 14px" }}>Přihlásit se</button>
          <button className="btn btn-ink" onClick={onStart}>Nová analýza →</button>
        </div>
      </div>

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1.1fr .9fr",
        gap: 48, alignItems: "center", padding: "28px 0",
      }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: 50,
              background: "var(--accent-ink)", marginRight: 8,
            }}/>
            AI Content Studio · Praha Kampa
          </div>
          <h1 style={{
            fontSize: "clamp(44px, 6vw, 76px)", lineHeight: 1,
            letterSpacing: "-.025em", fontWeight: 500, marginBottom: 24,
            fontFamily: "var(--font-display)",
          }}>
            Značka, co <em style={{ fontStyle: "italic" }}>mluví</em><br/>
            tvým hlasem.
          </h1>
          <div style={{
            fontSize: 17, color: "var(--ink-2)", lineHeight: 1.55,
            maxWidth: 540, marginBottom: 32,
          }}>
            Analyzujeme tvůj web, sestavíme Brand DNA a každý týden tvoříme
            obsah v tvém stylu. Není to šablona. Je to tvá značka, jen rychleji.
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
            <button className="btn btn-ink" onClick={onStart}
              style={{ padding: "14px 22px", fontSize: 14 }}>
              <Icon name="spark" size={15}/> Spustit Brand Scan zdarma
            </button>
            <button className="btn btn-ghost" style={{ padding: "14px 22px", fontSize: 14 }}>
              Ukázat, jak to vypadá →
            </button>
          </div>

          <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26,
                fontWeight: 500 }}>25 let</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>portrétní fotografie</div>
            </div>
            <div style={{ width: 1, height: 38, background: "var(--line)" }}/>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26,
                fontWeight: 500 }}>180+</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>aktivních značek</div>
            </div>
            <div style={{ width: 1, height: 38, background: "var(--line)" }}/>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26,
                fontWeight: 500 }}>14 dní</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>zdarma, bez karty</div>
            </div>
          </div>
        </div>

        {/* Visual mosaic */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "170px 170px 170px",
          gap: 10,
          aspectRatio: "auto",
        }}>
          <div style={{
            gridRow: "span 2", borderRadius: 18, overflow: "hidden",
            backgroundImage: "url(assets/portrait-2.jpg)",
            backgroundSize: "cover", backgroundPosition: "center",
            border: "1px solid var(--line)",
          }}/>
          <div style={{
            borderRadius: 18, overflow: "hidden",
            backgroundImage: "url(assets/portrait-7.jpg)",
            backgroundSize: "cover", backgroundPosition: "center",
            border: "1px solid var(--line)",
          }}/>
          <div style={{
            borderRadius: 18, overflow: "hidden",
            background: "var(--ink)", color: "var(--bg)",
            padding: 18, display: "flex", flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 10.5, color: "var(--accent)",
              letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600 }}>
              Brand Score
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 46,
                fontWeight: 500, lineHeight: 1 }}>75<span style={{
                fontSize: 18, color: "var(--ink-4)" }}>/100</span></div>
              <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>
                Solidní základ, prostor pro důvěru.
              </div>
            </div>
          </div>
          <div style={{
            borderRadius: 18, overflow: "hidden",
            backgroundImage: "url(assets/portrait-11.jpg)",
            backgroundSize: "cover", backgroundPosition: "center",
            border: "1px solid var(--line)",
          }}/>
          <div style={{
            borderRadius: 18, overflow: "hidden",
            backgroundImage: "url(assets/grafika-a.jpg)",
            backgroundSize: "cover", backgroundPosition: "center",
            border: "1px solid var(--line)",
          }}/>
        </div>
      </div>

      {/* Process strip */}
      <div style={{
        maxWidth: 1280, margin: "80px auto 0",
        padding: "32px 0", borderTop: "1px solid var(--line)",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
      }}>
        {[
          { n: "01", t: "Zadej web nebo vybír ze šablon", d: "Lucifera vidí, co ti funguje." },
          { n: "02", t: "Brand DNA za 3 minuty", d: "Pilíře, tón, archetyp, paleta." },
          { n: "03", t: "Schval obsah", d: "Tempo, které ti sedne. Týdně." },
          { n: "04", t: "Publikuj", d: "Přímo z Canvy, jedním klikem." },
        ].map(s => (
          <div key={s.n}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28,
              color: "var(--ink-4)" }}>{s.n}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>{s.t}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MediaLibrary, Approval, Plans, Landing, Planner });

function Planner({ plan, showToast }) {
  const isFree = plan === "free";
  const sched = window.LUCIFERA.SCHEDULE_SEED;
  const [selected, setSelected] = useStateS(null);
  const [addSlot, setAddSlot] = useStateS(null);
  const byDate = Object.fromEntries(sched.map(s => [s.date, s]));

  // 6 weeks grid starting from 21.4
  const cells = [];
  const start = 21;
  for (let w = 0; w < 6; w++) {
    for (let d = 0; d < 7; d++) {
      const num = start + w * 7 + d;
      const date = num > 30 ? String(num - 30).padStart(2, "0") : String(num).padStart(2, "0");
      const isMay = num > 30;
      cells.push({ date, isMay, post: byDate[date], key: `${w}-${d}` });
    }
  }

  const handleCellClick = (cell) => {
    if (cell.post) setSelected(cell);
    else setAddSlot(cell);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Plánovač</div>
          <h1 className="page-title">Kalendář obsahu</h1>
          <div className="page-sub">
            Klikni na den s obrázkem pro úpravu, nebo na prázdný slot pro přidání postu.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost">
            <Icon name="download" size={13}/> Export .ics
          </button>
          <button className="btn btn-ink">
            <Icon name="plus" size={13}/> Nový příspěvek
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="btn btn-ghost" style={{ padding: "6px 11px" }}>‹</button>
            <div style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 500 }}>
              Duben – Květen 2025
            </div>
            <button className="btn btn-ghost" style={{ padding: "6px 11px" }}>›</button>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11,
            color: "var(--ink-3)", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2,
                background: "var(--accent)" }} />
              {sched.length} naplánováno
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2,
                background: "var(--bg-soft)", border: "1px solid var(--line)" }} />
              Volné sloty
            </div>
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8,
          fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase",
          color: "var(--ink-4)", marginBottom: 8, fontWeight: 600,
        }}>
          {["Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota","Neděle"].map(d => (
            <div key={d} style={{ textAlign: "center", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8,
        }}>
          {cells.map(c => (
            <div key={c.key} onClick={() => handleCellClick(c)} style={{
              aspectRatio: "1",
              borderRadius: 10, overflow: "hidden",
              border: "1px solid var(--line)",
              background: c.post ? "transparent" : "var(--bg-soft)",
              position: "relative", cursor: "pointer",
              opacity: c.isMay && !c.post ? .55 : 1,
              transition: "transform .12s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              {c.post ? (
                <>
                  <img src={c.post.img} alt={c.post.hook}
                    style={{ width: "100%", height: "100%", objectFit: "cover",
                      display: "block" }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 35%, transparent 55%, rgba(0,0,0,.8) 100%)",
                  }} />
                  <div style={{
                    position: "absolute", top: 6, left: 8,
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    textShadow: "0 1px 2px rgba(0,0,0,.5)",
                  }}>{c.date}</div>
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    background: "var(--accent)", color: "#111",
                    fontSize: 9, fontWeight: 700, letterSpacing: ".04em",
                    padding: "2px 6px", borderRadius: 4,
                    textTransform: "uppercase",
                  }}>{c.post.type}</div>
                  <div style={{
                    position: "absolute", bottom: 6, left: 8, right: 8,
                    color: "#fff",
                  }}>
                    <div style={{ fontSize: 10, opacity: .85 }}>{c.post.time}</div>
                    <div style={{ fontSize: 10, lineHeight: 1.25, marginTop: 1,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.post.hook}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  position: "absolute", top: 8, left: 10,
                  fontSize: 13, color: "var(--ink-4)", fontWeight: 500,
                }}>{c.date}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "22px 24px 0", display: "flex",
              justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="eyebrow">Upravit plán</div>
                <h3 style={{ fontSize: 22, marginTop: 4 }}>{selected.date}. {selected.isMay ? "května" : "dubna"}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={{ padding: 6 }}>
                <Icon name="close" size={18}/>
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <img src={selected.post.img}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover",
                  borderRadius: 10, marginBottom: 14 }}/>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <span className="chip chip-lime">{selected.post.type}</span>
                <span className="chip">{selected.post.pillar}</span>
                <span className="chip">{selected.post.time}</span>
              </div>
              <div style={{ fontSize: 15, fontFamily: "var(--font-display)",
                lineHeight: 1.35, marginBottom: 16 }}>
                „{selected.post.hook}"
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Datum
                  <input defaultValue={`${selected.date}. ${selected.isMay ? "5." : "4."} 2025`}
                    style={{ width: "100%", padding: "8px 10px", marginTop: 4,
                      border: "1px solid var(--line)", borderRadius: 8,
                      background: "var(--bg-soft)", fontSize: 13, color: "var(--ink)" }}/>
                </label>
                <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Čas
                  <input defaultValue={selected.post.time}
                    style={{ width: "100%", padding: "8px 10px", marginTop: 4,
                      border: "1px solid var(--line)", borderRadius: 8,
                      background: "var(--bg-soft)", fontSize: 13, color: "var(--ink)" }}/>
                </label>
              </div>
            </div>
            <div style={{
              padding: "14px 24px", background: "var(--bg-soft)",
              borderTop: "1px solid var(--line)",
              display: "flex", justifyContent: "space-between", gap: 8,
            }}>
              <button className="btn btn-ghost" style={{ color: "var(--danger)" }}
                onClick={() => { setSelected(null); showToast("Post odstraněn z plánu"); }}>
                Odstranit
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Zrušit</button>
                <button className="btn btn-primary"
                  onClick={() => { setSelected(null); showToast("Změny uloženy ✓"); }}>
                  Uložit změny
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add slot modal */}
      {addSlot && (
        <div className="modal-backdrop" onClick={() => setAddSlot(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "22px 24px 0", display: "flex",
              justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="eyebrow">Nový příspěvek</div>
                <h3 style={{ fontSize: 22, marginTop: 4 }}>
                  {addSlot.date}. {addSlot.isMay ? "května" : "dubna"}
                </h3>
              </div>
              <button onClick={() => setAddSlot(null)} style={{ padding: 6 }}>
                <Icon name="close" size={18}/>
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14 }}>
                Naplánuj nový post — vyber typ a zdroj.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                marginBottom: 14 }}>
                {["Reel", "Carousel", "Post", "Story"].map(t => (
                  <button key={t} className="btn btn-ghost"
                    style={{ justifyContent: "center", padding: "10px" }}>
                    {t}
                  </button>
                ))}
              </div>
              <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                Čas
                <input defaultValue="10:00" type="time"
                  style={{ width: "100%", padding: "8px 10px", marginTop: 4,
                    border: "1px solid var(--line)", borderRadius: 8,
                    background: "var(--bg-soft)", fontSize: 13, color: "var(--ink)" }}/>
              </label>
            </div>
            <div style={{
              padding: "14px 24px", background: "var(--bg-soft)",
              borderTop: "1px solid var(--line)",
              display: "flex", justifyContent: "flex-end", gap: 8,
            }}>
              <button className="btn btn-ghost" onClick={() => setAddSlot(null)}>Zrušit</button>
              <button className="btn btn-primary"
                onClick={() => { setAddSlot(null); showToast("Slot rezervován — vyber vizuál v knihovně."); }}>
                Pokračovat →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
