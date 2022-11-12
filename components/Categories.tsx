import { ChangeEvent, ReactNode } from 'react'
import { CategoryName } from '../utils/types/Category'
import { PersonList } from '../utils/types/Person'

import { Mode, useModeContext } from '../context/ModeContext'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { useSelectedIdContext } from '../context/SelectedIdContext'

import RelativeCard from './RelativeCard'

type CategoryChecklist = { [key in CategoryName]: boolean }

function Categories() {
  const mode = useModeContext()
  const id = useSelectedIdContext()

  const list = usePeopleContext()
  const me = list[id]
  const dispatch = usePeopleDispatchContext()


  const allowed = allowedCategories(me.category, me.degree, mode)
  const checked = checkedCategories(list, me.relatives)
  const disabled = disabledCategories(checked)

  function onCheckChange(e: ChangeEvent<HTMLInputElement>, category: CategoryName) {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: { parentId: id, category, checked: e.target.checked } })
  }

  function onAdd(category: CategoryName) {
    dispatch({ type: 'ADD_RELATIVE', payload: { parentId: id, category } })
  }

  function relativesList(category: CategoryName): ReactNode {
    const filtered = me.relatives.filter((rId) => list[rId].category === category)
    if (filtered.length < 1) return null

    // Degree does not matter as long as it's greater than 0
    const canHaveHeirs = allowedCategories(category, 1, mode).length > 0
    const hasReachedHeirLimit = filtered.length >= maxHeirs(category)

    return (
      <ul className="mt-4">
        {filtered.map((rId) => (
          <RelativeCard key={rId} id={rId} canHaveHeirs={canHaveHeirs} />
        ))}
        {checked[category] && !hasReachedHeirLimit && (
          <button
            type="button"
            className="pt-4 w-full text-left text-blue-400 font-medium leading-none border-t"
            onClick={() => onAdd(category)}
          >
            + Aggiungi {translateName(category).toLocaleLowerCase()}
          </button>
        )}
      </ul>
    )
  }

  return (
    <div className="space-y-2">
      {allowed.map((c) => {
        const label = translateLabel(c)
        const isDisabled = disabled.includes(c)

        return (
          <section
            key={`${me.id}-${c}`}
            title={label}
            className={`px-4 py-6 bg-white rounded-md border
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <label className={isDisabled ? 'cursor-not-allowed' : ''}>
              <div className="flex items-center">
                <input
                  className="mr-2 disabled:cursor-not-allowed"
                  type="checkbox"
                  checked={checked[c]}
                  disabled={isDisabled}
                  onChange={(e) => onCheckChange(e, c)}
                />
                <h2 className="text-lg">{label}</h2>
              </div>
              <p className="text-gray-500">{translateDescription(c)}</p>
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
  description: string
}

const dictionary: Record<CategoryName, DictionaryEntry> = {
  children: {
    label: 'Discendenti',
    name: 'Discendente',
    description: 'Figli, figli di figli e così via, sono equiparati i figli legittimati e quelli adottivi.',
  },
  spouse: {
    label: 'Coniuge',
    name: 'Coniuge',
    description: 'Il coniuge putativo o separato se la separazione non sia stata a lui addebitata.',
  },
  ascendants: {
    label: 'Ascendenti',
    name: 'Genitore',
    description: 'Genitori, nonni, bisnonni ma anche pro zii pro pro zii specificando figli degli ascendenti.',
  },
  bilateral: {
    label: 'Fratelli o sorelle germane',
    name: 'Fratello o sorella',
    description: "Sono 'germani' i fratelli i quali hanno in comune con il de cuius entrambi i genitori.",
  },
  unilateral: {
    label: 'Fratelli o sorelle unilaterali',
    name: 'Fratello o sorella',
    description: 'Sono unilaterali i fratelli che hanno in comune solo un genitore.',
  },
  others: {
    label: 'Altri parenti',
    name: 'Parente',
    description: 'Ossia gli zii e i cugini oppure altri parenti fino al sesto grado di parentela.',
  },
}

function translateLabel(category: CategoryName): string {
  return dictionary[category].label
}

function translateName(category: CategoryName): string {
  return dictionary[category].name
}

function translateDescription(category: CategoryName): string {
  return dictionary[category].description
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
