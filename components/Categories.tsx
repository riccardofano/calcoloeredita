import { ChangeEvent } from 'react'
import { CategoryName } from '../utils/types/Category'
import { PersonList } from '../utils/types/Person'

import { Mode, useModeContext } from '../context/ModeContext'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'

import CategoryCards from './CategoryCards'

type CategoryChecklist = Record<CategoryName, boolean>

interface CategoriesProps {
  id: string
  goForwardTo: (id: string | null) => void
}

export default function Categories({ id, goForwardTo }: CategoriesProps) {
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

  return (
    <div>
      {allowed.map((c) => {
        const label = translateLabel(c)

        return (
          <div key={`${me.id}-${c}`} className="flex flex-col">
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
              {label}
            </label>

            <ul>
              <CategoryCards category={c} person={me} isChecked={checked[c]} onAdd={onAdd} goForwardTo={goForwardTo} />
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export function allowedCategories(category: CategoryName, degree: number, mode: Mode): CategoryName[] {
  if (mode === 'patrimony') {
    if (degree === 0) {
      return ['children', 'spouse', 'ascendants']
    }
    if (category === 'children') {
      return ['children']
    }
    if (category === 'ascendants') {
      return ['ascendants']
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

interface DictionaryEntry {
  label: string
  name: string
}

const dictionary: Record<CategoryName, DictionaryEntry> = {
  children: {
    label: 'Discendenti',
    name: 'Discendente',
  },
  spouse: {
    label: 'Coniuge',
    name: 'Coniuge',
  },
  ascendants: {
    label: 'Ascendenti',
    name: 'Genitore',
  },
  bilateral: {
    label: 'Fratelli o sorelle germane',
    name: 'Fratello o sorella',
  },
  unilateral: {
    label: 'Fratelli o sorelle unilaterali',
    name: 'Fratello o sorella',
  },
  others: {
    label: 'Altri parenti',
    name: 'Parente',
  },
}

function translateLabel(category: CategoryName): string {
  return dictionary[category].label
}

export function translateName(category: CategoryName): string {
  return dictionary[category].name
}
