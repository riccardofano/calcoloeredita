import Link from 'next/link'
import { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import RelativesForm from '../components/RelativesForm'
import RelativesList from '../components/RelativesList'
import { MoneyProvider } from '../context/MoneyContext'

interface MainProps {
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  inheritance: Record<string, string>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

function Main({ isEditing, setIsEditing, inheritance, onSubmit }: MainProps) {
  const [selectedId, setSelectedId] = useState('0')

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
        <MoneyProvider>
          {isEditing ? (
            <form className="space-y-4" onSubmit={onSubmit}>
              <RelativesForm id={selectedId} setSelectedId={setSelectedId} onSubmit={onSubmit}></RelativesForm>
            </form>
          ) : (
            <RelativesList inheritance={inheritance} setEditing={setIsEditing} />
          )}
        </MoneyProvider>
      </main>
    </div>
  )
}

export default Main
