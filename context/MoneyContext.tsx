import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export const MoneyContext = createContext<string>('')
export const SetMoneyContext = createContext<Dispatch<SetStateAction<string>> | null>(null)

export function useMoneyContext() {
  return useContext(MoneyContext)
}

export function useSetMoneyContext() {
  return useContext(SetMoneyContext)
}

interface MoneyProviderProps {
  children: ReactNode
}

export function MoneyProvider({ children }: MoneyProviderProps) {
  const [money, setMoney] = useState('')

  return (
    <MoneyContext.Provider value={money}>
      <SetMoneyContext.Provider value={setMoney}>{children}</SetMoneyContext.Provider>
    </MoneyContext.Provider>
  )
}
