import Fraction from 'fraction.js'
import { stripGraph } from './graph'
import { PersonList, Person, getAllRelatives, getRoot } from './types/Person'

export function calculateInheritance(list: PersonList, total = 100): Record<string, string> {
  try {
    list = stripGraph({ ...list }, getRoot(list), getRelevantCategories)
  } catch (error) {
    throw new Error(`Could not strip graph because of: ${error}`)
  }

  const inheritanceList: Record<string, string> = {}
  findInheritance(total, getRoot(list))

  return inheritanceList

  function findInheritance(remaning: number, current?: Person) {
    if (remaning === 0 || !current) return remaning

    if (current.available) {
      inheritanceList[current.id] = new Fraction(remaning / total).toFraction(true)
    }

    const { children, spouse, ascendants, bilateral, unilateral, others } = getAllRelatives(list, current)

    const spousePresent = spouse.length

    if (children.length > 0) {
      // multiple children and spouse:    2/3/children and 1/3
      // multiple children and no spouse: 1/children   and 0
      let forChildren = spousePresent ? ((remaning / 3) * 2) / children.length : remaning / children.length
      let forSpouse = spousePresent ? remaning / 3 : 0

      if (children.length === 1) {
        // single child and spouse:    1/2 and 1/2
        // single child and no spouse: 1   and 0
        forChildren = spousePresent ? remaning / 2 : remaning
        forSpouse = spousePresent ? remaning / 2 : 0
      }
      children.forEach((child) => findInheritance(forChildren, list[child]))
      findInheritance(forSpouse, list[spouse[0]])
      return 0
    }

    const numberAscendants = ascendants.length
    const numberBilateral = bilateral.length
    const numberUnilateral = unilateral.length
    const numberRelatives = numberAscendants + numberBilateral + numberUnilateral

    const inheritance = {
      relatives: remaning,
      ascendants: 0,
      bilateral: 0,
      unilateral: 0,
    }

    if (spousePresent + numberRelatives > 0) {
      if (spousePresent) {
        // only spouse:                 1
        // spouse and other relatives : 2/3
        const forSpouse = numberRelatives > 0 ? (remaning / 3) * 2 : remaning
        // if there's a spouse the other relatives get 1/3
        inheritance.relatives = remaning / 3
        findInheritance(forSpouse, list[spouse[0]])
      }

      if (numberAscendants > 0) {
        inheritance.ascendants = inheritance.relatives / numberRelatives
        // The parents receive at least half of the remaining inheritance
        const totalParentsInheritance = inheritance.ascendants * numberAscendants
        if (spousePresent && totalParentsInheritance < remaning / 4) {
          inheritance.ascendants = remaning / 4
        } else if (totalParentsInheritance < inheritance.relatives / 2) {
          inheritance.ascendants = inheritance.relatives / 2 / numberAscendants
        }

        const parentsAlive = ascendants.filter((p) => list[p].available)
        // If there's only one parent alive, all the inheritance goes to them
        if (parentsAlive?.length === 1) {
          findInheritance(inheritance.ascendants * numberAscendants, list[parentsAlive[0]])
        } else {
          // If neither parents is alive but the grandparents are, they receive only 1 parent's worth
          // When the spouse is present all ascendants get at least 1/4 of the total
          if (!spousePresent && parentsAlive?.length === 0) {
            inheritance.ascendants = inheritance.relatives / (1 + numberBilateral + numberUnilateral) / numberAscendants
          }
          ascendants.forEach((parent) => findInheritance(inheritance.ascendants, list[parent]))
        }
        inheritance.relatives -= inheritance.ascendants * numberAscendants
      }

      if (numberBilateral + numberUnilateral > 0) {
        if (numberUnilateral === 0) {
          // If there are no unilateral siblings all goes the bilateral siblings
          inheritance.bilateral = inheritance.relatives / numberBilateral
        } else if (numberBilateral === 0) {
          // If there are no bilateral siblings all goes to the unilateral siblings
          inheritance.unilateral = inheritance.relatives / numberUnilateral
        } else {
          // Otherwise an unilateral sibling gets 1/2 of what a bilateral one would get
          inheritance.bilateral = inheritance.relatives / (numberBilateral + numberUnilateral / 2)
          inheritance.unilateral = inheritance.bilateral / 2
        }
        bilateral.forEach((sibling) => findInheritance(inheritance.bilateral, list[sibling]))
        unilateral.forEach((sibling) => findInheritance(inheritance.unilateral, list[sibling]))
      }
    } else if (others.length > 0) {
      // If there are people in others, they must be the only ones that can inherit
      const inheritanceOneOther = inheritance.relatives / others.length
      others.forEach((relative) => findInheritance(inheritanceOneOther, list[relative]))
    }

    return remaning
  }
}

function getRelevantCategories(isRoot: boolean, person: Person): string[] {
  if (isRoot) {
    // The deceased can have all possible relatives
    return ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral']
  }

  if (person.category === 'ascendants') {
    // The deceased parents' only relevant relatives their own parents
    // because we already accounted for their children, they are the siblings
    if (person.degree === 1) {
      return ['ascendants']
    }
    // Other ascendants have their children also (uncles and aunts)
    return ['children', 'ascendants']
  }

  if (person.category === 'bilateral' || person.category === 'children') {
    // Only direct children and the children of bilateral siblings are eligible
    return ['children']
  }

  // Everyone else's heirs aren't eligible
  return []
}
