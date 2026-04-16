"use client";

import { useEffect, useState } from "react";

export function useDashboardStats(userId: string, siteId: string) {
  const [data, setData] = useState({
    totalSites: 0,
    totalProducts: 0,
    totalPages: 0,
    productsSold: 0,
    stockRemaining: 0,
    totalStock: 0,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !siteId) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(
          `/api/admin/dashboard/stats?userId=${userId}&siteId=${siteId}`
        );
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, siteId]);

  return { data, loading };
}