"use client";

import { createContext, useContext, useReducer } from "react";
import {
  createBoard as createBoardApi,
  deleteBoard as deleteBoardApi,
  renameBoard as renameBoardApi,
} from "../api/boardsApi";
import type { Card, ColumnType } from "../types/card";

type Board = { name: string; publicId: string };

interface BoardState {
  board: Board | null;
  cards: Card[];
  loading: boolean;
}

type BoardAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { board: Board; cards: Card[] } }
  | { type: "MOVE_CARD"; payload: { cardId: string; column: ColumnType } }
  | { type: "SET_CARDS"; payload: { cards: Card[] } }
  | { type: "ADD_CARD"; payload: { card: Card } }
  | { type: "UPDATE_CARD"; payload: { card: Card } }
  | { type: "DELETE_CARD"; payload: { cardId: string } }
  | { type: "UPDATE_BOARD_NAME"; payload: string }
  | { type: "RESET" };

const initialState: BoardState = {
  board: null,
  cards: [],
  loading: false,
};

export const boardReducer = (
  state: BoardState,
  action: BoardAction,
): BoardState => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_SUCCESS":
      return {
        board: action.payload.board,
        cards: action.payload.cards,
        loading: false,
      };
    case "MOVE_CARD": {
      const { cardId, column } = action.payload;

      const nextCards = state.cards.map((card) => {
        if (card._id !== cardId) return card;
        return { ...card, column };
      });

      return { ...state, cards: nextCards };
    }
    case "SET_CARDS":
      return { ...state, cards: action.payload.cards };
    case "ADD_CARD": {
      const nextCards = [...state.cards, action.payload.card];
      return { ...state, cards: nextCards };
    }
    case "UPDATE_CARD": {
      const nextCards = state.cards.map((c) =>
        c._id === action.payload.card._id ? action.payload.card : c,
      );
      return { ...state, cards: nextCards };
    }
    case "DELETE_CARD": {
      const nextCards = state.cards.filter((c) => c._id !== action.payload.cardId);
      return { ...state, cards: nextCards };
    }
    case "UPDATE_BOARD_NAME": {
      if (!state.board) return state;
      return { ...state, board: { ...state.board, name: action.payload } };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  createBoard: (name: string) => Promise<string>;
  renameBoard: (publicId: string, name: string) => Promise<void>;
  deleteBoard: (publicId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export const BoardProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const createBoard = async (name: string): Promise<string> => {
    const res = await createBoardApi(name);
    dispatch({
      type: "LOAD_SUCCESS",
      payload: { board: res.data, cards: [] },
    });
    return res.data.publicId;
  };

  const renameBoard = async (publicId: string, name: string): Promise<void> => {
    const res = await renameBoardApi(publicId, name);
    dispatch({ type: "UPDATE_BOARD_NAME", payload: res.data.name });
  };

  const deleteBoard = async (publicId: string): Promise<void> => {
    await deleteBoardApi(publicId);
    dispatch({ type: "RESET" });
  };

  return (
    <BoardContext.Provider
      value={{ state, dispatch, createBoard, renameBoard, deleteBoard }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = (): BoardContextValue => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used inside BoardProvider");
  }

  return context;
};
