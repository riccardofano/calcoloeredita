import Fraction from 'fraction.js'
import { stripGraph } from './graph'
import { PersonList, Person, getAllRelatives, getRoot } from './types/Person'

export function calculateInheritance(list: PersonList): Record<string, string> {
  try {
    list = stripGraph({ ...list }, getRoot(list), getRelevantCategories)
  } catch (error) {
    throw new Error(`Could not strip graph because of: ${error}`)
  }

  const results = {}
  findInheritance(list, results, new Fraction(1), getRoot(list))

  return results
}

function findInheritance(
  list: Readonly<PersonList>,
  results: Record<string, string>,
  total: Fraction,
  current?: Person
) {
  if (total.equals(0) || !current) {
    return
  }

  if (current.available) {
    results[current.id] = total.toFraction(true)
  }

  const { children, spouse, ascendants, bilateral, unilateral, others } = getAllRelatives(list, current)

  const spousePresent = spouse.length > 0 ? 1 : 0

  if (children.length > 0) {
    // multiple children and spouse:    2/3/children and 1/3
    // multiple children and no spouse: 1/children   and 0
    let forChildren = spousePresent ? total.div(3).mul(2).div(children.length) : total.div(children.length)
    let forSpouse = spousePresent ? total.div(3) : new Fraction(0)

    if (children.length === 1) {
      // single child and spouse:    1/2 and 1/2
      // single child and no spouse: 1   and 0
      forChildren = spousePresent ? total.div(2) : total
      forSpouse = spousePresent ? total.div(2) : new Fraction(0)
    }

    children.forEach((child) => findInheritance(list, results, forChildren, list[child]))
    findInheritance(list, results, forSpouse, list[spouse[0]])
    return
  }

  const numberAscendants = ascendants.length
  const numberBilateral = bilateral.length
  const numberUnilateral = unilateral.length
  const numberRelatives = numberAscendants + numberBilateral + numberUnilateral

  const inheritance = {
    relatives: total,
    ascendants: new Fraction(0),
    bilateral: new Fraction(0),
    unilateral: new Fraction(0),
  }

  if (spousePresent + numberRelatives > 0) {
    if (spousePresent) {
      // only spouse:                 1
      // spouse and other relatives : 2/3
      const forSpouse = numberRelatives > 0 ? total.div(3).mul(2) : total
      // if there's a spouse the other relatives get 1/3
      inheritance.relatives = total.div(3)
      findInheritance(list, results, forSpouse, list[spouse[0]])
    }

    if (numberAscendants > 0) {
      inheritance.ascendants = inheritance.relatives.div(numberRelatives)
      // The parents receive at least half of the remaining inheritance
      const totalParentsInheritance = inheritance.ascendants.mul(numberAscendants)
      if (totalParentsInheritance < inheritance.relatives.div(2)) {
        inheritance.ascendants = inheritance.relatives.div(2).div(numberAscendants)
      }

      const parentsAlive = ascendants.filter((p) => list[p].available)
      // If there's only one parent alive, all the inheritance goes to them
      if (parentsAlive?.length === 1) {
        findInheritance(list, results, inheritance.ascendants.mul(numberAscendants), list[parentsAlive[0]])
      } else {
        // If neither parents is alive but the grandparents are, they receive only 1 parent's worth
        // When the spouse is present all ascendants get at least 1/4 of the total
        if (!spousePresent && parentsAlive?.length === 0) {
          inheritance.ascendants = inheritance.relatives
            .div(1 + numberBilateral + numberUnilateral)
            .div(numberAscendants)
        }
        ascendants.forEach((parent) => findInheritance(list, results, inheritance.ascendants, list[parent]))
      }
      inheritance.relatives = inheritance.relatives.sub(inheritance.ascendants.mul(numberAscendants))
    }

    if (numberBilateral + numberUnilateral > 0) {
      if (numberUnilateral === 0) {
        // If there are no unilateral siblings all goes the bilateral siblings
        inheritance.bilateral = inheritance.relatives.div(numberBilateral)
      } else if (numberBilateral === 0) {
        // If there are no bilateral siblings all goes to the unilateral siblings
        inheritance.unilateral = inheritance.relatives.div(numberUnilateral)
      } else {
        // Otherwise an unilateral sibling gets 1/2 of what a bilateral one would get
        inheritance.bilateral = inheritance.relatives.div(numberBilateral + numberUnilateral / 2)
        inheritance.unilateral = inheritance.bilateral.div(2)
      }
      bilateral.forEach((sibling) => findInheritance(list, results, inheritance.bilateral, list[sibling]))
      unilateral.forEach((sibling) => findInheritance(list, results, inheritance.unilateral, list[sibling]))
    }
  } else if (others.length > 0) {
    // If there are people in others, they must be the only ones that can inherit
    const inheritanceOneOther = inheritance.relatives.div(others.length)
    others.forEach((relative) => findInheritance(list, results, inheritanceOneOther, list[relative]))
  }
}

function getRelevantCategories(person: Person): string[] {
  switch (person.category) {
    case 'root':
      // The deceased can have all possible relatives
      return ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral']

    case 'ascendants':
      // The deceased parents' only relevant relatives their own parents
      // because we already accounted for their children, they are the siblings
      if (person.degree === 1) {
        return ['ascendants']
      }
      // Other ascendants have their children also (uncles and aunts)
      return ['children', 'ascendants']
    case 'children':
    case 'bilateral':
      // Only direct children and the children of bilateral siblings are eligible
      return ['children']
    default:
      // Everyone else's heirs aren't eligible
      return []
  }
}
