import { Person } from '../types/Person'

export const newPerson = (options: Partial<Person>): { [key: string]: Person } => {
  const id = options.id ?? '0'
  return {
    [id]: {
      id,
      name: 'does not matter',
      available: true,
      degree: 0,
      root: null,
      category: 'children',
      relatives: [],
      ...options,
    },
  }
}

export const newDeceased = (relatives: string[]) => {
  return newPerson({ id: '0', name: 'Defunto', available: false, root: null, category: 'children', relatives })
}
