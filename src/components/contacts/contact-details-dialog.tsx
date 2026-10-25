import { useEffect, useState } from "react";
import { Download, Share2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createContactCard, downloadContactCard } from "@/lib/contact-card";
import { ContactActions } from "./contact-actions";
import { contactText, downloadContact } from "@/lib/contact-sharing";
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
      if (!(typeof error === "object" && error !== null && "name" in error && error.name === "AbortError"))
        setFeedback(
          "Sharing unavailable. Use Save image or copy the phone number instead.",
        );
    } finally {
      setSharing(false);
    }
  }

  const updated = contact.updatedAt ? new Date(contact.updatedAt) : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet className=" sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl leading-tight">
            {contact.name}
          </DialogTitle>
          <DialogDescription>
            {[contact.designation, contact.lobby].filter(Boolean).join(" · ") ||
              "Contact details"}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-card p-5">
          <p className="section-label">PHONE NUMBER</p>
          <p className="mt-1 break-all text-2xl font-medium tracking-tight">
            {contact.phone || "Not available"}
          </p>
          <div className="mt-4">
            <ContactActions
              phone={contact.phone || ""}
              contactName={contact.name}
            />
          </div>
        </div>
        <dl className="space-y-3">
          {[
            ["Lobby", contact.lobby],
            ["Designation", contact.designation],
            ["Blood group", contact.bloodGroup],
            ["Address", contact.address],
            ["Notes", contact.notes],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="border-b pb-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                  {value}
                </dd>
              </div>
            ))}
        </dl>
        {updated && !Number.isNaN(updated.getTime()) && (
          <p className="text-xs text-muted-foreground">
            Record updated {updated.toLocaleDateString()}. This does not
            indicate verification.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-11"
            aria-pressed={saved}
            onClick={() => toggleFavorite(contact.id, contact.phone)}
          >
            <Star className={saved ? "fill-current" : ""} />
            {saved ? "Saved" : "Favorite"}
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={share}
            disabled={sharing || card?.contact !== contact}
          >
            <Share2 />
            {sharing
              ? "Sharing…"
              : card?.contact !== contact
                ? "Preparing image…"
                : "Share"}
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => downloadContact(contact)}
          >
            <Download />
            Save contact
          </Button>
          {image && (
            <Button
              variant="ghost"
              className="h-11"
              onClick={() => downloadContactCard(image)}
            >
              <Download />
              Save image
            </Button>
          )}
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {feedback}
        </p>
      </DialogContent>
    </Dialog>
  );
}
