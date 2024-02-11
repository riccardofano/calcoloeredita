import { CategoryName } from './Category'

export interface PersonList {
  [id: string]: Person
}

export interface Person {
  id: string
  name: string
  available: boolean
  degree: number
  previous: string | null
  category: CategoryName
  relatives: string[]
}

export function getRoot(list: PersonList): Person {
  return list['0']
}

export function getAllRelatives(list: Readonly<PersonList>, person: Person) {
  const relatives: Record<string, string[]> = {
    children: [],
    spouse: [],
    ascendants: [],
    bilateral: [],
    unilateral: [],
    others: [],
  }

  for (const id of person.relatives) {
    const current = list[id]
    relatives[current.category].push(id)
  }

  return relatives
}

export function rootRelatives(list: Readonly<PersonList>, person: Person) {
  const relatives = {
    children: [] as string[],
    spouse: undefined as string | undefined,
    ascendants: [] as string[],
    bilateral: [] as string[],
    unilateral: [] as string[],
    others: [] as string[],
  }

  for (const id of person.relatives) {
    const current = list[id]
    if (!current || current.category === 'root') {
      continue
    }

    if (current.category === 'spouse') {
      relatives.spouse = id
    } else {
      relatives[current.category].push(id)
    }
  }

  return relatives
}

export function childrenRelatives(list: Readonly<PersonList>, person: Person): string[] {
  const children = []

  for (const id of person.relatives) {
    const current = list[id]
    if (current && current.category === 'children') {
      children.push(id)
    }
  }

  return children
}

export function childrenAndAscendants(list: Readonly<PersonList>, person: Person) {
  const relatives = {
    children: [] as string[],
    ascendants: [] as string[],
  }

  for (const id of person.relatives) {
    const current = list[id]
    if ((current && current.category === 'children') || current.category === 'ascendants') {
      relatives[current.category].push(id)
    }
  }

  return relatives
}
