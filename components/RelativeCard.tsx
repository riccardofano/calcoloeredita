import { ChangeEvent } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { useSetSelectedIdContext } from '../context/SelectedIdContext'

interface RelativeCardProps {
  id: string
  canHaveHeirs: boolean
}

function RelativeCard({ id, canHaveHeirs }: RelativeCardProps) {
  const list = usePeopleContext()
  const me = list[id]
  const dispatch = usePeopleDispatchContext()
  const setSelectedId = useSetSelectedIdContext()

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
    <li className="flex flex-col py-4 space-y-4 leading-none first:pt-0 text-sm">
      <div>
        <label className="input-label" htmlFor={`relative-name-${id}`}>
          Nome
        </label>
        <div className="flex mt-1">
          <input
            className="mr-2 input-field"
            type="text"
            placeholder="Nuova persona"
            value={me.name}
            onChange={onNameChange}
            id={`relative-name-${id}`}
          />
          <button
            type="button"
            className="px-4 font-normal border rounded-md shadow-sm text-red-400"
            onClick={onDelete}
          >
            Rimuovi
          </button>
        </div>
      </div>

      {me.category === 'others' && (
        <select
          className="w-full p-2 bg-white border rounded-md shadow-sm"
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
        // TODO: make this a link that navigates to ?id=${id} and use that to
        // set the selected id so you can use the browser controls to navigate
        // back and forth
        <button
          className="self-start flex gap-2 items-center underline text-blue-400"
          onClick={() => setSelectedId(id)}
        >
          Inserisci parenti di questa persona &rarr;
        </button>
      )}
    </li>
  )
}

export default RelativeCard
