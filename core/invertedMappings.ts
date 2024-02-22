import { CategoryName } from './types/Category'

export type Mapping = { category: CategoryName; degree: number }

export const MAPPINGS: Record<string, Mapping> = {
  figlio: { category: 'children', degree: 1 },
  'nipote in linea retta': { category: 'children', degree: 2 },
  'pronipote in linea retta': { category: 'children', degree: 3 },
  'abnipote in linea retta': { category: 'children', degree: 4 },
  genitore: { category: 'ascendants', degree: 1 },
  fratello: { category: 'bilateral', degree: 2 },
  'nipote in linea collaterale': { category: 'children', degree: 3 },
  'pronipote in linea collaterale': { category: 'children', degree: 4 },
  'abnipote in linea collaterale': { category: 'children', degree: 5 },
  zio: { category: 'others', degree: 3 },
  cugino: { category: 'children', degree: 4 },
  'figlio di cugino': { category: 'children', degree: 5 },
  'nipote di cugino': { category: 'children', degree: 6 },
  nonno: { category: 'ascendants', degree: 2 },
  prozio: { category: 'others', degree: 4 },
  'secondo cugino': { category: 'children', degree: 5 },
  'figlio di secondo cugino': { category: 'children', degree: 6 },
  bisavo: { category: 'ascendants', degree: 3 },
  trisavo: { category: 'children', degree: 4 },
  coniuge: { category: 'spouse', degree: 1 },
}
