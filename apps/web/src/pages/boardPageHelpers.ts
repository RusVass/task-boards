interface MoveCardPayload {
  cardId: string;
  column: string;
}

interface DragEndData {
  activeId: string | number;
  overId: string | number | null;
}

const normalizeId = (value: string | number | null): string | null => {
  if (value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

export const getMoveCardPayload = (
  data: DragEndData,
): MoveCardPayload | null => {
  const cardId = normalizeId(data.activeId);
  const column = normalizeId(data.overId);

  if (!cardId || !column) return null;

  return { cardId, column };
};

export const getTrimmedNonEmptyText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
