import { SavedContacts } from "@/components/contacts/saved-contacts";
export function Favorites() {
  return (
    <div className="page-stack">
      <div>
        <h1 className="page-heading">Your contacts</h1>
        <p className="page-description">
          Your favorites and recently viewed contacts, saved on this device.
        </p>
      </div>
      <SavedContacts kind="favorites" />
      <SavedContacts kind="recent" />
    </div>
  );
}
