import { DocumentsList } from "@/components/documents/documents-list";
export function Documents() {
  return (
    <div className="page-stack">
      <div>
        <h1 className="page-heading">Important documents</h1>
        <p className="page-description">
          Find reference material and open the latest available links.
        </p>
      </div>
      <DocumentsList />
    </div>
  );
}
