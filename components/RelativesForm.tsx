import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { Person, PersonList } from '../utils/types/Person'

import Categories from './Categories'

interface RelativesFormProps {
  id: string
  setSelectedId: Dispatch<SetStateAction<string>>
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
      {pagination.reverse().map((p) => (
        <span key={p.id}>
          <button onClick={() => setSelectedId(p.id)}>{p.name}</button>
          <span> / </span>
        </span>
      ))}
    </nav>
  )

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <header>{header}</header>
      <Categories id={id} setSelectedId={setSelectedId} />
      {isRoot ? (
        <button className="px-4 py-2 bg-blue-400 text-white rounded-md" type="submit">
          Calcola eredità
        </button>
      ) : (
        <button
          className="px-4 py-2 border border-blue-400 text-blue-400 rounded-md"
          onClick={() => {
            if (!me.root) return
            setSelectedId(me.root)
          }}
        >
          Indietro
        </button>
      )}
    </form>
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
