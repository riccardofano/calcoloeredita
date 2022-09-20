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
        parentId: string
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
  | {
      type: 'ADD_RELATIVE'
      payload: {
        parentId: string
        category: CategoryName
      }
    }
  | {
      type: 'REMOVE_RELATIVE'
      payload: {
        id: string
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
      const parent = { ...state[payload.parentId] }
      if (payload.checked) {
        const newRelative = createPerson(payload.category, parent)
        parent.relatives = [...parent.relatives, newRelative.id]
        return { ...state, [parent.id]: parent, [newRelative.id]: newRelative }
      }
      const filteredRelatives = parent.relatives.filter((id) => state[id].category !== payload.category)
      parent.relatives = filteredRelatives
      return { ...state, [parent.id]: parent }
    }
    case 'TOGGLE_AVAILABILITY': {
      const person = { ...state[payload.id] }
      return { ...state, [person.id]: { ...person, available: payload.checked } }
    }
    case 'ADD_RELATIVE': {
      const parent = { ...state[payload.parentId] }
      // TODO: maybe createPerson should throw an error if the max degree is
      // reacted so we can return the state as is
      const newRelative = createPerson(payload.category, parent)
      parent.relatives = [...parent.relatives, newRelative.id]
      return { ...state, [parent.id]: parent, [newRelative.id]: newRelative }
    }
    case 'REMOVE_RELATIVE': {
      const relative = { ...state[payload.id] }
      if (!relative.root) return state
      // remove self from parent relative
      const parent = { ...state[relative.root] }
      const nextParent = { ...parent, relatives: parent.relatives.filter((id) => id !== relative.id) }

      // remove every own relative
      const nextState = deleteAllRelatives(state, relative.id)
      return { ...nextState, [nextParent.id]: nextParent }
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
    name: '',
    available: true,
    degree: parent.degree + degreeOffset,
    root: parent.id,
    category,
    relatives: [] as string[],
  }
}

function deleteAllRelatives(state: PersonList, id: string): PersonList {
  const relative = { ...state[id] }
  const nextRelatives = [...relative.relatives]

  let nextState = { ...state }
  for (const r of nextRelatives) {
    nextState = deleteAllRelatives(nextState, r)
  }
  delete nextState[id]

  return nextState
}

// TODO: this should be a setState variable to make it idempotent
let ID_COUNT = 0
const initialPeople: PersonList = {
  '0': {
    id: '0',
    name: 'Defunto',
    available: false,
    degree: 0,
    root: null,
    category: 'children',
    relatives: [],
  },
}
