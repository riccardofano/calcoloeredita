import { calculatePatrimony } from '../patrimony'
import { newDeceased, newPerson } from './common'

test('Only one child', () => {
  // If there's only one child, they get 1/2 and 1/2 remains available
  const list = {
    ...newDeceased(['child']),
    ...newPerson({ id: 'child', category: 'children' }),
  }
  const result = calculatePatrimony(list)

  expect(result['child']).toBe('1/2')
  expect(result.available).toBe('1/2')
})

test('Two or more children', () => {
  // If there are two or more children 2/3 get divided among them and 1/3 remains available
  const list = {
    ...newDeceased(['first-child', 'second-child']),
    ...newPerson({ id: 'first-child', category: 'children' }),
    ...newPerson({ id: 'second-child', category: 'children' }),
  }
  const result = calculatePatrimony(list)

  expect(result['first-child']).toBe('1/3')
  expect(result['second-child']).toBe('1/3')
  expect(result.available).toBe('1/3')
})

test('Two or more children, one of them has descendants', () => {
  // If a child is dead the reserve goes to their descendants
  const list = {
    ...newDeceased(['son', 'daughter']),
    ...newPerson({ id: 'son', category: 'children', available: false, relatives: ['first-nephew', 'second-nephew'] }),
    ...newPerson({ id: 'daughter', category: 'children' }),
    ...newPerson({ id: 'first-nephew', category: 'children' }),
    ...newPerson({ id: 'second-nephew', category: 'children' }),
  }
  const result = calculatePatrimony(list)

  expect(result['first-nephew']).toBe('1/6')
  expect(result['second-nephew']).toBe('1/6')
  expect(result['daughter']).toBe('1/3')
  expect(result.available).toBe('1/3')
})

test('Only spouse', () => {
  // If only the spouse is alive 1/2 of the patrimony goes to them, 1/2 remains available
  const list = {
    ...newDeceased(['spouse']),
    ...newPerson({ id: 'spouse', category: 'spouse' }),
  }
  const result = calculatePatrimony(list)

  expect(result['spouse']).toBe('1/2')
  expect(result.available).toBe('1/2')
})

test('Only ascendants', () => {
  // If only the ascendants are alive 1/3 of the patrimony goes to them, 2/3 remain available
  const list = {
    ...newDeceased(['mother', 'father']),
    ...newPerson({ id: 'mother', category: 'ascendants' }),
    ...newPerson({ id: 'father', category: 'ascendants' }),
  }
  const result = calculatePatrimony(list)

  expect(result['mother']).toBe('1/6')
  expect(result['father']).toBe('1/6')
  expect(result.available).toBe('2/3')
})

test('Grandparents can inherit too', () => {
  const list = {
    ...newDeceased(['mother']),
    ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
    ...newPerson({ id: 'grandmother', category: 'ascendants' }),
  }
  const result = calculatePatrimony(list)

  expect(result['grandmother']).toBe('1/3')
  expect(result.available).toBe('2/3')
})

test('Grandparent and spouse', () => {
  const list = {
    ...newDeceased(['mother', 'spouse']),
    ...newPerson({ id: 'spouse', category: 'spouse' }),
    ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
    ...newPerson({ id: 'grandmother', category: 'ascendants' }),
  }
  const result = calculatePatrimony(list)

  expect(result['spouse']).toBe('1/2')
  expect(result['grandmother']).toBe('1/4')
  expect(result.available).toBe('1/4')
})

test('Only spouse and ascendants', () => {
  // The spouse receives 1/2,
  // the ascendants 1/4
  // 1/4 remains available
  const list = {
    ...newDeceased(['spouse', 'mother']),
    ...newPerson({ id: 'spouse', category: 'spouse' }),
    ...newPerson({ id: 'mother', category: 'ascendants' }),
  }
  const result = calculatePatrimony(list)

  expect(result['spouse']).toBe('1/2')
  expect(result['mother']).toBe('1/4')
  expect(result.available).toBe('1/4')
})

test('Spouse and one child', () => {
  // The spouse receives 1/3,
  // the child receives 1/3,
  // 1/3 remains available
  const list = {
    ...newDeceased(['spouse', 'daughter']),
    ...newPerson({ id: 'spouse', category: 'spouse' }),
    ...newPerson({ id: 'daughter', category: 'children' }),
  }
  const result = calculatePatrimony(list)

  expect(result['spouse']).toBe('1/3')
  expect(result['daughter']).toBe('1/3')
  expect(result.available).toBe('1/3')
})

test('Spouse and two or more children', () => {
  // The spouse receives 1/4,
  // the children receive 1/2 divided among them evenly,
  // 1/4 remains available
  const list = {
    ...newDeceased(['spouse', 'daughter', 'son']),
    ...newPerson({ id: 'spouse', category: 'spouse' }),
    ...newPerson({ id: 'daughter', category: 'children' }),
    ...newPerson({ id: 'son', category: 'children' }),
  }
  const result = calculatePatrimony(list)

  expect(result['spouse']).toBe('1/4')
  expect(result['daughter']).toBe('1/4')
  expect(result['son']).toBe('1/4')
  expect(result.available).toBe('1/4')
})
