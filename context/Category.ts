import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { Categories, CategoryName } from '../utils/types/Category'

export const defaultState = {
  children: false,
  spouse: false,
  parents: false,
  siblings: false,
  unilateral: false,
  others: false,
}

interface ICategoryContext {
  allChecked: Categories
  allDisabled: Categories
  setAllChecked: Dispatch<SetStateAction<Categories>>
  setAllDisabled: Dispatch<SetStateAction<Categories>>
}
export const CategoryContext = createContext<ICategoryContext>({} as ICategoryContext)

// These are `parents`, `siblings` and `unilateral`,
// the ones who get disabled when childrens are enabled
type RegularRelatives = Exclude<CategoryName, 'children' | 'spouse' | 'others'>
const updateRegularRelatives = (shouldEnable: boolean): { [key in RegularRelatives]: boolean } => {
  return {
    parents: shouldEnable,
    siblings: shouldEnable,
    unilateral: shouldEnable,
  }
}

const isAnyoneElseEnabled = (categories: Categories, currentCategory: CategoryName): boolean => {
  const categoryList = Object.entries(categories) as [CategoryName, boolean][]
  return categoryList.some(([category, enabled]) => category !== 'others' && category !== currentCategory && enabled)
}

type UseCategory = {
  checked: boolean
  disabled: boolean
  setChecked: (shouldEnable: boolean) => void
}
// Returns this category's state
export const useCategory = (category: CategoryName): UseCategory => {
  const { allChecked, allDisabled, setAllChecked, setAllDisabled } = useContext(CategoryContext)

  const setChecked = (shouldEnable: boolean) => {
    if (category === 'others') {
      return setAllChecked((state) => ({ ...state, others: shouldEnable }))
    }

    if (category === 'children') {
      // Regular relative disabled state should be the opposite for the `children's`
      setAllDisabled((state) => ({ ...state, ...updateRegularRelatives(shouldEnable) }))
      // Remove the checked state from regular relatives if `children` are getting enabled
      // otherwise leave their state as it was
      if (shouldEnable) {
        setAllChecked((state) => ({ ...state, ...updateRegularRelatives(!shouldEnable) }))
      }
    }

    // If a category is getting enabled, `others` should be disabled
    // it it's getting turned off look if someone else was enabled already
    const shouldOthersBeDisabled = shouldEnable ? true : isAnyoneElseEnabled(allChecked, category)
    setAllDisabled((state) => ({ ...state, others: shouldOthersBeDisabled }))
    if (shouldOthersBeDisabled) {
      setAllChecked((state) => ({ ...state, others: false }))
    }

    // finally, update this category's checked state
    setAllChecked((state) => ({ ...state, [category]: shouldEnable }))
  }

  return { checked: allChecked[category], disabled: allDisabled[category], setChecked }
}

export const useCategories = () => {
  const { allChecked } = useContext(CategoryContext)
  return allChecked
}
