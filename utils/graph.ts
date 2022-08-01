import { MaybeEligible, Person, PersonDegree, StrippedPerson } from './types/Person'

const DEGREE_CUTOFF = 6

function isDegreeTooHigh(person: MaybeEligible | PersonDegree, maxDegree: number, maxAscendantDegree: number) {
  if (person.category === 'parents') {
    // Ascendants only get excluded is another ascendant has a degree lower than them
    // but they set the degree for everyone
    return person.degree > maxAscendantDegree
  }
  return person.degree > maxDegree
}

function isPersonEligible(person: MaybeEligible, maxDegree: number, maxAscendantDegree: number) {
  // Someone is eligible if:
  // They are within 6 degrees from the deceased and
  // nobody with a degree lower than them was found eligible already.
  // They have the representation right (direct children or bilateral siblings).
  // They are an unilateral sibling (degree 2) (otherwise they would get excluded by the parents (degree 1))
  return (
    (person.degree <= DEGREE_CUTOFF && !isDegreeTooHigh(person, maxDegree, maxAscendantDegree)) ||
    person.representationRight ||
    person.category === 'unilateral'
  )
}

function addEligibleRelativeToRoot(relative: StrippedPerson) {
  // Recursively append relative to its root
  let current = relative
  while (current.root !== null) {
    const rootCategory = current.root[current.category] ?? []
    // current element is already in the root, we're finished here
    if (rootCategory.find((p) => p.id === current.id) !== undefined) {
      break
    }

    rootCategory.push(current)
    current.root[current.category] = rootCategory
    current = current.root
  }
}

function getRelatives(isRoot: boolean, person: MaybeEligible): Person[] {
  if (isRoot) {
    // The deceased can have all possible relatives
    return [...person.children, ...person.spouse, ...person.parents, ...person.siblings, ...person.unilateral]
  }

  if (person.category === 'parents') {
    // The deceased parents' only relevant relatives their own parents
    // because we already accounted for their children, they are the siblings
    if (person.degree === 1) {
      return [...person.parents]
    }
    // Other ascendants have their children also (uncles and aunts)
    return [...person.children, ...person.parents]
  }

  if (person.category === 'siblings' || person.category === 'children') {
    // Only direct children and the children of bilateral siblings are eligible
    return [...person.children]
  }

  // Everyone else's heirs aren't eligible
  return []
}

function getDegree(relative: MaybeEligible, current: MaybeEligible): number {
  // Return the relative's degree of kinship
  // siblings (unilateral and bilateral) have a difference of 2 degrees of kinship
  // because it's calculated by doing `current -> parent -> sibling`
  // everyone else has just one degree of difference
  if (relative.category === 'siblings' || relative.category === 'unilateral') {
    return current.degree + 2
  } else {
    return current.degree + 1
  }
}

// Descendants and siblings' descendence follow the representation right
// this means they can take over their parents' part of the inheritance
function hasRepresentationRight(relative: MaybeEligible, current: MaybeEligible, isRoot: boolean): boolean {
  return (
    (isRoot && (relative.category === 'children' || relative.category === 'siblings')) ||
    // If their parent had the representation right they have it as well
    current.representationRight
  )
}

// Build a graph with only the people who can receive the inheritance
export function stripGraph(root: Person): StrippedPerson | null {
  const ROOT_ID = root.id
  const strippedRoot: StrippedPerson = {
    id: ROOT_ID,
    root: null,
    category: 'children',
    wantsInheritance: false,
  }

  const visited: Record<string, boolean> = { [ROOT_ID]: true }
  const queue: MaybeEligible[] = [{ ...root, degree: 0, representationRight: false, root: null }]
  let maxDegree = Infinity
  let maxAscendantDegree = Infinity

  while (queue.length !== 0) {
    const person = queue.shift() as MaybeEligible

    if (person.alive) {
      if (isPersonEligible(person, maxDegree, maxAscendantDegree)) {
        maxDegree = person.degree
        if (person.category === 'parents') {
          maxAscendantDegree = maxDegree
        }

        // Someone eligible was found!
        addEligibleRelativeToRoot({
          id: person.id,
          root: person.root,
          category: person.category,
          wantsInheritance: true,
        })
      }
      continue
    }

    const isRoot = person.id === ROOT_ID
    const relatives = getRelatives(isRoot, person)
    if (relatives.length === 0) {
      continue
    }

    // Using a variable here so it's the same reference shared between relatives
    // person.root's categories should be empty at this moment in time so
    // there's no need to add them here
    const strippedPerson = { id: person.id, root: person.root, category: person.category, wantsInheritance: false }

    for (const relative of relatives as MaybeEligible[]) {
      if (visited[relative.id]) {
        continue
      }

      relative.representationRight = hasRepresentationRight(relative, person, isRoot)
      relative.degree = getDegree(relative, person)
      relative.root = isRoot ? strippedRoot : strippedPerson

      visited[relative.id] = true
      queue.push(relative)
    }
  }

  // Some relative was found to be eligible, we're done!
  if (maxDegree !== Infinity) {
    return strippedRoot
  }

  // There are no eligible relatives.
  if (!root.others || root.others.length === 0) {
    return null
  }

  // Look through the 'other' relatives for a candidate.
  const others = [...root.others]
  others.sort((a, b) => a.degree - b.degree)

  const othersQueue = [...others]
  while (othersQueue.length !== 0) {
    const person = othersQueue.shift() as PersonDegree

    if (person?.alive && person.degree <= DEGREE_CUTOFF && person.degree <= maxDegree) {
      maxDegree = person.degree
      addEligibleRelativeToRoot({ id: person.id, root: strippedRoot, category: 'others', wantsInheritance: true })
    }
  }

  // Nobody was found in 'others' either.
  if (strippedRoot?.others?.length === 0) {
    return null
  }

  return strippedRoot
}
