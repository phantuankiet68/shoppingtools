"use client";

import { useEffect, useState } from "react";

export function useTaskCalendar() {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        "/api/platform/tasks/calendar",
        {
          cache: "no-store",
        }
      );

      const result =
        await res.json();

      setEvents(
        result.data ?? []
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    refresh: fetchEvents,
  };
}