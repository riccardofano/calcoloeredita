import { createContext, ReactNode, useContext } from 'react'

export type Mode = 'inheritance' | 'patrimony'

export const ModeContext = createContext<Mode>('inheritance')

export function useModeContext() {
  return useContext(ModeContext)
}

interface MoneyProviderProps {
  mode: Mode
  children: ReactNode
}

export function ModeProvider({ mode, children }: MoneyProviderProps) {
  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>
}
