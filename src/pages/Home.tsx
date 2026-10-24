import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Train, Hotel, HeartPulse, ArrowRight } from "lucide-react";
import { ContactsSearch } from "@/components/contacts/contacts-search";
import { isPhoneQuery, type SearchMode } from "@/lib/contact-search";
import { ContactsList } from "@/components/contacts/contacts-list";
import { PaginationControls } from "@/components/contacts/pagination-controls";
import { SavedContacts } from "@/components/contacts/saved-contacts";
import { useContactsSearch } from "@/hooks/use-contacts-search";
const shortcuts = [
  { id: "division", title: "Running staff", icon: Briefcase },
  { id: "stations", title: "Stations", icon: Train },
  { id: "hotels", title: "Hotels", icon: Hotel },
  { id: "blood-group", title: "Blood groups", icon: HeartPulse },
];
export function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const mode: SearchMode =
    params.get("mode") === "name"
      ? "name"
      : params.get("mode") === "phone"
        ? "phone"
        : "auto";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [revision, setRevision] = useState(0);
  const immediate = useRef(false);
  const [submittedKey, setSubmittedKey] = useState("");
  const searchKey = JSON.stringify([query, mode, page, revision]);
  const {
    contacts,
    loading,
    error,
    pagination,
    searchByName,
    searchByPhone,
    clearResults,
  } = useContactsSearch();
  const busy = !!query.trim() && (loading || submittedKey !== searchKey);
  useEffect(() => {
    if (!query.trim()) {
      clearResults();
      return;
    }
    const timer = setTimeout(
      () => {
        setSubmittedKey(searchKey);
        if (isPhoneQuery(query, mode)) void searchByPhone(query.trim());
        else void searchByName(query.trim(), page);
      },
      immediate.current ? 0 : 400,
    );
    immediate.current = false;
    return () => {
      clearTimeout(timer);
      clearResults();
    };
  }, [
    query,
    mode,
    page,
    revision,
    searchKey,
    searchByName,
    searchByPhone,
    clearResults,
  ]);
  function change(value: string, nextMode: SearchMode) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set("q", value);
        else next.delete("q");
        next.set("mode", nextMode);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  }
  return (
    <div className="space-y-7">
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          East Coast Railway · Waltair Division
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Who are you looking for?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Running staff, stations and places along your route.
        </p>
      </section>
      <section
        aria-label="Contact search"
        className="sticky top-16 z-20 -mx-1 bg-background/95 px-1 py-2 backdrop-blur"
      >
        <ContactsSearch
          query={query}
          mode={mode}
          loading={busy}
          onChange={change}
          onSubmit={() => {
            immediate.current = true;
            setRevision((value) => value + 1);
          }}
        />
      </section>
      {!query.trim() ? (
        <>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Browse directory</h2>
              <Link
                to="/categories"
                className="flex min-h-11 items-center gap-1 text-sm text-primary"
              >
                View all <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shortcuts.map(({ id, title, icon: Icon }) => (
                <Link
                  key={id}
                  to={`/categories?category=${id}`}
                  className="rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-medium">{title}</span>
                </Link>
              ))}
            </div>
          </section>
          <SavedContacts kind="favorites" compact />
          <SavedContacts kind="recent" compact />
        </>
      ) : (
        <section aria-label="Search results">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Search results</h2>
            {pagination && (
              <p role="status" className="text-sm text-muted-foreground">
                {pagination.total} contacts found
              </p>
            )}
          </div>
          <ContactsList
            contacts={contacts}
            loading={busy}
            error={error}
            hasSearched
            onRetry={() => {
              immediate.current = true;
              setRevision((value) => value + 1);
            }}
          />
          {pagination &&
            pagination.totalPages > 1 &&
            !isPhoneQuery(query, mode) && (
              <div className="mt-5">
                <PaginationControls
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  loading={busy}
                  onPageChange={(value) => {
                    immediate.current = true;
                    setParams((previous) => {
                      const next = new URLSearchParams(previous);
                      next.set("page", String(value));
                      return next;
                    });
                  }}
                />
              </div>
            )}
        </section>
      )}
    </div>
  );
}
