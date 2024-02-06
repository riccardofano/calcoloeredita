import { InvertedPerson, defaultRoot, invertGraph } from '../invertGraph'

test('Only one child', () => {
  const list: InvertedPerson[] = [
    { id: 'only-child', name: 'Figlio', available: true, relation: 'figlio', relatedTo: '' },
  ]
  const graph = invertGraph(defaultRoot(), list)

  // prettier-ignore
  expect(graph).toStrictEqual({
    'only-child': { id: list[0].id, name: list[0].name, available: list[0].available, degree: 1, category: 'children', relatives: [], root: '0' },
    '0': { id: '0', name: 'Defunto', available: false, degree: 0, category: 'children', relatives: ['only-child'], root: null },
  })
})
