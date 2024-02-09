import { Person } from '../types/Person'

export const newPerson = (options: Partial<Person>): { [key: string]: Person } => {
  const id = options.id ?? '0'
  return {
    [id]: {
      id,
      name: 'does not matter',
      available: true,
      degree: 0,
      previous: null,
      category: 'children',
      relatives: [],
      ...options,
    },
  }
}

export const newDeceased = (relatives: string[]) => {
  return newPerson({ id: '0', name: 'Defunto', available: false, previous: null, category: 'root', relatives })
}
