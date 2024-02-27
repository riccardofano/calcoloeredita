import { newDeceased, newPerson } from './common'
import { calculateInheritance } from '../inheritance'
import { validate } from '../../pages/api/inheritance'

describe('Inheritance calculation', () => {
  it('Only one child', () => {
    // If there's only one child, they get all the inheritance
    const list = {
      ...newDeceased(['only-child']),
      ...newPerson({ id: 'only-child', name: 'Figlio', category: 'children' }),
    }
    const result = calculateInheritance(list)

    expect(result['only-child']).toBe('1')
  })

  it('Two children', () => {
    // If there are two children, they both get half of the total
    const list = {
      ...newDeceased(['first-child', 'second-child']),
      ...newPerson({ id: 'first-child', category: 'children' }),
      ...newPerson({ id: 'second-child', category: 'children' }),
    }
    const result = calculateInheritance(list)

    expect(result['first-child']).toBe('1/2')
    expect(result['second-child']).toBe('1/2')
  })

  it('Two children, one has died but has two children', () => {
    // The two children both get half of the total
    // But one of the children's total is divided between their children
    const list = {
      ...newDeceased(['first-child', 'second-child']),
      ...newPerson({ id: 'first-child', category: 'children' }),
      ...newPerson({
        id: 'second-child',
        category: 'children',
        available: false,
        relatives: ['first-grandchild', 'second-grandchild'],
      }),
      ...newPerson({ id: 'first-grandchild', category: 'children' }),
      ...newPerson({ id: 'second-grandchild', category: 'children' }),
    }

    const result = calculateInheritance(list)

    expect(result['first-child']).toBe('1/2')
    expect(result['second-child']).toBeFalsy()
    expect(result['first-grandchild']).toBe('1/4')
    expect(result['second-grandchild']).toBe('1/4')
  })

  it('One child and one spouse', () => {
    // If there is one child and one spouse they both get half of the total
    const list = {
      ...newDeceased(['child', 'spouse']),
      ...newPerson({ id: 'child', category: 'children' }),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
    }
    const result = calculateInheritance(list)

    expect(result['child']).toBe('1/2')
    expect(result['spouse']).toBe('1/2')
  })

  it('Two children and one spouse', () => {
    // If there are two children and a spouse, they all get one third
    const list = {
      ...newDeceased(['first-child', 'second-child', 'the-spouse']),
      ...newPerson({ id: 'first-child', category: 'children' }),
      ...newPerson({ id: 'second-child', category: 'children' }),
      ...newPerson({ id: 'the-spouse', category: 'spouse' }),
    }
    const result = calculateInheritance(list)

    expect(result['first-child']).toBe('1/3')
    expect(result['second-child']).toBe('1/3')
    expect(result['the-spouse']).toBe('1/3')
  })

  it('Three children and one spouse', () => {
    // If there are three children and a spouse
    // children get 2/3 of the total so 2/9 each
    // spouse gets 1/3 of the total
    const list = {
      ...newDeceased(['first-child', 'second-child', 'third-child', 'spouse']),
      ...newPerson({ id: 'first-child', category: 'children' }),
      ...newPerson({ id: 'second-child', category: 'children' }),
      ...newPerson({ id: 'third-child', category: 'children' }),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
    }
    const result = calculateInheritance(list)

    expect(result['first-child']).toBe('2/9')
    expect(result['second-child']).toBe('2/9')
    expect(result['third-child']).toBe('2/9')
    expect(result['spouse']).toBe('1/3')
  })

  it('Three children, one dead but has two others and one spouse', () => {
    // children get 2/3 of the total so 2/9 each
    // grandchildren then get 1/9 each
    // spouse gets 1/3 of the total
    const list = {
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newDeceased(['first-child', 'second-child', 'third-child', 'spouse']),
      ...newPerson({ id: 'first-child', category: 'children' }),
      ...newPerson({ id: 'second-child', category: 'children' }),
      ...newPerson({
        id: 'third-child',
        category: 'children',
        available: false,
        relatives: ['first-grandchild', 'second-grandchild'],
      }),
      ...newPerson({ id: 'first-grandchild', category: 'children' }),
      ...newPerson({ id: 'second-grandchild', category: 'children' }),
    }
    const result = calculateInheritance(list)

    expect(result['first-child']).toBe('2/9')
    expect(result['second-child']).toBe('2/9')
    expect(result['first-grandchild']).toBe('1/9')
    expect(result['second-grandchild']).toBe('1/9')
    expect(result['spouse']).toBe('1/3')
  })

  it('One child and parents, bilateral, or unilateral siblings ', () => {
    // Only the child should get the total
    const list = {
      ...newDeceased(['child', 'mother', 'brother', 'sister']),
      ...newPerson({ id: 'child', category: 'children' }),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'sister', category: 'bilateral' }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['child']).toBe('1')
    expect(result['mother']).toBeFalsy()
    expect(result['sister']).toBeFalsy()
    expect(result['brother']).toBeFalsy()
  })

  it('Spouse and two parents', () => {
    // Spouse gets 2/3
    // Parents divide the rest evenly between each other
    const list = {
      ...newDeceased(['spouse', 'mother', 'father']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'father', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('2/3')
    expect(result['mother']).toBe('1/6')
    expect(result['father']).toBe('1/6')
  })

  it('Spouse and one bilateral sibling', () => {
    // Spouse gets 2/3
    // Sibling gets 1/3
    const list = {
      ...newDeceased(['spouse', 'sister']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({ id: 'sister', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('2/3')
    expect(result['sister']).toBe('1/3')
  })

  it('Spouse and one unilateral sibling', () => {
    // Spouse gets 2/3
    // Sibling gets 1/3
    const list = {
      ...newDeceased(['spouse', 'unilateral-sister']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({ id: 'unilateral-sister', category: 'unilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('2/3')
    expect(result['unilateral-sister']).toBe('1/3')
  })

  it('Spouse, parents, bilateral, and unilateral siblings ', () => {
    // The spouse gets 2/3
    // Parents at least 1/2 of the remaining amount for the relatives so 1/6
    // Bilateral siblings 1/9
    // Unilateral siblings half a the bilateral siblings (1/18)
    const list = {
      ...newDeceased(['spouse', 'mother', 'sister', 'unilateral-brother']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'sister', category: 'bilateral' }),
      ...newPerson({ id: 'unilateral-brother', category: 'unilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('2/3')
    expect(result['mother']).toBe('1/6')
    expect(result['sister']).toBe('1/9')
    expect(result['unilateral-brother']).toBe('1/18')
  })

  it('Spouse, two grandparents and one sibling', () => {
    const list = {
      ...newDeceased(['spouse', 'mother', 'brother']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({
        id: 'mother',
        category: 'ascendants',
        available: false,
        relatives: ['grandmother', 'grandfather'],
      }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
      ...newPerson({ id: 'grandfather', category: 'ascendants' }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('2/3')
    expect(result['brother']).toBe('1/6')
    expect(result['grandmother']).toBe('1/12')
    expect(result['grandfather']).toBe('1/12')
  })

  it('Spouse, one grandparent and four siblings', () => {
    // The spouse takes 2/3
    // The grandparent has to have at least 1/4 of the remaining relatives' inheritance
    // The rest goes to the siblings
    const list = {
      ...newDeceased(['spouse', 'mother', 'first-brother', 'second-brother', 'first-sister', 'second-sister']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
      ...newPerson({ id: 'first-brother', category: 'bilateral' }),
      ...newPerson({ id: 'second-brother', category: 'bilateral' }),
      ...newPerson({ id: 'first-sister', category: 'bilateral' }),
      ...newPerson({ id: 'second-sister', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('2/3')
    expect(result['grandmother']).toBe('1/6')
    expect(result['first-brother']).toBe('1/24')
    expect(result['second-brother']).toBe('1/24')
    expect(result['first-sister']).toBe('1/24')
    expect(result['second-sister']).toBe('1/24')
  })

  it('Two parents', () => {
    // Inheritance gets evenly divided between the two
    const list = {
      ...newDeceased(['mother', 'father']),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'father', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother']).toBe('1/2')
    expect(result['father']).toBe('1/2')
  })

  it('One alive parent, one grandparent', () => {
    // All inheritance goes to the alive parent
    const list = {
      ...newDeceased(['mother', 'father']),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'father', category: 'ascendants', available: false, relatives: ['grandfather'] }),
      ...newPerson({ id: 'grandfather', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother']).toBe('1')
    expect(result['grandfather']).toBeFalsy()
  })

  it("Two grandparents on the father's side and one from the mother's", () => {
    // The inheritance is calculated per lineage
    // the father's side and the mother's side both add up to 1/2
    const list = {
      ...newDeceased(['mother', 'father']),
      ...newPerson({ id: 'mother', available: false, category: 'ascendants', relatives: ['mother-grandmother'] }),
      ...newPerson({
        id: 'father',
        available: false,
        category: 'ascendants',
        relatives: ['father-grandmother', 'father-grandfather'],
      }),
      ...newPerson({ id: 'mother-grandmother', available: true, category: 'ascendants' }),
      ...newPerson({ id: 'father-grandmother', available: true, category: 'ascendants' }),
      ...newPerson({ id: 'father-grandfather', available: true, category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother-grandmother']).toBe('1/2')
    expect(result['father-grandmother']).toBe('1/4')
    expect(result['father-grandfather']).toBe('1/4')
  })

  it('Two grandparents of different lineage but same degree of kinship', () => {
    // Inheritance is divided evenly between the two grandparents
    const list = {
      ...newDeceased(['mother', 'father']),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'father', category: 'ascendants', available: false, relatives: ['grandfather'] }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
      ...newPerson({ id: 'grandfather', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['grandmother']).toBe('1/2')
    expect(result['grandfather']).toBe('1/2')
  })

  it('Two grandparents of different lineage and different degree of kinship', () => {
    // The grandparent with lower degree receives everything
    const list = {
      ...newDeceased(['mother', 'father']),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'father', category: 'ascendants', available: false, relatives: ['grandfather'] }),
      ...newPerson({ id: 'grandmother', category: 'ascendants', available: false, relatives: ['grand-grandmother'] }),
      ...newPerson({ id: 'grandfather', category: 'ascendants' }),
      ...newPerson({ id: 'grand-grandmother', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['grand-grandmother']).toBeFalsy()
    expect(result['grandfather']).toBe('1')
  })

  it('One parent and one sibling', () => {
    const list = {
      ...newDeceased(['mother', 'brother']),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother']).toBe('1/2')
    expect(result['brother']).toBe('1/2')
  })

  it('One grandparent and one sibling', () => {
    const list = {
      ...newDeceased(['mother', 'brother']),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['brother']).toBe('1/2')
    expect(result['grandmother']).toBe('1/2')
  })

  it('Two parents and one sibling', () => {
    const list = {
      ...newDeceased(['mother', 'father', 'brother']),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'father', category: 'ascendants' }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother']).toBe('1/3')
    expect(result['father']).toBe('1/3')
    expect(result['brother']).toBe('1/3')
  })

  it('One parent and two siblings', () => {
    // The parents combined must receive at least half of the inheritance
    const list = {
      ...newDeceased(['mother', 'brother', 'sister']),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
      ...newPerson({ id: 'sister', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother']).toBe('1/2')
    expect(result['brother']).toBe('1/4')
    expect(result['sister']).toBe('1/4')
  })

  it('Two parents and three siblings', () => {
    // The parents combined must receive at least half of the inheritance
    const list = {
      ...newDeceased(['mother', 'father', 'brother', 'first-sister', 'second-sister']),
      ...newPerson({ id: 'mother', category: 'ascendants' }),
      ...newPerson({ id: 'father', category: 'ascendants' }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
      ...newPerson({ id: 'first-sister', category: 'bilateral' }),
      ...newPerson({ id: 'second-sister', category: 'bilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['mother']).toBe('1/4')
    expect(result['father']).toBe('1/4')
    expect(result['brother']).toBe('1/6')
    expect(result['first-sister']).toBe('1/6')
    expect(result['second-sister']).toBe('1/6')
  })

  it('Two grandparents and one sibling', () => {
    // If there are no parents but there are grandparents
    // they receive only what one parent would receive
    // so so the sibling gets 1/2 and they get 1/4 each
    // instead of 1/3 1/3 1/3 if they were the parents
    const list = {
      ...newDeceased(['mother', 'father', 'brother']),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'father', category: 'ascendants', available: false, relatives: ['grandfather'] }),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
      ...newPerson({ id: 'grandfather', category: 'ascendants' }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
    }
    const result = calculateInheritance(list)

    expect(result['grandfather']).toBe('1/4')
    expect(result['grandmother']).toBe('1/4')
    expect(result['brother']).toBe('1/2')
  })

  it('Two bilateral siblings and one unilateral one', () => {
    const list = {
      ...newDeceased(['bilateral-brother', 'bilateral-sister', 'unilateral-brother']),
      ...newPerson({ id: 'bilateral-brother', category: 'bilateral' }),
      ...newPerson({ id: 'bilateral-sister', category: 'bilateral' }),
      ...newPerson({ id: 'unilateral-brother', category: 'unilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['bilateral-brother']).toBe('2/5')
    expect(result['bilateral-sister']).toBe('2/5')
    expect(result['unilateral-brother']).toBe('1/5')
  })

  it('One parent, one grandparent, one bilateral sibling and one unilateral sibling', () => {
    const list = {
      ...newDeceased(['mother', 'father', 'bilateral-brother', 'bilateral-sister', 'unilateral-sister']),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
      ...newPerson({ id: 'father', category: 'ascendants' }),
      ...newPerson({ id: 'bilateral-brother', category: 'bilateral' }),
      ...newPerson({
        id: 'bilateral-sister',
        category: 'bilateral',
        available: false,
        relatives: ['first-nephew', 'second-nephew'],
      }),
      ...newPerson({ id: 'first-nephew', category: 'children' }),
      ...newPerson({ id: 'second-nephew', category: 'children' }),
      ...newPerson({ id: 'unilateral-sister', category: 'unilateral' }),
    }
    const result = calculateInheritance(list)

    expect(result['father']).toBe('1/2')
    expect(result['grandmother']).toBeFalsy()
    expect(result['bilateral-brother']).toBe('1/5')
    expect(result['first-nephew']).toBe('1/10')
    expect(result['second-nephew']).toBe('1/10')
    expect(result['unilateral-sister']).toBe('1/10')
  })

  it('One other relative within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['aunt']),
      ...newPerson({ id: 'aunt', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['aunt']).toBe('1')
  })

  it('Three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['first-aunt']).toBe('1/3')
    expect(result['second-aunt']).toBe('1/3')
    expect(result['uncle']).toBe('1/3')
  })

  it('One child and three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['child', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'child', category: 'children' }),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['child']).toBe('1')
    expect(result['first-aunt']).toBeFalsy()
    expect(result['first-aunt']).toBeFalsy()
    expect(result['uncle']).toBeFalsy()
  })

  it('Spouse and three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['spouse', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['spouse']).toBe('1')
    expect(result['first-aunt']).toBeFalsy()
    expect(result['first-aunt']).toBeFalsy()
    expect(result['uncle']).toBeFalsy()
  })

  it('One parent and three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['father', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'father', category: 'ascendants' }),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['father']).toBe('1')
    expect(result['first-aunt']).toBeFalsy()
    expect(result['first-aunt']).toBeFalsy()
    expect(result['uncle']).toBeFalsy()
  })

  it('One grandparent and three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['father', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'father', category: 'ascendants', available: false, relatives: ['grandfather'] }),
      ...newPerson({ id: 'grandfather', category: 'ascendants' }),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['grandfather']).toBe('1')
    expect(result['first-aunt']).toBeFalsy()
    expect(result['first-aunt']).toBeFalsy()
    expect(result['uncle']).toBeFalsy()
  })

  it('One siblings and three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['brother', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'brother', category: 'bilateral' }),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['brother']).toBe('1')
    expect(result['first-aunt']).toBeFalsy()
    expect(result['first-aunt']).toBeFalsy()
    expect(result['uncle']).toBeFalsy()
  })

  it('One siblings and three other relatives within six degrees of kinship', () => {
    const list = {
      ...newDeceased(['unilateral-brother', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'unilateral-brother', category: 'unilateral' }),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
    }
    const result = calculateInheritance(list)

    expect(result['unilateral-brother']).toBe('1')
    expect(result['first-aunt']).toBeFalsy()
    expect(result['first-aunt']).toBeFalsy()
    expect(result['uncle']).toBeFalsy()
  })

  it('Three other relatives of the same degree and one with an higher one', () => {
    const list = {
      ...newDeceased(['first-aunt', 'second-aunt', 'uncle', 'cousin']),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
      ...newPerson({ id: 'cousin', category: 'others', degree: 4 }),
    }
    const result = calculateInheritance(list)

    expect(result['first-aunt']).toBe('1/3')
    expect(result['second-aunt']).toBe('1/3')
    expect(result['uncle']).toBe('1/3')
    expect(result['cousin']).toBeFalsy()
  })

  it('One relative with an higher degree and three other relatives with a lower one', () => {
    const list = {
      ...newDeceased(['cousin', 'first-aunt', 'second-aunt', 'uncle']),
      ...newPerson({ id: 'first-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'second-aunt', category: 'others', degree: 3 }),
      ...newPerson({ id: 'uncle', category: 'others', degree: 3 }),
      ...newPerson({ id: 'cousin', category: 'others', degree: 4 }),
    }
    const result = calculateInheritance(list)

    expect(result['cousin']).toBeFalsy()
    expect(result['first-aunt']).toBe('1/3')
    expect(result['second-aunt']).toBe('1/3')
    expect(result['uncle']).toBe('1/3')
  })

  it('Relatives with a degree of kinship greater than 6 are ignored', () => {
    const list = {
      ...newDeceased(['child']),
      ...newPerson({ id: 'child', category: 'children', available: false, relatives: ['grandchild'] }),
      ...newPerson({ id: 'grandchild', category: 'children', available: false, relatives: ['grand-grandchild'] }),
      ...newPerson({
        id: 'grand-grandchild',
        category: 'children',
        available: false,
        relatives: ['grand-grand-grandchild'],
      }),
      ...newPerson({
        id: 'grand-grand-grandchild',
        category: 'children',
        available: false,
        relatives: ['grand-grand-grand-grandchild'],
      }),
      ...newPerson({
        id: 'grand-grand-grand-grandchild',
        category: 'children',
        available: false,
        relatives: ['grand-grand-grand-grand-grandchild'],
      }),
      ...newPerson({
        id: 'grand-grand-grand-grand-grandchild',
        category: 'children',
        available: false,
        relatives: ['grand-grand-grand-grand-grand-grandchild'],
      }),
      ...newPerson({
        id: 'grand-grand-grand-grand-grand-grandchild',
        category: 'children',
        available: true,
      }),
    }

    const result = calculateInheritance(list)

    expect(result['grand-grand-grand-grand-grand-grandchild']).toBeFalsy()
  })
})

describe('Inheritance body validation', () => {
  it('Should reject arrays', () => {
    const body: unknown = []
    expect(() => validate(body)).toThrow()
  })

  it('Should reject non records', () => {
    const body: unknown = {
      id: 'string',
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should accept record with one correct person', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, category: 'root', relatives: [] },
    }
    expect(() => validate(body)).not.toThrow()
  })

  it('Should accept records with multiple valid people', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, category: 'root', relatives: ['1'] },
      '1': { id: 'string', name: 'Son', available: true, degree: 1, previous: '0', category: 'children', relatives: [] },
    }
    expect(() => validate(body)).not.toThrow()
  })

  it('Should reject missing key', () => {
    // prettier-ignore
    const body: unknown = {
      id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, category: 'root', relatives: ['1']
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should reject object with missing id', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { name: 'Defunto', available: false, degree: 0, previous: null, category: 'root', relatives: ['1'] }
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should reject object with missing name', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', available: false, degree: 0, previous: null, category: 'root', relatives: ['1'] }
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should reject object with missing availability', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', degree: 0, previous: null, category: 'root', relatives: ['1'] }
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should allow object with missing degree', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, previous: null, category: 'root', relatives: ['1'] }
    }
    expect(() => validate(body)).not.toThrow()
  })

  it('Should reject object with missing previous key', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, degree: 0, category: 'root', relatives: ['1'] }
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should reject object with missing category', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, relatives: ['1'] }
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should reject object with missing relatives', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, category: 'root', }
    }
    expect(() => validate(body)).toThrow()
  })
})
