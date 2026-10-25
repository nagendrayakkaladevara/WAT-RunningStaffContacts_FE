import { describe, expect, it } from "vitest";
import { cardIdentity } from "./contact-card";
describe("Sharing card identity", () => {
  it("separates an explicit staff code and trailing designation", () => {
    expect(
      cardIdentity({
        id: "1",
        name: "KRPU1293 PRAKASH KUMAR BEHARA LPG",
        designation: "LPG",
      }),
    ).toEqual({ code: "KRPU1293", name: "PRAKASH KUMAR BEHARA" });
  });
  it("preserves dotted initials and does not invent a staff code", () => {
    expect(cardIdentity({ id: "uuid", name: "A.K.Biswas" })).toEqual({
      code: "",
      name: "A.K.Biswas",
    });
  });
});
