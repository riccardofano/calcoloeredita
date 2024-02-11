import Fraction from 'fraction.js'
import { stripGraph } from './graph'
import { PersonList, Person, getRoot, rootRelatives, childrenRelatives, childrenAndAscendants } from './types/Person'

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
    return
  }

  switch (current.category) {
    case 'root': {
      const relatives = rootRelatives(list, current)
      if (relatives.children.length > 0) {
        childrenAndSpouseInheritance(list, results, total, relatives.children, relatives.spouse)
      } else {
        relativesInheritance(list, results, total, relatives)
      }
      break
    }
    case 'children':
    case 'bilateral': {
      onlyChildrenInheritance(list, results, total, childrenRelatives(list, current))
      break
    }
    case 'ascendants': {
      const relatives = childrenAndAscendants(list, current)
      if (relatives.children.length > 0) {
        onlyChildrenInheritance(list, results, total, relatives.children)
      } else {
        relativesInheritance(list, results, total, { ...relatives, bilateral: [], unilateral: [], others: [] })
      }
      break
    }
  }
}

function childrenAndSpouseInheritance(
  list: Readonly<PersonList>,
  results: Record<string, string>,
  total: Fraction,
  children: string[],
  spouse?: string
) {
  if (spouse) {
    // multiple children and spouse: 2/3/children and 1/3
    let spouseCut = total.div(3)
    let childCut = total.div(3).mul(2).div(children.length)

    if (children.length === 1) {
      // single child and spouse: 1/2 and 1/2
      spouseCut = total.div(2)
      childCut = spouseCut
    }

    // in the absence of a spouse the children divide to total among themselves
    children.forEach((child) => findInheritance(list, results, childCut, list[child]))
    findInheritance(list, results, spouseCut, list[spouse])
    return
  }

  onlyChildrenInheritance(list, results, total, children)
}

function onlyChildrenInheritance(
  list: Readonly<PersonList>,
  results: Record<string, string>,
  total: Fraction,
  children: string[]
) {
  const childCut = total.div(children.length)
  children.forEach((child) => findInheritance(list, results, childCut, list[child]))
}

type Relatives = {
  ascendants: string[]
  bilateral: string[]
  unilateral: string[]
  others: string[]
  spouse?: string
}

function relativesInheritance(
  list: Readonly<PersonList>,
  results: Record<string, string>,
  total: Fraction,
  relatives: Relatives
) {
  const { ascendants, bilateral, unilateral, others, spouse } = relatives
  const numberRelatives = ascendants.length + bilateral.length + unilateral.length

  if (spouse || numberRelatives > 0) {
    if (spouse) {
      // only spouse:                 1
      // spouse and other relatives : 2/3
      const spouseCut = numberRelatives > 0 ? total.div(3).mul(2) : total
      findInheritance(list, results, spouseCut, list[spouse])

      // if there's a spouse the other relatives get 1/3
      total = total.div(3)
    }

    if (ascendants.length > 2) {
      throw new Error("You can't have more than 2 parents")
    }

    if (ascendants.length > 0) {
      let ascendantsCut = total.div(numberRelatives).mul(ascendants.length)
      // The parents receive at least half of the remaining inheritance
      if (ascendantsCut < total.div(2)) {
        ascendantsCut = total.div(2)
      }

      const directParents = ascendants.filter((p) => list[p]?.available).length
      switch (directParents) {
        case 0:
          // If neither parent is alive but the grandparents are, they receive only 1 parent's worth
          // When the spouse is present ascendants get at least 1/4 of the non spouse remaining total
          if (!spouse) {
            ascendantsCut = total.div(1 + bilateral.length + unilateral.length)
          }
          const ascendantCut = ascendantsCut.div(ascendants.length)
          ascendants.forEach((a) => findInheritance(list, results, ascendantCut, list[a]))
          break
        case 1:
          // If there's only one parent alive, all the inheritance goes to them
          findInheritance(list, results, ascendantsCut, list[ascendants[0]])
          break
        case 2:
          const parentCut = ascendantsCut.div(2)
          findInheritance(list, results, parentCut, list[ascendants[0]])
          findInheritance(list, results, parentCut, list[ascendants[1]])
          break
      }

      total = total.sub(ascendantsCut)
    }

    let bilateralCut = new Fraction(0)
    let unilateralCut = new Fraction(0)
    if (bilateral.length > 0 && unilateral.length > 0) {
      // Unilateral sibling gets 1/2 of what a bilateral one would get
      bilateralCut = total.div(bilateral.length + unilateral.length / 2)
      unilateralCut = bilateralCut.div(2)
    } else if (bilateral.length > 0) {
      // If there are no unilateral siblings all goes the bilateral siblings
      bilateralCut = total.div(bilateral.length)
    } else if (unilateral.length > 0) {
      // If there are no bilateral siblings all goes to the unilateral siblings
      unilateralCut = total.div(unilateral.length)
    }
    bilateral.forEach((sibling) => findInheritance(list, results, bilateralCut, list[sibling]))
    unilateral.forEach((sibling) => findInheritance(list, results, unilateralCut, list[sibling]))
    return
  }

  if (others.length > 0) {
    // If there are people in others, they must be the only ones that can inherit
    const inheritanceOneOther = total.div(others.length)
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
