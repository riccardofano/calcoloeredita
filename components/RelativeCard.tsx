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
    <li className="flex flex-col py-4 space-y-2 leading-none border-t border-gray-200 first:pt-0 first:border-none">
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
          <button type="button" className="text-red-400" onClick={onDelete}>
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
              <title>Rimuovi persona</title>
              <path d="M288 256c52.79 0 99.43-49.71 104-110.82 2.27-30.7-7.36-59.33-27.12-80.6C345.33 43.57 318 32 288 32c-30.24 0-57.59 11.5-77 32.38-19.63 21.11-29.2 49.8-27 80.78C188.49 206.28 235.12 256 288 256zM495.38 439.76c-8.44-46.82-34.79-86.15-76.19-113.75C382.42 301.5 335.83 288 288 288s-94.42 13.5-131.19 38c-41.4 27.6-67.75 66.93-76.19 113.75-1.93 10.73.69 21.34 7.19 29.11A30.94 30.94 0 00112 480h352a30.94 30.94 0 0024.21-11.13c6.48-7.77 9.1-18.38 7.17-29.11zM144 216H32a16 16 0 000 32h112a16 16 0 000-32z" />
            </svg>
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
        <input className="mr-2" type="checkbox" checked={me.available} onChange={onAvailabilityChange} />
        Disponibile a ricevere l&apos;eredità
      </label>
      {!me.available && canHaveHeirs && (
        <button
          type="button"
          className="flex items-center space-x-4 leading-none text-blue-400"
          onClick={() => setSelectedId(id)}
        >
          <span className="flex items-center px-2 py-1 border border-blue-400 rounded-md">
            {me.relatives.length}
            <svg className="w-5 h-5 ml-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <title>numero di parenti</title>
              <path d="M336 256c-20.56 0-40.44-9.18-56-25.84-15.13-16.25-24.37-37.92-26-61-1.74-24.62 5.77-47.26 21.14-63.76S312 80 336 80c23.83 0 45.38 9.06 60.7 25.52 15.47 16.62 23 39.22 21.26 63.63-1.67 23.11-10.9 44.77-26 61C376.44 246.82 356.57 256 336 256zm66-88zM467.83 432H204.18a27.71 27.71 0 01-22-10.67 30.22 30.22 0 01-5.26-25.79c8.42-33.81 29.28-61.85 60.32-81.08C264.79 297.4 299.86 288 336 288c36.85 0 71 9 98.71 26.05 31.11 19.13 52 47.33 60.38 81.55a30.27 30.27 0 01-5.32 25.78A27.68 27.68 0 01467.83 432zM147 260c-35.19 0-66.13-32.72-69-72.93-1.42-20.6 5-39.65 18-53.62 12.86-13.83 31-21.45 51-21.45s38 7.66 50.93 21.57c13.1 14.08 19.5 33.09 18 53.52-2.87 40.2-33.8 72.91-68.93 72.91zM212.66 291.45c-17.59-8.6-40.42-12.9-65.65-12.9-29.46 0-58.07 7.68-80.57 21.62-25.51 15.83-42.67 38.88-49.6 66.71a27.39 27.39 0 004.79 23.36A25.32 25.32 0 0041.72 400h111a8 8 0 007.87-6.57c.11-.63.25-1.26.41-1.88 8.48-34.06 28.35-62.84 57.71-83.82a8 8 0 00-.63-13.39c-1.57-.92-3.37-1.89-5.42-2.89z" />
            </svg>
          </span>
          <p className="flex items-center">
            <span className="underline">Modifica parenti</span>
            <svg className="w-5 h-5 ml-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <title>Log In</title>
              <path d="M392 80H232a56.06 56.06 0 00-56 56v104h153.37l-52.68-52.69a16 16 0 0122.62-22.62l80 80a16 16 0 010 22.62l-80 80a16 16 0 01-22.62-22.62L329.37 272H176v104c0 32.05 33.79 56 64 56h152a56.06 56.06 0 0056-56V136a56.06 56.06 0 00-56-56zM80 240a16 16 0 000 32h96v-32z" />
            </svg>
          </p>
        </button>
      )}
    </li>
  )
}

export default RelativeCard
