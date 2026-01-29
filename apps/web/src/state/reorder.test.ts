import { describe, expect, it } from "vitest";
import type { Card } from "../types/card";
import {
  buildReorderPayload,
  getNextCardsAfterDrag,
  normalizeOrders,
} from "./reorder";

describe("normalizeOrders", () => {
  it("returns empty array for empty input", () => {
    const result = normalizeOrders([]);
    expect(result).toEqual([]);
  });

  it("recalculates orders within each column", () => {
    const cards: Card[] = [
      { _id: "c1", title: "A", column: "todo", order: 3 },
      { _id: "c2", title: "B", column: "todo", order: 1 },
      { _id: "c3", title: "C", column: "done", order: 10 },
      { _id: "c4", title: "D", column: "done", order: 5 },
    ];

    const result = normalizeOrders(cards);

    expect(result).toEqual([
      { _id: "c2", title: "B", column: "todo", order: 0 },
      { _id: "c1", title: "A", column: "todo", order: 1 },
      { _id: "c4", title: "D", column: "done", order: 0 },
      { _id: "c3", title: "C", column: "done", order: 1 },
    ]);
  });

  it("keeps columns in fixed order", () => {
    const cards: Card[] = [
      { _id: "c1", title: "A", column: "done", order: 0 },
      { _id: "c2", title: "B", column: "todo", order: 0 },
      { _id: "c3", title: "C", column: "in_progress", order: 0 },
    ];

    const result = normalizeOrders(cards);

    expect(result.map((c) => c._id)).toEqual(["c2", "c3", "c1"]);
  });
});

describe("buildReorderPayload", () => {
  it("returns empty payload for empty input", () => {
    const result = buildReorderPayload([]);
    expect(result).toEqual([]);
  });

  it("sorts by column then order", () => {
    const cards: Card[] = [
      { _id: "c1", title: "A", column: "done", order: 1 },
      { _id: "c2", title: "B", column: "todo", order: 2 },
      { _id: "c3", title: "C", column: "todo", order: 0 },
      { _id: "c4", title: "D", column: "in_progress", order: 3 },
    ];

    const result = buildReorderPayload(cards);

    expect(result).toEqual([
      { cardId: "c3", column: "todo" },
      { cardId: "c2", column: "todo" },
      { cardId: "c4", column: "in_progress" },
      { cardId: "c1", column: "done" },
    ]);
  });

  it("preserves column value in payload", () => {
    const cards: Card[] = [
      { _id: "c1", title: "A", column: "todo", order: 0 },
      { _id: "c2", title: "B", column: "done", order: 0 },
    ];

    const result = buildReorderPayload(cards);

    expect(result).toEqual([
      { cardId: "c1", column: "todo" },
      { cardId: "c2", column: "done" },
    ]);
  });
});

describe("getNextCardsAfterDrag", () => {
  it("returns the same array when active id is missing", () => {
    const cards: Card[] = [{ _id: "c1", title: "A", column: "todo", order: 0 }];

    const result = getNextCardsAfterDrag(cards, "missing", "todo");

    expect(result).toBe(cards);
  });

  it("returns the same array when over id is unknown", () => {
    const cards: Card[] = [{ _id: "c1", title: "A", column: "todo", order: 0 }];

    const result = getNextCardsAfterDrag(cards, "c1", "unknown");

    expect(result).toBe(cards);
  });

  it("moves a card to the end when dropped on its column", () => {
    const cards: Card[] = [
      { _id: "a", title: "A", column: "todo", order: 0 },
      { _id: "b", title: "B", column: "todo", order: 1 },
    ];

    const result = getNextCardsAfterDrag(cards, "a", "todo");

    const byId = new Map(result.map((card) => [card._id, card]));

    expect(byId.get("a")?.order).toBe(1);
    expect(byId.get("b")?.order).toBe(0);
  });

  it("reorders within the same column when dropped on a card", () => {
    const cards: Card[] = [
      { _id: "a", title: "A", column: "todo", order: 0 },
      { _id: "b", title: "B", column: "todo", order: 1 },
      { _id: "c", title: "C", column: "todo", order: 2 },
    ];

    const result = getNextCardsAfterDrag(cards, "c", "a");

    const byId = new Map(result.map((card) => [card._id, card]));

    expect(byId.get("c")?.order).toBe(0);
    expect(byId.get("a")?.order).toBe(1);
    expect(byId.get("b")?.order).toBe(2);
  });

  it("moves a card to another column before the target card", () => {
    const cards: Card[] = [
      { _id: "a", title: "A", column: "todo", order: 0 },
      { _id: "b", title: "B", column: "todo", order: 1 },
      { _id: "c", title: "C", column: "in_progress", order: 0 },
    ];

    const result = getNextCardsAfterDrag(cards, "b", "c");

    const byId = new Map(result.map((card) => [card._id, card]));

    expect(byId.get("a")?.column).toBe("todo");
    expect(byId.get("a")?.order).toBe(0);
    expect(byId.get("b")?.column).toBe("in_progress");
    expect(byId.get("b")?.order).toBe(0);
    expect(byId.get("c")?.column).toBe("in_progress");
    expect(byId.get("c")?.order).toBe(1);
  });
});
