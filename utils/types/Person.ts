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
  return person.relatives.reduce(
    (acc, id) => {
      const current = list[id]
      if (current) {
        acc[current.category].push(id)
      }
      return acc
    },
    {
      children: [] as string[],
      spouse: [] as string[],
      ascendants: [] as string[],
      bilateral: [] as string[],
      unilateral: [] as string[],
      others: [] as string[],
    }
  )
}
