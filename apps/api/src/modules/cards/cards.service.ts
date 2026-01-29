import { CardModel } from './card.model';

export const createCard = async (params: {
  boardId: string;
  column: string;
  title: string;
  description?: string;
}) => {
  const lastCard = await CardModel.find({ boardId: params.boardId, column: params.column })
    .sort({ order: -1 })
    .limit(1)
    .lean();

  const nextOrder = lastCard[0]?.order ?? -1;

  return CardModel.create({
    boardId: params.boardId,
    column: params.column,
    order: nextOrder + 1,
    title: params.title,
    description: params.description,
  });
};

export const updateCard = async (
  cardId: string,
  data: { title: string; description?: string },
) => {
  return CardModel.findByIdAndUpdate(cardId, data, { new: true }).lean();
};

export const deleteCard = async (cardId: string) => {
  return CardModel.findByIdAndDelete(cardId);
};

export const reorderCards = async (
  boardId: string,
  items: { cardId: string; column: string }[],
) => {
  const orderByColumn = new Map<string, number>();

  const operations = items.map((item) => {
    const nextOrder = orderByColumn.get(item.column) ?? 0;
    orderByColumn.set(item.column, nextOrder + 1);

    return {
      updateOne: {
        filter: { _id: item.cardId, boardId },
        update: { column: item.column, order: nextOrder },
      },
    };
  });

  if (operations.length === 0) return;

  await CardModel.bulkWrite(operations);
};
