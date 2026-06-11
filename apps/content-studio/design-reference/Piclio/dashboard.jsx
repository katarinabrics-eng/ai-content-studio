/* ============================================================
   Dashboard screen — adapts to current plan
   ============================================================ */

const { useState: useStateD, useMemo: useMemoD } = React;

function Dashboard({ plan, onRoute, pendingCount, onApprove }) {
  const P = window.LUCIFERA.PLANS[plan];
  const brand = window.LUCIFERA.BRAND;
  const hasRTG = ["start", "plus", "pro"].includes(plan);
  const isFree = plan === "free";
  const isPVI = plan === "pvi";
  const isPaid = !isFree;

  return (
    <div className="page">
      {/* Hero */}
      <div className="page-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Dobré ráno, Kataríno</div>
          <h1 className="page-title">{brand.name}</h1>
          <div className="page-sub">
            {isFree
              ? "Zkoumáme tvou značku — tvé výsledky budou plně aktivní po upgradu."
              : isPVI
              ? "Tvá prémiová identita roste. Tady je dnešní přehled."
              : `Tempo ${P.name.replace("RTG ", "")} · ${P.posts.videos + P.posts.grafika + P.posts.carousels} příspěvků měsíčně.`
            }
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!isFree && <button className="btn btn-ghost" style={{ padding: "10px 16px" }}>
            <Icon name="download" size={14}/> Exportovat report
          </button>}
          <button className="btn btn-ink" onClick={() => onRoute("library")}>
            <Icon name="spark" size={14}/> Vytvořit příspěvek
          </button>
        </div>
      </div>

      {/* Free-trial banner */}
      {isFree && (
        <div style={{
          background: "var(--ink)", borderRadius: 16, padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, marginBottom: 22, color: "var(--bg)",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em",
              textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
              Free trial · 14 dní
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24,
              fontWeight: 500, letterSpacing: "-.01em" }}>
              Tvé výsledky jsou dostupné ještě 14 dní.
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-4)", marginTop: 6, maxWidth: 480 }}>
              Po uplynutí doby se všechna data automaticky vymažou.
              Přihlaš se k odběru a pracuj s nimi dál.
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => onRoute("plans")}>
            Přejít na placený plán <Icon name="arrow" size={14}/>
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14, marginBottom: 28,
      }}>
        <StatCard label="Brand index" value={brand.score} suffix="/100" trend="+6 tento měsíc" accent />
        <StatCard label="Archetyp" value={brand.archetype} display />
        <StatCard label="Příspěvky ke schválení" value={pendingCount} muted={pendingCount === 0} />
        <StatCard label={isFree ? "Zbývá zdarma" : "Kredit"}
          value={isFree ? "14 dní" : `${(P.creditsInit - 0).toLocaleString("cs")}`}
          subtle />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.35fr 1fr",
        gap: 20,
        alignItems: "start",
      }}>
        {/* LEFT column: pillars + pipeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Brand pillars card */}
          <div className="card" style={{ padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="eyebrow">Pilíře značky</div>
                <h3 style={{ fontSize: 22, marginTop: 4 }}>Pět sil, co drží Lucifera v rovnováze</h3>
              </div>
              <div style={{
                padding: "6px 12px", borderRadius: 999,
                background: "var(--accent-soft)", color: "var(--accent-ink)",
                fontSize: 11, fontWeight: 600,
              }}>
                {isFree ? "Náhled" : "Aktivní"}
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1.1fr .9fr",
              gap: 26, marginTop: 22, alignItems: "center",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {brand.pillars.map((p) => (
                  <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 80, fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>
                      {p.label}
                    </div>
                    <div style={{
                      flex: 1, height: 6, background: "var(--bg-soft)",
                      borderRadius: 999, overflow: "hidden",
                      filter: isFree ? "blur(2px) opacity(.7)" : "none",
                    }}>
                      <div style={{
                        width: `${p.score * 10}%`, height: "100%",
                        background: p.tone === "warn"
                          ? "color-mix(in oklab, var(--warn) 70%, var(--accent))"
                          : "var(--accent)",
                        transition: "width .6s ease",
                      }} />
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500,
                      width: 20, textAlign: "right",
                      filter: isFree ? "blur(3px)" : "none",
                    }}>{p.score}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center",
                filter: isFree ? "blur(2.5px)" : "none", opacity: isFree ? .6 : 1 }}>
                <SpiderChart pillars={brand.pillars} size={220} />
              </div>
            </div>

            {isFree && (
              <div style={{
                marginTop: 20, padding: 14,
                background: "var(--bg-soft)", border: "1px solid var(--line)",
                borderRadius: 10, fontSize: 12, color: "var(--ink-3)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>Plná analýza pilířů je odemčena v placeném tarifu.</span>
                <button onClick={() => onRoute("plans")}
                  className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 11 }}>
                  Odemknout →
                </button>
              </div>
            )}
          </div>

          {/* Obsah připravený */}
          {(hasRTG || isPVI) && (
            <div className="card" style={{ padding: 26 }}>
              <div className="section-head" style={{ marginBottom: 14 }}>
                <div>
                  <div className="eyebrow">Tvůj obsah</div>
                  <h3 style={{ fontSize: 20, marginTop: 4 }}>Připravený k použití</h3>
                </div>
                <button onClick={() => onRoute("approval")}
                  style={{ color: "var(--ink-3)", fontSize: 12 }}>
                  Vidět vše →
                </button>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
              }}>
                {window.LUCIFERA.POSTS_SEED.slice(0, 4).map((p) => (
                  <PostThumb key={p.id} post={p} onClick={() => onRoute("approval")} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state for free */}
          {isFree && (
            <div className="card" style={{ padding: 26 }}>
              <div className="eyebrow">Ochutnávka</div>
              <h3 style={{ fontSize: 20, marginTop: 4, marginBottom: 6 }}>
                3 příspěvky zdarma čekají v knihovně
              </h3>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>
                Vyber si fotku, kterou znáš — zbytek za tebe Lucifera dotvoří.
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
              }}>
                {window.LUCIFERA.LIBRARY_IMAGES.slice(0, 3).map((img) => (
                  <div key={img.id} onClick={() => onRoute("library")}
                    style={{
                      aspectRatio: "4/5", borderRadius: 10, overflow: "hidden",
                      backgroundImage: `url(${img.src})`, backgroundSize: "cover",
                      backgroundPosition: "center", cursor: "pointer",
                    }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <BrandDNACard plan={plan} onRoute={onRoute} />

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "baseline" }}>
              <div>
                <div className="eyebrow">Paleta</div>
                <h3 style={{ fontSize: 18, marginTop: 4 }}>Krémová & jemná</h3>
              </div>
              {!isFree && (plan === "plus" || plan === "pro" || plan === "pvi") && (
                <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 10.5 }}
                  onClick={() => onRoute && onRoute("branddna")}>
                  <Icon name="spark" size={11}/> Upravit
                </button>
              )}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 10, color: "var(--ink-3)", margin: "6px 0 12px",
            }}>
              <Icon name="globe" size={10}/>
              Z diagnostiky <b style={{ color: "var(--ink-2)" }}>studiolucifera.cz</b>
              <span style={{ color: "var(--ink-4)" }}>· auto-extrakt</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {brand.palette.slice(0, 10).map((c, i) => (
                <div key={i} title={c.label}
                  style={{
                    aspectRatio: "1", borderRadius: 8,
                    background: c.hex,
                    border: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)",
                    position: "relative",
                  }}>
                  {!isFree && (plan === "plus" || plan === "pro" || plan === "pvi") && (
                    <div style={{
                      position: "absolute", bottom: 3, right: 3,
                      width: 14, height: 14, borderRadius: 3,
                      background: "rgba(255,255,255,.9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0,
                    }} className="palette-edit-dot">
                      <Icon name="spark" size={8}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--ink-4)", lineHeight: 1.7, letterSpacing: "-.01em",
              wordBreak: "break-all" }}>
              {brand.palette.slice(0, 6).map(c => `'${c.hex}'`).join(", ")} …
            </div>
            {!isFree && (plan === "plus" || plan === "pro" || plan === "pvi") && (
              <div style={{ marginTop: 10, padding: "8px 10px",
                background: "var(--accent-soft)", borderRadius: 6,
                fontSize: 10.5, color: "var(--accent-ink)",
                display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={11}/>
                Přepisovatelné — v plném tarifu si paletu upravíš ručně
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow">Doporučení stratéga</div>
            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 999,
                background: "var(--accent-soft)", color: "var(--accent-ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 600,
              }}>JV</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Jana Válková</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Brand strateg · fit {brand.score}%
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 10, lineHeight: 1.6 }}>
                  „Zesil pilíř <b>Důvěra</b> sérií 3 testimonialů — tvůj archetyp to unese.“
                </div>
              </div>
            </div>
          </div>

          {!isFree && (
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "baseline", marginBottom: 14 }}>
                <div>
                  <div className="eyebrow">Obsahový plán</div>
                  <div style={{ fontSize: 18, fontFamily: "var(--font-display)",
                    marginTop: 4 }}>
                    Duben / Květen 2025
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>‹</button>
                  <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>›</button>
                </div>
              </div>

              {/* Weekday heading */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6,
                fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase",
                color: "var(--ink-4)", marginBottom: 6, fontWeight: 600,
              }}>
                {["Po","Út","St","Čt","Pá","So","Ne"].map(d => (
                  <div key={d} style={{ textAlign: "center" }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid — 4 weeks starting 21.4 */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6,
              }}>
                {(() => {
                  const byDate = Object.fromEntries(window.LUCIFERA.SCHEDULE_SEED.map(s => [s.date, s]));
                  // 28 days starting from 21
                  const cells = [];
                  const start = 21;
                  for (let w = 0; w < 4; w++) {
                    for (let d = 0; d < 7; d++) {
                      const num = start + w * 7 + d;
                      const date = num > 30 ? String(num - 30).padStart(2, "0")
                        : String(num).padStart(2, "0");
                      const isMay = num > 30;
                      const post = byDate[date];
                      cells.push({ date, isMay, post, key: `${w}-${d}` });
                    }
                  }
                  return cells.map(c => (
                    <div key={c.key} style={{
                      aspectRatio: "1",
                      borderRadius: 8, overflow: "hidden",
                      border: "1px solid var(--line)",
                      background: c.post ? "transparent" : "var(--bg-soft)",
                      position: "relative", cursor: c.post ? "pointer" : "default",
                      opacity: c.isMay && !c.post ? .45 : 1,
                    }}>
                      {c.post ? (
                        <>
                          <img src={c.post.img} alt={c.post.hook}
                            style={{ width: "100%", height: "100%", objectFit: "cover",
                              display: "block" }} />
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,.75) 100%)",
                          }} />
                          <div style={{
                            position: "absolute", top: 4, left: 5,
                            color: "#fff", fontSize: 10, fontWeight: 600,
                            textShadow: "0 1px 2px rgba(0,0,0,.4)",
                          }}>{c.date}</div>
                          <div style={{
                            position: "absolute", top: 4, right: 4,
                            background: "var(--accent)", color: "#111",
                            fontSize: 8, fontWeight: 700, letterSpacing: ".04em",
                            padding: "2px 5px", borderRadius: 4,
                            textTransform: "uppercase",
                          }}>{c.post.type}</div>
                          <div style={{
                            position: "absolute", bottom: 3, left: 5, right: 5,
                            color: "#fff", fontSize: 9, lineHeight: 1.2,
                            textShadow: "0 1px 2px rgba(0,0,0,.6)",
                          }}>{c.post.time}</div>
                        </>
                      ) : (
                        <div style={{
                          position: "absolute", top: 4, left: 5,
                          fontSize: 10, color: "var(--ink-4)", fontWeight: 500,
                        }}>{c.date}</div>
                      )}
                    </div>
                  ));
                })()}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 14, marginTop: 14,
                fontSize: 10.5, color: "var(--ink-3)", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2,
                    background: "var(--accent)" }} />
                  {window.LUCIFERA.SCHEDULE_SEED.length} naplánováno
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2,
                    background: "var(--bg-soft)", border: "1px solid var(--line)" }} />
                  Volné sloty
                </div>
                <div style={{ marginLeft: "auto", fontSize: 10.5 }}>
                  Klikni na den pro detail →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, trend, accent, muted, subtle, display }) {
  return (
    <div className="card" style={{
      padding: "18px 20px",
      background: accent ? "var(--ink)" : "var(--bg-elev)",
      color: accent ? "var(--bg)" : "var(--ink)",
      borderColor: accent ? "var(--ink)" : "var(--line)",
    }}>
      <div style={{
        fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase",
        fontWeight: 600,
        color: accent ? "var(--accent)" : "var(--ink-3)",
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: display ? 22 : 34,
        fontWeight: 500,
        letterSpacing: "-.02em",
        marginTop: 8, lineHeight: 1,
        color: muted ? "var(--ink-4)" : "inherit",
      }}>
        {value}{suffix && <span style={{
          fontSize: 14, color: accent ? "var(--ink-4)" : "var(--ink-3)", fontWeight: 400,
        }}>{suffix}</span>}
      </div>
      {trend && <div style={{
        fontSize: 11, marginTop: 8,
        color: accent ? "var(--accent)" : "var(--accent-ink)",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <Icon name="trend" size={12} />{trend}
      </div>}
    </div>
  );
}

function BrandDNACard({ plan, onRoute }) {
  const brand = window.LUCIFERA.BRAND;
  const locked = plan === "free";
  return (
    <div className="card" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
      <div className="eyebrow">Brand DNA</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
        <DNARow label="Pozicionování" value={brand.positioning} />
        <DNARow label="Tón" value={brand.tone} />
        <DNARow label="Cílová skupina" value={brand.audience} />
        <DNARow label="Archetyp" value={brand.archetype} accent />
      </div>
      {locked && (
        <div style={{
          position: "absolute", inset: 0, background:
            "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--bg-elev) 95%, transparent) 60%)",
          pointerEvents: "none",
        }} />
      )}
      {locked && (
        <button onClick={() => onRoute("plans")}
          className="btn btn-ghost"
          style={{
            marginTop: 14, width: "100%", padding: "8px 12px", fontSize: 11.5,
            position: "relative", zIndex: 2,
          }}>
          <Icon name="lock" size={13}/> Odemknout celou strategii
        </button>
      )}
    </div>
  );
}

function DNARow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 10.5, color: "var(--ink-4)", width: 100,
        letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0,
        paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: accent ? 600 : 400,
        flex: 1, fontFamily: accent ? "var(--font-display)" : "inherit",
        fontSize: accent ? 15 : 13 }}>
        {value}
      </span>
    </div>
  );
}

function PostThumb({ post, onClick }) {
  return (
    <div onClick={onClick} style={{
      aspectRatio: post.aspect === "1:1" ? "1" : "9/14",
      borderRadius: 10, overflow: "hidden", position: "relative",
      backgroundImage: `url(${post.img})`,
      backgroundSize: "cover", backgroundPosition: "center",
      cursor: "pointer", border: "1px solid var(--line)",
    }}>
      <div style={{
        position: "absolute", top: 8, left: 8,
        fontSize: 9, fontWeight: 700, letterSpacing: ".1em",
        padding: "3px 7px", borderRadius: 999,
        background: post.type === "Grafika" ? "var(--accent)" : "rgba(255,255,255,.92)",
        color: "#111",
        textTransform: "uppercase",
      }}>{post.type}</div>
      {post.duration && (
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          fontSize: 10, fontWeight: 600,
          padding: "2px 7px", borderRadius: 999,
          background: "rgba(17,17,17,.7)", color: "#fff",
          backdropFilter: "blur(4px)",
        }}>{post.duration}</div>
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,.6))",
      }} />
      <div style={{
        position: "absolute", bottom: 8, right: 8, left: 36,
        fontSize: 10, color: "#fff", lineHeight: 1.3,
        fontWeight: 500,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
      }}>{post.title}</div>
    </div>
  );
}

Object.assign(window, { Dashboard });
