import { AnimatePresence, motion } from 'framer-motion'

import { CategoryName } from '../utils/types/Category'
import { Person } from '../utils/types/Person'

import { useModeContext } from '../context/ModeContext'
import { usePeopleContext } from '../context/PeopleContext'

import { allowedCategories, translateName } from './Categories'
import RelativeCard from './RelativeCard'

interface CategoryCardsProps {
  person: Person
  category: CategoryName
  isChecked: boolean
  onAdd: (c: CategoryName) => void
}

export default function CategoryCards({ person, category, isChecked, onAdd }: CategoryCardsProps) {
  const mode = useModeContext()
  const list = usePeopleContext()
  if (!list) {
    return null
  }

  const filtered = person.relatives.filter((rId) => list[rId].category === category)

  // Degree does not matter as long as it's greater than 0
  const canHaveHeirs = allowedCategories(category, 1, mode).length > 0
  const hasReachedHeirLimit = filtered.length >= maxHeirs(category)

  const shouldAddButtonBeShown = isChecked && filtered.length > 0 && !hasReachedHeirLimit

  return (
    <>
      <AnimatePresence initial={false}>
        {filtered.map((relativeId) => (
          <motion.li
            key={relativeId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <RelativeCard id={relativeId} me={list[relativeId]} canHaveHeirs={canHaveHeirs} />
          </motion.li>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {shouldAddButtonBeShown && (
          <motion.li exit={{ opacity: 0, height: 0 }}>
            <button
              type="button"
              className="py-4 text-blue-400 font-medium leading-none"
              onClick={() => onAdd(category)}
            >
              + Aggiungi {translateName(category).toLocaleLowerCase()}
            </button>
          </motion.li>
        )}
      </AnimatePresence>
    </>
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
