import { useEffect, useState } from "react";
import {
  Download,
  Share2,
  Star,
  Copy,
  Phone,
  Users,
  Building2,
  BriefcaseBusiness,
  Droplet,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  cardIdentity,
  createContactCard,
  downloadContactCard,
} from "@/lib/contact-card";
import {
  contactText,
  dialNumber,
  downloadContact,
} from "@/lib/contact-sharing";
import {
  toggleFavorite,
  useContactPreferences,
} from "@/lib/contact-preferences";
import type { Contact } from "@/types/contact";
export function ContactDetailsDialog({
  contact,
  open,
  onOpenChange,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { favorites } = useContactPreferences();
  const [feedback, setFeedback] = useState("");
  const [card, setCard] = useState<{
    contact: Contact;
    file: File | null;
  } | null>(null);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    if (!open || !contact) return;
    let active = true;
    void createContactCard(contact)
      .then((file) => {
        if (active) setCard({ contact, file });
      })
      .catch(() => {
        if (active) {
          setCard({ contact, file: null });
          setFeedback(
            "Image unavailable. You can still share the contact text.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [contact, open]);
  if (!contact) return null;
  const image = card?.contact === contact ? card.file : null;
  const saved = favorites.includes(contact.id);
  async function share() {
    if (!contact) return;
    setSharing(true);
    setFeedback("");
    try {
      const data = { title: contact.name, text: contactText(contact) };
      if (image && navigator.canShare?.({ files: [image] })) {
        await navigator.share({ ...data, files: [image] });
      } else if (navigator.share) {
        await navigator.share(data);
        setFeedback(
          "Text shared. Use Save image to send the PNG card separately.",
        );
      } else {
        await navigator.clipboard.writeText(data.text);
        setFeedback(
          "Contact text copied. Use Save image to download the PNG card.",
        );
      }
    } catch (error) {
      if (!(
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        error.name === "AbortError"
      ))
        setFeedback(
          "Sharing unavailable. Use Save image or copy the phone number instead.",
        );
    } finally {
      setSharing(false);
    }
  }

  const updated = contact.updatedAt ? new Date(contact.updatedAt) : null;
  const identity = cardIdentity(contact);
  const words = identity.name.split(/[\s.]+/).filter(Boolean);
  const initials =
    `${words[0]?.[0] || ""}${words.length > 1 ? words[words.length - 1][0] : ""}`.toUpperCase();
  const number = dialNumber(contact.phone || "");
  async function copy() {
    try {
      await navigator.clipboard.writeText(contact?.phone || "");
      setFeedback("Number copied.");
    } catch {
      setFeedback("Could not copy. Select the phone number to copy it.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobileSheet
        className="contact-detail-sheet gap-5 p-5 sm:max-w-[560px] sm:p-7"
      >
        <div
          aria-hidden="true"
          className="mx-auto -mt-2 h-1.5 w-10 rounded-full bg-muted-foreground/25 sm:hidden"
        />
        <div className="flex min-h-10 items-center gap-3 pr-12 text-sm text-muted-foreground">
          <Users className="size-5" aria-hidden="true" />
          WAT Contacts
        </div>
        <div className="flex min-w-0 items-center gap-4">
          <div
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-2xl font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 sm:size-20"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-xl leading-tight sm:text-2xl">
              {identity.name}
            </DialogTitle>
            {identity.code && (
              <p className="mt-1 text-base font-medium">{identity.code}</p>
            )}
            <DialogDescription className="mt-1">
              {[contact.designation, contact.lobby]
                .filter(Boolean)
                .join(" · ") || "Contact details"}
            </DialogDescription>
          </div>
        </div>
        <section
          aria-label="Phone number and actions"
          className="min-w-0 rounded-2xl bg-blue-50/80 p-4 dark:bg-blue-950/40 sm:p-5"
        >
          <p className="section-label text-slate-500 dark:text-slate-400">
            PHONE NUMBER
          </p>
          <p className="mt-2 select-text break-all text-[clamp(1.75rem,8vw,2.75rem)] font-bold leading-tight tracking-tight text-slate-950 dark:text-blue-100">
            {contact.phone || "Not available"}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="h-11 min-w-0 gap-1.5 rounded-xl px-2"
              disabled={!number}
              onClick={copy}
            >
              <Copy className="size-4" />
              Copy
            </Button>
            {number ? (
              <Button
                asChild
                className="h-11 min-w-0 gap-1.5 rounded-xl bg-blue-600 px-2 text-white hover:bg-blue-700"
              >
                <a href={`tel:${number}`} aria-label={`Call ${identity.name}`}>
                  <Phone className="size-4" />
                  Call
                </a>
              </Button>
            ) : (
              <Button disabled className="h-11 rounded-xl">
                <Phone className="size-4" />
                Call
              </Button>
            )}
            <Button
              variant="outline"
              className="h-11 min-w-0 gap-1.5 rounded-xl px-2"
              onClick={share}
              disabled={sharing || card?.contact !== contact}
              aria-label={
                sharing
                  ? "Sharing…"
                  : card?.contact !== contact
                    ? "Preparing image…"
                    : "Share"
              }
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </section>
        <dl className="space-y-2">
          {[
            {
              label: "Lobby",
              value: contact.lobby,
              icon: Building2,
              color:
                "bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-300",
            },
            {
              label: "Designation",
              value: contact.designation,
              icon: BriefcaseBusiness,
              color:
                "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
            },
            {
              label: "Blood group",
              value: contact.bloodGroup,
              icon: Droplet,
              color:
                "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
            },
          ]
            .filter((item) => item.value)
            .map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border border-border/70 p-3"
              >
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words text-base font-semibold">
                    {label === "Blood group" ? (
                      <span className="inline-block rounded-full bg-rose-100 px-4 py-1 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          {[
            ["Address", contact.address],
            ["Notes", contact.notes],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="rounded-2xl border p-4">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                  {value}
                </dd>
              </div>
            ))}
        </dl>
        {updated && !Number.isNaN(updated.getTime()) && (
          <p className="flex items-start gap-3 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            <Info className="size-5 shrink-0" aria-hidden="true" />
            <span>
              Record updated {updated.toLocaleDateString()}. This does not
              indicate verification.
            </span>
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="h-auto min-h-11 flex-wrap gap-1.5 rounded-xl px-2 py-2 text-xs sm:text-sm"
            aria-pressed={saved}
            onClick={() => toggleFavorite(contact.id, contact.phone)}
          >
            <Star className={saved ? "fill-current" : ""} />
            {saved ? "Saved" : "Favorite"}
          </Button>
          <Button
            variant="outline"
            className="h-auto min-h-11 flex-wrap gap-1.5 rounded-xl px-2 py-2 text-xs sm:text-sm"
            onClick={() => downloadContact(contact)}
          >
            <Download />
            Save contact
          </Button>
          <Button
            variant="outline"
            className="h-auto min-h-11 flex-wrap gap-1.5 rounded-xl px-2 py-2 text-xs sm:text-sm"
            disabled={!image}
            onClick={() => image && downloadContactCard(image)}
          >
            <ImageIcon />
            Save image
          </Button>
        </div>
        <p
          role="status"
          className={feedback ? "text-xs text-muted-foreground" : "sr-only"}
        >
          {feedback}
        </p>
      </DialogContent>
    </Dialog>
  );
}
