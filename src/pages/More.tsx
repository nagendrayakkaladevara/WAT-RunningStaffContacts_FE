import { useState } from "react";
import { useInstallPrompt, promptInstall } from "@/lib/install-prompt";
import { Link } from "react-router-dom";
import {
  FileText,
  ChartNoAxesCombined,
  Info,
  Download,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
export function More() {
  const prompt = useInstallPrompt();
  const [installError, setInstallError] = useState("");
  async function install() {
    try {
      await promptInstall();
    } catch {
      setInstallError(
        "Use your browser menu to add the app to your home screen.",
      );
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          More from WAT Contacts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Documents, insights and app information.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        {[
          { to: "/documents", label: "Important documents", icon: FileText },
          {
            to: "/analytics",
            label: "Directory analytics",
            icon: ChartNoAxesCombined,
          },
          { to: "/about", label: "About this app", icon: Info },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-16 items-center gap-3 border-b px-5 last:border-0 hover:bg-muted"
          >
            <Icon className="size-5 text-primary" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border bg-card p-5">
        <Download className="mb-3 size-6 text-primary" />
        <h2 className="font-semibold">Keep the directory close</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add WAT Contacts to your home screen using your browser menu. On
          iPhone, use Share → Add to Home Screen.
        </p>
        {installError && (
          <p role="status" className="mt-2 text-sm">
            {installError}
          </p>
        )}
        {prompt && (
          <Button className="mt-4" onClick={install}>
            Install app
          </Button>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          An internet connection is required to load current contact details.
        </p>
      </section>
      <a
        className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"
        href="https://crewcontactsrailway.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink className="size-4" />
        Open legacy app
      </a>
      <p className="text-xs text-muted-foreground">
        Developed by Nagendra Yakkaladevara
      </p>
    </div>
  );
}
