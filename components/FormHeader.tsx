import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import MoneyForm from './MoneyForm'

interface FormHeaderProps {
  pagination: { id: string; name: string }[]
  isRoot: boolean
  name: string
  onNameChange: (e: ChangeEvent<HTMLInputElement>) => void
  setSelectedId: Dispatch<SetStateAction<string>>
}

export default function FormHeader({ isRoot, name, pagination, onNameChange, setSelectedId }: FormHeaderProps) {
  const reversedPagination = [...pagination].reverse()

  if (isRoot) {
    return (
      <header className="pt-6">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-medium">Informazioni del defunto</h2>
          <p className="text-gray-500 text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
        <div className="grid gap-y-4 bg-white px-4 py-5 my-5 border-b">
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
    <header className="rounded-md pt-6 px-4 pb-5 mb-5 bg-white">
      <nav className="space-x-2">
        {reversedPagination.map((p, i) => {
          const isLast = i === reversedPagination.length - 1

          if (isLast) {
            return (
              <span key={p.id} className="text-base text-gray-800">
                {p.name}
              </span>
            )
          }

          return (
            <span key={p.id} className="text-sm text-gray-400">
              <button type="button" className="mr-2" onClick={() => setSelectedId(p.id)}>
                {p.name}
              </button>
              /
            </span>
          )
        })}
      </nav>
    </header>
  )
}
