export const CARD_COLUMNS = ["todo", "in_progress", "done"] as const;

export type ColumnType = (typeof CARD_COLUMNS)[number];

export type Card = {
  _id: string;
  title: string;
  description?: string;
  column: ColumnType;
  order: number;
};
