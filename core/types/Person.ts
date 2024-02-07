import { CategoryName } from './Category'

export interface PersonList {
  [id: string]: Person
}

export interface Person {
  id: string
  name: string
  available: boolean
  degree: number
  root: string | null
  category: CategoryName
  relatives: string[]
}

export function getRoot(list: PersonList): Person {
  return list['0']
}

export function getAllRelatives(list: PersonList, person: Person) {
  const relatives: Record<string, string[]> = {
    children: [],
    spouse: [],
    ascendants: [],
    bilateral: [],
    unilateral: [],
    others: [],
  }

  for (const id in person.relatives) {
    const current = list[id]
    if (current.category === 'root') {
      throw new Error("Can't have more than one root")
    }

    relatives[current.category].push(id)
  }

  return relatives
}
