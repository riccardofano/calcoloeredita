import { Person } from './person'

interface Node extends Person {
  visited?: boolean
}

const removeDeadEnds = (current: Node): boolean => {
  const { predead, children, spouse, siblings, unilateral, parents } = current
  // can claim inheritance
  if (predead !== true && !current.visited) {
    return true
  }

  current.visited = true
  const queue = [children, spouse, siblings, unilateral, parents].flatMap((p) => p ?? [])
  while (queue.length > 0) {
    let person = queue.shift()
    if (!person) continue

    const eleggibile = removeDeadEnds(person)
    if (!eleggibile) {
      person.inheritance = 0
    }
  }

  if (current.spouse?.inheritance === 0) delete current.spouse
  current.children = current.children?.filter(removeNoInheritance) || []
  current.parents = current.parents?.filter(removeNoInheritance) || []
  current.siblings = current.siblings?.filter(removeNoInheritance) || []
  current.unilateral = current.unilateral?.filter(removeNoInheritance) || []

  return false
}

const removeNoInheritance = (person: Person): boolean => {
  return person.inheritance !== 0
}

const findInheritance = (total: number, current?: Person) => {
  if (total === 0 || !current) return total

  const { predead, children, spouse, parents, siblings, unilateral } = current
  if (predead !== true) {
    current.inheritance = total
  }

  if (children?.length) {
    // multiple children and spouse:    2/3/children and 1/3
    // multiple children and no spouse: 1/children   and 0
    let forChildren = spouse ? ((total / 3) * 2) / children.length : total / children.length
    let forSpouse = spouse ? total / 3 : 0

    if (children.length === 1) {
      // single child and spouse:    1/2 and 1/2
      // single child and no spouse: 1   and 0
      forChildren = spouse ? total / 2 : total
      forSpouse = spouse ? total / 2 : 0
    }
    children.forEach((child) => findInheritance(forChildren, child))
    findInheritance(forSpouse, spouse)
    return
  }

  const numberParents = parents?.length ?? 0
  const numberSiblings = siblings?.length ?? 0
  const numberUnilateral = unilateral?.length ?? 0
  const numberRelatives = numberParents + numberSiblings + numberUnilateral

  let inheritance = {
    relatives: total,
    parents: 0,
    siblingsTotal: 0,
    siblings: 0,
    unilateral: 0,
  }

  if (spouse) {
    // only spouse:                 1
    // spouse and other relatives : 2/3
    let forSpouse = numberRelatives > 0 ? (total / 3) * 2 : total
    // if there's a spouse the other relatives get 1/3
    inheritance.relatives = total / 3
    findInheritance(forSpouse, spouse)
  }

  if (numberParents) {
    inheritance.parents = inheritance.relatives / numberRelatives
    // The parents receive at least half of the remaining inheritance
    if (inheritance.parents * numberParents < inheritance.relatives / 2) {
      inheritance.parents = inheritance.relatives / 2 / numberParents
    }

    const parentsAlive = parents?.filter((p) => !p.predead)
    // If there's only one parent alive, all the inheritance goes to them
    if (parentsAlive?.length === 1) {
      findInheritance(inheritance.parents * numberParents, parentsAlive[0])
    } else {
      // If neither parents is alive but the grandparents are, they receive only 1 parent's worth
      if (parentsAlive?.length === 0) {
        inheritance.parents = inheritance.relatives / (1 + numberSiblings + numberUnilateral) / numberParents
      }
      parents?.forEach((parent) => findInheritance(inheritance.parents, parent))
    }
  }

  if (numberSiblings + numberUnilateral) {
    inheritance.siblingsTotal =
      (inheritance.relatives - inheritance.parents * numberParents) / (numberSiblings + numberUnilateral)

    if (numberUnilateral === 0) {
      // If there are no unilateral siblings all goes the bilaterals
      inheritance.siblings = inheritance.siblingsTotal
    } else if (numberSiblings === 0) {
      // If there are no bilateral siblings all goes to the unilaterals
      inheritance.unilateral = inheritance.siblingsTotal
    } else {
      // Otherwise it's split 2/3 bilateral and 1/3 unilateral
      inheritance.siblings = (inheritance.siblingsTotal * 2) / 3 / numberSiblings
      inheritance.unilateral = inheritance.siblings / 2
    }

    siblings?.forEach((sibling) => findInheritance(inheritance.siblings, sibling))
    unilateral?.forEach((sibling) => findInheritance(inheritance.unilateral, sibling))
  }
}

export const calculateInheritance = (person: Person): Person => {
  const graph = { ...person }
  removeDeadEnds(graph)
  findInheritance(100, graph)
  return graph
}
