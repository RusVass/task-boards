import { useState, type ChangeEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrash, FaEdit } from "react-icons/fa";
import styles from "./Card.module.scss";

type Props = {
  id: string;
  title: string;
  description?: string;
  onEdit: (data: { title: string; description?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
};

export const Card = ({
  id,
  title,
  description,
  onEdit,
  onDelete,
}: Props): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [nextDescription, setNextDescription] = useState(description ?? '');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: isEditing,
    });

  const handleSave = async (): Promise<void> => {
    await onEdit({ title: nextTitle, description: nextDescription });
    setIsEditing(false);
  };

  const handleToggleEdit = (): void => {
    setIsEditing((value) => !value);
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNextTitle(event.target.value);
  };

  const handleDescriptionChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setNextDescription(event.target.value);
  };

  const handleActionPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ): void => {
    event.stopPropagation();
  };

  const handleDelete = async (): Promise<void> => {
    const ok = window.confirm("Delete this card");
    if (!ok) return;
    await onDelete();
  };

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={styles.card}
      style={dragStyle}
      {...listeners}
      {...attributes}
    >
      <div className={styles.header}>
        {!isEditing && (
          <div
            className={`${styles.title} ${styles.dragHandle}`}
          >
            {title}
          </div>
        )}

        {!isEditing && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleToggleEdit}
              onPointerDown={handleActionPointerDown}
              aria-label="Edit"
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className={styles.iconBtnDanger}
              onClick={handleDelete}
              onPointerDown={handleActionPointerDown}
              aria-label="Delete"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {!isEditing && <div className={styles.description}>{description}</div>}

      {isEditing && (
        <div className={styles.editForm}>
          <input
            value={nextTitle}
            onChange={handleTitleChange}
            placeholder="Title"
          />
          <textarea
            value={nextDescription}
            onChange={handleDescriptionChange}
            placeholder="Description"
          />
          <div className={styles.editActions}>
            <button type="button" onClick={handleSave}>
              Save
            </button>
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
