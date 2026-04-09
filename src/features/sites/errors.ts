// features/builder/sites/errors.ts

export class SitesError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "SitesError";
  }
}

export function toSitesError(e: unknown, fallback = "Unknown error") {
  if (e instanceof Error) return e;
  return new SitesError(fallback, e);
}
