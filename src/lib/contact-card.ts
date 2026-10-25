import type { Contact } from "@/types/contact";

/** Split only an explicit leading staff code; never invent one from the record ID. */
export function cardIdentity(contact: Contact) {
  let name = contact.name.trim();
  const code = name.match(/^([A-Za-z]{2,8}\d{2,})\s+/)?.[1] || "";
  if (code) name = name.slice(code.length).trim();
  const designation = contact.designation?.trim();
  if (
    designation &&
    name.toLowerCase().endsWith(` ${designation.toLowerCase()}`)
  ) {
    name = name.slice(0, -(designation.length + 1)).trim();
  }
  return { code, name: name || contact.name };
}

/** Draw the reference layout locally; contact data never leaves the device to render it. */
export async function createContactCard(contact: Contact): Promise<File> {
  await document.fonts?.load('750 86px "Geist Variable"');
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image creation unavailable");
  const { code, name } = cardIdentity(contact);
  const font = '"Geist Variable", Arial, sans-serif';
  const width = 1448;
  const innerWidth = 1220;
  // Wrap at word boundaries, including a safe fallback for long unbroken names.
  ctx.font = `750 86px ${font}`;
  const lines: string[] = [];
  let line = "";
  for (const word of name.toUpperCase().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= innerWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const char of word) {
      if (ctx.measureText(line + char).width > innerWidth && line) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line) lines.push(line);
  const extra = Math.max(0, lines.length - 1) * 94;
  canvas.width = width;
  canvas.height = 1086 + extra;
  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string,
    stroke?: string,
  ) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    weight: number,
    color: string,
    maxWidth = innerWidth,
  ) => {
    ctx.fillStyle = color;
    ctx.letterSpacing =
      size <= 40 && value === value.toUpperCase() ? "3px" : "0px";
    ctx.font = `${weight} ${size}px ${font}`;
    // Fit rather than distort long phone numbers and metadata.
    while (ctx.measureText(value).width > maxWidth && size > 16) {
      size -= 1;
      ctx.font = `${weight} ${size}px ${font}`;
    }
    ctx.fillText(value, x, y);
  };
  ctx.fillStyle = "#f7f7f7";
  ctx.fillRect(0, 0, width, canvas.height);
  ctx.shadowColor = "rgba(0,0,0,0.04)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 8;
  roundRect(53, 65, 1342, canvas.height - 125, 36, "#ffffff");
  ctx.shadowColor = "transparent";
  text("WAT CONTACTS   /   WALTAIR DIVISION", 114, 153, 30, 400, "#72798a");
  if (code) text(code.toUpperCase(), 114, 249, 40, 600, "#6b7282");
  lines.forEach((value, index) =>
    text(value, 110, 348 + index * 94, 86, 750, "#090a0c"),
  );
  const phoneY = 410 + extra;
  roundRect(95, phoneY, 1258, 288, 26, "#f0f7ff", "#dfedff");
  text("PHONE NUMBER", 149, phoneY + 75, 29, 400, "#64748b");
  text(
    contact.phone || "Not available",
    142,
    phoneY + 235,
    156,
    750,
    "#08243c",
    1158,
  );
  const labelY = 779 + extra;
  text("DESIGNATION", 119, labelY, 28, 400, "#6b7282", 350);
  text(contact.designation || "—", 119, labelY + 73, 56, 700, "#090a0c", 350);
  text("LOBBY", 565, labelY, 28, 400, "#6b7282", 330);
  text(contact.lobby || "—", 565, labelY + 73, 56, 700, "#090a0c", 330);
  text("BLOOD GROUP", 1008, labelY, 28, 400, "#6b7282", 320);
  const blood = contact.bloodGroup || "—";
  ctx.font = `700 54px ${font}`;
  const badgeWidth = Math.min(
    310,
    Math.max(144, ctx.measureText(blood).width + 64),
  );
  roundRect(1008, labelY + 17, badgeWidth, 82, 41, "#fce7ec");
  text(blood, 1040, labelY + 77, 54, 700, "#be2347", badgeWidth - 64);
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  for (const x of [501, 946]) {
    ctx.beginPath();
    ctx.moveTo(x, labelY - 27);
    ctx.lineTo(x, labelY + 96);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(106, 921 + extra);
  ctx.lineTo(1341, 921 + extra);
  ctx.stroke();
  text("Shared from WAT Contacts", 114, 978 + extra, 30, 400, "#72798a");
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
