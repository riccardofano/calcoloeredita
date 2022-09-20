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
    <div>
      <label>
        <input type="text" value={me.name} onChange={onNameChange} />
      </label>
      <br />
      <button onClick={onDelete}>Rimuovi</button>
      <label>
        <input type="checkbox" checked={me.available} onChange={onAvailabilityChange} />
        Disponibile a ricevere l&apos;eredità
      </label>
      {!me.available && (
        <div>
          <span>{me.relatives.length} parenti</span>
          <button onClick={() => setSelectedId(id)}>Modifica parenti</button>
        </div>
      )}
    </div>
  )
}

export default RelativeCard
