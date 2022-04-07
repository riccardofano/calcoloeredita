import { createContext, Dispatch, SetStateAction, useContext } from 'react'

export const categoryNames = ['children', 'spouse', 'parents', 'siblings', 'unilateral', 'others'] as const
export type CategoryName = typeof categoryNames[number]
export type Categories = Record<CategoryName, boolean>

interface ICategoryContext {
  categories: Categories
  setCategories?: Dispatch<SetStateAction<Categories>>
}

export const defaultState = {
  children: false,
  spouse: false,
  parents: false,
  siblings: false,
  unilateral: false,
  others: false,
}
export const CategoryContext = createContext<ICategoryContext>({ categories: defaultState })

export const useCategory = (category: CategoryName): [boolean, (c: boolean) => void] => {
  const { categories, setCategories } = useContext(CategoryContext)
  const checked = categories[category]

  const setChecked = (c: boolean) => {
    if (!setCategories) return
    setCategories((categories) => ({
      ...categories,
      [category]: c,
    }))
  }

  return [checked, setChecked]
}

export const useCategories = () => {
  const { categories } = useContext(CategoryContext)
  return categories
}

export const nonOtherCategories = () => {
  const {
    categories: { children, spouse, parents, siblings, unilateral },
  } = useContext(CategoryContext)
  return [children, spouse, parents, siblings, unilateral]
}
