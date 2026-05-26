"use client";

import { useState, useEffect, useCallback } from "react";

export type Creator = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  profile: CreatorProfile | null;
};

export type CreatorProfile = {
  id: string;
  creatorId: string;
  positioning: string;
  domain: string;
  tone: string[];
  beliefs: string[];
  cases: string[];
  commonPatterns: string[];
  avoidPhrases: string[];
  titlePreference: string;
  platformRules: Record<string, string>;
};

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreators = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/creators");
      if (!res.ok) throw new Error("Failed to fetch creators");
      const data = await res.json();
      setCreators(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const createCreator = useCallback(async (data: {
    name: string;
    positioning?: string;
    domain?: string;
    tone?: string[];
    beliefs?: string[];
    cases?: string[];
    commonPatterns?: string[];
    avoidPhrases?: string[];
    titlePreference?: string;
    platformRules?: Record<string, string>;
  }) => {
    const res = await fetch("/api/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create creator");
    await fetchCreators();
  }, [fetchCreators]);

  const updateCreator = useCallback(async (id: string, data: Partial<CreatorProfile & { name: string }>) => {
    const res = await fetch(`/api/creators/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update creator");
    await fetchCreators();
  }, [fetchCreators]);

  const deleteCreator = useCallback(async (id: string) => {
    const res = await fetch(`/api/creators/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete creator");
    await fetchCreators();
  }, [fetchCreators]);

  return { creators, loading, error, createCreator, updateCreator, deleteCreator, refresh: fetchCreators };
}
