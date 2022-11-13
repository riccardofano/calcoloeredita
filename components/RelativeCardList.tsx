import { CategoryName } from '../utils/types/Category'

import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { Mode } from '../context/ModeContext'

import RelativeCard from './RelativeCard'

interface RelativeCardListProps {
  id: string
  category: CategoryName
  mode: Mode
  checked: boolean
  translatedName: string
  allowedCategories: (category: CategoryName, degree: number, mode: Mode) => CategoryName[]
}

export default function RelativeCardList({
  id,
  category,
  mode,
  checked,
  translatedName,
  allowedCategories,
}: RelativeCardListProps) {
  const list = usePeopleContext()
  const dispatch = usePeopleDispatchContext()
  const me = list[id]

  function handleAdd(category: CategoryName) {
    dispatch({ type: 'ADD_RELATIVE', payload: { parentId: id, category } })
  }

  const filtered = me.relatives.filter((rId) => list[rId].category === category)
  if (filtered.length < 1) return null

  // Degree does not matter as long as it's greater than 0
  const canHaveHeirs = allowedCategories(category, 1, mode).length > 0
  const hasReachedHeirLimit = filtered.length >= maxHeirs(category)

  return (
    <div className="grid">
      <ul className="mt-4">
        {filtered.map((rId) => (
          <RelativeCard key={rId} id={rId} canHaveHeirs={canHaveHeirs} />
        ))}
      </ul>

      {checked && !hasReachedHeirLimit && (
        <button type="button" className="justify-self-end btn btn-primary text-sm" onClick={() => handleAdd(category)}>
          + Aggiungi {translatedName.toLocaleLowerCase()}
        </button>
      )}
    </div>
  )
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
