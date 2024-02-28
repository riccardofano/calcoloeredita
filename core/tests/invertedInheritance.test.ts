import { validate } from '../../pages/api/inverted/inheritance'

describe('Inverted inheritance body validation', () => {
  it('Should accept empty arrays', () => {
    const body: unknown = []
    expect(() => validate(body)).not.toThrow()
  })

  it('Should reject objects', () => {
    const body: unknown = {}
    expect(() => validate(body)).toThrow()
  })

  it('Should accept complete entries', () => {
    // prettier-ignore
    const body: unknown = [
      { id: '1', name: '2', available: true, relation: 'figlio', relatedTo: '' },
    ]
    expect(() => validate(body)).not.toThrow()
  })

  it('Should accept bodies with multiple entries', () => {
    // prettier-ignore
    const body: unknown = [
      { id: '1', name: '2', available: true, relation: 'figlio', relatedTo: '' },
      { id: '2', name: '3', available: true, relation: 'figlio', relatedTo: '1' },
    ]
    expect(() => validate(body)).not.toThrow()
  })

  it('Should reject entries with missing id', () => {
    // prettier-ignore
    const body: unknown = [
      { name: '1', available: true, relation: 'figlio', relatedTo: '' },
    ]
    expect(() => validate(body)).toThrow()
  })

  it("Should reject entries with missing id even if it's just one", () => {
    // prettier-ignore
    const body: unknown = [
      { name: '1', available: true, relation: 'figlio', relatedTo: '' },
      { id: '2', name: '2', available: true, relation: 'figlio', relatedTo: '' },
    ]
    expect(() => validate(body)).toThrow()
  })

  it('Should reject entries with missing name', () => {
    // prettier-ignore
    const body: unknown = [
      { id: '1', available: true, relation: 'figlio', relatedTo: '' },
    ]
    expect(() => validate(body)).toThrow()
  })

  it('Should reject entries with missing availability', () => {
    // prettier-ignore
    const body: unknown = [
      { id: '1', name: '1', relation: 'figlio', relatedTo: '' },
    ]
    expect(() => validate(body)).toThrow()
  })

  it('Should reject entries with missing relation', () => {
    // prettier-ignore
    const body: unknown = [
      { id: '1', name: '1', available: true, relatedTo: '' },
    ]
    expect(() => validate(body)).toThrow()
  })

  it('Should reject entries with missing relatedTo', () => {
    // prettier-ignore
    const body: unknown = [
      { id: '1', name: '1', available: true, relation: 'figlio' },
    ]
    expect(() => validate(body)).toThrow()
  })

  it("Should reject entries containing key '0'", () => {
    // prettier-ignore
    const body: unknown = [
      { id: '0', name: '0', available: true, relation: 'figlio', relatedTo: '' },
    ]
    expect(() => validate(body)).toThrow()
  })
})
