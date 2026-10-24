import * as React from "react";
import { Search, FileText, ExternalLink, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { documentsService } from "@/services/documents.service";
import type { Document } from "@/types/document";

export function DocumentsList() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [fileType, setFileType] = React.useState("all");
  const [sort, setSort] = React.useState("title");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch documents function
  const fetchDocuments = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentsService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents",
      );
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch documents on mount
  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const typeOf = (link: string) => {
    try {
      const path = new URL(link).pathname.toLowerCase();
      return path.endsWith(".pdf")
        ? "pdf"
        : /\.(docx?|xlsx?|pptx?)$/.test(path)
          ? "office"
          : "link";
    } catch {
      return "link";
    }
  };
  const filteredDocuments = documents
    .filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
        (fileType === "all" || typeOf(doc.link) === fileType),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0),
    );
  const safeLink = (link: string) => {
    try {
      const url = new URL(link);
      return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
    } catch {
      return undefined;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Search skeleton */}
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Documents skeleton */}
        <div className="grid gap-x-8 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b py-6">
              <Skeleton className="h-10 w-10 rounded-md shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive mb-4">{error}</p>
          <Button
            onClick={fetchDocuments}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          aria-label="Search documents"
          placeholder="Search documents by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-xl bg-card pl-9 pr-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-11 w-11 -translate-y-1/2 cursor-pointer"
            aria-label="Clear document search"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <label htmlFor="document-type" className="text-sm font-medium">
            File type
          </label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger id="document-type" className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All documents</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="office">Office files</SelectItem>
              <SelectItem value="link">Other links</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="document-sort" className="text-sm font-medium">
            Sort by
          </label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger id="document-sort" className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title A–Z</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-14 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {searchQuery ? "No documents found" : "No documents available"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Documents will appear here once they are available"}
          </p>
        </div>
      ) : (
        <div className="grid gap-x-8 sm:grid-cols-2">
          {filteredDocuments.map((doc) => (
            <a
              key={doc.id}
              href={safeLink(doc.link)}
              aria-disabled={!safeLink(doc.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 border-b py-6 transition-colors hover:bg-card"
            >
              {/* Document Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Document Title and Link */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium break-words group-hover:text-primary transition-colors">
                  {doc.title}
                </h3>
                {doc.updatedAt && !Number.isNaN(Date.parse(doc.updatedAt)) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span>
                    {safeLink(doc.link)
                      ? "Open in new tab"
                      : "Link unavailable"}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Search Results Count */}
      {searchQuery && filteredDocuments.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} document
          {documents.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
