import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'

interface RelativeCardProps {
  id: string
  setSelectedId: Dispatch<SetStateAction<string>>
}

function RelativeCard({ id, setSelectedId }: RelativeCardProps) {
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

  return (
    <li className="py-4 first:pt-0 space-y-2 flex flex-col leading-none border-b border-gray-200">
      <div>
        <label className="text-xs" htmlFor="relative-name">
          Nome
        </label>
        <div className="flex items-center">
          <input
            className="px-2 py-2 mr-2 w-full border rounded-md shadow-sm"
            type="text"
            value={me.name}
            onChange={onNameChange}
            id="relative-name"
          />
          <button onClick={onDelete}>Rimuovi</button>
        </div>
      </div>
      <label>
        <input className="mr-2" type="checkbox" checked={me.available} onChange={onAvailabilityChange} />
        Disponibile a ricevere l&apos;eredità
      </label>
      {!me.available && (
        <button className="flex items-center text-blue-400 space-x-2 leading-none" onClick={() => setSelectedId(id)}>
          <span className="px-2 py-1 border border-blue-400 rounded-md">{me.relatives.length} parenti</span>
          <span>Modifica parenti</span>
        </button>
      )}
    </li>
  )
}

export default RelativeCard
