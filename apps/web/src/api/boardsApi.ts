import type { AxiosResponse } from "axios";
import { httpClient } from "./httpClient";

export type ColumnType = "todo" | "in_progress" | "done";

export type Board = {
  publicId: string;
  name: string;
};

export type Card = {
  _id: string;
  boardId: string;
  column: ColumnType;
  order: number;
  title: string;
  description?: string;
};

export type GetBoardResponse = {
  board: Board;
  cards: Card[];
};

type ApiResponse<T> = Promise<AxiosResponse<T>>;

export const getBoard = (publicId: string): ApiResponse<GetBoardResponse> => {
  return httpClient.get<GetBoardResponse>(`/boards/${publicId}`);
};

export const createBoard = (name: string): ApiResponse<Board> => {
  return httpClient.post<Board>("/boards", { name });
};

export const createCard = (
  publicId: string,
  data: { title: string; description?: string; column: ColumnType },
): ApiResponse<Card> => {
  return httpClient.post<Card>(`/boards/${publicId}/cards`, data);
};

export const reorderCards = (
  publicId: string,
  items: { cardId: string; column: ColumnType }[],
): ApiResponse<void> => {
  return httpClient.put<void>(`/boards/${publicId}/cards/reorder`, { items });
};

export const updateCard = (
  publicId: string,
  cardId: string,
  data: { title: string; description?: string },
): ApiResponse<Card> => {
  return httpClient.patch<Card>(`/boards/${publicId}/cards/${cardId}`, data);
};

export const deleteCard = (
  publicId: string,
  cardId: string,
): ApiResponse<void> => {
  return httpClient.delete<void>(`/boards/${publicId}/cards/${cardId}`);
};
