import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { profileSuggestions, creators, creatorProfiles } from "@/lib/db/schema";
import { json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const suggestions = await db
    .select()
    .from(profileSuggestions)
    .where(eq(profileSuggestions.creatorId, id));

  return json(
    suggestions.map((s) => ({
      ...s,
      suggestions: parseJsonField(s.suggestions, {}),
    }))
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const body = await req.json() as {
    suggestionId: string;
    action: "apply" | "ignore";
    applyFields?: string[];
  };

  const [suggestion] = await db
    .select()
    .from(profileSuggestions)
    .where(eq(profileSuggestions.id, body.suggestionId));

  if (!suggestion) return jsonError("建议不存在", 404);

  if (body.action === "apply") {
    const [profile] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.creatorId, id));

    if (profile) {
      const suggData = parseJsonField<{
        additions?: Array<{ field: string; value: string }>;
        modifications?: Array<{ field: string; from: string; to: string }>;
      }>(suggestion.suggestions, {});

      const currentTone = parseJsonField<string[]>(profile.tone, []);
      const currentBeliefs = parseJsonField<string[]>(profile.beliefs, []);
      const currentCases = parseJsonField<string[]>(profile.cases, []);
      const currentPatterns = parseJsonField<string[]>(profile.commonPatterns, []);
      const currentAvoid = parseJsonField<string[]>(profile.avoidPhrases, []);
      let currentPositioning = profile.positioning;

      const additions = suggData.additions || [];
      const modifications = suggData.modifications || [];

      // Apply modifications first
      for (const mod of modifications) {
        const field = mod.field;
        if (field === "定位") currentPositioning = mod.to;
        if (field === "语气") {
          const idx = currentTone.indexOf(mod.from);
          if (idx >= 0) currentTone[idx] = mod.to;
          else currentTone.push(mod.to);
        }
        if (field === "高频观点") {
          const idx = currentBeliefs.indexOf(mod.from);
          if (idx >= 0) currentBeliefs[idx] = mod.to;
          else currentBeliefs.push(mod.to);
        }
        if (field === "常用案例") {
          const idx = currentCases.indexOf(mod.from);
          if (idx >= 0) currentCases[idx] = mod.to;
          else currentCases.push(mod.to);
        }
        if (field === "常用结构") {
          const idx = currentPatterns.indexOf(mod.from);
          if (idx >= 0) currentPatterns[idx] = mod.to;
          else currentPatterns.push(mod.to);
        }
        if (field === "禁用表达") {
          const idx = currentAvoid.indexOf(mod.from);
          if (idx >= 0) currentAvoid[idx] = mod.to;
          else currentAvoid.push(mod.to);
        }
      }

      // Apply additions
      for (const add of additions) {
        const field = add.field;
        if (field === "定位" && !currentPositioning) currentPositioning = add.value;
        if (field === "语气" && !currentTone.includes(add.value)) currentTone.push(add.value);
        if (field === "高频观点" && !currentBeliefs.includes(add.value)) currentBeliefs.push(add.value);
        if (field === "常用案例" && !currentCases.includes(add.value)) currentCases.push(add.value);
        if (field === "常用结构" && !currentPatterns.includes(add.value)) currentPatterns.push(add.value);
        if (field === "禁用表达" && !currentAvoid.includes(add.value)) currentAvoid.push(add.value);
      }

      await db.update(creatorProfiles).set({
        positioning: currentPositioning,
        tone: JSON.stringify(currentTone),
        beliefs: JSON.stringify(currentBeliefs),
        cases: JSON.stringify(currentCases),
        commonPatterns: JSON.stringify(currentPatterns),
        avoidPhrases: JSON.stringify(currentAvoid),
        updatedAt: now(),
      }).where(eq(creatorProfiles.creatorId, id));
    }

    await db.update(profileSuggestions).set({ status: "applied", updatedAt: now() }).where(eq(profileSuggestions.id, body.suggestionId));
  } else {
    await db.update(profileSuggestions).set({ status: "ignored", updatedAt: now() }).where(eq(profileSuggestions.id, body.suggestionId));
  }

  return json({ success: true });
}
