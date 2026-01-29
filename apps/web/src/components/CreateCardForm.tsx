import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./CreateCardForm.module.scss";
import {
  buildCardPayload,
  type CardPayload,
  type FormValues,
} from "./createCardFormHelpers";

export const CreateCardForm = ({
  onSubmit,
  placeholderTitle,
}: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { title: "", description: "" },
  });

  const submit = async (values: FormValues): Promise<void> => {
    const payload = buildCardPayload(values);
    if (!payload) return;
    await onSubmit(payload);
    reset();
    setIsOpen(false);
  };

  const open = (): void => {
    setIsOpen(true);
  };

  const close = (): void => {
    reset();
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      {!isOpen && (
        <button type="button" className={styles.addTile} onClick={open}>
          <div className={styles.plus}>+</div>
        </button>
      )}

      {isOpen && (
        <form className={styles.form} onSubmit={handleSubmit(submit)}>
          <input
            {...register("title", { required: true })}
            placeholder={placeholderTitle ?? "Title"}
          />

          <textarea {...register("description")} rows={3} placeholder="Description" />

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={close}>
              Cancel
            </button>

            <button type="submit" className={styles.primaryBtn}>
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

interface Props {
  onSubmit: (data: CardPayload) => Promise<void> | void;
  placeholderTitle?: string;
}
