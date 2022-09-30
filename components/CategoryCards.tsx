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
  setDirectionForward: () => void
}

const variants = {
  visible: { opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } },
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
}

export default function CategoryCards({ person, category, isChecked, onAdd, setDirectionForward }: CategoryCardsProps) {
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
        {filtered.map((relativeId, i) => (
          <motion.li key={relativeId} initial="hidden" animate="visible" exit="hidden" variants={variants}>
            <RelativeCard
              id={relativeId}
              me={list[relativeId]}
              isFirst={i === 0}
              canHaveHeirs={canHaveHeirs}
              setDirectionForward={setDirectionForward}
            />
          </motion.li>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {shouldAddButtonBeShown && (
          <motion.li
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            className="bg-white relative z-10"
          >
            <button
              type="button"
              className="py-4 w-full font-medium leading-none text-left text-blue-400 border-t border-gray-200"
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
