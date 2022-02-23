import { Person } from './person'

interface Node extends Person {
  visited?: boolean
}

const removeDeadEnds = (c: Node): boolean => {
  const { alive, children, spouse, siblings, unilateral, parents } = c
  c.inheritance = undefined

  // can claim inheritance
  if (alive && !c.visited) {
    return true
  }

  c.visited = true
  const queue = [children, spouse, siblings, unilateral, parents].flatMap((p) => p)
  while (queue.length > 0) {
    let person = queue.shift()
    if (!person) continue

    const elegible = removeDeadEnds(person)
    if (!elegible) {
      person.inheritance = 0
    }
  }

  c.children = c.children?.filter(removeNoInheritance) || []
  c.spouse = c.spouse?.filter(removeNoInheritance) || []
  c.parents = c.parents?.filter(removeNoInheritance) || []
  c.siblings = c.siblings?.filter(removeNoInheritance) || []
  c.unilateral = c.unilateral?.filter(removeNoInheritance) || []

  return [...c.children, ...c.spouse, ...c.parents, ...c.siblings, ...c.unilateral].length > 0
}

const removeNoInheritance = (person: Node): boolean => {
  if (person.visited) delete person.visited
  return person.inheritance !== 0
}

const findInheritance = (total: number, current?: Person) => {
  if (total === 0 || !current) return total

  const { alive, children, spouse, parents, siblings, unilateral } = current
  if (alive) {
    current.inheritance = total
  }

  if (children?.length) {
    // multiple children and spouse:    2/3/children and 1/3
    // multiple children and no spouse: 1/children   and 0
    let forChildren = spouse?.[0] ? ((total / 3) * 2) / children.length : total / children.length
    let forSpouse = spouse?.[0] ? total / 3 : 0

    if (children.length === 1) {
      // single child and spouse:    1/2 and 1/2
      // single child and no spouse: 1   and 0
      forChildren = spouse?.[0] ? total / 2 : total
      forSpouse = spouse?.[0] ? total / 2 : 0
    }
    children.forEach((child) => findInheritance(forChildren, child))
    findInheritance(forSpouse, spouse?.[0])
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

  if (spouse?.length) {
    // only spouse:                 1
    // spouse and other relatives : 2/3
    let forSpouse = numberRelatives > 0 ? (total / 3) * 2 : total
    // if there's a spouse the other relatives get 1/3
    inheritance.relatives = total / 3
    findInheritance(forSpouse, spouse[0])
  }

  if (numberParents) {
    inheritance.parents = inheritance.relatives / numberRelatives
    // The parents receive at least half of the remaining inheritance
    if (inheritance.parents * numberParents < inheritance.relatives / 2) {
      inheritance.parents = inheritance.relatives / 2 / numberParents
    }

    const parentsAlive = parents?.filter((p) => p.alive)
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
  return { ...graph, ...person }
}
