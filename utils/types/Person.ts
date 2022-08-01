import { CategoryName, CategoryPeople } from './Category'

export interface Person extends CategoryPeople<Person> {
  id: string
  name: string
  alive: boolean
  category: CategoryName
  // 'others' must have a degree
  others: PersonDegree[]
}

export interface PersonDegree extends Person {
  degree: number
}

export interface MaybeEligible extends PersonDegree {
  // if someone has the `Diritto di rappresentazione (Cod. Civ. artt. 467-469)`
  representationRight: boolean
  root: StrippedPerson | null
}

export interface StrippedPerson extends Partial<CategoryPeople<StrippedPerson>> {
  id: string
  category: CategoryName
  wantsInheritance: boolean
  root: StrippedPerson | null
}
