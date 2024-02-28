import { validate } from '../../pages/api/patrimony'
import { calculatePatrimony } from '../patrimony'
import { newDeceased, newPerson } from './common'

describe('Patrimony calculation', () => {
  it('Only one child', () => {
    // If there's only one child, they get 1/2 and 1/2 remains available
    const list = {
      ...newDeceased(['child']),
      ...newPerson({ id: 'child', category: 'children' }),
    }
    const result = calculatePatrimony(list)

    expect(result['child']).toBe('1/2')
    expect(result.available).toBe('1/2')
  })

  it('Two or more children', () => {
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

  it('Two or more children, one of them has descendants', () => {
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

  it('Only spouse', () => {
    // If only the spouse is alive 1/2 of the patrimony goes to them, 1/2 remains available
    const list = {
      ...newDeceased(['spouse']),
      ...newPerson({ id: 'spouse', category: 'spouse' }),
    }
    const result = calculatePatrimony(list)

    expect(result['spouse']).toBe('1/2')
    expect(result.available).toBe('1/2')
  })

  it('Only ascendants', () => {
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

  it('Grandparents can inherit too', () => {
    const list = {
      ...newDeceased(['mother']),
      ...newPerson({ id: 'mother', category: 'ascendants', available: false, relatives: ['grandmother'] }),
      ...newPerson({ id: 'grandmother', category: 'ascendants' }),
    }
    const result = calculatePatrimony(list)

    expect(result['grandmother']).toBe('1/3')
    expect(result.available).toBe('2/3')
  })

  it('Grandparent and spouse', () => {
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

  it('Only spouse and ascendants', () => {
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

  it('Spouse and one child', () => {
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

  it('Spouse and two or more children', () => {
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

  it('Should reject object with missing degree', () => {
    // prettier-ignore
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, previous: null, category: 'root', relatives: ['1'] }
    }
    expect(() => validate(body)).toThrow()
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

  it('Should reject object without a 0 key', () => {
    const body: unknown = {
      '1': { id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, category: 'root' },
    }
    expect(() => validate(body)).toThrow()
  })

  it('Should reject object whose 0 key is not root', () => {
    const body: unknown = {
      '0': { id: 'string', name: 'Defunto', available: false, degree: 0, previous: null, category: 'children' },
    }
    expect(() => validate(body)).toThrow()
  })
})
