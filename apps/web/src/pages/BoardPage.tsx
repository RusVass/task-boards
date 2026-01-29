import { useState, type ChangeEvent } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  createCard,
  deleteCard,
  getBoard,
  reorderCards,
  updateCard,
} from "../api/boardsApi";
import { Column } from "../components/Column";
import { Card } from "../components/Card";
import { CreateCardForm } from "../components/CreateCardForm";
import { useBoard } from "../state/BoardContext";
import { buildReorderPayload, normalizeOrders } from "../state/reorder";
import styles from "./BoardPage.module.scss";

const columns = ["todo", "in_progress", "done"] as const;

type ColumnType = (typeof columns)[number];

type CardInput = {
  title: string;
  description?: string;
};

const isColumnType = (value: string): value is ColumnType => {
  return columns.includes(value as ColumnType);
};

export const BoardPage = (): JSX.Element => {
  const [boardId, setBoardId] = useState("");
  const { state, dispatch } = useBoard();

  const loadBoard = async (): Promise<void> => {
    dispatch({ type: "LOAD_START" });
    const response = await getBoard(boardId);
    dispatch({ type: "LOAD_SUCCESS", payload: response.data });
  };

  const todo = state.cards.filter((card) => card.column === "todo");
  const inProgress = state.cards.filter(
    (card) => card.column === "in_progress",
  );
  const done = state.cards.filter((card) => card.column === "done");

  const onDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const column = over.id as ColumnType;

    dispatch({ type: "MOVE_CARD", payload: { cardId, column } });

    const normalized = normalizeOrders(
      state.cards.map((c) => (c._id === cardId ? { ...c, column } : c)),
    );

    dispatch({ type: "SET_CARDS", payload: { cards: normalized } });

    if (!state.board) return;

    await reorderCards(state.board.publicId, buildReorderPayload(normalized));
  };

  const handleCreateCard = async (
    column: "todo" | "in_progress" | "done",
    data: CardInput,
  ): Promise<void> => {
    if (!state.board) return;

    const res = await createCard(state.board.publicId, { ...data, column });
    dispatch({ type: "ADD_CARD", payload: { card: res.data } });
  };

  const handleDeleteCard = async (cardId: string): Promise<void> => {
    if (!state.board) return;
    await deleteCard(state.board.publicId, cardId);
    dispatch({ type: "DELETE_CARD", payload: { cardId } });
  };

  const handleUpdateCard = async (
    cardId: string,
    data: CardInput,
  ): Promise<void> => {
    if (!state.board) return;
    const res = await updateCard(state.board.publicId, cardId, data);
    dispatch({ type: "UPDATE_CARD", payload: { card: res.data } });
  };

  const handleBoardIdChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setBoardId(event.target.value);
  };

  const handleCreateTodo = (data: CardInput): Promise<void> => {
    return handleCreateCard("todo", data);
  };

  const handleCreateInProgress = (data: CardInput): Promise<void> => {
    return handleCreateCard("in_progress", data);
  };

  const handleCreateDone = (data: CardInput): Promise<void> => {
    return handleCreateCard("done", data);
  };

  const createEditHandler = (cardId: string) => {
    return (data: CardInput) => handleUpdateCard(cardId, data);
  };

  const createDeleteHandler = (cardId: string) => {
    return () => handleDeleteCard(cardId);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <input
          value={boardId}
          onChange={handleBoardIdChange}
          placeholder="Enter board ID"
        />
        <button type="button" onClick={loadBoard}>
          Load
        </button>
      </div>

      {state.board && (
        <>
          <div className={styles.header}>
            <h2 className={styles.boardTitle}>{state.board.name}</h2>
          </div>

          <DndContext onDragEnd={onDragEnd}>
            <div className={styles.columns}>
              <Column id="todo" title="To Do">
                {todo.map((card) => (
                  <Card
                    key={card._id}
                    id={card._id}
                    title={card.title}
                    description={card.description}
                    onEdit={createEditHandler(card._id)}
                    onDelete={createDeleteHandler(card._id)}
                  />
                ))}
                <CreateCardForm onSubmit={handleCreateTodo} />
              </Column>

              <Column id="in_progress" title="In Progress">
                {inProgress.map((card) => (
                  <Card
                    key={card._id}
                    id={card._id}
                    title={card.title}
                    description={card.description}
                    onEdit={createEditHandler(card._id)}
                    onDelete={createDeleteHandler(card._id)}
                  />
                ))}
              </Column>

              <Column id="done" title="Done">
                {done.map((card) => (
                  <Card
                    key={card._id}
                    id={card._id}
                    title={card.title}
                    description={card.description}
                    onEdit={createEditHandler(card._id)}
                    onDelete={createDeleteHandler(card._id)}
                  />
                ))}
              </Column>
            </div>
          </DndContext>
        </>
      )}
    </div>
  );
};

