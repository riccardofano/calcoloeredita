import Link from 'next/link'
import { Dispatch, FormEvent, SetStateAction } from 'react'

import { MoneyProvider } from '../context/MoneyContext'
import { SelectedIdProvider } from '../context/SelectedIdContext'

import RelativesForm from '../components/RelativesForm'
import Results from '../components/Results'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'

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
      <nav className="bg-white px-4 sm:px-8 lg:px-0">
        <div className="mx-auto max-w-4xl space-x-8">
          <NavLink href="/" text="Calcolo eredità" />
          <NavLink href="/patrimonio" text="Calcolo patrimonio" />
        </div>
      </nav>

      <main className="mt-8 mb-16 px-4 sm:px-8 lg:px-0">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-medium">{title}</h1>
          <SelectedIdProvider>
            <MoneyProvider>
              {isEditing ? (
                <RelativesForm isLoading={isLoading} onSubmit={onSubmit} />
              ) : (
                <Results inheritance={inheritance} setEditing={setIsEditing} />
              )}
            </MoneyProvider>
          </SelectedIdProvider>
        </div>
      </main>
    </>
  )
}

function NavLink({ href, text }: { href: string; text: string }) {
  const { asPath } = useRouter()
  const isActive = asPath === href

  return (
    <span className="relative inline-block py-4">
      <Link href={href}>{text}</Link>
      {isActive && (
        <motion.span
          layout
          layoutId="activeNavLink"
          className="absolute inset-x-0 bottom-0 h-1 bg-blue-400"
        ></motion.span>
      )}
    </span>
  )
}

export default Main
