import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { Categories, CategoryName } from '../utils/types/Category'

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

  const setChecked = (shouldEnable: boolean) => {
    if (!setCategories) return

    // User wants to enable children
    // disable everyone but the spouse from the enabled list
    if (shouldEnable && category === 'children') {
      setCategories((state) => ({
        ...state,
        others: false,
        siblings: false,
        unilateral: false,
        parents: false,
        children: true,
      }))
      // Enabling a category that isn't 'others' should disabled 'others'
    } else if (shouldEnable && category !== 'others') {
      setCategories((state) => ({
        ...state,
        others: false,
        [category]: true,
      }))
    } else {
      setCategories((categories) => ({
        ...categories,
        [category]: shouldEnable,
      }))
    }
  }

  return [checked, setChecked]
}

export const useCategories = () => {
  const { categories } = useContext(CategoryContext)
  return categories
}

export const useNonOtherCategories = () => {
  const {
    categories: { children, spouse, parents, siblings, unilateral },
  } = useContext(CategoryContext)
  return [children, spouse, parents, siblings, unilateral]
}
