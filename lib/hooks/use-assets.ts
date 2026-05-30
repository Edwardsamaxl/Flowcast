"use client";

import { useState, useEffect, useCallback } from "react";

export type Asset = {
  id: string;
  type: string;
  title: string;
  filePath: string;
  duration: string;
  status: string;
  creatorId: string | null;
  createdAt: number;
  updatedAt: number;
  transcript?: {
    id: string;
    fullText: string;
    segments: unknown[];
  } | null;
  analysis?: {
    id: string;
    topic: string;
    summary: string;
    corePoints: unknown[];
    cases: string[];
    quotes: string[];
    contentAngles: string[];
    riskNotes: string[];
  } | null;
  profileSuggestion?: {
    id: string;
    suggestions: {
      additions?: Array<{ field: string; value: string }>;
      modifications?: Array<{ field: string; from: string; to: string }>;
      evidence_segments?: string[];
    };
    status: string;
  } | null;
};

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assets");
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      setAssets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const uploadAsset = useCallback(
    async (
      file: File,
      metadata?: { type?: string; title?: string; creatorId?: string }
    ) => {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata?.type) formData.append("type", metadata.type);
      if (metadata?.title) formData.append("title", metadata.title);
      if (metadata?.creatorId) formData.append("creatorId", metadata.creatorId);

      const res = await fetch("/api/assets", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const asset = await res.json();
      await fetchAssets();
      return asset as Asset;
    },
    [fetchAssets]
  );

  const getAsset = useCallback(async (id: string): Promise<Asset> => {
    const res = await fetch(`/api/assets/${id}`);
    if (!res.ok) throw new Error("Asset not found");
    return res.json();
  }, []);

  const transcribeAsset = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/assets/${id}/transcribe`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Transcription failed");
      }
      await fetchAssets();
      return res.json();
    },
    [fetchAssets]
  );

  const analyzeAsset = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/assets/${id}/analyze`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      await fetchAssets();
      return res.json();
    },
    [fetchAssets]
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      await fetchAssets();
    },
    [fetchAssets]
  );

  return {
    assets,
    loading,
    error,
    uploadAsset,
    getAsset,
    transcribeAsset,
    analyzeAsset,
    deleteAsset,
    refresh: fetchAssets,
  };
}
