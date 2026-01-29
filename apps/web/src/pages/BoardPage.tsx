import { useEffect, useState, type ChangeEvent } from "react";
import { FaEdit, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
import { getTrimmedNonEmptyText } from "./boardPageHelpers";
import { buildReorderPayload, getNextCardsAfterDrag } from "../state/reorder";
import styles from "./BoardPage.module.scss";
import { CARD_COLUMNS, type ColumnType } from "../types/card";

type CardInput = {
  title: string;
  description?: string;
};

const isColumnType = (value: string): value is ColumnType => {
  return CARD_COLUMNS.includes(value as ColumnType);
};

const sortByOrder = <T extends { order: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => a.order - b.order);
};

export const BoardPage = (): JSX.Element => {
  const [boardId, setBoardId] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const { state, dispatch, createBoard, renameBoard, deleteBoard } = useBoard();

  useEffect(() => {
    if (state.board) setDraftName(state.board.name);
  }, [state.board]);

  const handleLoad = async (): Promise<void> => {
    dispatch({ type: "LOAD_START" });
    const response = await getBoard(boardId);
    dispatch({ type: "LOAD_SUCCESS", payload: response.data });
  };

  const handleCreateBoard = async (): Promise<void> => {
    const name = getTrimmedNonEmptyText(newBoardName);
    if (!name) return;

    const publicId = await createBoard(name);
    setBoardId(publicId);
    setNewBoardName("");
  };

  const todo = sortByOrder(
    state.cards.filter((card) => card.column === "todo"),
  );
  const inProgress = sortByOrder(
    state.cards.filter((card) => card.column === "in_progress"),
  );
  const done = sortByOrder(state.cards.filter((card) => card.column === "done"));

  const onDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const overId = String(over.id);
    if (!isColumnType(overId) && !state.cards.some((c) => c._id === overId)) {
      return;
    }

    const nextCards = getNextCardsAfterDrag(state.cards, cardId, overId);
    if (nextCards === state.cards) return;

    dispatch({ type: "SET_CARDS", payload: { cards: nextCards } });

    if (!state.board) return;

    await reorderCards(state.board.publicId, buildReorderPayload(nextCards));
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

  const handleNewBoardNameChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewBoardName(event.target.value);
  };

  const handleDraftNameChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setDraftName(event.target.value);
  };

  const handleStartEditingName = (): void => {
    setIsEditingName(true);
  };

  const handleCancelRename = (): void => {
    setIsEditingName(false);
    if (state.board) setDraftName(state.board.name);
  };

  const saveName = async (): Promise<void> => {
    if (!state.board) return;
    const next = getTrimmedNonEmptyText(draftName);
    if (!next) return;

    await renameBoard(state.board.publicId, next);
    setIsEditingName(false);
  };

  const handleDeleteBoard = async (): Promise<void> => {
    if (!state.board) return;
    const ok = window.confirm("Delete this board and all cards?");
    if (!ok) return;

    await deleteBoard(state.board.publicId);
    setIsEditingName(false);
  };

  const handleExitBoard = (): void => {
    dispatch({ type: "RESET" });
    setBoardId("");
    setNewBoardName("");
    setIsEditingName(false);
    setDraftName("");
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
      {!state.board && (
        <div className={styles.topBar}>
          <div className={styles.controlRow}>
            <input
              value={newBoardName}
              onChange={handleNewBoardNameChange}
              placeholder="New board name"
            />
            <button type="button" onClick={handleCreateBoard}>
              Create
            </button>
          </div>
          <div className={styles.controlRow}>
            <input
              value={boardId}
              onChange={handleBoardIdChange}
              placeholder="Enter a board ID"
            />
            <button type="button" onClick={handleLoad}>
              Load
            </button>
          </div>
        </div>
      )}

      {state.board && (
        <>
          <div className={styles.boardHeader}>
            {!isEditingName && (
              <>
                <h2 className={styles.boardTitle}>{state.board.name}</h2>
                <div className={styles.boardActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={handleStartEditingName}
                    aria-label="Rename"
                    title="Rename"
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={handleExitBoard}
                    aria-label="Exit"
                    title="Exit"
                  >
                    <FaSignOutAlt />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtnDanger}
                    onClick={handleDeleteBoard}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </>
            )}

            {!isEditingName && (
              <div className={styles.boardMeta}>
                <span className={styles.boardIdLabel}>
                  Board ID: {state.board.publicId}
                </span>
              </div>
            )}

            {isEditingName && (
              <div className={styles.renameRow}>
                <input value={draftName} onChange={handleDraftNameChange} />
                <button type="button" onClick={saveName}>
                  Save
                </button>
                <button type="button" onClick={handleCancelRename}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter}>
            <div className={styles.columns}>
              <Column id="todo" title="To Do">
                <SortableContext
                  items={todo.map((card) => card._id)}
                  strategy={verticalListSortingStrategy}
                >
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
                </SortableContext>
                <CreateCardForm onSubmit={handleCreateTodo} />
              </Column>

              <Column id="in_progress" title="In Progress">
                <SortableContext
                  items={inProgress.map((card) => card._id)}
                  strategy={verticalListSortingStrategy}
                >
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
                </SortableContext>
              </Column>

              <Column id="done" title="Done">
                <SortableContext
                  items={done.map((card) => card._id)}
                  strategy={verticalListSortingStrategy}
                >
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
                </SortableContext>
              </Column>
            </div>
          </DndContext>
        </>
      )}
    </div>
  );
};

