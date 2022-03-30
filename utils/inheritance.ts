import { merge } from 'lodash'
import { Person } from './person'

const MAX_DEGREE = 999

const markWithoutInheritance = (deceased: Person) => {
  deceased.degree = 0
  let maxDegree = MAX_DEGREE

  const visited: Record<string, boolean> = {}
  let queue = [deceased]
  visited[deceased.id] = true

  while (queue.length !== 0) {
    const person = queue.shift() as Person
    // reset inheritance from previous calculations
    delete person.inheritance

    if (person.alive) {
      if (
        person.degree! > 6 ||
        // a person only gets excluded if
        // they aren't a person with the representation right (direct children or bilateral siblings)
        // they aren't an unilateral sibling (degree 2) (otherwise they would get excluded by the parents (degree 1))
        // a person with a lower degree of kinship is already available to take the inheritance
        (!person.representationRight && person.category !== 'unilateral' && person.degree! > maxDegree)
      ) {
        person.inheritance = 0
      } else {
        maxDegree = person.degree!
      }
      continue
    }

    const relatives = findRelatives(person)
    // person is dead and has no heirs
    if (relatives.length === 0) {
      person.inheritance = 0
      continue
    }

    // add every relative to the queue
    for (const relative of relatives) {
      if (!visited[relative.id]) {
        relative.degree = findDegree(relative, person)
        relative.representationRight = hasRepresentationRight(relative, person)

        if (relative.representationRight) {
          queue.unshift(relative)
        } else {
          queue.push(relative)
        }
      }
    }
  }
}

const findRelatives = (person: Person): Person[] => {
  // The deceased can have all possible relatives
  if (person.id === '1') {
    return [...person.children, ...person.spouse, ...person.parents, ...person.siblings, ...person.unilateral]
  } else if (person.category === 'parents') {
    // The deceased parents' only relevant relatives their own parents
    // because we already accounted for their children, they are the siblings
    if (person.degree === 1) {
      return [...person.parents]
    }
    // Other ascendants have their children also (uncles and aunts)
    return [...person.children, ...person.parents]
  } else if (person.category === 'siblings' || person.category === 'children') {
    // Only direct children and the children of bilateral siblings are eligible
    return [...person.children]
  } else {
    // Everyone else's heirs aren't eligible
    return []
  }
}

const findDegree = (relative: Person, current: Person): number => {
  // Return the relative's degree of kinship
  // siblings (unilateral and bilateral) have a difference of 2 degrees of kinship
  // because it's calculated by doing `current -> parent -> sibling`
  // everyone else has just one degree of difference
  if (relative.category === 'siblings' || relative.category === 'unilateral') {
    return (current.degree ?? 0) + 2
  } else {
    return (current.degree ?? 0) + 1
  }
}

const hasRepresentationRight = (relative: Person, current: Person): boolean => {
  // Descendants and siblings' descendence follow the representation right
  // this means they can take over their parents' part of the inheritance
  return (
    ((current.id === '1' && relative.category === 'children') ||
      current.category === 'siblings' ||
      current.representationRight) ??
    false
  )
}

const removeWithoutInheritance = (person: Person): boolean => {
  if (person.inheritance === 0) {
    return false
  }

  for (const relative of findRelatives(person)) {
    const eligible = removeWithoutInheritance(relative)
    if (!eligible) {
      relative.inheritance = 0
    }
  }

  person.children = person.children.filter(hasNoInheritance)
  person.spouse = person.spouse.filter(hasNoInheritance)
  person.parents = person.parents.filter(hasNoInheritance)
  person.siblings = person.siblings.filter(hasNoInheritance)
  person.unilateral = person.unilateral.filter(hasNoInheritance)

  return person.alive || findRelatives(person).length > 0
}

const hasNoInheritance = (person: Person): boolean => {
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
    console.log(inheritance)
    inheritance.siblingsTotal = inheritance.relatives - inheritance.parents * numberParents

    if (numberUnilateral === 0) {
      // If there are no unilateral siblings all goes the bilateral siblings
      inheritance.siblings = inheritance.siblingsTotal / numberSiblings
    } else if (numberSiblings === 0) {
      // If there are no bilateral siblings all goes to the unilateral siblings
      inheritance.unilateral = inheritance.siblingsTotal / numberUnilateral
    } else {
      // Otherwise it's split 2/3 bilateral and 1/3 unilateral
      inheritance.siblings = (inheritance.siblingsTotal * 2) / 3 / numberSiblings
      inheritance.unilateral = inheritance.siblingsTotal / 3 / numberUnilateral
    }

    siblings?.forEach((sibling) => findInheritance(inheritance.siblings, sibling))
    unilateral?.forEach((sibling) => findInheritance(inheritance.unilateral, sibling))
  }
}

export const calculateInheritance = (person: Person): Person => {
  markWithoutInheritance(person)
  // Deep copy initial state after removing old inheritance
  // so the relatives are copied too and aren't just references to the same object
  // and the old inheritance calculation isn't preserved
  const graph = JSON.parse(JSON.stringify(person))
  removeWithoutInheritance(graph)
  findInheritance(100, graph)

  return merge(graph, person)
}
