import Link from 'next/link'
import { Dispatch, FormEvent, SetStateAction } from 'react'

import { MoneyProvider } from '../context/MoneyContext'
import { SelectedIdProvider } from '../context/SelectedIdContext'

import RelativesForm from '../components/RelativesForm'
import RelativesList from '../components/RelativesList'

interface MainProps {
  isLoading: boolean
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  inheritance: Record<string, string>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

function Main({ isLoading, isEditing, setIsEditing, inheritance, onSubmit }: MainProps) {
  return (
    <div className="px-8 py-16 space-y-8 mx-auto max-w-prose">
      <header>
        <nav>
          <ul className="flex justify-between text-blue-400 underline">
            <li>
              <Link href="/">Calcolo eredità</Link>
            </li>
            <li>
              <Link href="/patrimonio">Calcolo patrimonio</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <SelectedIdProvider>
          <MoneyProvider>
            {isEditing ? (
              <form className="space-y-8" onSubmit={onSubmit}>
                <RelativesForm isLoading={isLoading} />
              </form>
            ) : (
              <RelativesList inheritance={inheritance} setEditing={setIsEditing} />
            )}
          </MoneyProvider>
        </SelectedIdProvider>
      </main>
    </div>
  )
}

export default Main
