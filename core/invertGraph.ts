import { CategoryName } from './types/Category'
import { Person, PersonList } from './types/Person'
import mappings from './invertedMappings.json'

type InvertedPerson = {
  id: string
  name: string
  available: boolean
  relation: string
  relatedTo: string
}

type InvertedPersonList = Record<string, InvertedPerson>

export function defaultRoot(): Person {
  return {
    id: '0',
    name: 'Defunto',
    available: false,
    degree: 0,
    root: null,
    category: 'children',
    relatives: [],
  }
}

export function invertGraph(root: Person, list: InvertedPersonList): PersonList {
  const personList: PersonList = { '0': root }
  for (const person of Object.values(list)) {
    const degree = relationIdToDegree(person.relation)
    const category = relationIdToCategory(person.relation)
    const root = person.relatedTo === '' ? '0' : person.relatedTo

    personList[person.id] = {
      id: person.id,
      name: person.name,
      available: person.available,
      degree,
      root,
      category,
      relatives: [],
    }
  }

  for (const person of Object.values(personList)) {
    if (!person.root) {
      continue
    }

    personList[person.root].relatives.push(person.id)
  }

  return personList
}

function relationIdToDegree(relation: string): number {
  const mapping = mappings[relation as keyof typeof mappings]
  if (!mapping) {
    throw new Error('Unknown relation')
  }

  return mapping.degree
}

function relationIdToCategory(relation: string): CategoryName {
  const mapping = mappings[relation as keyof typeof mappings]
  if (!mapping) {
    throw new Error('Unknown relation')
  }

  return mapping.category as CategoryName
}
