import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import styles from './Column.module.scss';

export const Column = ({ title, id, children }: ColumnProps): JSX.Element => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={styles.column}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </div>
  );
};

interface ColumnProps {
  id: string;
  title: string;
  children: ReactNode;
}

