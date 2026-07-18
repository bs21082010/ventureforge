"use client";

import { useState, useEffect, useCallback } from "react";
import type { DataSource, DataPoint, RegionalData } from "@/types/data";

export function useDataSources() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/data");
      if (!response.ok) throw new Error("Failed to fetch data sources");
      const data = await response.json();
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const refreshSource = useCallback(async (sourceId: string) => {
    try {
      const response = await fetch(`/api/data?source=${sourceId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to refresh");
      await fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    }
  }, [fetchSources]);

  return { sources, loading, error, refresh: fetchSources, refreshSource };
}

export function useRegionalData(regionId: string | null) {
  const [data, setData] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!regionId) return;
    setLoading(true);
    fetch(`/api/data?region=${regionId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [regionId]);

  return { data, loading };
}
