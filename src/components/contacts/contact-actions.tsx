import { useState } from "react";
import { Phone, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dialNumber } from "@/lib/contact-sharing";
export function ContactActions({
  phone,
  contactName,
  onCopy,
}: {
  phone: string;
  contactName: string;
  onCopy?: () => void;
}) {
  const [message, setMessage] = useState("");
  const number = dialNumber(phone || "");
  async function copy() {
    try {
      await navigator.clipboard.writeText(phone);
      setMessage("Number copied");
      onCopy?.();
    } catch {
      setMessage("Could not copy. Select the number in contact details.");
    }
  }
  if (!number)
    return (
      <span className="text-xs text-muted-foreground">No phone number</span>
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-11"
        aria-label={`Copy ${contactName}'s number`}
        onClick={copy}
      >
        <Copy className="size-4" />
      </Button>
      <Button asChild className="h-11 px-4">
        <a href={`tel:${number}`} aria-label={`Call ${contactName}`}>
          <Phone className="size-4" />
          Call
        </a>
      </Button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </div>
  );
}
