// src/services/http.ts
export class HttpError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

type HttpOptions = RequestInit & {
  parseJson?: boolean;
};

export async function http<T = any>(url: string, options: HttpOptions = {}): Promise<T> {
  const { parseJson = true, headers, ...init } = options;

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      ...(headers ?? {}),
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let data: any = null;
  if (parseJson && isJson) {
    data = await res.json().catch(() => null);
  } else if (parseJson) {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message = (data && typeof data === "object" ? data.message : null) || res.statusText || "Request failed";
    throw new HttpError(message, res.status, data);
  }

  return data as T;
}
