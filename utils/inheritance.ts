import { stripGraph } from './graph'
import { Person, StrippedPerson } from './types/Person'

export function calculateInheritance(root: Person, total = 100): Record<string, number> | null {
  const stripped = stripGraph(root)
  if (stripped === null) {
    return null
  }

  const inheritanceList: Record<string, number> = {}
  findInheritance(total, stripped)

  function findInheritance(total: number, current?: StrippedPerson) {
    if (total === 0 || !current) return total

    if (current.wantsInheritance) {
      inheritanceList[current.id] = total
    }

    if (current.children && current?.children?.length > 0) {
      // multiple children and spouse:    2/3/children and 1/3
      // multiple children and no spouse: 1/children   and 0
      let forChildren = current?.spouse?.[0]
        ? ((total / 3) * 2) / current.children.length
        : total / current.children.length
      let forSpouse = current?.spouse?.[0] ? total / 3 : 0

      if (current.children && current.children.length === 1) {
        // single child and spouse:    1/2 and 1/2
        // single child and no spouse: 1   and 0
        forChildren = current.spouse?.[0] ? total / 2 : total
        forSpouse = current.spouse?.[0] ? total / 2 : 0
      }
      current?.children?.forEach((child) => findInheritance(forChildren, child))
      findInheritance(forSpouse, current.spouse?.[0])
      return
    }

    const numberParents = current.parents?.length ?? 0
    const numberSiblings = current.siblings?.length ?? 0
    const numberUnilateral = current.unilateral?.length ?? 0
    const numberRelatives = numberParents + numberSiblings + numberUnilateral
    const spousePresent = current.spouse?.length ?? 0

    const inheritance = {
      relatives: total,
      parents: 0,
      siblings: 0,
      unilateral: 0,
    }

    if (spousePresent + numberRelatives > 0) {
      if (spousePresent) {
        // only spouse:                 1
        // spouse and other relatives : 2/3
        const forSpouse = numberRelatives > 0 ? (total / 3) * 2 : total
        // if there's a spouse the other relatives get 1/3
        inheritance.relatives = total / 3
        findInheritance(forSpouse, current?.spouse?.[0])
      }

      if (numberParents > 0) {
        inheritance.parents = inheritance.relatives / numberRelatives
        // The parents receive at least half of the remaining inheritance
        const totalParentsInheritance = inheritance.parents * numberParents
        if (spousePresent && totalParentsInheritance < total / 4) {
          inheritance.parents = total / 4
        } else if (totalParentsInheritance < inheritance.relatives / 2) {
          inheritance.parents = inheritance.relatives / 2 / numberParents
        }

        const parentsAlive = current?.parents?.filter((p) => p.wantsInheritance)
        // If there's only one parent alive, all the inheritance goes to them
        if (parentsAlive?.length === 1) {
          findInheritance(inheritance.parents * numberParents, parentsAlive[0])
        } else {
          // If neither parents is alive but the grandparents are, they receive only 1 parent's worth
          // When the spouse is present all ascendants get at least 1/4 of the total
          if (!spousePresent && parentsAlive?.length === 0) {
            inheritance.parents = inheritance.relatives / (1 + numberSiblings + numberUnilateral) / numberParents
          }
          current?.parents?.forEach((parent) => findInheritance(inheritance.parents, parent))
        }
        inheritance.relatives -= inheritance.parents * numberParents
      }

      if (numberSiblings + numberUnilateral > 0) {
        if (numberUnilateral === 0) {
          // If there are no unilateral siblings all goes the bilateral siblings
          inheritance.siblings = inheritance.relatives / numberSiblings
        } else if (numberSiblings === 0) {
          // If there are no bilateral siblings all goes to the unilateral siblings
          inheritance.unilateral = inheritance.relatives / numberUnilateral
        } else {
          // Otherwise an unilateral sibling gets 1/2 of what a bilateral one would get
          inheritance.siblings = inheritance.relatives / (numberSiblings + numberUnilateral / 2)
          inheritance.unilateral = inheritance.siblings / 2
        }
        current.siblings?.forEach((sibling) => findInheritance(inheritance.siblings, sibling))
        current.unilateral?.forEach((sibling) => findInheritance(inheritance.unilateral, sibling))
      }
    } else if (current.others && current.others?.length > 0) {
      // If there are people in others, they must be the only ones that can inherit
      const inheritanceOneOther = inheritance.relatives / current.others.length
      current.others?.forEach((relative) => findInheritance(inheritanceOneOther, relative))
    }
  }

  return inheritanceList
}
