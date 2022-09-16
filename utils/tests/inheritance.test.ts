import { newDeceased, newOther, newPerson } from './common'
import { calculateInheritance } from '../inheritance'

test('Only one child', () => {
  // If there's only one child, they get all the inheritance
  const deceased = newDeceased({
    children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.children[0].id]).toBe('1')
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

  expect(result[deceased.children[0].id]).toBe('1/2')
  expect(result[deceased.children[1].id]).toBe('1/2')
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

  expect(result[deceased.children[0].id]).toBe('1/2')
  expect(result[deceased.children[1].id]).toBeFalsy()
  expect(result[deceased.children[1].children[0].id]).toBe('1/4')
  expect(result[deceased.children[1].children[1].id]).toBe('1/4')
})

test('One child and one spouse', () => {
  // If there are two children, they both get half of the total
  const deceased = newDeceased({
    children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
    spouse: [newPerson({ id: '3', name: 'Coniuge', alive: true, category: 'spouse' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.children[0].id]).toBe('1/2')
  expect(result[deceased.spouse[0].id]).toBe('1/2')
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

  expect(result[deceased.children[0].id]).toBe('1/3')
  expect(result[deceased.children[1].id]).toBe('1/3')
  expect(result[deceased.spouse[0].id]).toBe('1/3')
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

  expect(result[deceased.children[0].id]).toBe('2/9')
  expect(result[deceased.children[1].id]).toBe('2/9')
  expect(result[deceased.children[1].id]).toBe('2/9')
  expect(result[deceased.spouse[0].id]).toBe('1/3')
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

  expect(result[deceased.children[0].id]).toBe('1')
  expect(result[deceased.parents[0].id]).toBeFalsy()
  expect(result[deceased.siblings[0].id]).toBeFalsy()
  expect(result[deceased.unilateral[0].id]).toBeFalsy()
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

  expect(result[deceased.spouse[0].id]).toBe('2/3')
  expect(result[deceased.parents[0].id]).toBe('1/6')
  expect(result[deceased.parents[1].id]).toBe('1/6')
})

test('Spouse and one bilateral sibling', () => {
  // Spouse gets 2/3
  // Sibling gets 1/3
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    siblings: [newPerson({ id: '3', name: 'Sorella', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.spouse[0].id]).toBe('2/3')
  expect(result[deceased.siblings[0].id]).toBe('1/3')
})

test('Spouse and one unilateral sibling', () => {
  // Spouse gets 2/3
  // Sibling gets 1/3
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    unilateral: [newPerson({ id: '3', name: 'Sorella', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.spouse[0].id]).toBe('2/3')
  expect(result[deceased.unilateral[0].id]).toBe('1/3')
})

test('Spouse, parents, bilateral, and unilateral siblings ', () => {
  // The spouse gets 2/3
  // Parents at least 1/4 of the total
  // Bilateral siblings 1/18
  // Unilateral siblings half a the bilateral siblings (1/36)
  const deceased = newDeceased({
    spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
    parents: [newPerson({ id: '3', name: 'Mamma', alive: true, category: 'parents' })],
    siblings: [newPerson({ id: '4', name: 'Sorella', alive: true, category: 'siblings' })],
    unilateral: [newPerson({ id: '5', name: 'Fratello', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.spouse[0].id]).toBe('2/3')
  expect(result[deceased.parents[0].id]).toBe('1/4')
  expect(result[deceased.siblings[0].id]).toBe('1/18')
  expect(result[deceased.unilateral[0].id]).toBe('1/36')
})

test('Spouse, two grandparents and one sibling', () => {
  const deceased = newDeceased({
    spouse: [newPerson({ id: '3', name: 'Coniuge', alive: true, category: 'spouse' })],
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [
          newPerson({ id: '8', name: 'Nonna', alive: true, category: 'parents' }),
          newPerson({ id: '9', name: 'Nonno', alive: true, category: 'parents' }),
        ],
      }),
    ],
    siblings: [newPerson({ id: '4', name: 'Fratello 1', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.spouse[0].id]).toBe('2/3')
  expect(result[deceased.siblings[0].id]).toBe('1/12')
  expect(result[deceased.parents[0].parents[0].id]).toBe('1/8')
  expect(result[deceased.parents[0].parents[1].id]).toBe('1/8')
})

test('Spouse, one grandparent and four siblings', () => {
  // The spouse takes 2/3
  // The grandparent has to have at least 1/4 of the inheritance
  // The rest goes to the siblings
  const deceased = newDeceased({
    spouse: [newPerson({ id: '3', name: 'Coniuge', alive: true, category: 'spouse' })],
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '8', name: 'Nonna', alive: true, category: 'parents' })],
      }),
    ],
    siblings: [
      newPerson({ id: '4', name: 'Fratello 1', alive: true, category: 'siblings' }),
      newPerson({ id: '5', name: 'Sorella 1', alive: true, category: 'siblings' }),
      newPerson({ id: '6', name: 'Sorella 2', alive: true, category: 'siblings' }),
      newPerson({ id: '7', name: 'Fratello 2', alive: true, category: 'siblings' }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.spouse[0].id]).toBe('2/3')
  expect(result[deceased.siblings[0].id]).toBe('1/48')
  expect(result[deceased.siblings[1].id]).toBe('1/48')
  expect(result[deceased.siblings[2].id]).toBe('1/48')
  expect(result[deceased.siblings[3].id]).toBe('1/48')
  expect(result[deceased.parents[0].parents[0].id]).toBe('1/4')
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

  expect(result[deceased.parents[0].id]).toBe('1/2')
  expect(result[deceased.parents[1].id]).toBe('1/2')
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

  expect(result[deceased.parents[0].id]).toBe('1')
  expect(result[deceased.parents[1].parents[0].id]).toBeFalsy()
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

  expect(result[deceased.parents[0].parents[0].id]).toBe('1/2')
  expect(result[deceased.parents[1].parents[0].id]).toBe('1/4')
  expect(result[deceased.parents[1].parents[1].id]).toBe('1/4')
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

  expect(result[deceased.parents[0].parents[0].id]).toBe('1/2')
  expect(result[deceased.parents[1].parents[0].id]).toBe('1/2')
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

  expect(result[deceased.parents[0].parents[0].parents[0].id]).toBeFalsy()
  expect(result[deceased.parents[1].parents[0].id]).toBe('1')
})

test('One parent and one sibling', () => {
  const deceased = newDeceased({
    parents: [newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' })],
    siblings: [newPerson({ id: '3', name: 'Fratello', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.parents[0].id]).toBe('1/2')
  expect(result[deceased.siblings[0].id]).toBe('1/2')
})

test('One grandparent and one sibling', () => {
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '2',
        name: 'Mamma',
        alive: false,
        category: 'parents',
        parents: [newPerson({ id: '4', name: 'Nonna', alive: true, category: 'parents' })],
      }),
    ],
    siblings: [newPerson({ id: '3', name: 'Fratello', alive: true, category: 'siblings' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.parents[0].parents[0].id]).toBe('1/2')
  expect(result[deceased.siblings[0].id]).toBe('1/2')
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

  expect(result[deceased.parents[0].id]).toBe('1/3')
  expect(result[deceased.parents[1].id]).toBe('1/3')
  expect(result[deceased.siblings[0].id]).toBe('1/3')
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

  expect(result[deceased.parents[0].id]).toBe('1/2')
  expect(result[deceased.siblings[0].id]).toBe('1/4')
  expect(result[deceased.siblings[1].id]).toBe('1/4')
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

  expect(result[deceased.parents[0].id]).toBe('1/4')
  expect(result[deceased.parents[1].id]).toBe('1/4')
  expect(result[deceased.siblings[0].id]).toBe('1/6')
  expect(result[deceased.siblings[1].id]).toBe('1/6')
  expect(result[deceased.siblings[2].id]).toBe('1/6')
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

  expect(result[deceased.parents[0].parents[0].id]).toBe('1/4')
  expect(result[deceased.parents[1].parents[0].id]).toBe('1/4')
  expect(result[deceased.siblings[0].id]).toBe('1/2')
})

test('Two bilateral siblings and one unilateral one', () => {
  const deceased = newDeceased({
    siblings: [
      newPerson({ id: '2', name: 'Fratello germano', alive: true, category: 'siblings' }),
      newPerson({ id: '3', name: 'Sorella germana', alive: true, category: 'siblings' }),
    ],
    unilateral: [newPerson({ id: '4', name: 'Fratello unilaterale', alive: true, category: 'unilateral' })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.siblings[0].id]).toBe('2/5')
  expect(result[deceased.siblings[1].id]).toBe('2/5')
  expect(result[deceased.unilateral[0].id]).toBe('1/5')
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

  expect(result[deceased.parents[1].id]).toBe('1/2')
  expect(result[deceased.parents[0].parents[0].id]).toBeFalsy()
  expect(result[deceased.siblings[0].id]).toBe('1/5')
  expect(result[deceased.siblings[1].children[0].id]).toBe('1/10')
  expect(result[deceased.siblings[1].children[1].id]).toBe('1/10')
  expect(result[deceased.unilateral[0].id]).toBe('1/10')
})

test('One other relative within six degrees of kinship', () => {
  const deceased = newDeceased({
    others: [newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 })],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.others[0].id]).toBe('1')
})

test('Three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.others[0].id]).toBe('1/3')
  expect(result[deceased.others[1].id]).toBe('1/3')
  expect(result[deceased.others[2].id]).toBe('1/3')
})

test('One child and three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    children: [newPerson({ id: '5', alive: true, name: 'Figlia', category: 'children' })],
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.children[0].id]).toBe('1')
  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBeFalsy()
  expect(result[deceased.others[2].id]).toBeFalsy()
})

test('Spouse and three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    spouse: [newPerson({ id: '5', alive: true, name: 'Coniuge', category: 'spouse' })],
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.spouse[0].id]).toBe('1')
  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBeFalsy()
  expect(result[deceased.others[2].id]).toBeFalsy()
})

test('One parent and three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    parents: [newPerson({ id: '5', alive: true, name: 'Mamma', category: 'parents' })],
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.parents[0].id]).toBe('1')
  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBeFalsy()
  expect(result[deceased.others[2].id]).toBeFalsy()
})

test('One grandparent and three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    parents: [
      newPerson({
        id: '5',
        alive: false,
        name: 'Mamma',
        category: 'parents',
        parents: [newPerson({ id: '6', alive: true, name: 'Nonno', category: 'parents' })],
      }),
    ],
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.parents[0].parents[0].id]).toBe('1')
  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBeFalsy()
  expect(result[deceased.others[2].id]).toBeFalsy()
})

test('One siblings and three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    siblings: [newPerson({ id: '5', alive: true, name: 'Fratello', category: 'siblings' })],
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.siblings[0].id]).toBe('1')
  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBeFalsy()
  expect(result[deceased.others[2].id]).toBeFalsy()
})

test('One siblings and three other relatives within six degrees of kinship', () => {
  const deceased = newDeceased({
    unilateral: [newPerson({ id: '5', alive: true, name: 'Fratello', category: 'unilateral' })],
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.unilateral[0].id]).toBe('1')
  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBeFalsy()
  expect(result[deceased.others[2].id]).toBeFalsy()
})

test('Three other relatives of the same degree and one with an higher one', () => {
  const deceased = newDeceased({
    others: [
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '5', alive: true, name: 'Cugino', category: 'others', degree: 4 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.others[0].id]).toBe('1/3')
  expect(result[deceased.others[1].id]).toBe('1/3')
  expect(result[deceased.others[2].id]).toBe('1/3')
  expect(result[deceased.others[3].id]).toBeFalsy()
})

test('One relative with an higher degree and three other relatives with a lower one', () => {
  const deceased = newDeceased({
    others: [
      newOther({ id: '5', alive: true, name: 'Cugino', category: 'others', degree: 4 }),
      newOther({ id: '2', alive: true, name: 'Zia', category: 'others', degree: 3 }),
      newOther({ id: '3', alive: true, name: 'Zio', category: 'others', degree: 3 }),
      newOther({ id: '4', alive: true, name: 'Zia', category: 'others', degree: 3 }),
    ],
  })
  const result = calculateInheritance(deceased)

  expect(result[deceased.others[0].id]).toBeFalsy()
  expect(result[deceased.others[1].id]).toBe('1/3')
  expect(result[deceased.others[2].id]).toBe('1/3')
  expect(result[deceased.others[3].id]).toBe('1/3')
})