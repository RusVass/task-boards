import request from 'supertest';
import { createApp } from '../app';

interface CardResponse {
  _id?: string;
  id?: string;
  column?: string;
  order?: number;
}

interface BoardResponse {
  publicId: string;
  name: string;
}

interface GetBoardResponse {
  board: BoardResponse;
  cards: CardResponse[];
}

const getCardId = (card: CardResponse): string => {
  if (card._id) {
    return card._id;
  }
  if (card.id) {
    return card.id;
  }
  throw new Error('Card id is missing');
};

const app = createApp();

describe('boards', () => {
  test('POST boards creates board and returns publicId', async () => {
    const res = await request(app).post('/api/boards').send({ name: 'Board A' });

    expect(res.status).toBe(201);
    expect(res.body.publicId).toBeTruthy();
    expect(res.body.name).toBe('Board A');
  });

  test('GET board returns { board, cards } and cards is array', async () => {
    const created = await request(app).post('/api/boards').send({ name: 'Board A' });
    const publicId = created.body.publicId as string;

    const res = await request(app).get(`/api/boards/${publicId}`);
    const body = res.body as GetBoardResponse;

    expect(res.status).toBe(200);
    expect(body.board.publicId).toBe(publicId);
    expect(Array.isArray(body.cards)).toBe(true);
  });

  test('reorder moves card to done', async () => {
    const created = await request(app).post('/api/boards').send({ name: 'Board A' });
    const publicId = created.body.publicId as string;

    const card = await request(app)
      .post(`/api/boards/${publicId}/cards`)
      .send({ title: 'First task', description: 'Details', column: 'todo' });

    const cardId = getCardId(card.body as CardResponse);

    const reorder = await request(app)
      .put(`/api/boards/${publicId}/cards/reorder`)
      .send({ items: [{ cardId, column: 'done' }] });

    expect(reorder.status).toBe(200);

    const res = await request(app).get(`/api/boards/${publicId}`);
    const body = res.body as GetBoardResponse;
    const moved = body.cards.find((item) => getCardId(item) === cardId);

    expect(moved?.column).toBe('done');
    expect(moved?.order).toBe(0);
  });
});
