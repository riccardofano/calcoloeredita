import Link from 'next/link'
import { ChangeEvent } from 'react'
import MoneyForm from './MoneyForm'

interface FormHeaderProps {
  pagination: { id: string; name: string }[]
  isRoot: boolean
  name: string
  onNameChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function FormHeader({ isRoot, name, pagination, onNameChange }: FormHeaderProps) {
  const reversedPagination = [...pagination].reverse()

  if (isRoot) {
    return (
      <header className="pt-6">
        <div className="mb-4 px-4">
          <h2 className="text-lg font-medium md:text-xl">Informazioni del defunto</h2>
          <p className="text-sm text-gray-600 md:text-base">Queste informazioni saranno visibili solo a te.</p>
        </div>
        <div className="my-5 grid gap-y-4 border-b bg-white px-4 py-5">
          <label className="input-label" htmlFor="deceased-name">
            Nome
            <input className="input-field" type="text" id="deceased-name" value={name} onChange={onNameChange} />
          </label>
          <MoneyForm />
        </div>
      </header>
    )
  }

  return (
    <header className="mb-5 rounded-t-md border-b px-4 pt-6 pb-5">
      <nav className="space-x-2">
        {reversedPagination.map((p, i) => {
          const isLast = i === reversedPagination.length - 1

          if (isLast) {
            return (
              <span key={p.id} className="text-base text-gray-800 md:text-lg">
                {p.name}
              </span>
            )
          }

          return (
            <span key={p.id} className="text-sm text-gray-600 md:text-base">
              <Link href={`?id=${p.id}`}>
                <a className="mr-2">{p.name}</a>
              </Link>
              /
            </span>
          )
        })}
      </nav>
    </header>
  )
}
