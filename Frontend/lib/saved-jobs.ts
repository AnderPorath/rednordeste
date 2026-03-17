"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "red-nordeste-saved-jobs";

function getStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSavedIds(getStoredIds());
    setIsReady(true);
  }, []);

  const persist = useCallback((ids: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setSavedIds(ids);
  }, []);

  const add = useCallback(
    (jobId: string) => {
      const next = savedIds.includes(jobId) ? savedIds : [...savedIds, jobId];
      persist(next);
    },
    [savedIds, persist]
  );

  const remove = useCallback(
    (jobId: string) => {
      persist(savedIds.filter((id) => id !== jobId));
    },
    [savedIds, persist]
  );

  const toggle = useCallback(
    (jobId: string) => {
      if (savedIds.includes(jobId)) remove(jobId);
      else add(jobId);
    },
    [savedIds, add, remove]
  );

  const isSaved = useCallback(
    (jobId: string) => savedIds.includes(jobId),
    [savedIds]
  );

  return { savedIds, isReady, isSaved, add, remove, toggle };
}
