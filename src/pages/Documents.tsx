import { DocumentsList } from "@/components/documents/documents-list";
export function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Important documents
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find reference material and open the latest available links.
        </p>
      </div>
      <DocumentsList />
    </div>
  );
}
