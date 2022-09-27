export const categoryNames = ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral', 'others'] as const
export type CategoryName = typeof categoryNames[number]
export type Categories = Record<CategoryName, boolean>
export type CategoryPeople<T> = { [key in CategoryName]: Array<T> }
