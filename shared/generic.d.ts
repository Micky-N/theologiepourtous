export type SerializedStateDates<T> = Omit<
    T,
  'deletedAt' | 'publishedAt' | 'createdAt' | 'updatedAt'
> & {
    publishedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
};
