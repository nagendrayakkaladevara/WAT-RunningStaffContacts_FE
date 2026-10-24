import { SavedContacts } from "@/components/contacts/saved-contacts";
export function Favorites() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your contacts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Favorite and recent contact IDs and lookup numbers are saved on this
          device. Contact details are refreshed when you open this page.
        </p>
      </div>
      <SavedContacts kind="favorites" />
      <SavedContacts kind="recent" />
    </div>
  );
}
