import { Search, Star, FileText, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Find the right contact",
    description: "Search by name or phone, or browse by lobby and designation.",
  },
  {
    icon: Star,
    title: "Keep people close",
    description:
      "Save favorites on this device and revisit recently opened contacts.",
  },
  {
    icon: FileText,
    title: "Useful references",
    description: "Find railway documents and open their available links.",
  },
  {
    icon: HeartPulse,
    title: "Browse blood groups",
    description:
      "Find recorded blood groups. Always confirm availability directly.",
  },
];
export function About() {
  return (
    <div className="page-stack">
      <header>
        <p className="section-label mb-4">East Coast Railway</p>
        <h1 className="page-heading">
          A directory for your everyday journeys.
        </h1>
        <p className="page-description">
          WAT Contacts brings running staff, stations and useful places across
          the Waltair Division together in one searchable directory.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Find a contact</Link>
        </Button>
      </header>
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="section-label mb-5">
          Made to be useful
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="gap-0 p-6">
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className="mb-6 size-5 text-muted-foreground"
              />
              <h3 className="text-[15px] font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>
      <section
        className="max-w-xl border-t pt-8"
        aria-labelledby="credits-heading"
      >
        <h2 id="credits-heading" className="section-label">
          Behind the directory
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed">
          Developed by Nagendra Yakkaladevara.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thank you to Y. S. Prabhu Garu for providing the data and for the
          continued support throughout development.
        </p>
      </section>
    </div>
  );
}
