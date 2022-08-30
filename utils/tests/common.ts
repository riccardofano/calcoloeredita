import Fraction from 'fraction.js'
import { CategoryName, CategoryPeople } from '../types/Category'
import { Person, PersonDegree } from '../types/Person'

export interface TestPerson extends Partial<CategoryPeople<Person>> {
  id: string
  name?: string
  alive: boolean
  category: CategoryName
  others?: PersonDegree[]
}

export const newPerson = (options: TestPerson): Person => {
  return {
    name: 'does not matter',
    children: [],
    spouse: [],
    parents: [],
    siblings: [],
    unilateral: [],
    others: [],
    ...options,
  }
}

export const newOther = (options: TestPerson & { degree: number }): PersonDegree => {
  return { ...newPerson(options), degree: options.degree }
}

export type AllButOthers = Exclude<CategoryName, 'others'>
export type MaybeAllRelatives = Partial<{ [key in AllButOthers]: Person[] } & { others?: PersonDegree[] }>

export const newDeceased = (relatives: MaybeAllRelatives) => {
  return newPerson({ id: '1', name: 'Defunto', alive: false, category: 'children', ...relatives })
}

export const asFraction = (inheritance?: number): string => {
  return new Fraction((inheritance ?? 0) / 100).toFraction(true)
}
