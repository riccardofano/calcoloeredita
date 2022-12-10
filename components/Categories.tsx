import { ChangeEvent } from 'react'
import { CategoryName } from '../utils/types/Category'
import { PersonList } from '../utils/types/Person'

import { Mode, useModeContext } from '../context/ModeContext'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { useSelectedId } from '../hooks/useSelectedId'

import RelativeCardList from './RelativeCardList'
import { AnimatePresence } from 'framer-motion'

type CategoryChecklist = { [key in CategoryName]: boolean }

function Categories() {
  const mode = useModeContext()
  const id = useSelectedId()

  const list = usePeopleContext()
  const me = list[id]
  const dispatch = usePeopleDispatchContext()

  const allowed = allowedCategories(me.category, me.degree, mode)
  const checked = checkedCategories(list, me.relatives)
  const disabled = disabledCategories(checked)

  function onCheckChange(e: ChangeEvent<HTMLInputElement>, category: CategoryName) {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: { parentId: id, category, checked: e.target.checked } })
  }

  return (
    <div className="space-y-5">
      {allowed.map((c) => {
        const label = translateLabel(c)
        const isDisabled = disabled.includes(c)

        const peopleInCategory = me.relatives.filter((rId) => list[rId].category === c)

        return (
          <section
            key={`${me.id}-${c}`}
            title={label}
            className={`border-b pb-5 last:border-none last:pb-0 ${isDisabled ? 'cursor-not-allowed opacity-50 ' : ''}`}
          >
            <label className={`grid items-center justify-start gap-x-4 px-4 ${isDisabled ? 'cursor-not-allowed' : ''}`}>
              <input
                className="disabled:cursor-not-allowed"
                type="checkbox"
                checked={checked[c]}
                disabled={isDisabled}
                onChange={(e) => onCheckChange(e, c)}
              />
              <h3 className="text-base font-medium md:text-lg">{label}</h3>
              <p className="col-start-2 row-start-2 text-sm text-gray-600 md:text-base">{translateDescription(c)}</p>
            </label>
            <AnimatePresence initial={false}>
              {peopleInCategory.length > 0 && (
                <RelativeCardList
                  id={me.id}
                  category={c}
                  mode={mode}
                  list={list}
                  filtered={peopleInCategory}
                  allowedCategories={allowedCategories}
                  translatedName={translateName(c)}
                />
              )}
            </AnimatePresence>
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
