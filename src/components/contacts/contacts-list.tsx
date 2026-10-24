import { useState } from "react";
import { Star, Users, ArrowUpRight } from "lucide-react";
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
      <div aria-label="Loading contacts" className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
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
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <Users className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No contacts found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a shorter name, another phone number, or fewer filters.
          </p>
        </div>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {contacts.map((contact) => (
          <article
            key={contact.id}
            className="rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="flex items-start gap-2">
              <button
                className="min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => {
                  recordViewed(contact.id, contact.phone);
                  setSelected(contact);
                }}
                aria-label={`View ${contact.name}'s details`}
              >
                <h3 className="flex items-start gap-2 text-base font-semibold leading-snug">
                  {contact.name}
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[contact.designation, contact.lobby]
                    .filter(Boolean)
                    .join(" · ") || "Contact"}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label={`${favorites.includes(contact.id) ? "Remove" : "Add"} ${contact.name} ${favorites.includes(contact.id) ? "from" : "to"} favorites`}
                aria-pressed={favorites.includes(contact.id)}
                onClick={() => toggleFavorite(contact.id, contact.phone)}
              >
                <Star
                  className={
                    favorites.includes(contact.id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }
                />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium tabular-nums">
                  {contact.phone || "No phone number"}
                </p>
                {contact.bloodGroup && (
                  <span className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {contact.bloodGroup}
                  </span>
                )}
              </div>
              <ContactActions
                phone={contact.phone || ""}
                contactName={contact.name}
              />
            </div>
          </article>
        ))}
      </div>
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
