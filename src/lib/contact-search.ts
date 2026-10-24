export type SearchMode = "auto" | "name" | "phone";
export function isPhoneQuery(query: string, mode: SearchMode) {
  return (
    mode === "phone" ||
    (mode === "auto" && /^[+\d][\d\s()+-]*$/.test(query.trim()))
  );
}
