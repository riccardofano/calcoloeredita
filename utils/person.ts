export interface Person {
  name: string
  children?: Person[]
  spouse?: Person
  siblings?: Person[]
  unilateral?: Person[]
  parents?: Person[]
  predead?: boolean
}
