import { merge } from 'lodash'
import { CategoryName } from '../context/Category'
import { Person } from './person'

const MAX_DEGREE = 999

const markInheritanceless = (deceased: Person) => {
  deceased.degree = 0
  let maxDegree: Record<CategoryName, number> = {
    children: MAX_DEGREE,
    spouse: MAX_DEGREE,
    parents: MAX_DEGREE,
    siblings: MAX_DEGREE,
    unilateral: MAX_DEGREE,
  }

  const visited: Record<string, boolean> = {}
  let queue = [deceased]
  visited[deceased.id] = true

  while (queue.length !== 0) {
    const person = queue.shift() as Person
    // reset inheritance from previous calculations
    delete person.inheritance

    console.log(person.name, person.degree, maxDegree[person.category])

    const relatives = findRelatives(person)
    if (person.alive) {
      // person is elegible for receiving the inheritance
      if (person.degree! < 7 && person.degree! <= maxDegree[person.category]) {
        maxDegree[person.category] = person.degree!
        // out of the degree range
      } else {
        person.inheritance = 0
      }
      continue
    }

    // person has no heirs
    if (relatives.length === 0) {
      person.inheritance = 0
      continue
    }

    // add every relative to the queue
    for (const relative of relatives) {
      if (!visited[relative.id]) {
        relative.degree = findDegree(relative, person)

        // children go in front of the queue because they have priority
        if (relative.category === 'children') {
          queue.unshift(relative)
        } else {
          queue.push(relative)
        }
      }
    }
  }
}

const findRelatives = (person: Person): Person[] => {
  // Id '1' is always the deceased
  if (person.id === '1') {
    return [...person.children, ...person.spouse, ...person.parents, ...person.siblings, ...person.unilateral]
  } else if (person.category === 'parents') {
    return [...person.children, ...person.parents]
  } else {
    return [...person.children]
  }
}

const findDegree = (relative: Person, current: Person): number => {
  if (relative.category === 'siblings' || relative.category === 'unilateral') {
    return (current.degree ?? 0) + 2
  } else {
    return (current.degree ?? 0) + 1
  }
}

const removeInheritanceless = (person: Person): boolean => {
  if (person.inheritance === 0) {
    return false
  }

  for (const relative of findRelatives(person)) {
    const elegible = removeInheritanceless(relative)
    if (!elegible) {
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
      // If there are no unilateral siblings all goes the bilaterals
      inheritance.siblings = inheritance.siblingsTotal / numberSiblings
    } else if (numberSiblings === 0) {
      // If there are no bilateral siblings all goes to the unilaterals
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
  markInheritanceless(person)
  // Deep copy initial state after removing old inheritance
  // so the relatives are copied too and aren't just references to the same object
  // and the old inheritance calculation isn't preserved
  const graph = JSON.parse(JSON.stringify(person))
  removeInheritanceless(graph)
  findInheritance(100, graph)

  return merge(graph, person)
}
