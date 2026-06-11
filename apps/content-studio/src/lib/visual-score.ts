import OpenAI from "openai";

export type VisualScoreResult = {
  brandFit: number;
  readability: number;
  composition: number;
  conversionClarity: number;
  overall: number;
  passed: boolean;
};

export async function scoreVisualFromB64(
  imageB64: string,
  openaiKey: string
): Promise<VisualScoreResult | null> {
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Ohodnoť tento reklamní vizuál (1-10) pro:
- brandFit: soulad s profesionální značkou
- readability: čitelnost
- composition: kompozice
- conversionClarity: viditelnost CTA
Vrať POUZE validní JSON: {"brandFit":N,"readability":N,"composition":N,"conversionClarity":N}`,
      },
      { type: "image_url", image_url: { url: `data:image/png;base64,${imageB64}` } },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      max_tokens: 200,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonStr) as Record<string, number>;

    const brandFit = Math.min(10, Math.max(0, Number(parsed.brandFit) || 5));
    const readability = Math.min(10, Math.max(0, Number(parsed.readability) || 5));
    const composition = Math.min(10, Math.max(0, Number(parsed.composition) || 5));
    const conversionClarity = Math.min(10, Math.max(0, Number(parsed.conversionClarity) || 5));
    const overall = Math.round((brandFit + readability + composition + conversionClarity) / 4);

    return {
      brandFit,
      readability,
      composition,
      conversionClarity,
      overall,
      passed: overall >= 8,
    };
  } catch {
    return null;
  }
}
