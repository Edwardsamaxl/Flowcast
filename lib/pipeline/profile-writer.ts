import type {
  CreatorProfile,
  CreatorInsight,
  ProfileAnalysisResult,
  ProfileSuggestion,
  CoreDimension,
} from "./types";
import type {
  CreatorProfileRepository,
  FullCreatorProfile,
} from "@/lib/repositories/creator-profile";
import type { VersionManager } from "@/lib/repositories/version-manager";

export type WriteMode = "auto" | "manual";

export interface ProfileWriter {
  write(
    creatorId: string,
    analysis: ProfileAnalysisResult,
    mode: WriteMode,
    sourceAssetId?: string
  ): Promise<
    | { applied: ProfileSuggestion[]; insightsAdded: CreatorInsight[] }
    | { suggestions: ProfileSuggestion[]; insights: ProfileAnalysisResult["insights"] }
  >;
}

const ARRAY_DIMENSIONS: CoreDimension[] = [
  "tone",
  "beliefs",
  "structures",
  "avoid_phrases",
  "catchphrases",
];

const SCALAR_DIMENSIONS: CoreDimension[] = ["positioning", "title_preference"];

function isArrayDimension(d: CoreDimension | undefined): boolean {
  if (!d) return false;
  return ARRAY_DIMENSIONS.includes(d);
}

function isScalarDimension(d: CoreDimension | undefined): boolean {
  if (!d) return false;
  return SCALAR_DIMENSIONS.includes(d);
}

function buildChangeSummary(
  additions: ProfileSuggestion[],
  modifications: ProfileSuggestion[],
  insightsCount: number
): string {
  const parts: string[] = [];
  if (additions.length > 0) {
    parts.push(`新增 ${additions.length} 条核心维度`);
  }
  if (modifications.length > 0) {
    parts.push(`修改 ${modifications.length} 条核心维度`);
  }
  if (insightsCount > 0) {
    parts.push(`新增 ${insightsCount} 条洞察`);
  }
  return parts.length > 0 ? parts.join("，") : "画像微调";
}

export function createProfileWriter(deps: {
  profileRepo: CreatorProfileRepository;
  versionManager: VersionManager;
}): ProfileWriter {
  const { profileRepo, versionManager } = deps;

  return {
    async write(creatorId, analysis, mode, sourceAssetId) {
      const allSuggestions: ProfileSuggestion[] = [
        ...analysis.additions,
        ...analysis.modifications,
      ];

      if (mode === "manual") {
        return {
          suggestions: allSuggestions,
          insights: analysis.insights,
        };
      }

      // auto mode: apply all changes
      const profile = await profileRepo.loadProfile(creatorId);

      const changes: Partial<Omit<FullCreatorProfile, "insights">> = {};

      // Helper to get current array value
      const getArray = (dim: CoreDimension): string[] => {
        if (!profile) return [];
        switch (dim) {
          case "tone":
            return [...profile.tone];
          case "beliefs":
            return [...profile.beliefs];
          case "structures":
            return [...profile.structures];
          case "avoid_phrases":
            return [...profile.avoidPhrases];
          case "catchphrases":
            return [...profile.catchphrases];
          default:
            return [];
        }
      };

      const getScalar = (dim: CoreDimension): string => {
        if (!profile) return "";
        switch (dim) {
          case "positioning":
            return profile.positioning;
          case "title_preference":
            return profile.titlePreference;
          default:
            return "";
        }
      };

      // Apply additions
      for (const add of analysis.additions) {
        const dim = add.dimension;
        if (!dim) continue;

        if (isArrayDimension(dim)) {
          const arr = getArray(dim);
          const val = add.value || "";
          if (val && !arr.includes(val)) {
            arr.push(val);
          }
          switch (dim) {
            case "tone":
              changes.tone = arr;
              break;
            case "beliefs":
              changes.beliefs = arr;
              break;
            case "structures":
              changes.structures = arr;
              break;
            case "avoid_phrases":
              changes.avoidPhrases = arr;
              break;
            case "catchphrases":
              changes.catchphrases = arr;
              break;
          }
        } else if (isScalarDimension(dim)) {
          const val = add.value || "";
          if (val) {
            switch (dim) {
              case "positioning":
                changes.positioning = val;
                break;
              case "title_preference":
                changes.titlePreference = val;
                break;
            }
          }
        }
      }

      // Apply modifications
      for (const mod of analysis.modifications) {
        const dim = mod.dimension;
        if (!dim) continue;

        if (isArrayDimension(dim)) {
          const arr = getArray(dim);
          const from = mod.from || "";
          const to = mod.to || "";
          const idx = arr.indexOf(from);
          if (idx >= 0) {
            arr[idx] = to;
          } else if (to && !arr.includes(to)) {
            arr.push(to);
          }
          switch (dim) {
            case "tone":
              changes.tone = arr;
              break;
            case "beliefs":
              changes.beliefs = arr;
              break;
            case "structures":
              changes.structures = arr;
              break;
            case "avoid_phrases":
              changes.avoidPhrases = arr;
              break;
            case "catchphrases":
              changes.catchphrases = arr;
              break;
          }
        } else if (isScalarDimension(dim)) {
          const to = mod.to || "";
          if (to) {
            switch (dim) {
              case "positioning":
                changes.positioning = to;
                break;
              case "title_preference":
                changes.titlePreference = to;
                break;
            }
          }
        }
      }

      // Update profile if there are changes
      const hasChanges = Object.keys(changes).length > 0;
      if (hasChanges) {
        await profileRepo.updateProfile(creatorId, changes);
      }

      // Add insights
      const insightsAdded: CreatorInsight[] = [];
      for (const insight of analysis.insights) {
        const added = await profileRepo.addInsight(creatorId, {
          content: insight.content,
          tags: insight.tags,
          sourceAssetId,
        });
        insightsAdded.push(added);
      }

      // Build snapshot and create version
      const updatedProfile = await profileRepo.loadProfile(creatorId);
      const snapshot = {
        profile: updatedProfile
          ? {
              id: updatedProfile.id,
              creatorId: updatedProfile.creatorId,
              positioning: updatedProfile.positioning,
              tone: updatedProfile.tone,
              beliefs: updatedProfile.beliefs,
              structures: updatedProfile.structures,
              avoidPhrases: updatedProfile.avoidPhrases,
              titlePreference: updatedProfile.titlePreference,
              catchphrases: updatedProfile.catchphrases,
            }
          : {},
        insights: updatedProfile
          ? updatedProfile.insights.map((i) => ({
              id: i.id,
              content: i.content,
              tags: i.tags,
              sourceAssetId: i.sourceAssetId,
              createdAt: i.createdAt,
            }))
          : [],
      };

      const changeSummary = buildChangeSummary(
        analysis.additions,
        analysis.modifications,
        insightsAdded.length
      );

      await versionManager.createVersion(creatorId, snapshot, {
        changeSummary,
        sourceAssetId,
        triggerType: "auto_write",
      });

      return {
        applied: allSuggestions,
        insightsAdded,
      };
    },
  };
}
