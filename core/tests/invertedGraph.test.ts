import { InvertedPerson, defaultRoot, invertGraph } from '../invertGraph'

test('Only one child', () => {
  const list: InvertedPerson[] = [
    { id: 'only-child', name: 'Figlio', available: true, relation: 'figlio', relatedTo: '' },
  ]
  const graph = invertGraph(defaultRoot(), list)

  // prettier-ignore
  expect(graph).toStrictEqual({
    'only-child': { id: list[0].id, name: list[0].name, available: list[0].available, degree: 1, category: 'children', relatives: [], previous: '0' },
    '0': { id: '0', name: 'Defunto', available: false, degree: 0, category: 'children', relatives: ['only-child'], previous: null },
  })
})

test('Child and spouse', () => {
  const list: InvertedPerson[] = [
    { id: '1', name: 'Figlio', available: true, relation: 'figlio', relatedTo: '' },
    { id: '2', name: 'Coniuge', available: true, relation: 'coniuge', relatedTo: '' },
  ]
  const graph = invertGraph(defaultRoot(), list)

  // prettier-ignore
  expect(graph).toStrictEqual({
    '1': { id: list[0].id, name: list[0].name, available: list[0].available, degree: 1, category: 'children', relatives: [], previous: '0' },
    '2': { id: list[1].id, name: list[1].name, available: list[1].available, degree: 1, category: 'spouse', relatives: [], previous: '0' },
    '0': { id: '0', name: 'Defunto', available: false, degree: 0, category: 'children', relatives: ['1', '2'], previous: null },
  })
})

test('nested children', () => {
  const list: InvertedPerson[] = [
    { id: '1', name: 'Figlio', available: true, relation: 'figlio', relatedTo: '' },
    { id: '2', name: 'Nipote', available: true, relation: 'nipote in linea retta', relatedTo: '1' },
    { id: '3', name: 'ProNipote', available: true, relation: 'pronipote in linea retta', relatedTo: '2' },
    { id: '4', name: 'AbNipote', available: true, relation: 'abnipote in linea retta', relatedTo: '3' },
  ]
  const graph = invertGraph(defaultRoot(), list)

  // prettier-ignore
  expect(graph).toStrictEqual({
    '1': { id: list[0].id, name: list[0].name, available: list[0].available, degree: 1, category: 'children', relatives: ['2'], previous: '0' },
    '2': { id: list[1].id, name: list[1].name, available: list[1].available, degree: 2, category: 'children', relatives: ['3'], previous: '1' },
    '3': { id: list[2].id, name: list[2].name, available: list[2].available, degree: 3, category: 'children', relatives: ['4'], previous: '2' },
    '4': { id: list[3].id, name: list[3].name, available: list[3].available, degree: 4, category: 'children', relatives: [], previous: '3' },
    '0': { id: '0', name: 'Defunto', available: false, degree: 0, category: 'children', relatives: ['1'], previous: null },
  })
})

test('siblings', () => {
  const list: InvertedPerson[] = [
    { id: '1', name: 'Fratello', available: true, relation: 'fratello', relatedTo: '' },
    { id: '2', name: 'Sorella', available: true, relation: 'fratello', relatedTo: '' },
    { id: '3', name: 'Fratello 2', available: true, relation: 'fratello', relatedTo: '' },
    { id: '4', name: 'Sorella 2', available: true, relation: 'fratello', relatedTo: '' },
  ]
  const graph = invertGraph(defaultRoot(), list)

  // prettier-ignore
  expect(graph).toStrictEqual({
    '1': { id: list[0].id, name: list[0].name, available: list[0].available, degree: 2, category: 'bilinear', relatives: [], previous: '0' },
    '2': { id: list[1].id, name: list[1].name, available: list[1].available, degree: 2, category: 'bilinear', relatives: [], previous: '0' },
    '3': { id: list[2].id, name: list[2].name, available: list[2].available, degree: 2, category: 'bilinear', relatives: [], previous: '0' },
    '4': { id: list[3].id, name: list[3].name, available: list[3].available, degree: 2, category: 'bilinear', relatives: [], previous: '0' },
    '0': { id: '0', name: 'Defunto', available: false, degree: 0, category: 'children', relatives: ['1', '2', '3', '4'], previous: null },
  })
})

test('other relatives', () => {
  const list: InvertedPerson[] = [
    { id: '1', name: 'Zio', available: true, relation: 'zio', relatedTo: '' },
    { id: '2', name: 'Prozio', available: true, relation: 'prozio', relatedTo: '' },
  ]
  const graph = invertGraph(defaultRoot(), list)

  // prettier-ignore
  expect(graph).toStrictEqual({
    '1': { id: list[0].id, name: list[0].name, available: list[0].available, degree: 3, category: 'others', relatives: [], previous: '0' },
    '2': { id: list[1].id, name: list[1].name, available: list[1].available, degree: 4, category: 'others', relatives: [], previous: '0' },
    '0': { id: '0', name: 'Defunto', available: false, degree: 0, category: 'children', relatives: ['1', '2'], previous: null },
  })
})
