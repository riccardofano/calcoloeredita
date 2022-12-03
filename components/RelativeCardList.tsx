import { AnimatePresence, motion } from 'framer-motion'

import { CategoryName } from '../utils/types/Category'
import { usePeopleDispatchContext } from '../context/PeopleContext'
import { Mode } from '../context/ModeContext'

import RelativeCard from './RelativeCard'
import { PersonList } from '../utils/types/Person'

interface RelativeCardListProps {
  id: string
  category: CategoryName
  mode: Mode
  list: PersonList
  filtered: string[]
  translatedName: string
  allowedCategories: (category: CategoryName, degree: number, mode: Mode) => CategoryName[]
}

export default function RelativeCardList({
  id,
  category,
  mode,
  list,
  filtered,
  translatedName,
  allowedCategories,
}: RelativeCardListProps) {
  const dispatch = usePeopleDispatchContext()

  function handleAdd(category: CategoryName) {
    dispatch({ type: 'ADD_RELATIVE', payload: { parentId: id, category } })
  }

  // Degree does not matter as long as it's greater than 0
  const canHaveHeirs = allowedCategories(category, 1, mode).length > 0
  const hasReachedHeirLimit = filtered.length >= maxHeirs(category)

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      transition={{ type: 'just' }}
      className="overflow-hidden"
    >
      <ul className="mt-4">
        <AnimatePresence initial={false}>
          {filtered.map((rId) => (
            <motion.li
              key={rId}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ type: 'just' }}
              className="overflow-hidden"
            >
              <RelativeCard id={rId} me={list[rId]} canHaveHeirs={canHaveHeirs} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!hasReachedHeirLimit && (
        <button
          type="button"
          className="btn btn-inverted mx-4 justify-self-end text-sm md:text-base"
          onClick={() => handleAdd(category)}
        >
          + Aggiungi {translatedName.toLocaleLowerCase()}
        </button>
      )}
    </motion.div>
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
