import { useEffect, useRef, useState } from "react";
import { Search, Mic, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { SearchMode } from "@/lib/contact-search";
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
interface Props {
  query: string;
  mode: SearchMode;
  loading: boolean;
  onChange: (query: string, mode: SearchMode) => void;
  onSubmit: () => void;
}
export function ContactsSearch({
  query,
  mode,
  loading,
  onChange,
  onSubmit,
}: Props) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const Speech =
    (window as SpeechWindow).SpeechRecognition ||
    (window as SpeechWindow).webkitSpeechRecognition;
  useEffect(
    () => () => {
      const current = recognition.current;
      if (current) {
        current.onresult = null;
        current.onerror = null;
        current.onend = null;
        current.abort();
      }
    },
    [],
  );
  function stop() {
    recognition.current?.abort();
    setListening(false);
  }
  function listen() {
    if (!Speech) return;
    setMessage("");
    const current = new Speech();
    current.lang = "en-IN";
    current.continuous = false;
    current.interimResults = false;
    current.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (text) onChange(text, "name");
      setListening(false);
    };
    current.onerror = (event) => {
      setListening(false);
      setMessage(
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow access in browser settings or type your search."
          : "Voice search could not hear you. Please try again or type your search.",
      );
    };
    current.onend = () => setListening(false);
    recognition.current = current;
    try {
      current.start();
      setListening(true);
    } catch {
      setMessage("Voice search is unavailable. Please type your search.");
    }
  }
  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-4 size-5 text-muted-foreground" />
          <label htmlFor="contact-search" className="sr-only">
            Search contacts
          </label>
          <Input
            id="contact-search"
            value={query}
            onChange={(event) => onChange(event.target.value, mode)}
            placeholder="Search by name or phone number"
            inputMode={mode === "phone" ? "tel" : "search"}
            className="h-13 rounded-xl bg-card pl-11 pr-12 text-base shadow-sm"
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 size-11"
              aria-label="Clear search"
              onClick={() => onChange("", mode)}
            >
              <X />
            </Button>
          )}
        </div>
        {Speech && (
          <Button
            type="button"
            variant="outline"
            className="size-13 rounded-xl"
            aria-label="Search by voice"
            onClick={listen}
          >
            <Mic />
          </Button>
        )}
        <Button
          type="submit"
          className="h-13 rounded-xl px-4"
          aria-label="Search now"
        >
          <Search className="size-5" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p role="status">
          {loading ? "Searching…" : "Find your people. Get in touch."}
        </p>
        <label className="flex items-center gap-2">
          Search in
          <select
            aria-label="Search mode"
            value={mode}
            onChange={(event) =>
              onChange(query, event.target.value as SearchMode)
            }
            className="min-h-10 rounded-lg border bg-card px-2 text-foreground"
          >
            <option value="auto">Auto detect</option>
            <option value="name">Name</option>
            <option value="phone">Phone</option>
          </select>
        </label>
      </div>
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <Dialog
        open={listening}
        onOpenChange={(open) => {
          if (!open) stop();
        }}
      >
        <DialogContent>
          <DialogTitle>Listening…</DialogTitle>
          <DialogDescription>
            Say a name to search the directory.
          </DialogDescription>
          <Mic className="mx-auto my-6 size-12 text-primary" />
          <Button onClick={stop}>Stop listening</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
