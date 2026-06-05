"use client";

import { useEffect, useState } from "react";

import { getTasks } from "@/features/tasks/task.service";

export function useTasks() {
  const [tasks, setTasks] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchTasks = async () => {
    try {
      const response =
        await getTasks();

      setTasks(response.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    refresh: fetchTasks,
  };
}