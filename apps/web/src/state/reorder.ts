import { arrayMove } from "@dnd-kit/sortable";
import { CARD_COLUMNS, type Card, type ColumnType } from "../types/card";

export const normalizeOrders = (cards: Card[]): Card[] => {
  const next: Card[] = [];

  for (const col of CARD_COLUMNS) {
    const group = cards
      .filter((c) => c.column === col)
      .sort((a, b) => a.order - b.order);

    group.forEach((c, index) => {
      next.push({ ...c, order: index });
    });
  }

  return next;
};

export const buildReorderPayload = (
  cards: Card[],
): { cardId: string; column: ColumnType }[] => {
  const sorted = [...cards].sort((a, b) => {
    if (a.column === b.column) return a.order - b.order;
    return a.column.localeCompare(b.column);
  });

  return sorted.map((c) => ({ cardId: c._id, column: c.column }));
};

const isColumnType = (value: string): value is ColumnType => {
  return CARD_COLUMNS.includes(value as ColumnType);
};

const getOrderedIdsForColumn = (cards: Card[], column: ColumnType): string[] => {
  return cards
    .filter((card) => card.column === column)
    .sort((a, b) => a.order - b.order)
    .map((card) => card._id);
};

const applyColumnOrder = (
  cards: Card[],
  column: ColumnType,
  orderedIds: string[],
): Card[] => {
  const orderById = new Map(orderedIds.map((id, index) => [id, index]));

  return cards.map((card) => {
    if (card.column !== column) return card;
    const nextOrder = orderById.get(card._id);
    if (nextOrder === undefined) return card;
    return { ...card, order: nextOrder };
  });
};

export const getNextCardsAfterDrag = (
  cards: Card[],
  activeId: string,
  overId: string,
): Card[] => {
  if (activeId === overId) return cards;

  const activeCard = cards.find((card) => card._id === activeId);
  if (!activeCard) return cards;

  const overIsColumn = isColumnType(overId);
  const overCard = overIsColumn
    ? null
    : cards.find((card) => card._id === overId);

  if (!overIsColumn && !overCard) return cards;

  const targetColumn = overIsColumn ? (overId as ColumnType) : overCard.column;

  if (targetColumn === activeCard.column) {
    const ordered = getOrderedIdsForColumn(cards, targetColumn);
    const fromIndex = ordered.indexOf(activeId);
    const toIndex = overIsColumn ? ordered.length - 1 : ordered.indexOf(overId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return cards;
    }

    const nextIds = arrayMove(ordered, fromIndex, toIndex);
    return applyColumnOrder(cards, targetColumn, nextIds);
  }

  const sourceOrdered = getOrderedIdsForColumn(cards, activeCard.column).filter(
    (id) => id !== activeId,
  );
  const targetOrdered = getOrderedIdsForColumn(cards, targetColumn).filter(
    (id) => id !== activeId,
  );
  const insertIndex = overIsColumn
    ? targetOrdered.length
    : targetOrdered.indexOf(overId);

  if (insertIndex === -1) return cards;

  const nextTarget = [...targetOrdered];
  nextTarget.splice(insertIndex, 0, activeId);

  const moved = cards.map((card) =>
    card._id === activeId ? { ...card, column: targetColumn } : card,
  );

  const withSourceOrder = applyColumnOrder(
    moved,
    activeCard.column,
    sourceOrdered,
  );

  return applyColumnOrder(withSourceOrder, targetColumn, nextTarget);
};
