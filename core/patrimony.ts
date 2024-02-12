import Fraction from 'fraction.js'
import { stripGraph } from './graph'
import { CategoryName } from './types/Category'
import { getAllRelatives, getRoot, Person, PersonList } from './types/Person'

export function calculatePatrimony(list: PersonList, total = 100): Record<string, string> {
  try {
    list = stripGraph({ ...list }, getRoot(list), getRelevantCategories)
  } catch (error) {
    throw new Error(`Could not strip graph because of: ${error}`)
  }

  const patrimonyList: Record<string, string> = {}
  const root = getRoot(list)
  const availableAmount = findPatrimony(list, patrimonyList, total, root, root)
  const available = new Fraction(availableAmount / total).toFraction(true) ?? '0'
  return { available, ...patrimonyList }
}

function findPatrimony(
  list: Readonly<PersonList>,
  patrimonyList: Record<string, string>,
  remaining: number,
  root: Person,
  current?: Person
): number {
  if (remaining === 0 || !current) return remaining

  if (current.available) {
    patrimonyList[current.id] = new Fraction(remaining / 100).toFraction(true)
  }

  const { children, spouse, ascendants } = getAllRelatives(list, current)

  const spousePresent = spouse.length
  if (children.length > 0) {
    let forChildren = spousePresent ? remaining / 2 / children.length : ((remaining / 3) * 2) / children.length
    let remains = spousePresent ? remaining / 4 : remaining / 3

    if (children.length === 1) {
      forChildren = spousePresent ? remaining / 3 : remaining / 2
      remains = spousePresent ? remaining / 3 : remaining / 2
    }

    // If current is not root, 100% of the remainder should go to the children
    // because if someone is not an immediate relative of the deceased nothing should be reserved for the patrimony
    if (current.id !== root.id) {
      forChildren = remaining / children.length
      remains = 0
    }

    children.forEach((child) => findPatrimony(list, patrimonyList, forChildren, root, list[child]))
    if (spousePresent) {
      const denominator = children.length > 1 ? 4 : 3
      findPatrimony(list, patrimonyList, remaining / denominator, root, list[spouse[0]])
    }

    return remains
  }

  const numberAscendantsPresent = ascendants.length
  if (spousePresent + numberAscendantsPresent > 0) {
    let ascendantsPatrimony = remaining / 3
    let remains = (remaining / 3) * 2
    if (spousePresent) {
      remains = numberAscendantsPresent > 0 ? remaining / 4 : remaining / 2
      ascendantsPatrimony = remaining / 4

      findPatrimony(list, patrimonyList, remaining / 2, root, list[spouse[0]])
    }

    if (current.id !== root.id) {
      ascendantsPatrimony = remaining / ascendants.length
      remains = 0
    }

    if (numberAscendantsPresent > 0) {
      ascendants.forEach((ascendant) => {
        findPatrimony(list, patrimonyList, ascendantsPatrimony / numberAscendantsPresent, root, list[ascendant])
      })
    }

    return remains
  }

  return remaining
}

function getRelevantCategories(person: Person): CategoryName[] {
  switch (person.category) {
    case 'root':
      // The deceased can have all possible relatives
      return ['children', 'spouse', 'ascendants']
    case 'children':
      // Children can defer to their children
      return ['children']
    case 'ascendants':
      return ['ascendants']
    // Everyone else's heirs aren't eligible
    default:
      return []
  }
}
