import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Clock3 } from "lucide-react";
import { useContactPreferences, clearRecent } from "@/lib/contact-preferences";
import { contactsService } from "@/services/contacts.service";
import { ContactsList } from "./contacts-list";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/contact";
export function SavedContacts({
  kind,
  compact = false,
}: {
  kind: "favorites" | "recent";
  compact?: boolean;
}) {
  const preferences = useContactPreferences();
  const ids = preferences[kind];
  const lookupKey = JSON.stringify(
    ids.map((id) => [id, preferences.phones[id]]),
  );
  const [state, setState] = useState<{
    contacts: Contact[];
    loading: boolean;
    error: string | null;
  }>({ contacts: [], loading: false, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const lookups: [string, string][] = JSON.parse(lookupKey);
    const visible = compact ? lookups.slice(0, 4) : lookups;
    // Refresh via phone search; never treat an old ID or reassigned phone as a match.
    async function load() {
      setState({ contacts: [], loading: visible.length > 0, error: null });
      const results = await Promise.allSettled(
        visible.map(async ([id, phone]) => {
          if (!phone) throw new Error("Missing saved lookup");
          const response = await contactsService.searchByPhone(
            phone,
            controller.signal,
          );
          const contact = response.data.find((item) => item.id === id);
          if (!contact) throw new Error("Contact no longer available");
          return contact;
        }),
      );
      if (controller.signal.aborted) return;
      setState({
        contacts: results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        ),
        loading: false,
        error: results.some((result) => result.status === "rejected")
          ? "Some saved contacts could not be loaded. They may be unavailable or the connection was interrupted."
          : null,
      });
    }
    void load();
    return () => controller.abort();
  }, [lookupKey, compact, attempt]);
  const title = kind === "favorites" ? "Favorites" : "Recently viewed";
  const Icon = kind === "favorites" ? Star : Clock3;
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-label flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h2>
        {kind === "recent" && ids.length > 0 ? (
          <Button variant="ghost" onClick={clearRecent}>
            Clear history
          </Button>
        ) : compact && ids.length > 4 ? (
          <Link className="text-sm text-primary" to="/favorites">
            View all
          </Link>
        ) : null}
      </div>
      {!ids.length ? (
        <div className="border-t py-6 text-sm leading-relaxed text-muted-foreground">
          {kind === "favorites"
            ? "Tap the star on a contact to keep them close."
            : "Contacts you open will appear here. This is not a call history."}
        </div>
      ) : (
        <ContactsList
          {...state}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      )}
    </section>
  );
}
