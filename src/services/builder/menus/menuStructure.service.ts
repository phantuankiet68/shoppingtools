async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const res = await fetch(`/api/admin/menu-items/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await safeText(res);
    throw new Error(t || "Delete failed");
  }
}
