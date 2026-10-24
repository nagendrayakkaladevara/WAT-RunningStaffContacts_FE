import { useEffect, useRef, useState } from "react";
import { Search, Mic, X, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
        className="rounded-xl border border-[var(--border-hover)] bg-card p-3 sm:p-4"
      >
        <div className="relative min-w-0">
          <label htmlFor="contact-search" className="sr-only">
            Search contacts
          </label>
          <Input
            id="contact-search"
            value={query}
            onChange={(event) => onChange(event.target.value, mode)}
            placeholder="Search a name or phone"
            inputMode={mode === "phone" ? "tel" : "search"}
            className="h-14 border-0 bg-transparent px-2 pr-12 text-base shadow-none dark:bg-transparent"
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute bottom-1.5 right-1.5 size-11"
              aria-label="Clear search"
              onClick={() => onChange("", mode)}
            >
              <X />
            </Button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Select
            value={mode}
            onValueChange={(value) => onChange(query, value as SearchMode)}
          >
            <SelectTrigger
              aria-label="Search mode"
              className="min-h-11 border-0 bg-transparent px-2 text-xs text-muted-foreground shadow-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto detect</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex shrink-0 items-center gap-1">
            {Speech && (
              <Button
                type="button"
                variant="ghost"
                className="size-11 rounded-full text-muted-foreground"
                aria-label="Search by voice"
                onClick={listen}
              >
                <Mic />
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              className="size-11 rounded-full"
              aria-label="Search now"
            >
              {loading ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </form>
      <p role="status" className="sr-only">
        {loading
          ? "Searching…"
          : "Search by name or phone. Results update as you type."}
      </p>
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
