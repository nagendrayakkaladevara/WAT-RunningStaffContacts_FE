import { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./dialog";

describe("Responsive dialog behavior", () => {
  it("keeps an accessible modal and restores trigger focus after Escape", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open filters</DialogTrigger>
        <DialogContent mobileSheet>
          <DialogTitle>Filter contacts</DialogTitle>
          <DialogDescription>Choose filters.</DialogDescription>
          <button>Apply</button>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Open filters" });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", {
      name: "Filter contacts",
    });
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

function ControlledDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>View contact</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent mobileSheet>
          <DialogTitle>Contact</DialogTitle>
          <DialogDescription>Details</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
it("restores focus for programmatically opened contact/filter dialogs", async () => {
  render(<ControlledDialog />);
  const opener = screen.getByRole("button", { name: "View contact" });
  opener.focus();
  fireEvent.click(opener);
  await screen.findByRole("dialog", { name: "Contact" });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(opener).toHaveFocus());
});
