import { describe, expect, it } from "vitest";
import { getMoveCardPayload, getTrimmedNonEmptyText } from "./boardPageHelpers";

describe("getMoveCardPayload", () => {
  it("returns null when overId is null", () => {
    const result = getMoveCardPayload({ activeId: "a", overId: null });
    expect(result).toBeNull();
  });

  it("returns null when overId is an empty string", () => {
    const result = getMoveCardPayload({ activeId: "a", overId: "  " });
    expect(result).toBeNull();
  });

  it("coerces numeric ids to strings", () => {
    const result = getMoveCardPayload({ activeId: 1, overId: 2 });
    expect(result).toEqual({ cardId: "1", column: "2" });
  });

  it("trims ids before building payload", () => {
    const result = getMoveCardPayload({ activeId: " a ", overId: " b " });
    expect(result).toEqual({ cardId: "a", column: "b" });
  });
});

describe("getTrimmedNonEmptyText", () => {
  it("returns null for empty string", () => {
    expect(getTrimmedNonEmptyText("")).toBeNull();
  });

  it("returns null for whitespace only", () => {
    expect(getTrimmedNonEmptyText("   ")).toBeNull();
  });

  it("returns trimmed text for valid input", () => {
    expect(getTrimmedNonEmptyText("  Board A ")).toBe("Board A");
  });
});
