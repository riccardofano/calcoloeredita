import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { Person } from '../utils/person'
import { CategoryName } from './Category'

export type PeopleDispatch = [Person[], Dispatch<SetStateAction<Person[]>>]
type IPeople = Record<CategoryName, PeopleDispatch>

export const PeopleContext = createContext<IPeople | null>(null)

export const usePeople = () => useContext(PeopleContext)
