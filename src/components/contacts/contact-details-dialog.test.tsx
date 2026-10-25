import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactDetailsDialog } from "./contact-details-dialog";
import { contactText } from "@/lib/contact-sharing";
vi.mock("@/lib/contact-card", () => ({
  createContactCard: async () =>
    new File(["png"], "contact.png", { type: "image/png" }),
  downloadContactCard: vi.fn(),
}));
const contact = {
  id: "share-test",
  name: "Example Contact",
  phone: "12345",
  lobby: "Example lobby",
};
afterEach(() => vi.unstubAllGlobals());
describe("Contact image sharing", () => {
  it("shares a prepared PNG together with the existing text only after a click", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share, canShare: () => true });
    render(
      <ContactDetailsDialog contact={contact} open onOpenChange={() => {}} />,
    );
    const button = await screen.findByRole("button", {
      name: "Share",
      exact: true,
    });
    expect(share).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: contact.name,
        text: contactText(contact),
        files: [expect.objectContaining({ type: "image/png" })],
      }),
    );
  });
  it("keeps text sharing and image download available when file sharing is unsupported", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share, canShare: () => false });
    render(
      <ContactDetailsDialog contact={contact} open onOpenChange={() => {}} />,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Share", exact: true }),
    );
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: contact.name,
        text: contactText(contact),
      }),
    );
    expect(screen.getByRole("button", { name: "Save image" })).toBeEnabled();
  });
  it("does not show a failure when the user cancels sharing", async () => {
    vi.stubGlobal("navigator", {
      share: vi
        .fn()
        .mockRejectedValue(new DOMException("Cancelled", "AbortError")),
      canShare: () => true,
    });
    render(
      <ContactDetailsDialog contact={contact} open onOpenChange={() => {}} />,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Share", exact: true }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Share", exact: true }),
      ).toBeEnabled(),
    );
    expect(screen.queryByText(/Sharing unavailable/)).not.toBeInTheDocument();
  });
});
