import type { Contact } from "@/types/contact";

/** Render locally: no contact details or images are sent to another service. */
export async function createContactCard(contact: Contact): Promise<File> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image creation unavailable");
  const width = 1080;
  const inset = 80;
  const font = "Arial, sans-serif";
  ctx.font = `600 52px ${font}`;
  const lines: string[] = [];
  let line = "";
  for (const character of contact.name) {
    if (ctx.measureText(line + character).width > width - inset * 2 && line) {
      lines.push(line.trim());
      line = "";
    }
    line += character;
  }
  if (line) lines.push(line.trim());
  const details = [
    ["PHONE NUMBER", contact.phone || "Not available"],
    ["DESIGNATION", contact.designation],
    ["LOBBY", contact.lobby],
    ["BLOOD GROUP", contact.bloodGroup],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  canvas.width = width;
  canvas.height = 300 + lines.length * 66 + details.length * 120;
  ctx.fillStyle = "#f5f5f4";
  ctx.fillRect(0, 0, width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(32, 32, width - 64, canvas.height - 64, 32);
  ctx.fill();
  ctx.fillStyle = "#737373";
  ctx.font = `24px ${font}`;
  ctx.fillText("WAT CONTACTS  /  WALTAIR DIVISION", inset, 108);
  ctx.fillStyle = "#171717";
  ctx.font = `600 52px ${font}`;
  let y = 192;
  for (const nameLine of lines) {
    ctx.fillText(nameLine, inset, y);
    y += 66;
  }
  y += 32;
  for (const [label, value] of details) {
    ctx.fillStyle = "#737373";
    ctx.font = `22px ${font}`;
    ctx.fillText(label, inset, y);
    ctx.fillStyle = label === "BLOOD GROUP" ? "#be123c" : "#171717";
    ctx.font = `500 38px ${font}`;
    ctx.fillText(value, inset, y + 48, width - inset * 2);
    y += 120;
  }
  ctx.fillStyle = "#737373";
  ctx.font = `20px ${font}`;
  ctx.fillText("Shared from WAT Contacts", inset, canvas.height - 72);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error("Could not create image")),
      "image/png",
    ),
  );
  return new File(
    [blob],
    `${contact.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "contact"}.png`,
    { type: "image/png" },
  );
}

export function downloadContactCard(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
