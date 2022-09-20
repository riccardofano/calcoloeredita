import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { CategoryName } from '../utils/types/Category'
import { Person, PersonList } from '../utils/types/Person'

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

export type PeopleAction =
  | {
      type: 'UPDATE_NAME'
      payload: {
        id: string
        name: string
      }
    }
  | {
      type: 'TOGGLE_CATEGORY'
      payload: {
        id: string
        category: CategoryName
        checked: boolean
      }
    }
  | {
      type: 'TOGGLE_AVAILABILITY'
      payload: {
        id: string
        checked: boolean
      }
    }

export function peopleReducer(state: PersonList, action: PeopleAction): PersonList {
  const { type, payload } = action

  switch (type) {
    case 'UPDATE_NAME': {
      const person = { ...state[payload.id] }
      person.name = payload.name
      return { ...state, [person.id]: person }
    }
    case 'TOGGLE_CATEGORY': {
      const person = { ...state[payload.id] }
      if (payload.checked) {
        const relative = createPerson(payload.category, person)
        person.relatives = [...person.relatives, relative.id]
        return { ...state, [person.id]: person, [relative.id]: relative }
      }
      const filteredRelatives = person.relatives.filter((id) => state[id].category !== payload.category)
      person.relatives = filteredRelatives
      return { ...state, [person.id]: person }
    }
    case 'TOGGLE_AVAILABILITY': {
      const person = { ...state[payload.id] }
      return { ...state, [person.id]: { ...person, available: payload.checked } }
    }
    default: {
      throw new Error(`Unknown action: ${type}`)
    }
  }
}

function createPerson(category: CategoryName, parent: Person): Person {
  ID_COUNT += 1
  const degreeOffset = category === 'bilateral' || category === 'unilateral' ? 2 : 1
  return {
    id: `${ID_COUNT}`,
    name: 'Nuova persona',
    available: true,
    degree: parent.degree + degreeOffset,
    root: parent.id,
    category,
    relatives: [] as string[],
  }
}

// TODO: this should be a setState variable to make it idempotent
let ID_COUNT = 0
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
