import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Home } from "./Home";
import { contactsService } from "@/services/contacts.service";
vi.mock("@/services/contacts.service");
vi.mock("@/components/contacts/saved-contacts", () => ({
  SavedContacts: () => null,
}));
const response = {
  success: true,
  data: [{ id: "1", name: "Test Person", phone: "123" }],
  pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
};
describe("Directory search interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(contactsService.searchByName).mockResolvedValue(response);
    vi.mocked(contactsService.searchByPhone).mockResolvedValue(response);
  });
  afterEach(() => vi.useRealTimers());
  it("debounces rapid typing and keeps search editable while loading", async () => {
    vi.mocked(contactsService.searchByName).mockReturnValue(
      new Promise(() => {}),
    );
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const input = screen.getByRole("textbox", { name: "Search contacts" });
    fireEvent.change(input, { target: { value: "Ra" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    fireEvent.change(input, { target: { value: "Ravi" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(contactsService.searchByName).toHaveBeenCalledTimes(1);
    expect(contactsService.searchByName).toHaveBeenCalledWith(
      "Ravi",
      1,
      50,
      expect.any(AbortSignal),
    );
    expect(input).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(screen.queryByText("Searching…")).not.toBeInTheDocument();
  });
  it("switches mode with the same query and submits immediately", async () => {
    render(
      <MemoryRouter initialEntries={["/?q=123&mode=name"]}>
        <Home />
      </MemoryRouter>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(contactsService.searchByName).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Search mode" }), {
      key: "ArrowDown",
    });
    fireEvent.click(screen.getByRole("option", { name: "Phone" }));
    fireEvent.click(screen.getByRole("button", { name: "Search now" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(contactsService.searchByPhone).toHaveBeenCalledWith(
      "123",
      expect.any(AbortSignal),
    );
  });
});
