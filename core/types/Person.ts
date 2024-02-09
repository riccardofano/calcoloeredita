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
