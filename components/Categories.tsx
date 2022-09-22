import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react'
import { Mode, useModeContext } from '../context/ModeContext'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { CategoryName } from '../utils/types/Category'
import { PersonList } from '../utils/types/Person'

import RelativeCard from './RelativeCard'

type CategoryChecklist = { [key in CategoryName]: boolean }

interface CategoriesProps {
  id: string
  setSelectedId: Dispatch<SetStateAction<string>>
}

function Categories({ id, setSelectedId }: CategoriesProps) {
  const mode = useModeContext()
  const list = usePeopleContext()
  const dispatch = usePeopleDispatchContext()
  if (!list) return null

  const me = list[id]

  const allowed = allowedCategories(me.category, me.degree, mode)
  const checked = checkedCategories(list, me.relatives)
  const disabled = disabledCategories(checked)

  function onCheckChange(e: ChangeEvent<HTMLInputElement>, category: CategoryName) {
    if (!dispatch) return
    dispatch({ type: 'TOGGLE_CATEGORY', payload: { parentId: id, category, checked: e.target.checked } })
  }

  function onAdd(category: CategoryName) {
    if (!dispatch) return
    dispatch({ type: 'ADD_RELATIVE', payload: { parentId: id, category } })
  }

  function relativesList(category: CategoryName): ReactNode {
    if (!list) return null

    const filtered = me.relatives.filter((rId) => list[rId].category === category)
    if (filtered.length < 1) return null

    // Degree does not matter as long as it's greater than 0
    const canHaveHeirs = allowedCategories(category, 1, mode).length > 0
    const hasReachedHeirLimit = filtered.length >= maxHeirs(category)

    return (
      <ul className="ml-4 mt-2 mb-4">
        {filtered.map((rId) => (
          <RelativeCard key={rId} id={rId} setSelectedId={setSelectedId} canHaveHeirs={canHaveHeirs} />
        ))}
        {checked[category] && !hasReachedHeirLimit && (
          <button type="button" className="pt-4 text-blue-400 font-medium leading-none" onClick={() => onAdd(category)}>
            + Aggiungi discendente
          </button>
        )}
      </ul>
    )
  }

  return (
    <div>
      {allowed.map((c) => {
        const translation = translateLabel(c)

        return (
          <section title={translation} key={`${me.id} - ${c}`}>
            <label
              className={`${
                disabled.includes(c) ? 'opacity-40 cursor-not-allowed' : ''
              } flex items-center text-lg font-medium`}
            >
              <input
                className="mr-2"
                type="checkbox"
                checked={checked[c]}
                disabled={disabled.includes(c)}
                onChange={(e) => onCheckChange(e, c)}
              />
              {translation}
            </label>
            {relativesList(c)}
          </section>
        )
      })}
    </div>
  )
}

export default Categories

function allowedCategories(category: CategoryName, degree: number, mode: Mode): CategoryName[] {
  if (mode === 'patrimony') {
    if (degree === 0) {
      return ['children', 'spouse', 'ascendants']
    }
    if (category === 'children') {
      return ['children']
    }
    return []
  }

  if (degree === 0) {
    return ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral', 'others']
  }
  switch (category) {
    case 'children':
    case 'bilateral': {
      return ['children']
    }
    case 'ascendants': {
      if (degree === 1) {
        return ['ascendants']
      }
      return ['children', 'ascendants']
    }
    default: {
      return []
    }
  }
}

function checkedCategories(list: PersonList, relativeIDs: string[]): CategoryChecklist {
  const categories: CategoryChecklist = {
    children: false,
    spouse: false,
    ascendants: false,
    bilateral: false,
    unilateral: false,
    others: false,
  }

  // When a category is checked it auto adds one person to the relatives
  // so if there is a person with that category it must be on
  for (const relativeID of relativeIDs) {
    const relative = list[relativeID]
    categories[relative.category] = true
  }
  return categories
}

function disabledCategories(checkedCategories: CategoryChecklist): CategoryName[] {
  if (checkedCategories['children']) {
    return ['ascendants', 'bilateral', 'unilateral', 'others']
  }

  if (['spouse', 'ascendants', 'bilateral', 'unilateral'].some((c) => checkedCategories[c as CategoryName])) {
    return ['others']
  }

  return []
}

function translateLabel(category: CategoryName): string {
  const dictionary: { [key in CategoryName]: string } = {
    children: 'Discendenti',
    spouse: 'Coniuge',
    ascendants: 'Ascendenti',
    bilateral: 'Fratelli o sorelle germane',
    unilateral: 'Fratelli o sorelle unilaterali',
    others: 'Altri parenti',
  }

  return dictionary[category]
}

function maxHeirs(category: CategoryName): number {
  switch (category) {
    case 'children':
    case 'bilateral':
    case 'unilateral':
    case 'others': {
      return 20
    }
    case 'spouse': {
      return 1
    }
    case 'ascendants': {
      return 2
    }
  }
}
