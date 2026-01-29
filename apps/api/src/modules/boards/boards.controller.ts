import type { Request, Response } from 'express';
import { createBoardSchema } from './validation/createBoard.schema';
import { updateBoardSchema } from './validation/updateBoard.schema';
import {
  createBoard,
  getBoardWithCards,
  updateBoard,
  deleteBoardCascade,
} from './boards.service';

export const createBoardHandler = async (req: Request, res: Response) => {
  const data = createBoardSchema.parse(req.body);
  const board = await createBoard(data.name);
  res.status(201).json(board);
};

export const getBoardHandler = async (req: Request, res: Response) => {
  const data = await getBoardWithCards(req.params.publicId);

  if (!data) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }

  res.json(data);
};

export const updateBoardHandler = async (req: Request, res: Response) => {
  const data = updateBoardSchema.parse(req.body);
  const board = await updateBoard(req.params.publicId, data.name);

  if (!board) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }

  res.json(board);
};

export const deleteBoardHandler = async (req: Request, res: Response) => {
  const board = await deleteBoardCascade(req.params.publicId);

  if (!board) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }

  res.status(204).send();
};
