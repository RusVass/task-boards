import type { Request, Response } from 'express';
import { createCardSchema } from './validation/createCard.schema';
import { reorderCardsSchema } from './validation/reorderCards.schema';
import { updateCardSchema } from './validation/updateCard.schema';
import { createCard, updateCard, deleteCard, reorderCards } from './cards.service';

export const createCardHandler = async (req: Request, res: Response) => {
  const data = createCardSchema.parse(req.body);

  const card = await createCard({
    boardId: req.params.publicId,
    column: data.column,
    title: data.title,
    description: data.description,
  });

  res.status(201).json(card);
};

export const updateCardHandler = async (req: Request, res: Response) => {
  const data = updateCardSchema.parse(req.body);

  const card = await updateCard(req.params.cardId, data);

  if (!card) {
    res.status(404).json({ message: 'Card not found' });
    return;
  }

  res.json(card);
};

export const deleteCardHandler = async (req: Request, res: Response) => {
  const card = await deleteCard(req.params.cardId);

  if (!card) {
    res.status(404).json({ message: 'Card not found' });
    return;
  }

  res.status(204).send();
};

export const reorderCardsHandler = async (req: Request, res: Response) => {
  const data = reorderCardsSchema.parse(req.body);

  await reorderCards(req.params.publicId, data.items);

  res.status(204).send();
};
