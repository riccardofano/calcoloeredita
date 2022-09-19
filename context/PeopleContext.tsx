import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { PersonList } from '../utils/types/Person'

export const PeopleContext = createContext<PersonList | null>(null)
export const PeopleDispatchContext = createContext<Dispatch<PeopleAction> | null>(null)

export function usePeopleContext() {
  return useContext(PeopleContext)
}

export function usePeopleDispatchContext() {
  return useContext(PeopleDispatchContext)
}

interface PeopleProviderProps {
  children: ReactNode
}

export function PeopleProvider({ children }: PeopleProviderProps) {
  const [people, dispatch] = useReducer(peopleReducer, initialPeople)

  return (
    <PeopleContext.Provider value={people}>
      <PeopleDispatchContext.Provider value={dispatch}>{children}</PeopleDispatchContext.Provider>
    </PeopleContext.Provider>
  )
}

export type PeopleAction = {
  type: 'ADD'
  payload: string
}

export function peopleReducer(state: PersonList, action: PeopleAction): PersonList {
  switch (action.type) {
    default: {
      throw new Error(`Unknown action: ${action.type}`)
    }
  }
}

const initialPeople: PersonList = {
  '0': {
    id: '0',
    name: '',
    available: false,
    degree: 0,
    root: null,
    category: 'children',
    relatives: [],
  },
}
