export type Platform = string;

export type PipelineStatus =
  | "uploaded"
  | "extracting_audio"
  | "transcribing"
  | "analyzing"
  | "ready"
  | "generating"
  | "completed"
  | "failed";

export type TranscriptSegment = {
  startSeconds?: number;
  endSeconds?: number;
  speaker?: string;
  text: string;
};

export type TranscriptAnalysis = {
  topic: string;
  summary: string;
  core_points: Array<{
    point: string;
    evidence: string;
    usable_for_platforms: Platform[];
  }>;
  cases: string[];
  quotes: string[];
  content_angles: string[];
  risk_notes: string[];
};

export type CoreDimension =
  | "positioning"
  | "tone"
  | "beliefs"
  | "structures"
  | "avoid_phrases"
  | "title_preference"
  | "catchphrases";

export type CreatorProfile = {
  id: string;
  creatorId: string;
  positioning: string;
  tone: string[];
  beliefs: string[];
  structures: string[];
  avoid_phrases: string[];
  title_preference: string;
  catchphrases: string[];
  insights: CreatorInsight[];
};

export type CreatorInsight = {
  id: string;
  content: string;
  tags: string[];
  sourceAssetId?: string;
  createdAt: number;
};

// Legacy alias for backward compatibility during transition
export type VoiceProfile = CreatorProfile;

export type ProfileSuggestion = {
  dimension?: CoreDimension;
  type: "addition" | "modification";
  field: string;
  value?: string;
  from?: string;
  to?: string;
};

export type ProfileAnalysisResult = {
  additions: ProfileSuggestion[];
  modifications: ProfileSuggestion[];
  insights: { content: string; tags: string[]; evidence?: string }[];
  evidenceSegments: string[];
};

// Legacy alias for backward compatibility
export type CreatorProfileSuggestions = {
  additions: Array<{ field: string; value: string }>;
  modifications: Array<{ field: string; from: string; to: string }>;
  evidence_segments: string[];
};

// Legacy alias for backward compatibility
export type VoiceProfileSuggestions = CreatorProfileSuggestions;

export type GeneratedPlatformDraft = {
  platform: Platform;
  title: string;
  content: string;
  notes: string[];
  voice_alignment?: {
    matched_traits: string[];
    conflicts: string[];
    suggestions: string[];
  };
};

export type FeedbackScope = "current_draft" | "creator_profile";
