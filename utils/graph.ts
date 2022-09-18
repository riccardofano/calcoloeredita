import { Person, PersonList } from './types/Person'

const DEGREE_CUTOFF = 6

function isDegreeTooHigh(person: Person, maxDegree: number, maxAscendantDegree: number) {
  if (person.category === 'ascendants') {
    // Ascendants only get excluded is another ascendant has a degree lower than them
    // but they set the degree for everyone
    return person.degree > maxAscendantDegree
  }
  return person.degree > maxDegree
}

function isPersonEligible(
  person: Person,
  maxDegree: number,
  maxAscendantDegree: number,
  hasRepresentationRight: boolean
) {
  // Someone is eligible if:
  // They are within 6 degrees from the deceased and
  // nobody with a degree lower than them was found eligible already.
  // They have the representation right (direct children or bilateral siblings).
  // They are an unilateral sibling (degree 2) (otherwise they would get excluded by the parents (degree 1))
  return (
    person.degree <= DEGREE_CUTOFF &&
    (!isDegreeTooHigh(person, maxDegree, maxAscendantDegree) ||
      hasRepresentationRight ||
      person.category === 'unilateral')
  )
}

function addEligibleRelativeToRoot(list: PersonList, relative: Person) {
  // Recursively append relative to its root
  let current = relative
  while (current.root !== null) {
    if (!list[current.root]) {
      throw new Error(`Could not find person corresponding to id: ${current.root}`)
    }
    // current element is already in the root, we're finished here
    if (list[current.root].relatives.find((id) => id === current.id) !== undefined) {
      break
    }

    list[current.root].relatives.push(current.id)
    current = list[current.root]
  }
}

function getDegree(relative: Person, current: Person): number {
  // Return the relative's degree of kinship
  // siblings (unilateral and bilateral) have a difference of 2 degrees of kinship
  // because it's calculated by doing `current -> parent -> sibling`
  // everyone else has just one degree of difference
  if (relative.category === 'bilateral' || relative.category === 'unilateral') {
    return (current.degree ?? 0) + 2
  } else {
    return (current.degree ?? 0) + 1
  }
}

// Descendants and siblings' descendants follow the representation right
// this means they can take over their parents' part of the inheritance
function hasRepresentationRight(list: PersonList, current: Person, rootId: string): boolean {
  if (current.id === rootId) {
    return true
  }

  // Current person is a direct child or bilateral sibling of the root
  if (current.root === rootId && (current.category === 'children' || current.category === 'bilateral')) {
    return true
  }

  // If everyone in their family line had the right they have it as well
  let parentHadRepresentationRight = true
  while (current.root !== null && parentHadRepresentationRight) {
    const parent = list[current.root]
    if (!parent) {
      throw new Error(`Could not find parent with id: ${current.root}`)
    }

    if (!(parent.category === 'children' || parent.category === 'bilateral')) {
      parentHadRepresentationRight = false
    }
    current = parent
  }

  return parentHadRepresentationRight
}

// Build a graph with only the people who can receive the inheritance
export function stripGraph(
  list: PersonList,
  root: Person,
  getRelevantCategories: (isRoot: boolean, person: Person) => string[]
): PersonList {
  const visited: Record<string, boolean> = { [root.id]: true }

  const queue: string[] = [root.id]
  let maxDegree = Infinity
  let maxAscendantDegree = Infinity

  const others = root.relatives.filter((id) => list[id].category === 'others')

  while (queue.length !== 0) {
    const currentId = queue.shift() as string
    const person = list[currentId]

    if (!person) {
      throw new Error(`Could not find person with id: ${currentId}`)
    }

    if (person.available) {
      if (isPersonEligible(person, maxDegree, maxAscendantDegree, hasRepresentationRight(list, person, root.id))) {
        maxDegree = person.degree
        if (person.category === 'ascendants') {
          maxAscendantDegree = maxDegree
        }

        // Someone eligible was found!
        try {
          addEligibleRelativeToRoot(list, person)
        } catch (error) {
          throw new Error(`Unable to strip graph because of: ${error}`)
        }
      }
      continue
    }

    // Could also try checking if root is null but I want to get object validation going first
    const isRoot = person.id === root.id
    const categories = getRelevantCategories(isRoot, person)
    if (categories.length === 0) {
      continue
    }

    const relatives = person.relatives.filter((id) => {
      const relative = list[id]
      if (!relative) {
        throw new Error(`Could not find relative with id: ${id}`)
      }
      return categories.includes(list[id].category)
    })

    for (const relativeId of relatives) {
      if (visited[relativeId]) {
        continue
      }

      const relative = list[relativeId]
      relative.root = person.id
      relative.degree = getDegree(relative, person)

      visited[relative.id] = true
      queue.push(relative.id)
    }

    // reset relatives so only eligible relatives get readded
    list[person.id].relatives = []
  }

  // Some relative was found to be eligible, we're done!
  if (maxDegree !== Infinity) {
    return list
  }

  // There are no eligible relatives.
  if (others.length === 0) {
    return list
  }

  const sorted = others.sort((a, b) => {
    const ap = list[a]
    const bp = list[b]
    if (!ap) {
      throw new Error(`Could not find other relative with id: ${a}`)
    }
    if (!bp) {
      throw new Error(`Could not find other relative with id: ${b}`)
    }
    return ap.degree - bp.degree
  })

  const othersQueue = [...sorted]
  while (othersQueue.length !== 0) {
    const otherId = othersQueue.shift() as string
    const person = list[otherId]
    if (!person) {
      throw new Error(`Could not find other relative with id: ${otherId}`)
    }
    person.root = root.id

    if (person.available && person.degree <= DEGREE_CUTOFF && !isDegreeTooHigh(person, maxDegree, Infinity)) {
      maxDegree = person.degree
      addEligibleRelativeToRoot(list, person)
    }
  }

  return list
}
