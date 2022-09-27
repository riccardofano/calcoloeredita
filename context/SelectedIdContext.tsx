import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export const SelectedIdContext = createContext<string>('0')
export const SetSelectedIdContext = createContext<Dispatch<SetStateAction<string>> | null>(null)

export function useSelectedIdContext() {
  return useContext(SelectedIdContext)
}

export function useSetSelectedIdContext() {
  return useContext(SetSelectedIdContext)
}

interface SelectedIdProviderProps {
  children: ReactNode
}

export function SelectedIdProvider({ children }: SelectedIdProviderProps) {
  const [selectedId, setSelectedId] = useState('0')

  return (
    <SelectedIdContext.Provider value={selectedId}>
      <SetSelectedIdContext.Provider value={setSelectedId}>{children}</SetSelectedIdContext.Provider>
    </SelectedIdContext.Provider>
  )
}
