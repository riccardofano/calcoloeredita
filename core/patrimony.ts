import Fraction from 'fraction.js'
import { stripGraph } from './graph'
import { CategoryName } from './types/Category'
import { getAllRelatives, getRoot, Person, PersonList } from './types/Person'

export function calculatePatrimony(list: PersonList): Record<string, string> {
  try {
    list = stripGraph({ ...list }, getRoot(list), getRelevantCategories)
  } catch (error) {
    throw new Error(`Could not strip graph because of: ${error}`)
  }

  const patrimonyList: Record<string, string> = {}
  const root = getRoot(list)
  const available = findPatrimony(list, patrimonyList, new Fraction(1), root)

  return { available: available.toFraction(true), ...patrimonyList }
}

function findPatrimony(
  list: Readonly<PersonList>,
  patrimonyList: Record<string, string>,
  remaining: Fraction,
  current?: Person
): Fraction {
  if (remaining.equals(0) || !current) {
    return remaining
  }

  if (current.available) {
    patrimonyList[current.id] = remaining.toFraction(true)
  }

  const { children, spouse, ascendants } = getAllRelatives(list, current)

  if (current.category !== 'root') {
    // If current is not root, 100% of the remainder should go to the children or if they are not present to the ascendants
    // because if someone is not an immediate relative of the deceased nothing should be reserved for the patrimony
    if (children.length > 0) {
      const cut = remaining.div(children.length)
      children.forEach((child) => findPatrimony(list, patrimonyList, cut, list[child]))
    } else if (ascendants.length > 0) {
      const cut = remaining.div(ascendants.length)
      ascendants.forEach((ascendant) => findPatrimony(list, patrimonyList, cut, list[ascendant]))
    }

    return new Fraction(0)
  }

  const spousePresent = spouse.length
  if (children.length > 0) {
    let available = remaining.div(3)
    let childCut = remaining.div(3).mul(2).div(children.length)

    if (spousePresent) {
      let spouseCut = remaining.div(4)
      childCut = remaining.div(2).div(children.length)
      available = remaining.div(4)

      if (children.length === 1) {
        childCut = remaining.div(3)
        available = remaining.div(3)
        spouseCut = remaining.div(3)
      }
      findPatrimony(list, patrimonyList, spouseCut, list[spouse[0]])
    } else if (children.length === 1) {
      childCut = remaining.div(2)
      available = remaining.div(2)
    }

    children.forEach((child) => findPatrimony(list, patrimonyList, childCut, list[child]))
    return available
  }

  const numberAscendantsPresent = ascendants.length
  if (spousePresent + numberAscendantsPresent > 0) {
    let ascendantsPatrimony = remaining.div(3)
    let available = remaining.div(3).mul(2)

    if (spousePresent) {
      available = numberAscendantsPresent > 0 ? remaining.div(4) : remaining.div(2)
      ascendantsPatrimony = remaining.div(4)

      findPatrimony(list, patrimonyList, remaining.div(2), list[spouse[0]])
    }

    if (numberAscendantsPresent > 0) {
      const cut = ascendantsPatrimony.div(numberAscendantsPresent)
      ascendants.forEach((ascendant) => {
        findPatrimony(list, patrimonyList, cut, list[ascendant])
      })
    }

    return available
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
