import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { Person, PersonList } from '../utils/types/Person'

import Categories from './Categories'

interface RelativesFormProps {
  id: string
  setSelectedId: Dispatch<SetStateAction<string>>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

function RelativesForm({ id, setSelectedId }: RelativesFormProps) {
  const list = usePeopleContext()
  const dispatch = usePeopleDispatchContext()
  if (!list) return null

  const me = list[id]
  const isRoot = me.id === '0'
  const pagination = getPagination(list, me)

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  const header = isRoot ? (
    <>
      <label className="text-xs" htmlFor="deceased-name">
        Nome del defunto
      </label>
      <input
        className="px-2 py-2 mr-2 w-full border rounded-md shadow-sm"
        type="text"
        id="deceased-name"
        value={me.name}
        onChange={onNameChange}
      />
    </>
  ) : (
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
  )

  return (
    <>
      <header>{header}</header>
      <p>Seleziona le tipologie di parenti di questa persona.</p>

      <Categories id={id} setSelectedId={setSelectedId} />
      {isRoot ? (
        <button type="submit" className="px-4 py-2 bg-blue-400 text-white rounded-md">
          Calcola eredità
        </button>
      ) : (
        <button
          key="back"
          type="button"
          className="px-4 py-2 border border-blue-400 text-blue-400 rounded-md"
          onClick={() => {
            if (!me.root) return
            setSelectedId(me.root)
          }}
        >
          Indietro
        </button>
      )}
    </>
  )
}

export default RelativesForm

function getPagination(list: PersonList, me: Person): { id: string; name: string }[] {
  const pagination = [{ id: me.id, name: me.name }]
  let root = me.root
  while (root !== null) {
    const parent = list[root]
    pagination.push({ id: parent.id, name: parent.name })
    root = parent.root
  }

  return pagination
}
