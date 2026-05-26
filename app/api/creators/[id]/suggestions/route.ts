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
      const suggData = parseJsonField<Record<string, string[]>>(suggestion.suggestions, {});

      const currentTone = parseJsonField<string[]>(profile.tone, []);
      const currentBeliefs = parseJsonField<string[]>(profile.beliefs, []);
      const currentCases = parseJsonField<string[]>(profile.cases, []);
      const currentPatterns = parseJsonField<string[]>(profile.commonPatterns, []);
      const currentAvoid = parseJsonField<string[]>(profile.avoidPhrases, []);

      const fields = body.applyFields || ["tone", "beliefs", "cases", "patterns", "avoid"];

      if (fields.includes("tone") && suggData.tone_suggestions?.length) {
        const merged = Array.from(new Set([...currentTone, ...suggData.tone_suggestions]));
        await db.update(creatorProfiles).set({ tone: JSON.stringify(merged), updatedAt: now() }).where(eq(creatorProfiles.creatorId, id));
      }
      if (fields.includes("beliefs") && suggData.belief_suggestions?.length) {
        const merged = Array.from(new Set([...currentBeliefs, ...suggData.belief_suggestions]));
        await db.update(creatorProfiles).set({ beliefs: JSON.stringify(merged), updatedAt: now() }).where(eq(creatorProfiles.creatorId, id));
      }
      if (fields.includes("cases") && suggData.case_suggestions?.length) {
        const merged = Array.from(new Set([...currentCases, ...suggData.case_suggestions]));
        await db.update(creatorProfiles).set({ cases: JSON.stringify(merged), updatedAt: now() }).where(eq(creatorProfiles.creatorId, id));
      }
      if (fields.includes("patterns") && suggData.common_pattern_suggestions?.length) {
        const merged = Array.from(new Set([...currentPatterns, ...suggData.common_pattern_suggestions]));
        await db.update(creatorProfiles).set({ commonPatterns: JSON.stringify(merged), updatedAt: now() }).where(eq(creatorProfiles.creatorId, id));
      }
      if (fields.includes("avoid") && suggData.avoid_phrase_suggestions?.length) {
        const merged = Array.from(new Set([...currentAvoid, ...suggData.avoid_phrase_suggestions]));
        await db.update(creatorProfiles).set({ avoidPhrases: JSON.stringify(merged), updatedAt: now() }).where(eq(creatorProfiles.creatorId, id));
      }
    }

    await db.update(profileSuggestions).set({ status: "applied", updatedAt: now() }).where(eq(profileSuggestions.id, body.suggestionId));
  } else {
    await db.update(profileSuggestions).set({ status: "ignored", updatedAt: now() }).where(eq(profileSuggestions.id, body.suggestionId));
  }

  return json({ success: true });
}
