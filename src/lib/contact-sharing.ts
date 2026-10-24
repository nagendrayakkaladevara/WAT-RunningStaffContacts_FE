import type { Contact } from "@/types/contact";
export function dialNumber(phone: string) {
  return phone.replace(/[^+\d*#]/g, "");
}
export function contactText(contact: Contact) {
  return [contact.name, contact.designation, contact.lobby, contact.phone]
    .filter(Boolean)
    .join(" · ");
}
const escapeVCard = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function toVCard(contact: Contact) {
  return (
    [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCard(contact.name)}`,
      `N:${escapeVCard(contact.name)};;;;`,
      contact.phone ? `TEL;TYPE=VOICE:${dialNumber(contact.phone)}` : "",
      contact.designation ? `TITLE:${escapeVCard(contact.designation)}` : "",
      contact.lobby ? `ORG:${escapeVCard(contact.lobby)}` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n") + "\r\n"
  );
}
export function downloadContact(contact: Contact) {
  const url = URL.createObjectURL(
    new Blob([toVCard(contact)], { type: "text/vcard;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${contact.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "contact"}.vcf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
