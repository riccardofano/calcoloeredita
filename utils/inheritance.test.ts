import { CategoryName } from '../context/Category'
import { calculateInheritance } from './inheritance'
import { Person } from './person'

const newPerson = (
  options: { id: string; name: string; alive: boolean; category: CategoryName } & Partial<
    Record<CategoryName, Person[]>
  >
): Person => {
  return {
    children: [],
    spouse: [],
    parents: [],
    siblings: [],
    unilateral: [],
    ...options,
  }
}

const newDeceased = (relatives: Partial<Record<CategoryName, Person[]>>) => {
  return newPerson({ id: '1', name: 'Defunto', alive: false, category: 'children', ...relatives })
}

test('Only one child', () => {
  const deceased = newDeceased({
    children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
  })
  const result = calculateInheritance(deceased)

  expect(result.children[0].inheritance).toBe(100)
})
