"use client";

import { useState, useEffect, useCallback } from "react";

export type Draft = {
  id: string;
  taskId: string;
  platform: string;
  title: string;
  content: string;
  notes: string[];
  voiceAlignment: {
    matched_traits: string[];
    conflicts: string[];
    suggestions: string[];
  } | null;
  status: string;
  createdAt: number;
};

export type Feedback = {
  id: string;
  taskId: string;
  draftId: string | null;
  scope: "current_draft" | "creator_profile";
  tags: string[];
  message: string;
  createdAt: number;
};

export type Task = {
  id: string;
  assetId: string;
  creatorId: string | null;
  title: string;
  platforms: string[];
  status: string;
  createdAt: number;
  updatedAt: number;
  creatorName?: string | null;
  asset?: {
    id: string;
    title: string;
    type: string;
    status: string;
    transcript?: { id: string; fullText: string } | null;
    analysis?: {
      topic: string;
      summary: string;
      corePoints: unknown[];
      cases: string[];
      quotes: string[];
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
  } | null;
  creatorProfile?: {
    id: string;
    name: string;
    positioning: string;
    tone: string[];
    avoidPhrases: string[];
  } | null;
  drafts?: Draft[];
  feedback?: Feedback[];
};

export function useTasks(filters?: { creatorId?: string; status?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.creatorId) params.set("creator_id", filters.creatorId);
      if (filters?.status) params.set("status", filters.status);

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters?.creatorId, filters?.status]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refresh: fetchTasks };
}

export function useTask(taskId: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Task not found");
      const data = await res.json();
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const createTask = useCallback(async (params: { assetId: string; creatorId?: string; title?: string; platforms?: string[] }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const data = await res.json();
    return data.taskId as string;
  }, []);

  const generateDrafts = useCallback(async () => {
    if (!taskId) return;
    const res = await fetch(`/api/tasks/${taskId}/generate`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Generation failed");
    }
    const data = await res.json();
    await fetchTask();
    return data.drafts as Draft[];
  }, [taskId, fetchTask]);

  const submitFeedback = useCallback(async (params: {
    tags?: string[];
    message?: string;
    scope?: "current_draft" | "creator_profile";
    draftId?: string;
  }) => {
    if (!taskId) return;
    const res = await fetch(`/api/tasks/${taskId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    await fetchTask();
  }, [taskId, fetchTask]);

  return { task, loading, error, createTask, generateDrafts, submitFeedback, refresh: fetchTask };
}
