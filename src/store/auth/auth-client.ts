type ApiError = Error & { status?: number };

async function parseJson(res: Response) {
  const data = await res.json().catch(() => null);
  return data;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await parseJson(res);

  if (!res.ok) {
    const err = new Error(data?.message || "Request failed") as ApiError;
    err.status = res.status;
    throw err;
  }

  return data as T;
}

export async function loginUser(payload: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse<{
    message: string;
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      image?: string | null;
    };
  }>(res);
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse<{
    message: string;
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      createdAt: string;
    };
  }>(res);
}

export async function logoutUser() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res);
}

export async function getMe() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return handleResponse<{
    authenticated: boolean;
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      image?: string | null;
    } | null;
  }>(res);
}
