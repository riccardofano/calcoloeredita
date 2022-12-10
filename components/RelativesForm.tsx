import { ChangeEvent, FormEvent } from 'react'
import { Person, PersonList } from '../utils/types/Person'

import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'

import Categories from './Categories'
import Header from './FormHeader'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface RelativesFormProps {
  isLoading: boolean
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export default function RelativesForm({ isLoading, onSubmit }: RelativesFormProps) {
  const router = useRouter()
  const { id: queryId = '0' } = router.query
  const id = Array.isArray(queryId) ? queryId[0] : queryId

  const dispatch = usePeopleDispatchContext()
  const list = usePeopleContext()
  const me = list[id]
  const isRoot = me.id === '0'
  const pagination = getPagination(list, me)

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  return (
    <form className="rounded-md border bg-gray-100" onSubmit={onSubmit}>
      <Header isRoot={isRoot} name={me.name} pagination={pagination} onNameChange={onNameChange} />

      <div className="px-4">
        <h2 className="text-lg font-medium md:text-xl">Albero genealogico</h2>
        <p className="text-sm text-gray-600 md:text-base">Seleziona le tipologie di parenti di questa persona.</p>
      </div>
      <div className="mt-5 bg-white py-5">
        <Categories />
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-gray-50 px-4 pt-5 pb-6 md:flex-row md:justify-between">
        {!isRoot && (
          <Link href={`?id=${me.root ?? '0'}`}>
            <a className="btn btn-inverted px-8">Indietro</a>
          </Link>
        )}
        <button
          type="submit"
          disabled={isLoading || isSubmitDisabled(list)}
          className="btn btn-primary flex items-center justify-center px-8 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && <Spinner />}
          Calcola eredità
        </button>
      </div>
    </form>
  )
}

export function toNonEmptyName(name: string): string {
  return name === '' ? 'Senza nome' : name
}

function getPagination(list: PersonList, me: Person): { id: string; name: string }[] {
  const pagination = [{ id: me.id, name: toNonEmptyName(me.name) }]
  let root = me.root
  while (root !== null) {
    const parent = list[root]
    pagination.push({ id: parent.id, name: toNonEmptyName(parent.name) })
    root = parent.root
  }

  return pagination
}

function isSubmitDisabled(list: PersonList): boolean {
  const root = list['0']
  if (!root || root.relatives.length < 1) return true

  let disabled = false
  const queue = [root.id]

  while (!disabled && queue.length > 0) {
    const currentId = queue.pop() as string
    const current = list[currentId]
    if (!current || !current.name) {
      disabled = true
      break
    }
    queue.push(...current.relatives)
  }

  return disabled
}

function Spinner() {
  return (
    <svg className="mr-2 h-6 w-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M434.67 285.59v-29.8c0-98.73-80.24-178.79-179.2-178.79a179 179 0 00-140.14 67.36m-38.53 82v29.8C76.8 355 157 435 256 435a180.45 180.45 0 00140-66.92"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        d="M32 256l44-44 46 44M480 256l-44 44-46-44"
      />
    </svg>
  )
}
