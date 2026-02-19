import OpenAI from "openai";

export type VisualCriticResult = {
  score: number;
  hasTextArtifacts: boolean;
  brandColorMatch: number;
  brandStyleMatch: number;
  note: string;
};

export async function criticVisualFromB64(
  imageB64: string,
  openaiKey: string,
  options: { brandColors?: string[]; moodKeywords?: string[] }
): Promise<VisualCriticResult | null> {
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const brandContext =
      (options.brandColors?.length ? `Brand colors to match: ${options.brandColors.join(", ")}. ` : "") +
      (options.moodKeywords?.length ? `Desired mood: ${options.moodKeywords.join(", ")}. ` : "");

    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Ohodnoť tento reklamní VIZUÁL (pouze pozadí, bez overlay textu). ${brandContext}
Pravidla:
- score 1-10: celková kvalita (kompozice, profesionální vzhled, vhodnost pro reklamu).
- hasTextArtifacts: true pokud obrázek obsahuje JAKÝKOLIV text, písmena, čísla, watermark nebo gibberish v samotném obrázku; false pokud je čistý (text přijde jako overlay zvlášť).
- brandColorMatch 1-10: jak moc odpovídá barvám značky (pokud nejsou uvedeny, dej 5).
- brandStyleMatch 1-10: soulad s mood/style (pokud nejsou uvedeny, dej 5).
- note: krátký komentář (1-2 věty).

Vrať POUZE validní JSON bez markdownu:
{"score":N,"hasTextArtifacts":true|false,"brandColorMatch":N,"brandStyleMatch":N,"note":"..."}`,
      },
      { type: "image_url", image_url: { url: `data:image/png;base64,${imageB64}` } },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
      max_tokens: 300,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    const score = Math.min(10, Math.max(1, Number(parsed.score) || 5));
    const hasTextArtifacts = parsed.hasTextArtifacts === true;
    const brandColorMatch = Math.min(10, Math.max(1, Number(parsed.brandColorMatch) || 5));
    const brandStyleMatch = Math.min(10, Math.max(1, Number(parsed.brandStyleMatch) || 5));
    const note = typeof parsed.note === "string" ? parsed.note.trim() : "";

    return {
      score,
      hasTextArtifacts,
      brandColorMatch,
      brandStyleMatch,
      note,
    };
  } catch {
    return null;
  }
}
