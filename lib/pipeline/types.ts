export type Platform = "xiaohongshu" | "douyin" | "bilibili" | "zhihu" | "x";

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

export type CreatorProfile = {
  persona_id: string;
  name: string;
  positioning: string;
  domain?: string;
  tone: string[];
  beliefs: string[];
  cases: string[];
  common_patterns: string[];
  avoid_phrases: string[];
  title_preference?: string;
  platform_rules: Record<Platform, string>;
};

// Legacy alias for backward compatibility
export type VoiceProfile = CreatorProfile;

export type CreatorProfileSuggestions = {
  positioning_suggestions: string[];
  tone_suggestions: string[];
  belief_suggestions: string[];
  case_suggestions: string[];
  common_pattern_suggestions: string[];
  avoid_phrase_suggestions: string[];
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
