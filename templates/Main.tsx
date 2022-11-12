import Link from 'next/link'
import { Dispatch, FormEvent, SetStateAction } from 'react'

import { MoneyProvider } from '../context/MoneyContext'
import { SelectedIdProvider } from '../context/SelectedIdContext'

import RelativesForm from '../components/RelativesForm'
import RelativesList from '../components/RelativesList'
import { useRouter } from 'next/router'

interface MainProps {
  title: string
  isLoading: boolean
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  inheritance: Record<string, string>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

function Main({ title, isLoading, isEditing, setIsEditing, inheritance, onSubmit }: MainProps) {
  return (
    <>
      <nav className="bg-white sm:px-0 px-8">
        <div className="max-w-4xl mx-auto space-x-8">
          <NavLink href="/" text="Calcolo eredità" />
          <NavLink href="/patrimonio" text="Calcolo patrimonio" />
        </div>
      </nav>

      <main className="max-w-4xl sm:mx-auto mx-8 my-16">
        <h1 className="mb-4 text-3xl font-medium">{title}</h1>
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
    </>
  )
}

function NavLink({ href, text }: { href: string; text: string }) {
  const { asPath } = useRouter()
  const isActive = asPath === href

  return (
    <Link href={href}>
      <a className={`inline-block border-b-4 py-4 ${isActive ? 'border-blue-400' : 'border-transparent'}`}>{text}</a>
    </Link>
  )
}

export default Main
