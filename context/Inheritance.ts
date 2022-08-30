import { createContext } from 'react'

interface IInheritanceContext {
  inheritanceList: Record<string, string>
}

const initialState: IInheritanceContext = {
  inheritanceList: {},
}

export const InheritanceContext = createContext<IInheritanceContext>(initialState)
