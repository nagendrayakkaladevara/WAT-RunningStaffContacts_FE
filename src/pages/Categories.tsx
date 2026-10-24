import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
  Users,
  Briefcase,
  Hotel,
  Train,
  HeartPulse,
  ArrowLeft,
} from "lucide-react";
import { contactsService } from "@/services/contacts.service";
import { ContactsList } from "@/components/contacts/contacts-list";
import { PaginationControls } from "@/components/contacts/pagination-controls";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Contact, PaginationMeta } from "@/types/contact";
const categories = [
  {
    id: "all-contacts",
    name: "All contacts",
    description: "Browse the full directory",
    icon: Users,
  },
  {
    id: "division",
    name: "Running staff",
    description: "Find contacts by lobby and designation",
    icon: Briefcase,
  },
  {
    id: "stations",
    name: "Stations",
    description: "Station contact numbers",
    icon: Train,
  },
  {
    id: "hotels",
    name: "Hotels",
    description: "Places along your route",
    icon: Hotel,
  },
  {
    id: "blood-group",
    name: "Blood groups",
    description: "Find contacts by recorded blood group",
    icon: HeartPulse,
  },
];
type Filters = { lobby: string[]; designation: string[]; bloodGroup: string[] };
const empty: Filters = { lobby: [], designation: [], bloodGroup: [] };
const fields = ["lobby", "designation", "bloodGroup"] as const;
const labels = {
  lobby: "Lobby",
  designation: "Designation",
  bloodGroup: "Blood group",
};
function FilterForm({
  initial,
  options,
  onApply,
  onClose,
}: {
  initial: Filters;
  options: Filters;
  onApply: (value: Filters) => void;
  onClose?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
        onClose?.();
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {fields.map((field) => (
          <fieldset key={field}>
            <legend className="mb-2 text-sm font-semibold">
              {labels[field]}
            </legend>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
              {options[field].length ? (
                options[field].map((value) => (
                  <label
                    key={value}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={draft[field].includes(value)}
                      onCheckedChange={(checked) =>
                        setDraft((previous) => ({
                          ...previous,
                          [field]:
                            checked === true
                              ? [...previous[field], value]
                              : previous[field].filter(
                                  (item) => item !== value,
                                ),
                        }))
                      }
                    />
                    {value}
                  </label>
                ))
              ) : (
                <p className="p-2 text-sm text-muted-foreground">
                  No options available
                </p>
              )}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setDraft(empty)}>
          Reset
        </Button>
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}
export function Categories() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const selected = categories.find((item) => item.id === category);
  const [options, setOptions] = useState<Filters>(empty);
  const [optionsError, setOptionsError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    contacts: Contact[];
    pagination: PaginationMeta | null;
    loading: boolean;
    error: string | null;
  }>({ contacts: [], pagination: null, loading: false, error: null });
  const page = Math.max(1, Number(params.get("page")) || 1);
  const applied: Filters = {
    lobby: params.getAll("lobby"),
    designation: params.getAll("designation"),
    bloodGroup: params.getAll("bloodGroup"),
  };
  const filterKey = JSON.stringify(applied);
  useEffect(() => {
    if (!category) return;
    let active = true;
    setOptionsLoading(true);
    setOptionsError("");
    Promise.allSettled([
      contactsService.getLobbies(),
      contactsService.getDesignations(),
      contactsService.getBloodGroups(),
    ]).then((results) => {
      if (!active) return;
      const values = results.map((result) =>
        result.status === "fulfilled" ? result.value : [],
      );
      setOptions({
        lobby: values[0],
        designation: values[1],
        bloodGroup: values[2],
      });
      setOptionsLoading(false);
      if (results.some((result) => result.status === "rejected"))
        setOptionsError("Some filters could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, [category, optionsAttempt]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    const filters: Filters = JSON.parse(filterKey);
    const designations =
      category === "hotels"
        ? ["HOTEL"]
        : category === "stations"
          ? ["STATION"]
          : filters.designation;
    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const response =
          filters.lobby.length ||
          designations.length ||
          filters.bloodGroup.length
            ? await contactsService.filterContacts(
                filters.bloodGroup,
                filters.lobby,
                designations,
                page,
                50,
                controller.signal,
              )
            : await contactsService.getAllContacts(page, 50, controller.signal);
        if (!controller.signal.aborted)
          setState({
            contacts: response.data,
            pagination: response.pagination,
            loading: false,
            error: null,
          });
      } catch (error) {
        if (!controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load contacts.",
          }));
      }
    }
    void load();
    return () => controller.abort();
  }, [category, selected, filterKey, page, attempt]);
  function apply(filters: Filters) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      fields.forEach((field) => {
        next.delete(field);
        filters[field].forEach((value) => next.append(field, value));
      });
      next.delete("page");
      return next;
    });
  }
  if (!selected)
    return (
      <div className="page-stack">
        <div>
          <h1 className="page-heading">Browse directory</h1>
          <p className="page-description">
            Choose a category to find the right contact.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ id, name, description, icon: Icon }) => (
            <Link
              key={id}
              to={`/categories?category=${id}`}
              className="rounded-xl"
            >
              <Card className="directory-tile gap-0">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mb-7 size-5 text-muted-foreground"
                />
                <h2 className="font-semibold">{name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  return (
    <div className="space-y-8">
      <Link
        to="/categories"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Categories
      </Link>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">{selected.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {selected.description}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 md:hidden"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal />
          Filters
        </Button>
      </div>
      {category === "blood-group" && (
        <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          Blood groups are directory records, not confirmation of donor
          availability.
        </p>
      )}
      {optionsError && (
        <div role="alert" className="text-sm text-destructive">
          {optionsError}
          <Button
            variant="ghost"
            onClick={() => setOptionsAttempt((value) => value + 1)}
          >
            Retry filters
          </Button>
        </div>
      )}
      <details className="hidden rounded-xl border bg-card p-4 md:block">
        <summary className="cursor-pointer text-sm font-medium">
          Filter contacts{optionsLoading ? " — loading options…" : ""}
        </summary>
        <div className="pt-4">
          <FilterForm
            key={filterKey}
            initial={applied}
            options={options}
            onApply={apply}
          />
        </div>
      </details>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mobile-sheet max-h-[90dvh] overflow-y-auto">
          <DialogTitle>Filter contacts</DialogTitle>
          <DialogDescription>
            {optionsLoading
              ? "Loading filter options…"
              : "Choose filters, then apply to update results."}
          </DialogDescription>
          <FilterForm
            key={filterKey}
            initial={applied}
            options={options}
            onApply={apply}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <div className="flex flex-wrap items-center gap-2">
        {fields.flatMap((field) =>
          applied[field].map((value) => (
            <button
              key={`${field}:${value}`}
              className="flex min-h-10 items-center gap-2 rounded-full border bg-card px-3 text-sm"
              onClick={() =>
                apply({
                  ...applied,
                  [field]: applied[field].filter((item) => item !== value),
                })
              }
              aria-label={`Remove ${labels[field]} ${value} filter`}
            >
              {value}
              <X className="size-3" />
            </button>
          )),
        )}
        {fields.some((field) => applied[field].length) && (
          <Button variant="ghost" onClick={() => apply(empty)}>
            Clear all
          </Button>
        )}
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {state.loading
          ? "Updating directory…"
          : state.pagination
            ? `${state.pagination.total} contacts found · Name A–Z · Page ${state.pagination.page} of ${Math.max(1, state.pagination.totalPages)}`
            : ""}
      </p>
      <ContactsList
        contacts={state.contacts}
        loading={state.loading}
        error={state.error}
        hasSearched
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {state.pagination && state.pagination.totalPages > 1 && (
        <PaginationControls
          page={state.pagination.page}
          totalPages={state.pagination.totalPages}
          loading={state.loading}
          onPageChange={(value) =>
            setParams((previous) => {
              const next = new URLSearchParams(previous);
              next.set("page", String(value));
              return next;
            })
          }
        />
      )}
    </div>
  );
}
