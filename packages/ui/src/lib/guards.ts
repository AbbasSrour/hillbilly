export function isNullOrUndefined(v: unknown): v is null | undefined {
  return v === null || v === undefined || typeof v === "undefined";
}
