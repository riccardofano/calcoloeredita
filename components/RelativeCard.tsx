import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'

interface RelativeCardProps {
  id: string
  setSelectedId: Dispatch<SetStateAction<string>>
  canHaveHeirs: boolean
}

function RelativeCard({ id, setSelectedId, canHaveHeirs }: RelativeCardProps) {
  const list = usePeopleContext()
  const dispatch = usePeopleDispatchContext()
  if (!list) return null

  const me = list[id]

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  function onAvailabilityChange(e: ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return
    dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { id, checked: e.target.checked } })
  }

  function onDelete() {
    if (!dispatch) return
    dispatch({ type: 'REMOVE_RELATIVE', payload: { id } })
  }

  function onDegreeChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!dispatch) return

    const degree = Number(e.target.value)
    if (isNaN(degree)) return

    dispatch({ type: 'CHANGE_DEGREE', payload: { id, degree } })
  }

  return (
    <li className="py-4 first:pt-0 space-y-2 flex flex-col leading-none border-b border-gray-200">
      <div>
        <label className="text-xs" htmlFor="relative-name">
          Nome
        </label>
        <div className="flex items-center">
          <input
            className="mr-2 input-field"
            type="text"
            placeholder="Nuova persona"
            value={me.name}
            onChange={onNameChange}
            id="relative-name"
          />
          <button type="button" onClick={onDelete}>
            Rimuovi
          </button>
        </div>
      </div>

      {me.category === 'others' && (
        <select
          className="p-2 w-full rounded-md shadow-sm bg-white border"
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
        <input className="mr-2" type="checkbox" checked={me.available} onChange={onAvailabilityChange} />
        Disponibile a ricevere l&apos;eredità
      </label>
      {!me.available && canHaveHeirs && (
        <button
          type="button"
          className="flex items-center text-blue-400 space-x-2 leading-none"
          onClick={() => setSelectedId(id)}
        >
          <span className="px-2 py-1 border border-blue-400 rounded-md">{me.relatives.length} parenti</span>
          <span className="underline">Modifica parenti</span>
        </button>
      )}
    </li>
  )
}

export default RelativeCard
