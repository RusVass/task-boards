import { describe, expect, it } from "vitest";
import { boardReducer } from "./BoardContext";

type Card = {
  _id: string;
  title: string;
  description?: string;
  column: "todo" | "in_progress" | "done";
  order: number;
};

const baseBoard = { name: "Board", publicId: "b1" };

const createCard = (overrides: Partial<Card> = {}): Card => {
  return {
    _id: "c1",
    title: "Title",
    description: "Desc",
    column: "todo",
    order: 0,
    ...overrides,
  };
};

describe("boardReducer", () => {
  it("updates a single card on UPDATE_CARD", () => {
    const state = {
      board: baseBoard,
      cards: [createCard(), createCard({ _id: "c2" })],
      loading: false,
    };

    const next = boardReducer(state, {
      type: "UPDATE_CARD",
      payload: { card: createCard({ _id: "c2", title: "Next" }) },
    });

    expect(next.cards[1]?.title).toBe("Next");
    expect(next.cards[0]?.title).toBe("Title");
  });

  it("removes a card on DELETE_CARD", () => {
    const state = {
      board: baseBoard,
      cards: [createCard(), createCard({ _id: "c2" })],
      loading: false,
    };

    const next = boardReducer(state, {
      type: "DELETE_CARD",
      payload: { cardId: "c1" },
    });

    expect(next.cards).toHaveLength(1);
    expect(next.cards[0]?._id).toBe("c2");
  });

  it("keeps cards when DELETE_CARD id does not exist", () => {
    const state = {
      board: baseBoard,
      cards: [createCard()],
      loading: false,
    };

    const next = boardReducer(state, {
      type: "DELETE_CARD",
      payload: { cardId: "missing" },
    });

    expect(next.cards).toHaveLength(1);
    expect(next.cards[0]?._id).toBe("c1");
  });

  it("changes column on MOVE_CARD", () => {
    const state = {
      board: baseBoard,
      cards: [createCard()],
      loading: false,
    };

    const next = boardReducer(state, {
      type: "MOVE_CARD",
      payload: { cardId: "c1", column: "done" },
    });

    expect(next.cards[0]?.column).toBe("done");
  });

  it("updates board name on UPDATE_BOARD_NAME", () => {
    const state = {
      board: baseBoard,
      cards: [],
      loading: false,
    };

    const next = boardReducer(state, {
      type: "UPDATE_BOARD_NAME",
      payload: "Next Board",
    });

    expect(next.board?.name).toBe("Next Board");
  });

  it("keeps state when UPDATE_BOARD_NAME has no board", () => {
    const state = {
      board: null,
      cards: [createCard()],
      loading: false,
    };

    const next = boardReducer(state, {
      type: "UPDATE_BOARD_NAME",
      payload: "Next Board",
    });

    expect(next).toEqual(state);
  });

  it("resets state on RESET", () => {
    const state = {
      board: baseBoard,
      cards: [createCard(), createCard({ _id: "c2" })],
      loading: true,
    };

    const next = boardReducer(state, { type: "RESET" });

    expect(next.board).toBeNull();
    expect(next.cards).toHaveLength(0);
    expect(next.loading).toBe(false);
  });
});
