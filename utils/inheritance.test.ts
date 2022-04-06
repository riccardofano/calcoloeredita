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

test('Spouse and two parents', () => {
  // Spouse gets 2/3
  // Parents divide the rest evenly between each other
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    parents: [
      newPerson({ id: '3', name: 'Mamma', alive: true, category: 'parents' }),
      newPerson({ id: '4', name: 'Papà', alive: true, category: 'parents' }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.spouse[0].inheritance)).toBe('2/3')
  expect(asFraction(result.parents[0].inheritance)).toBe('1/6')
  expect(asFraction(result.parents[1].inheritance)).toBe('1/6')
})

test('Spouse and one bilateral sibling', () => {
  // Spouse gets 2/3
  // Sibling gets 1/3
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    siblings: [newPerson({ id: '3', name: 'Sorella', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.spouse[0].inheritance)).toBe('2/3')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/3')
})

test('Spouse and one unilateral sibling', () => {
  // Spouse gets 2/3
  // Sibling gets 1/3
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    unilateral: [newPerson({ id: '3', name: 'Sorella', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.spouse[0].inheritance)).toBe('2/3')
  expect(asFraction(result.unilateral[0].inheritance)).toBe('1/3')
})

test('Spouse, parents, bilateral, and unilateral siblings ', () => {
  // The spouse gets 2/3
  // Parents 1/2 of the remainder (1/6)
  // Bilateral siblings 2/3 of the remainder (1/9)
  // Unilateral siblings half a the bilateral siblings (1/18)
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    parents: [newPerson({ id: '3', name: 'Mamma', alive: true, category: 'parents' })],
    siblings: [newPerson({ id: '4', name: 'Sorella', alive: true, category: 'siblings' })],
    unilateral: [newPerson({ id: '5', name: 'Fratello', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.spouse[0].inheritance)).toBe('2/3')
  expect(asFraction(result.parents[0].inheritance)).toBe('1/6')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/9')
  expect(asFraction(result.unilateral[0].inheritance)).toBe('1/18')
})

test('Two parents', () => {
  // Inheritance gets evenly divided between the two
  const deceased = newDeceased({
    parents: [
      newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' }),
      newPerson({ id: '3', name: 'Papà', alive: true, category: 'parents' }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result.parents[0].inheritance).toBe(50)
  expect(result.parents[1].inheritance).toBe(50)
})

test('One alive parent, one grandparent', () => {
  // All inheritance goes to the alive parent
  const deceased = newDeceased({
    parents: [
      newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' }),
      newPerson({
        id: '3',
        name: 'Papà',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '4', name: 'Nonno', alive: true, category: 'parents' })],
      }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result.parents[0].inheritance).toBe(100)
  expect(result.parents[1].parents[0].inheritance).toBeFalsy()
})

test("Two grandparents on the father's side and one from the mother's", () => {
  // The inheritance is calculated per lineage
  // the father's side and the mother's side both add up to 1/2
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '5', name: 'Nonna', alive: true, category: 'parents' })],
      }),
      newPerson({
        id: '3',
        name: 'Papà',
        alive: false,
        category: 'parents',
        parents: [
          newPerson({ id: '4', name: 'Nonno 1', alive: true, category: 'parents' }),
          newPerson({ id: '6', name: 'Nonno 2', alive: true, category: 'parents' }),
        ],
      }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].parents[0].inheritance)).toBe('1/2')
  expect(asFraction(result.parents[1].parents[0].inheritance)).toBe('1/4')
  expect(asFraction(result.parents[1].parents[1].inheritance)).toBe('1/4')
})

test('Two grandparents of different lineage but same degree of kinship', () => {
  // Inheritance is divided evenly between the two grandparents
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '5', name: 'Nonna', alive: true, category: 'parents' })],
      }),
      newPerson({
        id: '3',
        name: 'Papà',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '4', name: 'Nonno', alive: true, category: 'parents' })],
      }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result.parents[0].parents[0].inheritance).toBe(50)
  expect(result.parents[1].parents[0].inheritance).toBe(50)
})

test('Two grandparents of different lineage and different degree of kinship', () => {
  // The grandparent with lower degree receives everything
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [
          newPerson({
            id: '3',
            name: 'Nonna',
            alive: false,
            category: 'parents',
            parents: [newPerson({ id: '4', name: 'Bisnonna', alive: true, category: 'parents' })],
          }),
        ],
      }),
      newPerson({
        id: '5',
        name: 'Papà',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '6', name: 'Nonno', alive: true, category: 'parents' })],
      }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result.parents[0].parents[0].parents[0].inheritance).toBeFalsy()
  expect(result.parents[1].parents[0].inheritance).toBe(100)
})

test('One parent and one sibling', () => {
  const deceased = newDeceased({
    parents: [newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' })],
    siblings: [newPerson({ id: '3', name: 'Fratello', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].inheritance)).toBe('1/2')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/2')
})

test('Two parents and one sibling', () => {
  const deceased = newDeceased({
    parents: [
      newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' }),
      newPerson({ id: '3', name: 'Papà', alive: true, category: 'parents' }),
    ],
    siblings: [newPerson({ id: '4', name: 'Fratello', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].inheritance)).toBe('1/3')
  expect(asFraction(result.parents[1].inheritance)).toBe('1/3')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/3')
})

test('Two parents and one sibling', () => {
  const deceased = newDeceased({
    parents: [
      newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' }),
      newPerson({ id: '3', name: 'Papà', alive: true, category: 'parents' }),
    ],
    siblings: [newPerson({ id: '4', name: 'Fratello', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].inheritance)).toBe('1/3')
  expect(asFraction(result.parents[1].inheritance)).toBe('1/3')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/3')
})

test('One parent and two siblings', () => {
  // The parents combined must receive at least half of the inheritance
  const deceased = newDeceased({
    parents: [newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' })],
    siblings: [
      newPerson({ id: '3', name: 'Fratello', alive: true, category: 'siblings' }),
      newPerson({ id: '4', name: 'Sorella', alive: true, category: 'siblings' }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].inheritance)).toBe('1/2')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/4')
  expect(asFraction(result.siblings[1].inheritance)).toBe('1/4')
})

test('Two parents and three siblings', () => {
  // The parents combined must receive at least half of the inheritance
  const deceased = newDeceased({
    parents: [
      newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' }),
      newPerson({ id: '3', name: 'Papà', alive: true, category: 'parents' }),
    ],
    siblings: [
      newPerson({ id: '4', name: 'Fratello', alive: true, category: 'siblings' }),
      newPerson({ id: '5', name: 'Sorella', alive: true, category: 'siblings' }),
      newPerson({ id: '6', name: 'Sorella', alive: true, category: 'siblings' }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].inheritance)).toBe('1/4')
  expect(asFraction(result.parents[1].inheritance)).toBe('1/4')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/6')
  expect(asFraction(result.siblings[1].inheritance)).toBe('1/6')
  expect(asFraction(result.siblings[2].inheritance)).toBe('1/6')
})

test('Two grandparents and one sibling', () => {
  // If there are no parents but there are grandparents
  // they receive only what one parent would receive
  // so so the sibling gets 1/2 and they get 1/4 each
  // instead of 1/3 1/3 1/3 if they were the parents
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '5', name: 'Nonna', alive: true, category: 'parents' })],
      }),
      newPerson({
        id: '3',
        name: 'Papà',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '6', name: 'Nonno', alive: true, category: 'parents' })],
      }),
    ],
    siblings: [newPerson({ id: '4', name: 'Fratello', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[0].parents[0].inheritance)).toBe('1/4')
  expect(asFraction(result.parents[1].parents[0].inheritance)).toBe('1/4')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/2')
})

test('One parent, one grandparent, one bilateral sibling and one unilateral sibling', () => {
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '7', name: 'Nonna', alive: true, category: 'parents' })],
      }),
      newPerson({
        id: '3',
        name: 'Papà',
        alive: true,
        category: 'parents',
      }),
    ],
    siblings: [
      newPerson({ id: '4', name: 'Fratello germano', alive: true, category: 'siblings' }),
      newPerson({
        id: '5',
        name: 'Sorella germana',
        alive: false,
        category: 'siblings',
        children: [
          newPerson({ id: '8', name: 'Nipote 1', alive: true, category: 'children' }),
          newPerson({ id: '9', name: 'Nipote 2', alive: true, category: 'children' }),
        ],
      }),
    ],
    unilateral: [newPerson({ id: '6', name: 'Sorella unilaterale', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(asFraction(result.parents[1].inheritance)).toBe('1/2')
  expect(asFraction(result.parents[0].parents[0].inheritance)).toBe('0')
  expect(asFraction(result.siblings[0].inheritance)).toBe('1/5')
  expect(asFraction(result.siblings[1].children[0].inheritance)).toBe('1/10')
  expect(asFraction(result.siblings[1].children[1].inheritance)).toBe('1/10')
  expect(asFraction(result.unilateral[0].inheritance)).toBe('1/10')
})
