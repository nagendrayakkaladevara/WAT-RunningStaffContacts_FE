import { m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ContactsSearch } from "@/components/contacts/contacts-search";
import { isPhoneQuery, type SearchMode } from "@/lib/contact-search";
import { ContactsList } from "@/components/contacts/contacts-list";
import { PaginationControls } from "@/components/contacts/pagination-controls";
import { useContactsSearch } from "@/hooks/use-contacts-search";
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
    <div
      className={`mx-auto w-full max-w-3xl ${query.trim() ? "space-y-5 py-4 sm:space-y-8 sm:py-8" : "flex min-h-[calc(100svh-4.5rem)] flex-col justify-center pb-20"}`}
    >
      <h1
        className={`page-heading ${query.trim() ? "sr-only" : "mb-8 text-center"}`}
      >
        Who are you looking for?
      </h1>
      <m.section
        layout="position"
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Contact search"
        className="sticky top-18 z-20 bg-background py-2"
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
      </m.section>
      {query.trim() && (
        <m.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          aria-label="Search results"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-label">Search results</h2>
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
        </m.section>
      )}
    </div>
  );
}
