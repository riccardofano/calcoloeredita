import Fraction from 'fraction.js'
import { stripGraph } from './graph'
import { MaybeEligible, Person, StrippedPerson } from './types/Person'

function getRelatives(isRoot: boolean, person: MaybeEligible): Person[] {
  if (isRoot) {
    // The deceased can have all possible relatives
    return [...person.children, ...person.spouse, ...person.parents]
  }

  if (person.category === 'children') {
    // Children can defer to their children
    return [...person.children]
  }

  // Everyone else's heirs aren't eligible
  return []
}

export function calculatePatrimony(root: Person, total = 100): Record<string, string> {
  const stripped = stripGraph(root, getRelatives)
  if (stripped === null) {
    throw new Error('Could not strip graph')
  }

  const patrimonyList: Record<string, string> = {}
  const availableAmount = findPatrimony(total, stripped)
  const available = new Fraction(availableAmount / total).toFraction(true) ?? '0'
  return { available, ...patrimonyList }

  function findPatrimony(remaining: number, current?: StrippedPerson): number {
    if (remaining === 0 || !current) return remaining

    if (current.wantsInheritance) {
      patrimonyList[current.id] = new Fraction(remaining / 100).toFraction(true)
    }

    const spousePresent = current.spouse?.length ?? 0

    if (current.children && current.children.length > 0) {
      let forChildren = spousePresent
        ? remaining / 2 / current.children.length
        : ((remaining / 3) * 2) / current.children.length
      let remains = spousePresent ? remaining / 4 : remaining / 3

      console.log(current.children.length)
      console.log(remaining, forChildren)

      if (current.children.length === 1) {
        forChildren = spousePresent ? remaining / 3 : remaining / 2
        remains = spousePresent ? remaining / 3 : remaining / 2
      }

      // If current is not root, 100% of the remainder should go to the children
      if (current.id !== root.id) {
        forChildren = remaining / current.children.length
        remains = 0
      }

      current.children.forEach((child) => findPatrimony(forChildren, child))
      if (spousePresent) {
        findPatrimony(remaining / 3, current.spouse?.[0])
      }

      return remains
    }

    const numberAscendantsPresent = current.parents?.length ?? 0
    if (spousePresent + numberAscendantsPresent > 0) {
      let ascendantsPatrimony = remaining / 3
      let remains = (remaining / 3) * 2
      if (spousePresent) {
        remains = numberAscendantsPresent > 0 ? remaining / 4 : remaining / 2
        ascendantsPatrimony = remaining / 4

        findPatrimony(remaining / 2, current.spouse?.[0])
      }

      if (numberAscendantsPresent > 0) {
        current.parents?.forEach((ascendant) => {
          findPatrimony(ascendantsPatrimony / numberAscendantsPresent, ascendant)
        })
      }

      return remains
    }

    return remaining
  }
}
