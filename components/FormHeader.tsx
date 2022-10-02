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
  if (isRoot) {
    return (
      <header className="space-y-2">
        <label className="text-xs" htmlFor="deceased-name">
          Nome del defunto
          <input className="input-field" type="text" id="deceased-name" value={name} onChange={onNameChange} />
        </label>

        <MoneyForm />
      </header>
    )
  }

  return (
    <header>
      <nav>
        {pagination.reverse().map((p, i) => {
          const isLast = i === pagination.length - 1
          return (
            <span key={p.id} className={`${isLast ? 'text-lg text-black font-semibold' : 'text-sm text-gray-400'}`}>
              <button type="button" onClick={() => setSelectedId(p.id)}>
                {p.name}
              </button>
              {!isLast && <span> / </span>}
            </span>
          )
        })}
      </nav>
    </header>
  )
}
