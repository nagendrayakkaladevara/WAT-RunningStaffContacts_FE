import { m } from "motion/react";
import { useState } from "react";
import { Star, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactActions } from "./contact-actions";
import { ContactDetailsDialog } from "./contact-details-dialog";
import {
  recordViewed,
  toggleFavorite,
  useContactPreferences,
} from "@/lib/contact-preferences";
import type { Contact } from "@/types/contact";
interface Props {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  hasSearched?: boolean;
  onRetry?: () => void;
}
export function ContactsList({
  contacts,
  loading,
  error,
  hasSearched = false,
  onRetry,
}: Props) {
  const [selected, setSelected] = useState<Contact | null>(null);
  const { favorites } = useContactPreferences();
  if (loading && !contacts.length)
    return (
      <div aria-label="Loading contacts" className="divide-y border-y">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="my-6 h-20 rounded-lg" />
        ))}
      </div>
    );
  return (
    <div aria-busy={loading} className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="text-sm">{error}</p>
          {onRetry && (
            <Button variant="outline" className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
      {loading && (
        <p role="status" className="text-sm text-muted-foreground">
          Updating contacts…
        </p>
      )}
      {!loading && !error && !contacts.length && hasSearched && (
        <div className="rounded-xl bg-card px-6 py-14 text-center">
          <Users className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No contacts found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a shorter name, another phone number, or fewer filters.
          </p>
        </div>
      )}
      {contacts.length > 0 && (
        <div className="border-y">
          {contacts.map((contact, index) => (
            <m.article
              key={contact.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, delay: Math.min(index, 5) * 0.025 }}
              className="contact-row"
            >
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
                >
                  {contact.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <button
                  className="min-h-11 min-w-0 flex-1 rounded-lg text-left"
                  onClick={() => {
                    recordViewed(contact.id, contact.phone);
                    setSelected(contact);
                  }}
                  aria-label={`View ${contact.name}'s details`}
                >
                  <h3 className="flex items-start gap-2 text-[15px] font-medium leading-relaxed">
                    <span className="min-w-0 break-words">{contact.name}</span>
                    <ChevronRight
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-muted-foreground"
                    />
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {[contact.designation, contact.lobby]
                      .filter(Boolean)
                      .join(" · ") || "Contact"}
                  </p>
                  <p className="mt-2 text-sm tabular-nums">
                    {contact.phone || "No phone number"}
                    {contact.bloodGroup && (
                      <span className="ml-3 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {contact.bloodGroup}
                      </span>
                    )}
                  </p>
                </button>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label={`${favorites.includes(contact.id) ? "Remove" : "Add"} ${contact.name} ${favorites.includes(contact.id) ? "from" : "to"} favorites`}
                  aria-pressed={favorites.includes(contact.id)}
                  onClick={() => toggleFavorite(contact.id, contact.phone)}
                >
                  <Star
                    className={
                      favorites.includes(contact.id)
                        ? "fill-foreground text-foreground"
                        : ""
                    }
                  />
                </Button>
                <ContactActions
                  phone={contact.phone || ""}
                  contactName={contact.name}
                />
              </div>
            </m.article>
          ))}
        </div>
      )}
      <ContactDetailsDialog
        key={selected?.id || "closed"}
        contact={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
