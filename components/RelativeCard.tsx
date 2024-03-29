import Link from 'next/link'
import { ChangeEvent } from 'react'
import { usePeopleDispatchContext } from '../context/PeopleContext'
import { Person } from '../core/types/Person'

interface RelativeCardProps {
  id: string
  me: Person
  canHaveHeirs: boolean
}

function RelativeCard({ id, me, canHaveHeirs }: RelativeCardProps) {
  const dispatch = usePeopleDispatchContext()

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  function onAvailabilityChange(e: ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { id, checked: e.target.checked } })
  }

  function onDelete() {
    dispatch({ type: 'REMOVE_RELATIVE', payload: { id } })
  }

  function onDegreeChange(e: ChangeEvent<HTMLSelectElement>) {
    const degree = Number(e.target.value)
    if (isNaN(degree)) return

    dispatch({ type: 'CHANGE_DEGREE', payload: { id, degree } })
  }

  return (
    <div className="flex flex-col space-y-4 p-4 text-sm leading-none first:pt-0 md:text-base">
      <div>
        <label className="input-label" htmlFor={`relative-name-${id}`}>
          Nome
        </label>
        <div className="mt-1 flex">
          <input
            className="input-field mr-2"
            type="text"
            placeholder="Nuova persona"
            value={me.name}
            onChange={onNameChange}
            id={`relative-name-${id}`}
          />
          <button
            type="button"
            className="rounded-md border px-4 font-normal text-danger-400 shadow-sm"
            onClick={onDelete}
          >
            Rimuovi
          </button>
        </div>
      </div>

      {me.category === 'others' && (
        <select
          className="w-full rounded-md border bg-white p-2 shadow-sm"
          onChange={onDegreeChange}
          placeholder="Parente (grado di parentela)"
        >
          <option value={3}>Zio/a (3)</option>
          <option value={4}>Cugino/a (4)</option>
          <option value={5}>Figlio/a di cugino/a (5)</option>
          <option value={6}>Nipote di cugino/a (6)</option>
          <option value={4}>Prozio/a (4)</option>
          <option value={5}>Secondo cugino/a (5)</option>
          <option value={6}>Figlio/a di secondo/a cugino/a (6)</option>
          <option value={5}>Fratello/Sorella di bisavo (5)</option>
          <option value={6}>Nipote di trisavo (6)</option>
        </select>
      )}

      <label>
        <input className="mr-4" type="checkbox" checked={me.available} onChange={onAvailabilityChange} />
        Disponibile
      </label>

      {!me.available && canHaveHeirs && (
        <Link href={`?id=${id}`}>
          <a className="flex items-center gap-2 self-start text-primary-400 underline">
            Inserisci parenti di questa persona &#8599;
          </a>
        </Link>
      )}
    </div>
  )
}

export default RelativeCard
