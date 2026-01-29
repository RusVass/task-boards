export const buildCardPayload = (
  values: FormValues,
): CardPayload | null => {
  const title = values.title.trim();
  if (!title) return null;

  return {
    title,
    description: values.description.trim(),
  };
};

export interface FormValues {
  title: string;
  description: string;
}

export interface CardPayload {
  title: string;
  description: string;
}
