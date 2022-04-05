import Fraction from 'fraction.js'
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

const asFraction = (inheritance?: number): string => {
  return new Fraction((inheritance ?? 0) / 100).toFraction(true)
}

test('Only one child', () => {
  // If there's only one child, they get all the inheritance
  const deceased = newDeceased({
    children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
  })
  const result = calculateInheritance(deceased)

  expect(result.children[0].inheritance).toBe(100)
})

test('Two children', () => {
  // If there are two children, they both get half of the total
  const deceased = newDeceased({
    children: [
      newPerson({ id: '2', name: 'Figlio 1', alive: true, category: 'children' }),
      newPerson({ id: '3', name: 'Figlio 2', alive: true, category: 'children' }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result.children[0].inheritance).toBe(50)
  expect(result.children[1].inheritance).toBe(50)
})

test('Two children, one has died but has two children', () => {
  // The two children both get half of the total
  // But one of the children's total is divided between their children
  const deceased = newDeceased({
    children: [
      newPerson({ id: '2', name: 'Figlio 1', alive: true, category: 'children' }),
      newPerson({
        id: '3',
        name: 'Figlio 2',
        alive: false,
        category: 'children',
        children: [
          newPerson({ id: '4', name: 'Nipote 1', alive: true, category: 'children' }),
          newPerson({ id: '5', name: 'Nipote 2', alive: true, category: 'children' }),
        ],
      }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result.children[0].inheritance).toBe(50)
  expect(result.children[1].inheritance).toBeFalsy()
  expect(result.children[1].children[0].inheritance).toBe(25)
  expect(result.children[1].children[1].inheritance).toBe(25)
})

test('One child and one spouse', () => {
  // If there are two children, they both get half of the total
  const deceased = newDeceased({
    children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
    spouse: [newPerson({ id: '3', name: 'Coniuge', alive: true, category: 'spouse' })],
  })
  const result = calculateInheritance(deceased)

  expect(result.children[0].inheritance).toBe(50)
  expect(result.spouse[0].inheritance).toBe(50)
})

test('Two children and one spouse', () => {
  // If there are two children and a spouse, they all get one third
  const deceased = newDeceased({
    children: [
      newPerson({ id: '2', name: 'Figlio 1', alive: true, category: 'children' }),
      newPerson({ id: '3', name: 'Figlio 2', alive: true, category: 'children' }),
    ],
    spouse: [newPerson({ id: '4', name: 'Coniuge', alive: true, category: 'spouse' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.children[0].inheritance)).toBe('1/3')
  expect(asFraction(result.children[1].inheritance)).toBe('1/3')
  expect(asFraction(result.spouse[0].inheritance)).toBe('1/3')
})

test('Three children and one spouse', () => {
  // If there are three children and a spouse
  // children get 2/3 of the total so 2/9 each
  // spouse gets 1/3 of the total
  const deceased = newDeceased({
    children: [
      newPerson({ id: '2', name: 'Figlio 1', alive: true, category: 'children' }),
      newPerson({ id: '3', name: 'Figlio 2', alive: true, category: 'children' }),
      newPerson({ id: '4', name: 'Figlio 3', alive: true, category: 'children' }),
    ],
    spouse: [newPerson({ id: '5', name: 'Coniuge', alive: true, category: 'spouse' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.children[0].inheritance)).toBe('2/9')
  expect(asFraction(result.children[1].inheritance)).toBe('2/9')
  expect(asFraction(result.children[1].inheritance)).toBe('2/9')
  expect(asFraction(result.spouse[0].inheritance)).toBe('1/3')
})

test('One child and parents, bilateral, or unilateral siblings ', () => {
  // Only the child should get the total
  const deceased = newDeceased({
    children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
    parents: [newPerson({ id: '3', name: 'Mamma', alive: true, category: 'parents' })],
    siblings: [newPerson({ id: '4', name: 'Sorella', alive: true, category: 'siblings' })],
    unilateral: [newPerson({ id: '5', name: 'Fratello', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(result.children[0].inheritance).toBe(100)
  expect(result.parents[0].inheritance).toBeFalsy()
  expect(result.siblings[0].inheritance).toBeFalsy()
  expect(result.unilateral[0].inheritance).toBeFalsy()
})

